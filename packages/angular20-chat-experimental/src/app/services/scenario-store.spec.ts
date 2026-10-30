import { ScenarioStore } from './scenario-store';

describe('ScenarioStore', () => {
  it('derives overall readiness and preserves partial failure details', () => {
    const store = new ScenarioStore(['chat', 'history']);
    expect(store.overall()).toBe('pending');
    store.mark('chat', 'ready');
    store.mark('history', 'failed', 'history unavailable');
    expect(store.overall()).toBe('partial');
    expect(store.scenarios()['history'].detail).toBe('history unavailable');
    store.mark('history', 'ready');
    expect(store.overall()).toBe('ready');
  });

  it('tracks provider mode, stale state, reset, and teardown', () => {
    let now = 100;
    const store = new ScenarioStore(['chat'], () => now);
    store.setProviderMode('deepseek');
    store.mark('chat', 'ready');
    now = 10_000;
    expect(store.isStale('chat', 1_000)).toBeTrue();
    expect(store.providerMode()).toBe('deepseek');
    store.reset();
    expect(store.overall()).toBe('pending');
    expect(store.providerMode()).toBe('local');
    store.destroy();
    store.mark('chat', 'ready');
    expect(store.overall()).toBe('pending');
  });
});
