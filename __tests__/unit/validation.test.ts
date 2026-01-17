import { describe, it, expect } from 'vitest';
import { sanitizeInput, validateAndSanitize, MessageSchema } from '@/lib/utils/validation';

describe('Validation Utils', () => {
  describe('sanitizeInput', () => {
    it('removes script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      expect(sanitizeInput(input)).toBe('Hello');
    });

    it('removes javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      expect(sanitizeInput(input)).not.toContain('javascript:');
    });

    it('removes event handlers', () => {
      const input = 'onclick=alert(1)';
      expect(sanitizeInput(input)).not.toContain('onclick=');
    });

    it('trims whitespace', () => {
      const input = '  hello world  ';
      expect(sanitizeInput(input)).toBe('hello world');
    });
  });

  describe('MessageSchema', () => {
    it('validates correct message', () => {
      const message = { role: 'user', content: 'Hello' };
      expect(() => MessageSchema.parse(message)).not.toThrow();
    });

    it('rejects empty content', () => {
      const message = { role: 'user', content: '' };
      expect(() => MessageSchema.parse(message)).toThrow();
    });

    it('rejects invalid role', () => {
      const message = { role: 'invalid', content: 'Hello' };
      expect(() => MessageSchema.parse(message)).toThrow();
    });
  });
});
