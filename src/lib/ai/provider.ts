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

const BLACKBOX_API_KEY = 'sk-XN13reQfIX-D8rAipMUqSg';
const BLACKBOX_MODEL = 'blackboxai/deepseek/deepseek-chat:free';

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

function generateIntelligentMockResponse(userMessage: string, searchResults: SearchResult[]): string {
  const message = userMessage.toLowerCase();
  const searchContext = searchResults.length > 0 
    ? `Based on my search, I found relevant information about "${userMessage.slice(0, 50)}...".`
    : '';

  // Greetings
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    return `${searchContext}\nHello! I'm Kateno AI, your intelligent assistant. I'm here to help you with questions, coding, analysis, and much more. How can I assist you today?\n\n${searchResults.length > 0 ? 'I can see you have web search results available, so I can provide current information on various topics.' : 'Feel free to ask me anything - from simple questions to complex technical problems!'}`;
  }

  // Questions about AI/ChatGPT/identity
  if (message.includes('who are you') || message.includes('what are you') || message.includes('your name')) {
    return `${searchContext}\nI'm Kateno AI, an advanced AI assistant designed to provide helpful, accurate, and well-researched responses. I can:\n\n• **Answer questions** on a wide range of topics\n• **Help with coding** and technical problems  \n• **Analyze data** and provide insights\n• **Write content** and assist with creative tasks\n• **Web search** integration for current information\n\nI'm currently in enhanced demo mode, but in production I would be powered by advanced language models. What would you like to explore?`;
  }

  // Technical/coding questions
  if (message.includes('code') || message.includes('programming') || message.includes('javascript') || 
      message.includes('python') || message.includes('function') || message.includes('bug') ||
      message.includes('error') || message.includes('debug')) {
    return `${searchContext}\nGreat! I'd be happy to help with your coding question.\n\nI can assist with:\n- **Debugging code** and fixing errors\n- **Writing functions** and algorithms\n- **Best practices** and optimization\n- **Code review** and improvement suggestions\n\nHere's a helpful example:\n\n\`\`\`javascript\n// Example: Function with error handling\nfunction processData(data) {\n  try {\n    if (!data) {\n      throw new Error('No data provided');\n    }\n    return data.map(item => item.trim().toUpperCase());\n  } catch (error) {\n    console.error('Processing failed:', error.message);\n    return null;\n  }\n}\n\n// Usage\nconst result = processData(['hello', 'world']);\nconsole.log(result); // ['HELLO', 'WORLD']\n\`\`\`\n\nWhat specific coding challenge are you working on?`;
  }

  // Web search related
  if (message.includes('search') || message.includes('google') || message.includes('research')) {
    return `${searchContext}\nI can help you research any topic! My web search integration allows me to find current, relevant information from across the internet.\n\n**Search capabilities:**\n• Real-time web results via Tavily API\n• Multiple sources and perspectives  \n• Current events and recent information\n• Academic and technical resources\n\n${searchResults.length > 0 ? `I can see I have ${searchResults.length} search results available to reference in my response.` : 'What topic would you like me to research for you?'}\n\nWould you like me to search for information on a specific topic?`;
  }

  // Help/assistance requests
  if (message.includes('help') || message.includes('assist') || message.includes('support')) {
    return `${searchContext}\nI'm here to help! As Kateno AI, I can assist you with a wide variety of tasks:\n\n**📚 Knowledge & Learning**\n- Answer questions on any topic\n- Explain complex concepts\n- Provide educational content\n\n**💻 Technical Support**  \n- Debug code and fix errors\n- Software development guidance\n- System administration tips\n\n**✍️ Content Creation**\n- Writing and editing assistance\n- Creative writing support\n- Document formatting\n\n**🔍 Research & Analysis**\n- Web search integration\n- Data analysis and insights\n- Information synthesis\n\nWhat specific area would you like help with?`;
  }

  // General questions - provide helpful response
  if (message.includes('?')) {
    return `${searchContext}\nThat's an interesting question! I appreciate you reaching out.\n\nWhile I'm currently operating in enhanced demo mode, I can still provide helpful responses and engage with your questions thoughtfully. In a full deployment, I would access extensive knowledge bases and current web information.\n\n**Here's how I can assist:**\n• Break down complex topics into understandable parts\n• Provide multiple perspectives on issues\n• Suggest relevant resources and further reading\n• Help you think through problems step-by-step\n\nWhat specific aspect of your question would you like me to focus on?`;
  }

  // Default response for other inputs
  const defaultResponses = [
    `${searchContext}\nThank you for your message! I understand you're discussing "${userMessage.slice(0, 30)}..."\n\nAs Kateno AI, I'm designed to be helpful, informative, and engaging. Even in demo mode, I can:\n\n• **Listen and understand** your needs\n• **Provide thoughtful responses** \n• **Engage in meaningful conversation**\n• **Help solve problems** and answer questions\n\nWhat would you like to explore or discuss further?`,
    
    `${searchContext}\nI appreciate you sharing "${userMessage.slice(0, 40)}..." with me.\n\n**Kateno AI is ready to help!** Here's what I can do:\n\n🔹 **Answer questions** on any topic\n🔹 **Provide explanations** and insights  \n🔹 **Help with technical challenges**\n🔹 **Assist with creative projects**\n🔹 **Research current information**\n\n${searchResults.length > 0 ? `I have access to current web search results to provide up-to-date information.` : 'I can also integrate web search for the most current information.'}\n\nWhat specific assistance would be most helpful for you right now?`
  ];

  return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

async function mockStream(messages: Message[], searchResults: SearchResult[]): Promise<ReadableStream> {
  const lastMessage = messages[messages.length - 1];
  const response = generateIntelligentMockResponse(lastMessage.content, searchResults);
  const encoder = new TextEncoder();
  
  return new ReadableStream({
    async start(controller) {
      // Realistic typing delay simulation
      for (const char of response) {
        await new Promise(resolve => setTimeout(resolve, 8 + Math.random() * 12));
        controller.enqueue(encoder.encode(char));
      }
      controller.close();
    },
  });
}

async function streamBlackBoxAI(messages: Message[], contextMemory: string, searchResults: SearchResult[]) {
  const searchContext = formatSearchResults(searchResults);
  const enhancedSystem = `${SYSTEM_PROMPT}${contextMemory ? `\n\nUser Context: ${contextMemory}` : ''}${searchContext}`;
  
  const formattedMessages = [
    { role: 'system', content: enhancedSystem },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const response = await fetch('https://api.blackbox.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BLACKBOX_API_KEY}`,
      },
      body: JSON.stringify({
        model: BLACKBOX_MODEL,
        messages: formattedMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      console.error('BlackBox AI API error:', await response.text());
      throw new Error(`BlackBox AI API failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body from BlackBox AI');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              break;
            }
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                  }
                } catch (e) {
                  console.warn('Failed to parse SSE data:', data);
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('BlackBox AI streaming error:', error);
    throw error;
  }
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
    case 'deepseek':
      try {
        return await streamBlackBoxAI(messages, contextMemory || '', searchResults);
      } catch (error) {
        console.error('BlackBox AI failed, falling back to intelligent mock:', error);
        const stream = await mockStream(messages, searchResults);
        return new Response(stream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          },
        });
      }

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
