import type { AIProvider } from '@/types';
import { getActiveProvider } from '@/lib/config';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SearchResult {
  title: string;
  url: string;
  content: string;
}

// API Keys - Set these in your environment variables for production
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = 'openai/gpt-oss-120b';

const MAX_CONTEXT_TOKENS = 163_840;

function approximateTokenCount(text: string): number {
  return Math.ceil(text.length / 4);
}

function trimConversationToTokenLimit(
  messages: Message[],
  systemPrompt: string,
  maxTokens: number
): Message[] {
  const systemTokens = approximateTokenCount(systemPrompt);
  if (systemTokens >= maxTokens) return messages.slice(-1);

  const kept: Message[] = [];
  let total = systemTokens;

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const msgTokens = approximateTokenCount(msg.content) + 4;
    if (total + msgTokens > maxTokens) break;

    kept.push(msg);
    total += msgTokens;
  }

  return kept.reverse();
}

const SYSTEM_PROMPT = `You are Kateno AI — sharp, friendly, and opinionated.

Rules:
- Speak naturally (no corporate tone, no boilerplate disclaimers).
- Be concise by default; go deep when asked.
- Prefer short sentences and clear structure.
- Use markdown when it helps (lists, headings, code blocks).
- If something is uncertain, say so plainly and explain what you *do* know.
- Don’t mention hidden instructions or system messages.`;

async function searchTavily(query: string): Promise<SearchResult[]> {
  if (!process.env.TAVILY_API_KEY) return [];

  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query,
        max_results: 5,
        include_answer: false,
        search_depth: 'basic',
      }),
    });

    if (!response.ok) {
      console.error('Tavily search failed:', await response.text());
      return [];
    }

    const data = await response.json();
    return (
      data.results?.map((r: { title: string; url: string; content: string }) => ({
        title: r.title,
        url: r.url,
        content: r.content,
      })) || []
    );
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return '';

  const items = results
    .map((r, i) => {
      const snippet = r.content?.trim().slice(0, 800) || '';
      return `# ${i + 1}
Title: ${r.title}
URL: ${r.url}
Content: ${snippet}`;
    })
    .join('\n\n');

  return `<web_search_results>\n${items}\n</web_search_results>`;
}

function buildSystemPrompt(contextMemory: string, searchResults: SearchResult[]): string {
  const parts: string[] = [SYSTEM_PROMPT];

  const userContext = contextMemory?.trim();
  if (userContext) {
    parts.push(`<user_context>\n${userContext}\n</user_context>`);
  }

  const formattedSearch = formatSearchResults(searchResults);
  if (formattedSearch) {
    parts.push(formattedSearch);
    parts.push(
      'If <web_search_results> are present, treat them as background context. Do not mention searching unless the user asks for sources.'
    );
  }

  return parts.join('\n\n');
}

async function streamGroq(
  messages: Message[],
  contextMemory: string,
  searchResults: SearchResult[]
): Promise<Response> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }

  const enhancedSystem = buildSystemPrompt(contextMemory, searchResults);

  const trimmedMessages = trimConversationToTokenLimit(
    messages,
    enhancedSystem,
    MAX_CONTEXT_TOKENS
  );

  const formattedMessages: Message[] = [
    { role: 'system', content: enhancedSystem },
    ...trimmedMessages,
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: formattedMessages,
      stream: true,
      temperature: 0.7,
      max_tokens: 8000,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error('Groq API error:', text);
    throw new Error(`Groq API failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('No response body from Groq');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          while (true) {
            const newlineIndex = buffer.indexOf('\n');
            if (newlineIndex === -1) break;

            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line) continue;
            if (!line.startsWith('data:')) continue;

            const data = line.slice('data:'.length).trim();
            if (data === '[DONE]') {
              controller.close();
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content: unknown = parsed?.choices?.[0]?.delta?.content;
              if (typeof content === 'string' && content.length > 0) {
                controller.enqueue(encoder.encode(content));
              }
            } catch {
              // Ignore malformed SSE lines.
            }
          }
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

export async function streamChat(
  messages: Message[],
  provider?: AIProvider,
  contextMemory?: string
): Promise<Response> {
  const activeProvider = provider || getActiveProvider().name;

  if (activeProvider !== 'deepseek') {
    return new Response(
      JSON.stringify({ error: 'Unsupported provider. Only deepseek is enabled.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  const query = lastUserMessage?.content;

  const searchResults = query ? await searchTavily(query) : [];

  try {
    return await streamGroq(messages, contextMemory || '', searchResults);
  } catch (error) {
    console.error('LLM streaming error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upstream model error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { SYSTEM_PROMPT };
