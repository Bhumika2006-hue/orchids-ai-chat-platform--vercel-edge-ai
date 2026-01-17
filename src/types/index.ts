export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  conversationId: string;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAnonymous: boolean;
}

export type AIProvider = 'openai' | 'huggingface' | 'mock';

export interface AIProviderConfig {
  name: AIProvider;
  available: boolean;
  model: string;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

export interface CanvasState {
  elements: CanvasElement[];
  notes: StickyNote[];
}

export interface CanvasElement {
  id: string;
  type: 'path' | 'line' | 'rect' | 'circle';
  points?: { x: number; y: number }[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
}

export interface StickyNote {
  id: string;
  x: number;
  y: number;
  content: string;
  color: string;
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}
