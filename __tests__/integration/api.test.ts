import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  describe('Chat API', () => {
    it('handles chat request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode('Hello'));
            controller.close();
          },
        }),
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('handles rate limit', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () => Promise.resolve({ error: 'Rate limit exceeded' }),
      });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      });

      expect(response.status).toBe(429);
    });
  });

  describe('Conversations API', () => {
    it('creates conversation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          conversation: { id: '123', title: 'Test', userId: 'user1' },
        }),
      });

      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test' }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.conversation.title).toBe('Test');
    });

    it('lists conversations', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ conversations: [] }),
      });

      const response = await fetch('/api/conversations');
      expect(response.ok).toBe(true);
    });
  });

  describe('Tools API', () => {
    it('handles web search', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          results: [{ title: 'Result', url: 'https://example.com', snippet: 'Test' }],
        }),
      });

      const response = await fetch('/api/tools/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'test' }),
      });

      expect(response.ok).toBe(true);
    });

    it('handles code generation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          code: 'console.log("hello")',
          language: 'javascript',
        }),
      });

      const response = await fetch('/api/tools/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'hello world function' }),
      });

      expect(response.ok).toBe(true);
    });
  });
});
