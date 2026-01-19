"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MessageSquare, Plus, Settings, Trash2, Edit2, Check, X, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { firebaseDb, Conversation } from "@/lib/firebase";
import { ChainLogo } from "@/components/ui/chain-logo";
import { SettingsModal } from "@/components/layout/settings-modal";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { toast } from "sonner";

interface SidebarProps {
  currentConversationId?: string;
  onSelectConversation?: (id: string) => void;
  onNewConversation?: () => void;
  onRefreshRef?: (fn: () => void) => void;
}

export function Sidebar({ currentConversationId, onSelectConversation, onNewConversation, onRefreshRef }: SidebarProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; id: string; title: string }>({
    isOpen: false,
    id: "",
    title: "",
  });

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
      const convs = await firebaseDb.getConversations(user.uid);
      setConversations(convs);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    } else {
      setConversations([]);
    }
  }, [user, fetchConversations]);

  useEffect(() => {
    onRefreshRef?.(fetchConversations);
  }, [onRefreshRef, fetchConversations]);

  const handleNewConversation = () => {
    setIsMobileOpen(false);
    onNewConversation?.();
  };

  const openDeleteDialog = (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialog({ isOpen: true, id, title });
  };

  const handleDelete = async () => {
    try {
      await firebaseDb.deleteConversation(deleteDialog.id);
      setConversations((prev) => prev.filter((c) => c.id !== deleteDialog.id));
      toast.success("Conversation deleted");
      if (currentConversationId === deleteDialog.id) {
        onNewConversation?.();
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      toast.error("Failed to delete conversation");
    }
    setDeleteDialog({ isOpen: false, id: "", title: "" });
  };

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const saveEdit = async (id: string) => {
    try {
      await firebaseDb.updateConversationTitle(id, editTitle);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: editTitle } : c))
      );
      toast.success("Title updated");
    } catch (error) {
      console.error("Failed to update conversation:", error);
      toast.error("Failed to update title");
    }
    setEditingId(null);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
        className="fixed top-4 left-4 z-30 md:hidden p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsMobileOpen(false);
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}

      <aside
        className={cn(
          "h-full flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 relative",
          "md:relative md:z-20",
          "fixed inset-y-0 left-0 z-50",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-3 flex items-center justify-between border-b border-sidebar-border">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2">
              <ChainLogo size={32} />
              <span className="font-semibold text-lg">Kateno AI</span>
            </Link>
          )}
          {isCollapsed && (
            <ChainLogo size={28} className="mx-auto" />
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "p-2 rounded-lg hover:bg-sidebar-accent transition-colors",
              isCollapsed && "mx-auto"
            )}
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3">
          <button
            onClick={handleNewConversation}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
              "gradient-primary text-white font-medium",
              "hover:opacity-90 transition-opacity",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">New Chat</span>}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3">
          {conversations.length === 0 && !isCollapsed && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No conversations yet
            </p>
          )}

          {!isCollapsed && conversations.length > 0 && (
            <div className="mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3">
                Recent Chats
              </span>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {conversations.map((conv) => (
              <motion.div
                key={conv.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                layout
              >
                <button
                  onClick={() => {
                    setIsMobileOpen(false);
                    onSelectConversation?.(conv.id);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl mb-1 group",
                    "hover:bg-sidebar-accent transition-colors text-left",
                    currentConversationId === conv.id && "bg-sidebar-accent",
                    isCollapsed && "justify-center px-2"
                  )}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      {editingId === conv.id ? (
                        <div className="flex-1 flex items-center gap-1">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 bg-background px-2 py-0.5 rounded text-sm border border-border"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              saveEdit(conv.id);
                            }}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <Check className="w-3 h-3 text-primary" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                            className="p-1 hover:bg-secondary rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm truncate">{conv.title}</span>
                          <div className="hidden group-hover:flex items-center gap-1">
                            <button
                              onClick={(e) => startEditing(conv, e)}
                              className="p-1 hover:bg-secondary rounded"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => openDeleteDialog(conv.id, conv.title, e)}
                              className="p-1 hover:bg-secondary rounded text-destructive"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setShowSettings(true)}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2.5 rounded-xl",
              "hover:bg-sidebar-accent transition-colors",
              isCollapsed && "justify-center px-2"
            )}
          >
            <Settings className="w-4 h-4" />
            {!isCollapsed && <span className="text-sm">Settings</span>}
          </button>
        </div>
      </aside>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, id: "", title: "" })}
        onConfirm={handleDelete}
        title={deleteDialog.title}
      />
    </>
  );
}
