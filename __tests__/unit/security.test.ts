import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, generateCSRFToken, validateCSRFToken } from '@/lib/utils/security';

describe('Security Utils', () => {
  describe('checkRateLimit', () => {
    it('allows requests under limit', async () => {
      const result = await checkRateLimit('test-user-1');
      expect(result.success).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('tracks request count', async () => {
      const id = 'test-user-count-' + Date.now();
      const first = await checkRateLimit(id);
      const second = await checkRateLimit(id);
      expect(second.remaining).toBeLessThan(first.remaining);
    });
  });

  describe('CSRF Token', () => {
    it('generates unique tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(token1).not.toBe(token2);
      expect(token1.length).toBe(64);
    });

    it('validates matching tokens', () => {
      const token = generateCSRFToken();
      expect(validateCSRFToken(token, token)).toBe(true);
    });

    it('rejects mismatched tokens', () => {
      const token1 = generateCSRFToken();
      const token2 = generateCSRFToken();
      expect(validateCSRFToken(token1, token2)).toBe(false);
    });

    it('rejects empty tokens', () => {
      expect(validateCSRFToken('', 'token')).toBe(false);
      expect(validateCSRFToken('token', '')).toBe(false);
    });
  });
});
