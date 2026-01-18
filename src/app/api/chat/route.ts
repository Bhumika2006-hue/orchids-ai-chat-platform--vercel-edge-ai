import { NextRequest, NextResponse } from 'next/server';
import { streamChat } from '@/lib/ai/provider';
import { ChatRequestSchema, validateAndSanitize } from '@/lib/utils/validation';
import { checkRateLimit } from '@/lib/utils/security';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    
    const rateLimitResult = await checkRateLimit(ip);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before sending more messages.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, contextMemory } = validateAndSanitize(ChatRequestSchema, body);

    const response = await streamChat(messages, undefined, contextMemory || '');
    
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
