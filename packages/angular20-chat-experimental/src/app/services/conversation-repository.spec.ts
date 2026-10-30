import { ConversationRepository } from './conversation-repository';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('ConversationRepository', () => {
  it('persists CRUD changes and reloads them without message-state duplication', async () => {
    const storage = new MemoryStorage();
    const repository = new ConversationRepository(storage, {
      storageKey: 'history-test',
      pageSize: 3,
      delayMs: 0,
    });
    await repository.save({ id: 'one', title: 'Alpha', createdAt: 1, updatedAt: 10 });
    await repository.save({ id: 'two', title: 'Beta', createdAt: 2, updatedAt: 20 });
    await repository.rename('one', 'Alpha renamed');

    const reloaded = new ConversationRepository(storage, {
      storageKey: 'history-test',
      pageSize: 3,
      delayMs: 0,
    });
    expect((await reloaded.list()).items.map((item) => item.title)).toEqual([
      'Alpha renamed',
      'Beta',
    ]);

    await reloaded.remove('two');
    expect((await reloaded.list()).items.map((item) => item.id)).toEqual(['one']);
  });

  it('groups pinned, today, and older records while supporting search and cursor paging', async () => {
    const now = Date.now();
    const storage = new MemoryStorage();
    const repository = new ConversationRepository(storage, {
      storageKey: 'group-test',
      pageSize: 2,
      delayMs: 0,
      now: () => now,
    });
    await repository.reset([
      { id: 'pinned', title: 'Pinned project', createdAt: now, updatedAt: now, pinned: true },
      { id: 'today', title: 'Today project', createdAt: now, updatedAt: now - 1 },
      {
        id: 'older',
        title: 'Older project',
        createdAt: now - 172_800_000,
        updatedAt: now - 172_800_000,
      },
    ]);

    const first = await repository.list();
    expect(first.groups.map((group) => group.group)).toEqual(['置顶', '今天']);
    expect(first.nextCursor).toBe('2');
    const second = await repository.list(undefined, first.nextCursor);
    expect(second.groups.map((group) => group.group)).toEqual(['更早']);
    expect((await repository.list('older')).items.map((item) => item.id)).toEqual(['older']);
  });

  it('recovers from corrupt storage with an empty valid page', async () => {
    const storage = new MemoryStorage();
    storage.setItem('corrupt-test', '{not-json');
    const repository = new ConversationRepository(storage, {
      storageKey: 'corrupt-test',
      pageSize: 3,
      delayMs: 0,
    });

    expect(await repository.list()).toEqual({ items: [], groups: [], total: 0 });
    expect(storage.getItem('corrupt-test')).toBe('[]');
  });

  it('simulates delay and a recoverable one-shot failure', async () => {
    const repository = new ConversationRepository(new MemoryStorage(), {
      storageKey: 'failure-test',
      pageSize: 3,
      delayMs: 5,
    });
    repository.setFailureMode('once');
    const startedAt = performance.now();

    await expectAsync(repository.list()).toBeRejectedWithError('模拟历史服务暂时不可用');
    expect(performance.now() - startedAt).toBeGreaterThanOrEqual(4);
    await expectAsync(repository.list()).toBeResolvedTo({ items: [], groups: [], total: 0 });
  });
});
