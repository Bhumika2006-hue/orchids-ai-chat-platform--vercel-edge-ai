"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { firebaseAuth, firebaseDb, UserSettings } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  settings: UserSettings | null;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateSettings: (settings: UserSettings) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthChange(async (user) => {
      setUser(user);
      if (user) {
        try {
          const userSettings = await firebaseDb.getUserSettings(user.uid);
          setSettings(userSettings || { contextMemory: '', theme: 'dark' });
        } catch (error) {
          console.error('Failed to load settings:', error);
          setSettings({ contextMemory: '', theme: 'dark' });
        }
      } else {
        // Load settings from localStorage for non-authenticated users
        try {
          const savedSettings = localStorage.getItem('kateno-settings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          } else {
            setSettings({ contextMemory: '', theme: 'dark' });
          }
        } catch {
          setSettings({ contextMemory: '', theme: 'dark' });
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await firebaseAuth.signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await firebaseAuth.signInWithEmail(email, password);
    } catch (error) {
      console.error('Email sign in error:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      await firebaseAuth.signUpWithEmail(email, password);
    } catch (error) {
      console.error('Email sign up error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateSettings = async (newSettings: UserSettings) => {
    try {
      if (user) {
        // Save to Firebase for authenticated users
        await firebaseDb.saveUserSettings(user.uid, newSettings);
        setSettings(newSettings);
      } else {
        // Save to localStorage for non-authenticated users
        localStorage.setItem('kateno-settings', JSON.stringify(newSettings));
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      settings,
      isConfigured: true,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      logout,
      updateSettings,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
