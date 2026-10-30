import { signal } from '@angular/core';
import type { SkillDefinition } from '@opentiny/tiny-robot-kit';
import type { TestSkill, TestSkillState } from '../models/test-skill';

const CATALOG: readonly TestSkill[] = [
  {
    name: 'project-summary',
    label: '项目摘要',
    group: '内容',
    description: '用结构化方式总结项目上下文。',
    instructions: '请按“目标、现状、风险、下一步”四个小节回答，并明确这是项目摘要 Skill。',
  },
  {
    name: 'image-analysis',
    label: '图片分析',
    group: '多模态',
    description: '优先描述图片中的界面结构与异常。',
    instructions: '收到图片时，请先描述视觉结构，再列出可访问性和交互风险。',
  },
  {
    name: 'mcp-tool-assistant',
    label: 'MCP 工具助手',
    group: '工具',
    dependency: 'mcp',
    description: '引导模型优先调用已启用的 MCP 工具。',
    instructions: '当存在匹配的 MCP 工具时必须先调用工具，再根据工具结果回答。',
  },
];

const EMPTY_STATE = (): TestSkillState => ({ installed: false, enabled: false, selected: false });

export class SkillTestService {
  readonly catalog = signal<TestSkill[]>(CATALOG.map((skill) => ({ ...skill })));
  readonly resolvedSkillNames = signal<string[]>([]);
  private readonly states = signal<Record<string, TestSkillState>>({});
  private readonly mcpAvailable = signal(false);

  constructor(
    private readonly storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage,
    private readonly storageKey = 'tiny-robot-angular20-skills-v1',
  ) {
    this.states.set(this.load());
  }

  stateFor(name: string): TestSkillState {
    return { ...(this.states()[name] ?? EMPTY_STATE()) };
  }

  install(name: string): void {
    this.assertSkill(name);
    this.update(name, { installed: true, enabled: true });
  }

  remove(name: string): void {
    this.assertSkill(name);
    this.update(name, EMPTY_STATE());
  }

  setEnabled(name: string, enabled: boolean): void {
    const state = this.stateFor(name);
    if (!state.installed) throw new Error(`Skill 尚未安装：${name}`);
    this.update(name, { enabled, ...(enabled ? {} : { selected: false }) });
  }

  setSelected(name: string, selected: boolean): void {
    const state = this.stateFor(name);
    if (!state.installed || !state.enabled) throw new Error(`Skill 尚未启用：${name}`);
    this.update(name, { selected });
  }

  activeDefinitions(): SkillDefinition[] {
    return this.catalog().filter((skill) => {
      const state = this.stateFor(skill.name);
      return (
        state.installed &&
        state.enabled &&
        state.selected &&
        this.dependencyStatus(skill.name) === 'ready'
      );
    });
  }

  dependencyStatus(name: string): 'ready' | 'missing' {
    const skill = this.assertSkill(name);
    return skill.dependency === 'mcp' && !this.mcpAvailable() ? 'missing' : 'ready';
  }

  setMcpAvailable(available: boolean): void {
    this.mcpAvailable.set(available);
  }

  recordResolved(names: readonly string[]): void {
    this.resolvedSkillNames.set([...names]);
  }

  private update(name: string, patch: Partial<TestSkillState>): void {
    this.states.update((states) => ({ ...states, [name]: { ...this.stateFor(name), ...patch } }));
    this.persist();
  }

  private assertSkill(name: string): TestSkill {
    const skill = this.catalog().find((item) => item.name === name);
    if (!skill) throw new Error(`未知 Skill：${name}`);
    return skill;
  }

  private load(): Record<string, TestSkillState> {
    const raw = this.storage.getItem(this.storageKey);
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
        throw new Error('invalid');
      return parsed as Record<string, TestSkillState>;
    } catch {
      this.storage.setItem(this.storageKey, '{}');
      return {};
    }
  }

  private persist(): void {
    this.storage.setItem(this.storageKey, JSON.stringify(this.states()));
  }
}

export const defaultSkillTestService = new SkillTestService();
