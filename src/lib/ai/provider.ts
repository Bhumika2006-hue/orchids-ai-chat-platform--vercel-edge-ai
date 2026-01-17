import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
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

const SYSTEM_PROMPT = `You are Kateno AI, an advanced AI assistant that provides accurate, well-researched responses. You have access to real-time web search results to ensure your answers are current and factual.

Guidelines:
- Provide clear, structured responses
- Use markdown formatting for readability
- When providing code, use proper markdown code blocks with language specification
- Reference search results when relevant to provide accurate information
- Be concise but thorough
- If you're unsure about something, acknowledge it`;

async function searchTavily(query: string): Promise<SearchResult[]> {
  if (!process.env.TAVILY_API_KEY) {
    return [];
  }
  
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
    return data.results?.map((r: { title: string; url: string; content: string }) => ({
      title: r.title,
      url: r.url,
      content: r.content,
    })) || [];
  } catch (error) {
    console.error('Tavily search error:', error);
    return [];
  }
}

function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) return '';
  
  return `\n\n[Web Search Results]\n${results.map((r, i) => 
    `${i + 1}. ${r.title}\n   ${r.content.slice(0, 200)}...\n   Source: ${r.url}`
  ).join('\n\n')}\n\n[End of Search Results]\n`;
}

async function mockStream(messages: Message[], searchResults: SearchResult[]): Promise<ReadableStream> {
  const lastMessage = messages[messages.length - 1];
  const searchContext = searchResults.length > 0 
    ? `Based on my search, I found relevant information about "${lastMessage.content.slice(0, 50)}".`
    : '';
  
  const mockResponses = [
    `${searchContext}\n\nI understand you're asking about "${lastMessage.content.slice(0, 50)}...". Here's what I can tell you:\n\nThis is a mock response demonstrating Kateno AI's capabilities. In production with an OpenAI API key, this would be replaced with intelligent AI-generated content.\n\n**Key points:**\n- Kateno AI is working correctly\n- Your message was received and processed\n- Web search integration is ${searchResults.length > 0 ? 'active' : 'available with Tavily API key'}`,
    `${searchContext}\n\nGreat question! Let me help you with that.\n\n\`\`\`javascript\n// Example code\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('World'));\n\`\`\`\n\nThis demonstrates Kateno AI's code formatting with scrollable blocks.`,
    `${searchContext}\n\nI've analyzed your request. Here are my thoughts:\n\n1. **Understanding**: Your query has been processed\n2. **Analysis**: Kateno AI is simulating a thoughtful response\n3. **Conclusion**: Everything is working as expected!\n\n> Note: This is mock mode - add your OpenAI API key for full functionality.`,
  ];
  
  const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      for (const char of response) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        controller.enqueue(encoder.encode(char));
      }
      controller.close();
    },
  });
}

async function streamOpenAI(messages: Message[], contextMemory: string, searchResults: SearchResult[]) {
  const searchContext = formatSearchResults(searchResults);
  const enhancedSystem = `${SYSTEM_PROMPT}${contextMemory ? `\n\nUser Context: ${contextMemory}` : ''}${searchContext}`;
  
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: enhancedSystem,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  });

  return result.toTextStreamResponse();
}

export async function streamChat(
  messages: Message[], 
  provider?: AIProvider,
  contextMemory?: string
): Promise<Response> {
  const activeProvider = provider || getActiveProvider().name;
  const lastUserMessage = messages.filter(m => m.role === 'user').pop();
  
  let searchResults: SearchResult[] = [];
  if (lastUserMessage && process.env.TAVILY_API_KEY) {
    searchResults = await searchTavily(lastUserMessage.content);
  }

  switch (activeProvider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        return streamChat(messages, 'mock', contextMemory);
      }
      return streamOpenAI(messages, contextMemory || '', searchResults);

    case 'mock':
    default:
      const stream = await mockStream(messages, searchResults);
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
  }
}

export { SYSTEM_PROMPT };
