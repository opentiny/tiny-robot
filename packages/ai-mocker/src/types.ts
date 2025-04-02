export interface ChatCompletionRequestMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  name?: string;
}