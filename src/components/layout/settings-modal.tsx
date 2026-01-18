"use client";

import { useState, useEffect } from "react";
import { X, Moon, Sun, User, LogOut, Save, Settings as SettingsIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ChainLogo } from "@/components/ui/chain-logo";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { user, settings, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, updateSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<"account" | "appearance" | "memory">("account");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [contextMemory, setContextMemory] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setContextMemory(settings?.contextMemory ?? "");
  }, [settings]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        toast.success("Account created successfully!");
      } else {
        await signInWithEmail(email, password);
        toast.success("Signed in successfully!");
      }
      setEmail("");
      setPassword("");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Google sign in failed";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Logout failed";
      toast.error(errorMessage);
    }
  };

  const handleSaveMemory = async () => {
    if (!user) {
      toast.error("Please sign in to save context memory");
      return;
    }
    try {
      await updateSettings({ 
        contextMemory, 
        theme: (theme as "light" | "dark") || "dark" 
      });
      toast.success("Context memory saved!");
    } catch {
      toast.error("Failed to save context memory");
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
            {(["account", "appearance", "memory"] as const).map((tab) => (
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
            {activeTab === "account" && (
              <div className="space-y-6">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/50">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full" />
                      ) : (
                        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{user.displayName || "User"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <ChainLogo size={48} className="mx-auto mb-3" />
                      <h3 className="font-semibold">Sign in to Kateno AI</h3>
                      <p className="text-sm text-muted-foreground">Save your chats and settings</p>
                    </div>

                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continue with Google
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isSignUp ? "Create Account" : "Sign In"}
                      </button>
                    </form>

                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                    </button>
                  </div>
                )}
              </div>
            )}

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
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-medium hover:opacity-90 transition-opacity"
                >
                  <Save className="w-4 h-4" />
                  Save Context Memory
                </button>
                {!user && (
                  <p className="text-sm text-muted-foreground text-center">
                    Sign in to save your context memory
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
