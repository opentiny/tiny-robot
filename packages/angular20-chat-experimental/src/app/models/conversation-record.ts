export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ConversationGroup {
  group: '置顶' | '今天' | '更早';
  items: readonly ConversationRecord[];
}

export interface ConversationPage {
  items: readonly ConversationRecord[];
  groups: readonly ConversationGroup[];
  nextCursor?: string;
  total: number;
}
