import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/lib/db';

describe('Database Layer', () => {
  describe('User Operations', () => {
    it('creates anonymous user', async () => {
      const user = await db.user.createAnonymous();
      expect(user.id).toBeDefined();
      expect(user.isAnonymous).toBe(true);
      expect(user.name).toContain('Guest-');
    });

    it('creates user with data', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        image: null,
        isAnonymous: false,
      };
      const user = await db.user.create(userData);
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
    });

    it('finds user by id', async () => {
      const created = await db.user.createAnonymous();
      const found = await db.user.findById(created.id);
      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
    });

    it('finds user by email', async () => {
      const email = `test-${Date.now()}@example.com`;
      await db.user.create({
        name: 'Email User',
        email,
        image: null,
        isAnonymous: false,
      });
      const found = await db.user.findByEmail(email);
      expect(found).not.toBeNull();
      expect(found?.email).toBe(email);
    });
  });

  describe('Conversation Operations', () => {
    it('creates conversation', async () => {
      const user = await db.user.createAnonymous();
      const conv = await db.conversation.create(user.id, 'Test Chat');
      expect(conv.id).toBeDefined();
      expect(conv.title).toBe('Test Chat');
      expect(conv.userId).toBe(user.id);
    });

    it('finds conversations by user id', async () => {
      const user = await db.user.createAnonymous();
      await db.conversation.create(user.id, 'Chat 1');
      await db.conversation.create(user.id, 'Chat 2');
      const conversations = await db.conversation.findByUserId(user.id);
      expect(conversations.length).toBeGreaterThanOrEqual(2);
    });

    it('updates conversation title', async () => {
      const user = await db.user.createAnonymous();
      const conv = await db.conversation.create(user.id, 'Original');
      const updated = await db.conversation.update(conv.id, { title: 'Updated' });
      expect(updated?.title).toBe('Updated');
    });

    it('deletes conversation', async () => {
      const user = await db.user.createAnonymous();
      const conv = await db.conversation.create(user.id, 'To Delete');
      const deleted = await db.conversation.delete(conv.id);
      expect(deleted).toBe(true);
      const found = await db.conversation.findById(conv.id);
      expect(found).toBeNull();
    });
  });

  describe('Message Operations', () => {
    it('creates message', async () => {
      const user = await db.user.createAnonymous();
      const conv = await db.conversation.create(user.id, 'Chat');
      const msg = await db.message.create({
        role: 'user',
        content: 'Hello',
        conversationId: conv.id,
      });
      expect(msg.id).toBeDefined();
      expect(msg.content).toBe('Hello');
    });

    it('finds messages by conversation', async () => {
      const user = await db.user.createAnonymous();
      const conv = await db.conversation.create(user.id, 'Chat');
      await db.message.create({ role: 'user', content: 'Hello', conversationId: conv.id });
      await db.message.create({ role: 'assistant', content: 'Hi', conversationId: conv.id });
      const messages = await db.message.findByConversationId(conv.id);
      expect(messages.length).toBe(2);
    });
  });
});
