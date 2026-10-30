export type McpCallStatus = 'running' | 'success' | 'error';

export interface McpCallRecord {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  status: McpCallStatus;
  result?: string;
  error?: string;
  durationMs?: number;
}
