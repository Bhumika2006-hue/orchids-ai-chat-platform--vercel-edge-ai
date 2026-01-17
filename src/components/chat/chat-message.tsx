"use client";

import { memo, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { User, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChainLogo } from "@/components/ui/chain-logo";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {language || 'code'}
        </span>
        <button
          onClick={copyCode}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-secondary"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-primary" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="code-block-content scrollbar-thin">
        <pre>
          <code className="font-mono text-sm">{code}</code>
        </pre>
      </div>
    </div>
  );
}

function parseMarkdown(content: string): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;
  let codeContent = "";
  let codeLanguage = "";
  let codeBlockKey = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLanguage = line.slice(3).trim() || "text";
        codeContent = "";
      } else {
        elements.push(
          <CodeBlock
            key={`code-${codeBlockKey++}`}
            code={codeContent.trim()}
            language={codeLanguage}
          />
        );
        inCodeBlock = false;
        codeContent = "";
        codeLanguage = "";
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="text-xl font-bold mt-4 mb-2">
          {parseInline(line.slice(2))}
        </h1>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-lg font-semibold mt-3 mb-2">
          {parseInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="text-base font-medium mt-2 mb-1">
          {parseInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={i}
          className="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-2"
        >
          {parseInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc">
          {parseInline(line.slice(2))}
        </li>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <li key={i} className="ml-4 list-decimal">
            {parseInline(match[2])}
          </li>
        );
      }
    } else if (line.trim() === "") {
      elements.push(<br key={i} />);
    } else {
      elements.push(
        <p key={i} className="my-1 leading-relaxed">
          {parseInline(line)}
        </p>
      );
    }
  }

  if (inCodeBlock && codeContent) {
    elements.push(
      <CodeBlock
        key={`code-${codeBlockKey}`}
        code={codeContent.trim()}
        language={codeLanguage}
      />
    );
  }

  return elements;
}

function parseInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  const boldRegex = /\*\*(.+?)\*\*/g;
  const italicRegex = /\*(.+?)\*/g;
  const codeRegex = /`([^`]+)`/g;

  let lastIndex = 0;
  let match;

  const combinedRegex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;

  while ((match = combinedRegex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(<strong key={keyIndex++}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={keyIndex++}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code key={keyIndex++} className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">
          {match[4]}
        </code>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  const formattedTime = useMemo(() => {
    return message.timestamp.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [message.timestamp]);

  const parsedContent = useMemo(() => {
    if (isUser) return message.content;
    return parseMarkdown(message.content);
  }, [message.content, isUser]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center",
          isUser ? "gradient-primary" : "bg-card border border-border"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <ChainLogo size={20} />
        )}
      </div>

      <div className={cn("flex-1 min-w-0 max-w-[85%]", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 break-words",
            isUser
              ? "gradient-primary text-white"
              : "bg-card border border-border"
          )}
        >
          <div className={cn(
            "prose prose-sm max-w-none overflow-hidden",
            isUser && "text-white [&_*]:text-white"
          )}>
            {parsedContent}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">{formattedTime}</p>
      </div>
    </motion.div>
  );
});
