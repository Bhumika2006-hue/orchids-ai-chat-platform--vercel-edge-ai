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

const SYSTEM_PROMPT = `You are Kateno AI — a sharp, friendly, opinionated AI assistant.

Your goal is to sound like a highly skilled human developer / researcher who enjoys helping, not a robotic helpdesk agent.

Behavior rules:
- Speak naturally, like a real person chatting on Discord or Twitter — not like documentation.
- Avoid phrases like “As an AI language model”, “I can help you with”, or excessive formalities.
- Be confident and slightly opinionated when appropriate. It’s okay to say something is a bad idea and explain why.
- Use casual language when the user is casual. Match the user’s vibe.
- Use humor lightly if it fits, but never cringe or forced.
- Prefer short, clear sentences over long academic paragraphs.
- When explaining complex things, break them down simply, step by step.
- If something is uncertain, say so honestly instead of sounding fake-confident.

Formatting rules:
- Use markdown for clarity (headings, bullet points, code blocks).
- Keep answers structured but not rigid.
- Code should be clean, minimal, and practical — not textbook dumps.

Knowledge & accuracy:
- Prioritize correctness over sounding smart.
- If real-time info is needed and available, use it.
- If you don’t know something, say “I’m not 100% sure” and explain what *is* known.

Personality baseline:
- Smart senior dev energy
- Helpful, not preachy
- Curious, not robotic
- Zero corporate tone

Your responses should feel like:
“a smart friend who knows their stuff”
not
“a customer support chatbot”`;

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

  // Questions about AI/ChatGPT/identity
  if (message.includes('who are you') || message.includes('what are you') || message.includes('your name')) {
    return `${searchContext}\nI'm Kateno AI, an advanced AI assistant designed to provide helpful, accurate, and well-researched responses. I can:

• **Answer questions** on a wide range of topics
• **Help with coding** and technical problems  
• **Analyze data** and provide insights
• **Write content** and assist with creative tasks
• **Web search** integration for current information

I'm currently in enhanced demo mode, but in production I would be powered by advanced language models. What would you like to explore?`;
  }

  // Technical/coding questions - enhanced with Python examples
  if (/\b(code|programming|javascript|python|function|bug|error|debug|fibonacci|series|algorithm)\b/.test(message)) {
    let codeExample = '';
    let language = 'python';
    
    // Specific Python Fibonacci request
    if (message.includes('fibonacci')) {
      codeExample = `def fibonacci_series(n):
    """
    Generate Fibonacci series up to n terms
    """
    fib_series = []
    a, b = 0, 1
    
    for i in range(n):
        fib_series.append(a)
        a, b = b, a + b
    
    return fib_series

# Example usage
n_terms = 10
result = fibonacci_series(n_terms)
print(f"First {n_terms} terms of Fibonacci series:")
print(result)

# Alternative: Using recursion
def fibonacci_recursive(n):
    if n <= 1:
        return n
    return fibonacci_recursive(n-1) + fibonacci_recursive(n-2)

print("Recursive approach (first 10 terms):")
for i in range(10):
    print(f"F({i}) = {fibonacci_recursive(i)}")`;
      language = 'python';
    } else if (message.includes('python')) {
      codeExample = `# Python examples
# 1. Basic function with error handling
def process_data(data):
    try:
        if not data:
            raise ValueError("No data provided")
        return [item.strip().upper() for item in data if item]
    except Exception as e:
        print(f"Error: {e}")
        return None

# 2. Working with lists
numbers = [1, 2, 3, 4, 5]
squared = [x**2 for x in numbers]
print(f"Original: {numbers}")
print(f"Squared: {squared}")

# 3. File handling
def read_file(filename):
    try:
        with open(filename, 'r') as file:
            return file.read()
    except FileNotFoundError:
        return "File not found"
    except Exception as e:
        return f"Error reading file: {e}"

# 4. Class example
class Calculator:
    def add(self, a, b):
        return a + b
    
    def multiply(self, a, b):
        return a * b

calc = Calculator()
print(f"2 + 3 = {calc.add(2, 3)}")
print(f"4 * 5 = {calc.multiply(4, 5)}")`;
      language = 'python';
    } else {
      codeExample = `// General programming examples
// JavaScript function with error handling
function processData(data) {
  try {
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid data format');
    }
    return data
      .filter(item => item && typeof item === 'string')
      .map(item => item.trim().toUpperCase());
  } catch (error) {
    console.error('Processing failed:', error.message);
    return null;
  }
}

// Python equivalent
def process_data(data):
    try:
        if not data or not isinstance(data, list):
            raise ValueError("Invalid data format")
        return [item.strip().upper() for item in data if item]
    except Exception as e:
        print(f"Error: {e}")
        return None

// Usage examples
const result = processData(['hello', ' world', '', 'test']);
console.log(result); // ['HELLO', 'WORLD', 'TEST']`;
      language = 'javascript';
    }
    
    return `${searchContext}\nGreat! I'd be happy to help with your coding question.${codeExample ? `

Here's a helpful example:

\`\`\`${language}
${codeExample}
\`\`\`` : ''}

