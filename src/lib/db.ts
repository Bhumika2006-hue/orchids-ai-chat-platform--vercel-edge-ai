// Database layer for testing - using in-memory storage
import { randomUUID } from 'crypto';

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  isAnonymous: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: Date;
  conversationId: string;
}

// In-memory storage for testing
const users = new Map<string, User>();
const conversations = new Map<string, Conversation>();
const messages = new Map<string, Message[]>();

export const db = {
  user: {
    async create(data: Partial<User>): Promise<User> {
      const user: User = {
        id: randomUUID(),
        name: data.name || null,
        email: data.email || null,
        image: data.image || null,
        isAnonymous: data.isAnonymous || false,
      };
      users.set(user.id, user);
      return user;
    },

    async createAnonymous(): Promise<User> {
      const user: User = {
        id: randomUUID(),
        name: `Guest-${Math.floor(Math.random() * 10000)}`,
        email: null,
        image: null,
        isAnonymous: true,
      };
      users.set(user.id, user);
      return user;
    },

    async findById(id: string): Promise<User | null> {
      return users.get(id) || null;
    },

    async findByEmail(email: string): Promise<User | null> {
      for (const user of users.values()) {
        if (user.email === email) {
          return user;
        }
      }
      return null;
    },
  },

  conversation: {
    async create(userId: string, title: string): Promise<Conversation> {
      const conversation: Conversation = {
        id: randomUUID(),
        title,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      conversations.set(conversation.id, conversation);
      return conversation;
    },

    async findByUserId(userId: string): Promise<Conversation[]> {
      const userConversations: Conversation[] = [];
      for (const conv of conversations.values()) {
        if (conv.userId === userId) {
          userConversations.push(conv);
        }
      }
      return userConversations.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    },

    async findById(id: string): Promise<Conversation | null> {
      return conversations.get(id) || null;
    },

    async update(id: string, data: Partial<Conversation>): Promise<Conversation | null> {
      const conversation = conversations.get(id);
      if (!conversation) return null;

      const updated = { ...conversation, ...data, updatedAt: new Date() };
      conversations.set(id, updated);
      return updated;
    },

    async delete(id: string): Promise<boolean> {
      return conversations.delete(id);
    },
  },

  message: {
    async create(data: { role: 'user' | 'assistant' | 'system'; content: string; conversationId: string }): Promise<Message> {
      const message: Message = {
        id: randomUUID(),
        role: data.role,
        content: data.content,
        conversationId: data.conversationId,
        createdAt: new Date(),
      };
      
      const conversationMessages = messages.get(data.conversationId) || [];
      conversationMessages.push(message);
      messages.set(data.conversationId, conversationMessages);
      
      return message;
    },

    async findByConversationId(conversationId: string): Promise<Message[]> {
      return messages.get(conversationId) || [];
    },
  },
};