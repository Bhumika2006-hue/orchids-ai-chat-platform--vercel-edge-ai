"use client";

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, Auth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, deleteDoc, updateDoc, query, where, orderBy, Timestamp, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDEAOr3iqU6TJZ6uztMvC5mquZECPcBkkE",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fir-config-d3c36.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "fir-config-d3c36",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "fir-config-d3c36.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "477435579926",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:477435579926:web:d370e9fb5a3c5a05316f37",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let googleProvider: GoogleAuthProvider | null = null;
let initialized = false;

function initializeFirebase() {
  if (initialized || typeof window === 'undefined') return;
  
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    initialized = true;
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  contextMemory: string;
  theme: 'light' | 'dark';
}

export const firebaseAuth = {
  isConfigured: true,

  signInWithGoogle: async () => {
    initializeFirebase();
    if (!auth || !googleProvider) throw new Error('Firebase not initialized');
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  signInWithEmail: async (email: string, password: string) => {
    initializeFirebase();
    if (!auth) throw new Error('Firebase not initialized');
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  signUpWithEmail: async (email: string, password: string) => {
    initializeFirebase();
    if (!auth) throw new Error('Firebase not initialized');
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  signOut: async () => {
    if (!auth) return;
    await signOut(auth);
  },

  onAuthChange: (callback: (user: User | null) => void) => {
    initializeFirebase();
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => auth?.currentUser || null,
};

export const firebaseDb = {
  isConfigured: true,

  async saveConversation(userId: string, conversation: Omit<Conversation, 'userId'>): Promise<void> {
    initializeFirebase();
    if (!db) return;

    const docRef = doc(db, 'conversations', conversation.id);

    let createdAt = conversation.createdAt;
    let title = conversation.title;

    try {
      const existing = await getDoc(docRef);
      if (existing.exists()) {
        const data = existing.data();

        if (data.createdAt?.toDate) {
          createdAt = data.createdAt.toDate();
        }

        const existingTitle = data.title;
        if (typeof existingTitle === 'string' && existingTitle.trim() && existingTitle !== 'New Chat') {
          title = existingTitle;
        } else if (existingTitle === 'New Chat' && conversation.title !== 'New Chat') {
          title = conversation.title;
        }
      }
    } catch {
      // If we can't read the existing doc (network/rules), we still try writing.
    }

    await setDoc(
      docRef,
      {
        ...conversation,
        title,
        userId,
        createdAt: Timestamp.fromDate(createdAt),
        updatedAt: Timestamp.fromDate(conversation.updatedAt),
        messages: conversation.messages.map((m) => ({
          ...m,
          timestamp: Timestamp.fromDate(m.timestamp),
        })),
      },
      { merge: true }
    );
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    initializeFirebase();
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          title: data.title,
          messages: data.messages?.map((m: { id: string; role: 'user' | 'assistant'; content: string; timestamp: Timestamp }) => ({
            ...m,
            timestamp: m.timestamp.toDate(),
          })) || [],
          createdAt: data.createdAt.toDate(),
          updatedAt: data.updatedAt.toDate(),
        };
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  async getConversation(conversationId: string): Promise<Conversation | null> {
    initializeFirebase();
    if (!db) return null;
    try {
      const docRef = doc(db, 'conversations', conversationId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      const data = snapshot.data();
      return {
        id: snapshot.id,
        userId: data.userId,
        title: data.title,
        messages: data.messages?.map((m: { id: string; role: 'user' | 'assistant'; content: string; timestamp: Timestamp }) => ({
          ...m,
          timestamp: m.timestamp.toDate(),
        })) || [],
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      };
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  },

  async deleteConversation(conversationId: string): Promise<void> {
    initializeFirebase();
    if (!db) return;
    await deleteDoc(doc(db, 'conversations', conversationId));
  },

  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    initializeFirebase();
    if (!db) return;
    await updateDoc(doc(db, 'conversations', conversationId), {
      title,
      updatedAt: Timestamp.now(),
    });
  },

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    initializeFirebase();
    if (!db) return null;
    try {
      const docRef = doc(db, 'userSettings', userId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;
      return snapshot.data() as UserSettings;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      return null;
    }
  },

  async saveUserSettings(userId: string, settings: UserSettings): Promise<void> {
    initializeFirebase();
    if (!db) return;
    await setDoc(doc(db, 'userSettings', userId), settings);
  },
};

export const isFirebaseConfigured = true;
export { auth, db };