I can assist with:
- **Debugging code** and fixing errors
- **Writing functions** and algorithms  
- **Best practices** and optimization
- **Code review** and improvement suggestions
- **Python, JavaScript, and other languages**

What specific coding challenge are you working on?`;
  }

  // Help/assistance requests - more specific matching (after technical check)
  if (/\b(help|assist|support)\b/.test(message) && !/\b(code|programming|javascript|python|function|bug|error|debug|fibonacci|series|algorithm)\b/.test(message)) {
    return `${searchContext}\nI'm here to help! As Kateno AI, I can assist you with a wide variety of tasks:

**📚 Knowledge & Learning**
- Answer questions on any topic
- Explain complex concepts
- Provide educational content

**💻 Technical Support**  
- Debug code and fix errors
- Software development guidance
- System administration tips

**✍️ Content Creation**
- Writing and editing assistance
- Creative writing support
- Document formatting

**🔍 Research & Analysis**
- Web search integration
- Data analysis and insights
- Information synthesis

What specific area would you like help with?`;
  }

  // Web search related
  if (message.includes('search') || message.includes('google') || message.includes('research')) {
    return `${searchContext}\nI can help you research any topic! My web search integration allows me to find current, relevant information from across the internet.

**Search capabilities:**
• Real-time web results via Tavily API
• Multiple sources and perspectives  
• Current events and recent information
• Academic and technical resources

${searchResults.length > 0 ? `I can see I have ${searchResults.length} search results available to reference in my response.` : 'What topic would you like me to research for you?'}

Would you like me to search for information on a specific topic?`;
  }

  // Greetings - more specific matching
  if (/^(hello|hi|hey)\b/.test(message)) {
    return `${searchContext}\nHello! I'm Kateno AI, your intelligent assistant. I'm here to help you with questions, coding, analysis, and much more. How can I assist you today?

${searchResults.length > 0 ? 'I can see you have web search results available, so I can provide current information on various topics.' : 'Feel free to ask me anything - from simple questions to complex technical problems!'}`;
  }

  // General questions - provide helpful response
  if (message.includes('?')) {
    return `${searchContext}\nThat's an interesting question! I appreciate you reaching out.

While I'm currently operating in enhanced demo mode, I can still provide helpful responses and engage with your questions thoughtfully. In a full deployment, I would access extensive knowledge bases and current web information.

**Here's how I can assist:**
• Break down complex topics into understandable parts
• Provide multiple perspectives on issues
• Suggest relevant resources and further reading
• Help you think through problems step-by-step

What specific aspect of your question would you like me to focus on?`;
  }

  // Default response for other inputs
  const defaultResponses = [
    `${searchContext}\nThank you for your message! I understand you're discussing "${userMessage.slice(0, 30)}..."

As Kateno AI, I'm designed to be helpful, informative, and engaging. Even in demo mode, I can:

• **Listen and understand** your needs
• **Provide thoughtful responses** 
• **Engage in meaningful conversation**
• **Help solve problems** and answer questions

What would you like to explore or discuss further?`,
    
    `${searchContext}\nI appreciate you sharing "${userMessage.slice(0, 40)}..." with me.

**Kateno AI is ready to help!** Here's what I can do:

🔹 **Answer questions** on any topic
🔹 **Provide explanations** and insights  
🔹 **Help with technical challenges**
🔹 **Assist with creative projects**
🔹 **Research current information**

${searchResults.length > 0 ? `I have access to current web search results to provide up-to-date information.` : 'I can also integrate web search for the most current information.'}

What specific assistance would be most helpful for you right now?`
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