"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChainBackground } from "@/components/ui/chain-logo";
import { useAuth } from "@/contexts/auth-context";
import { useState, useCallback, useEffect, useRef } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const [newChatKey, setNewChatKey] = useState(0);
  const refreshSidebarRef = useRef<() => void>(undefined);

  const handleConversationCreated = useCallback((id: string) => {
    setCurrentConversationId(id);
    refreshSidebarRef.current?.();
  }, []);

  const handleConversationUpdated = useCallback(() => {
    refreshSidebarRef.current?.();
  }, []);

  const handleNewConversation = useCallback(() => {
    setCurrentConversationId(undefined);
    setNewChatKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      handleNewConversation();
      return;
    }

    refreshSidebarRef.current?.();
  }, [user, loading, handleNewConversation]);

  return (
    <div className="flex h-screen overflow-hidden fixed inset-0 md:relative">
      <ChainBackground />
      
      <Sidebar
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleNewConversation}
        onRefreshRef={(fn) => {
          refreshSidebarRef.current = fn;
        }}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <ChatInterface
          conversationId={currentConversationId}
          resetKey={newChatKey}
          onConversationCreated={handleConversationCreated}
          onConversationUpdated={handleConversationUpdated}
        />
      </main>
    </div>
  );
}
