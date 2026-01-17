import type { AIProvider, AIProviderConfig } from '@/types';

export const config = {
  app: {
    name: 'NexusAI',
    description: 'AI-powered chat platform',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  ai: {
    defaultProvider: 'openai' as AIProvider,
    maxTokens: 4096,
    temperature: 0.7,
    streamingEnabled: true,
  },
  auth: {
    sessionMaxAge: 30 * 24 * 60 * 60,
    allowAnonymous: true,
  },
  rateLimit: {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
  tools: {
    canvas: { enabled: true },
    codeGenerator: { enabled: true },
    imageGenerator: { enabled: !!process.env.IMAGE_API_KEY },
    voiceInput: { enabled: true },
    webSearch: { enabled: !!process.env.TAVILY_API_KEY },
  },
} as const;

export function getAvailableProviders(): AIProviderConfig[] {
  const providers: AIProviderConfig[] = [];

  if (process.env.OPENAI_API_KEY) {
    providers.push({
      name: 'openai',
      available: true,
      model: 'gpt-4o-mini',
    });
  }

  if (process.env.HUGGINGFACE_API_KEY) {
    providers.push({
      name: 'huggingface',
      available: true,
      model: 'meta-llama/Llama-3.2-3B-Instruct',
    });
  }

  providers.push({
    name: 'mock',
    available: true,
    model: 'mock-v1',
  });

  return providers;
}

export function getActiveProvider(): AIProviderConfig {
  const providers = getAvailableProviders();
  return providers.find((p) => p.name !== 'mock' && p.available) || providers[providers.length - 1];
}
