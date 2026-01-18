import { z } from 'zod';

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(163840),
});

export const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1),
  conversationId: z.string().optional(),
  contextMemory: z.string().max(163840).optional(),
});

export const ConversationSchema = z.object({
  title: z.string().min(1).max(200),
});

export const CanvasElementSchema = z.object({
  id: z.string(),
  type: z.enum(['path', 'line', 'rect', 'circle']),
  points: z.array(z.object({ x: z.number(), y: z.number() })).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  color: z.string(),
  strokeWidth: z.number(),
});

export const StickyNoteSchema = z.object({
  id: z.string(),
  x: z.number(),
  y: z.number(),
  content: z.string().max(500),
  color: z.string(),
});

export const CanvasStateSchema = z.object({
  elements: z.array(CanvasElementSchema),
  notes: z.array(StickyNoteSchema),
});

export const CodeGeneratorSchema = z.object({
  prompt: z.string().min(1).max(2000),
  language: z.string().optional(),
});

export const ImageGeneratorSchema = z.object({
  prompt: z.string().min(1).max(1000),
});

export const WebSearchSchema = z.object({
  query: z.string().min(1).max(500),
});

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const parsed = schema.parse(data);
  if (typeof parsed === 'object' && parsed !== null) {
    const sanitized = JSON.parse(JSON.stringify(parsed, (_, value) => {
      if (typeof value === 'string') {
        return sanitizeInput(value);
      }
      return value;
    }));
    return sanitized as T;
  }
  return parsed;
}
