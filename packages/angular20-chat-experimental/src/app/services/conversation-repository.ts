import type {
  ConversationGroup,
  ConversationPage,
  ConversationRecord,
} from '../models/conversation-record';

type FailureMode = 'off' | 'once' | 'always';

export interface ConversationRepositoryOptions {
  storageKey: string;
  pageSize: number;
  delayMs: number;
  now?: () => number;
}

const DEFAULT_OPTIONS: ConversationRepositoryOptions = {
  storageKey: 'tiny-robot-angular20-history-index-v1',
  pageSize: 8,
  delayMs: 80,
};

export class ConversationRepository {
  private readonly options: ConversationRepositoryOptions;
  private records: ConversationRecord[];
  private failureMode: FailureMode = 'off';

  constructor(
    private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage,
    options: Partial<ConversationRepositoryOptions> = {},
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.records = this.load();
  }

  async list(query = '', cursor?: string): Promise<ConversationPage> {
    await this.wait();
    this.maybeFail();
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = this.sort(
      normalizedQuery
        ? this.records.filter((record) =>
            record.title.toLocaleLowerCase().includes(normalizedQuery),
          )
        : this.records,
    );
    const offset = this.parseCursor(cursor);
    const items = filtered.slice(offset, offset + this.options.pageSize);
    const nextOffset = offset + items.length;
    return {
      items: this.clone(items),
      groups: this.group(items),
      ...(nextOffset < filtered.length ? { nextCursor: String(nextOffset) } : {}),
      total: filtered.length,
    };
  }

  async save(record: ConversationRecord): Promise<void> {
    const next = this.clone(record);
    const index = this.records.findIndex((item) => item.id === record.id);
    if (index === -1) this.records.push(next);
    else this.records[index] = next;
    this.persist();
  }

  async rename(id: string, title: string): Promise<void> {
    const record = this.records.find((item) => item.id === id);
    if (!record) return;
    record.title = title;
    record.updatedAt = this.now();
    this.persist();
  }

  async remove(id: string): Promise<void> {
    this.records = this.records.filter((item) => item.id !== id);
    this.persist();
  }

  setFailureMode(mode: FailureMode | boolean): void {
    this.failureMode = typeof mode === 'boolean' ? (mode ? 'always' : 'off') : mode;
  }

  async reset(records: readonly ConversationRecord[] = []): Promise<void> {
    this.records = this.clone([...records]);
    this.persist();
  }

  private load(): ConversationRecord[] {
    const raw = this.storage.getItem(this.options.storageKey);
    if (!raw) return [];
    try {
      const value: unknown = JSON.parse(raw);
      if (!Array.isArray(value) || !value.every((item) => this.isRecord(item))) {
        throw new Error('Invalid conversation index');
      }
      return this.clone(value);
    } catch {
      this.storage.setItem(this.options.storageKey, '[]');
      return [];
    }
  }

  private isRecord(value: unknown): value is ConversationRecord {
    if (!value || typeof value !== 'object') return false;
    const record = value as Partial<ConversationRecord>;
    return (
      typeof record.id === 'string' &&
      typeof record.title === 'string' &&
      typeof record.createdAt === 'number' &&
      typeof record.updatedAt === 'number'
    );
  }

  private persist(): void {
    this.storage.setItem(this.options.storageKey, JSON.stringify(this.records));
  }

  private sort(records: readonly ConversationRecord[]): ConversationRecord[] {
    return [...records].sort(
      (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || b.updatedAt - a.updatedAt,
    );
  }

  private group(records: readonly ConversationRecord[]): ConversationGroup[] {
    const groups = new Map<ConversationGroup['group'], ConversationRecord[]>();
    for (const record of records) {
      const group = record.pinned ? '置顶' : this.isToday(record.updatedAt) ? '今天' : '更早';
      const items = groups.get(group) ?? [];
      items.push(this.clone(record));
      groups.set(group, items);
    }
    return (['置顶', '今天', '更早'] as const)
      .filter((group) => groups.has(group))
      .map((group) => ({ group, items: groups.get(group)! }));
  }

  private isToday(timestamp: number): boolean {
    const date = new Date(timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp);
    const now = new Date(this.now());
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  }

  private parseCursor(cursor?: string): number {
    const offset = Number(cursor ?? 0);
    return Number.isSafeInteger(offset) && offset >= 0 ? offset : 0;
  }

  private maybeFail(): void {
    if (this.failureMode === 'off') return;
    if (this.failureMode === 'once') this.failureMode = 'off';
    throw new Error('模拟历史服务暂时不可用');
  }

  private wait(): Promise<void> {
    return this.options.delayMs > 0
      ? new Promise((resolve) => setTimeout(resolve, this.options.delayMs))
      : Promise.resolve();
  }

  private now(): number {
    return this.options.now?.() ?? Date.now();
  }

  private clone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
