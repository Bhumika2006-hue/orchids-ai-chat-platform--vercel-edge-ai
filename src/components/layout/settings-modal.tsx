"use client";

import { useState, useEffect } from "react";
import { X, Moon, Sun, Save, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<"appearance" | "memory">("appearance");
  const [contextMemory, setContextMemory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContextMemory(settings?.contextMemory ?? "");
  }, [settings]);

  const handleSaveMemory = async () => {
    setIsLoading(true);
    try {
      await updateSettings({ 
        contextMemory, 
        theme: (theme as "light" | "dark") || "dark" 
      });
      toast.success("Context memory saved!");
    } catch {
      toast.error("Failed to save context memory");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-4 bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex border-b border-border">
            {(["appearance", "memory"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "flex-1 px-4 py-3 text-sm font-medium transition-colors capitalize",
                  activeTab === tab
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-6 max-h-96 overflow-y-auto scrollbar-thin">
            {activeTab === "appearance" && (
              <div className="space-y-4">
                <h3 className="font-medium mb-3">Theme</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-colors",
                      theme === "light"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-secondary"
                    )}
                  >
                    <Sun className="w-5 h-5" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex items-center justify-center gap-2 px-4 py-4 rounded-xl border transition-colors",
                      theme === "dark"
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-secondary"
                    )}
                  >
                    <Moon className="w-5 h-5" />
                    Dark
                  </button>
                </div>
              </div>
            )}

            {activeTab === "memory" && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Context Memory</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add context that Kateno AI will remember across all your conversations.
                  </p>
                </div>
                <textarea
                  value={contextMemory}
                  onChange={(e) => setContextMemory(e.target.value)}
                  placeholder="E.g., I'm a software developer working on a React project. I prefer TypeScript and functional components..."
                  className="w-full h-40 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={handleSaveMemory}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Context Memory
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
