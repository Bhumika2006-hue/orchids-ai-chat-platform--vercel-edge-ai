import { describe, it, expect, vi } from 'vitest';
import { getAvailableProviders, getActiveProvider } from '@/lib/config';

describe('AI Provider Integration', () => {
  describe('getAvailableProviders', () => {
    it('always includes mock provider', () => {
      const providers = getAvailableProviders();
      const mockProvider = providers.find((p) => p.name === 'mock');
      expect(mockProvider).toBeDefined();
      expect(mockProvider?.available).toBe(true);
    });

    it('returns providers in fallback order', () => {
      const providers = getAvailableProviders();
      expect(providers.length).toBeGreaterThanOrEqual(1);
      expect(providers[providers.length - 1].name).toBe('mock');
    });
  });

  describe('getActiveProvider', () => {
    it('returns an available provider', () => {
      const provider = getActiveProvider();
      expect(provider).toBeDefined();
      expect(provider.available).toBe(true);
    });

    it('returns deepseek as the active provider', () => {
      const provider = getActiveProvider();
      expect(provider.name).toBe('deepseek');
    });
  });
});
