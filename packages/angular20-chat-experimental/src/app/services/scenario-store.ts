import { computed, signal } from '@angular/core';

export type ScenarioStatus = 'pending' | 'ready' | 'failed';
export interface ScenarioState {
  status: ScenarioStatus;
  detail?: string;
  updatedAt: number;
}

export class ScenarioStore<T extends string = string> {
  readonly scenarios;
  readonly providerMode = signal<'local' | 'deepseek'>('local');
  readonly overall;
  private destroyed = false;

  constructor(
    private readonly ids: readonly T[],
    private readonly now: () => number = () => Date.now(),
  ) {
    this.scenarios = signal<Record<T, ScenarioState>>(this.initialState());
    this.overall = computed<'pending' | 'partial' | 'ready'>(() => {
      const values = Object.values(this.scenarios()) as ScenarioState[];
      if (values.every((state) => state.status === 'ready')) return 'ready';
      if (values.some((state) => state.status === 'ready' || state.status === 'failed'))
        return 'partial';
      return 'pending';
    });
  }

  mark(id: T, status: ScenarioStatus, detail?: string): void {
    if (this.destroyed) return;
    this.scenarios.update((states) => ({
      ...states,
      [id]: { status, ...(detail ? { detail } : {}), updatedAt: this.now() },
    }));
  }

  setProviderMode(mode: 'local' | 'deepseek'): void {
    if (!this.destroyed) this.providerMode.set(mode);
  }

  isStale(id: T, maxAgeMs: number): boolean {
    return this.now() - this.scenarios()[id].updatedAt > maxAgeMs;
  }

  reset(): void {
    if (this.destroyed) return;
    this.scenarios.set(this.initialState());
    this.providerMode.set('local');
  }

  destroy(): void {
    this.destroyed = true;
  }

  private initialState(): Record<T, ScenarioState> {
    return Object.fromEntries(
      this.ids.map((id) => [id, { status: 'pending', updatedAt: this.now() }]),
    ) as Record<T, ScenarioState>;
  }
}
