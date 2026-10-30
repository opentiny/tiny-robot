import type { SkillDefinition } from '@opentiny/tiny-robot-kit';

export interface TestSkill extends SkillDefinition {
  label: string;
  group: '内容' | '多模态' | '工具';
  dependency?: 'mcp';
}

export interface TestSkillState {
  installed: boolean;
  enabled: boolean;
  selected: boolean;
}
