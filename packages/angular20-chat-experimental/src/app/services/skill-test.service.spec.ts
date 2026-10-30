import { SkillTestService } from './skill-test.service';

class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  private readonly values = new Map<string, string>();
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

describe('SkillTestService', () => {
  it('provides grouped catalog and persists install, enable, and selection state', () => {
    const storage = new MemoryStorage();
    const service = new SkillTestService(storage, 'skills-test');
    expect(service.catalog().map((skill) => skill.name)).toEqual([
      'project-summary',
      'image-analysis',
      'mcp-tool-assistant',
    ]);

    service.install('project-summary');
    service.setEnabled('project-summary', true);
    service.setSelected('project-summary', true);
    expect(service.activeDefinitions().map((skill) => skill.name)).toEqual(['project-summary']);

    const restored = new SkillTestService(storage, 'skills-test');
    expect(restored.stateFor('project-summary')).toEqual({
      installed: true,
      enabled: true,
      selected: true,
    });
    restored.remove('project-summary');
    expect(restored.activeDefinitions()).toEqual([]);
  });

  it('recovers from corrupt storage and exposes MCP dependency readiness', () => {
    const storage = new MemoryStorage();
    storage.setItem('skills-corrupt', '{bad');
    const service = new SkillTestService(storage, 'skills-corrupt');
    expect(service.stateFor('project-summary').installed).toBeFalse();
    expect(service.dependencyStatus('mcp-tool-assistant')).toBe('missing');
    service.setMcpAvailable(true);
    expect(service.dependencyStatus('mcp-tool-assistant')).toBe('ready');
  });

  it('records only enabled and selected skills as resolved for the current request', () => {
    const service = new SkillTestService(new MemoryStorage(), 'skills-resolved');
    for (const name of ['project-summary', 'image-analysis'] as const) {
      service.install(name);
      service.setEnabled(name, true);
      service.setSelected(name, name === 'image-analysis');
    }
    service.recordResolved(service.activeDefinitions().map((skill) => skill.name));
    expect(service.resolvedSkillNames()).toEqual(['image-analysis']);
  });
});
