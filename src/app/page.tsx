"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChainBackground } from "@/components/ui/chain-logo";
import { useState, useCallback, useRef } from "react";

export default function Home() {
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  const refreshSidebarRef = useRef<() => void>();

  const handleConversationCreated = useCallback((id: string) => {
    setCurrentConversationId(id);
    refreshSidebarRef.current?.();
  }, []);

  const handleConversationUpdated = useCallback(() => {
    refreshSidebarRef.current?.();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <ChainBackground />
      
      <Sidebar
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={() => setCurrentConversationId(undefined)}
        onRefreshRef={(fn) => { refreshSidebarRef.current = fn; }}
      />
      
      <main className="flex-1 flex flex-col relative z-10">
        <ChatInterface 
          conversationId={currentConversationId}
          onConversationCreated={handleConversationCreated}
          onConversationUpdated={handleConversationUpdated}
        />
      </main>
    </div>
  );
}
