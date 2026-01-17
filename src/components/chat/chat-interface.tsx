"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Mic, MicOff, StopCircle, FileText, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";
import { ChainLogo } from "@/components/ui/chain-logo";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { firebaseDb, ChatMessage as FirebaseChatMessage, Conversation } from "@/lib/firebase";
import { v4 as uuid } from "uuid";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  conversationId?: string;
  onConversationCreated?: (id: string) => void;
  onConversationUpdated?: () => void;
}

export function ChatInterface({ conversationId, onConversationCreated, onConversationUpdated }: ChatInterfaceProps) {
  const { user, settings } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showDocTools, setShowDocTools] = useState(false);
  const [currentConvId, setCurrentConvId] = useState<string | undefined>(conversationId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (conversationId && user) {
      loadConversation(conversationId);
    } else if (!conversationId) {
      setMessages([]);
      setCurrentConvId(undefined);
    }
  }, [conversationId, user]);

  const loadConversation = async (id: string) => {
    try {
      const conv = await firebaseDb.getConversation(id);
      if (conv) {
        setMessages(conv.messages.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })));
        setCurrentConvId(id);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const saveToFirebase = async (msgs: Message[], convId: string, isNew: boolean) => {
    if (!user) return;
    
    try {
      const conversation: Omit<Conversation, 'userId'> = {
        id: convId,
        title: msgs[0]?.content.slice(0, 50) || "New Chat",
        messages: msgs.map(m => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: m.timestamp,
        })),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await firebaseDb.saveConversation(user.uid, conversation);
      
      if (isNew) {
        onConversationCreated?.(convId);
      }
      onConversationUpdated?.();
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuid(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      id: uuid(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          contextMemory: settings?.contextMemory || "",
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let content = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          content += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMessage.id ? { ...m, content } : m
            )
          );
        }

        const isNewConversation = !currentConvId;
        const convId = currentConvId || uuid();
        if (!currentConvId) {
          setCurrentConvId(convId);
        }

        const finalMessages = [...newMessages, { ...assistantMessage, content }];
        if (user) {
          await saveToFirebase(finalMessages, convId, isNewConversation);
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        console.error("Chat error:", error);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "Sorry, something went wrong. Please try again." }
              : m
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  };

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    const SpeechRecognitionClass = win.webkitSpeechRecognition || win.SpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = true;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((result: any) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  const generateDocument = async (format: 'pdf' | 'doc') => {
    if (messages.length === 0) {
      toast.error("No conversation to export");
      return;
    }

    const content = messages.map(m => 
      `${m.role === 'user' ? 'You' : 'Kateno AI'}: ${m.content}`
    ).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kateno-chat-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'txt' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Conversation exported as ${format.toUpperCase()}`);
    setShowDocTools(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center px-4"
          >
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
              <ChainLogo size={48} className="text-white" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Welcome to Kateno AI</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Your intelligent assistant with web search capabilities. Ask me anything!
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                "Explain quantum computing",
                "Write a Python script",
                "Latest tech news",
                "Help me brainstorm",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-4 py-3 text-sm rounded-xl border border-border hover:bg-secondary/50 transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-border bg-background/80 backdrop-blur-sm px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isLoading}
                rows={1}
                className={cn(
                  "w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 pr-32",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary",
                  "placeholder:text-muted-foreground disabled:opacity-50",
                  "scrollbar-thin max-h-[150px]"
                )}
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowDocTools(!showDocTools)}
                    className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                    title="Export conversation"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  {showDocTools && (
                    <div className="absolute bottom-full right-0 mb-2 p-2 bg-card border border-border rounded-xl shadow-lg min-w-[140px]">
                      <button
                        type="button"
                        onClick={() => generateDocument('pdf')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export as PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => generateDocument('doc')}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Export as DOC
                      </button>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isListening
                      ? "bg-destructive text-white"
                      : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                {isLoading ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    className="p-2 rounded-lg bg-destructive text-white hover:bg-destructive/90 transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      input.trim()
                        ? "gradient-primary text-white hover:opacity-90"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
