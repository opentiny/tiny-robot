import {
  getSkillRequestContext,
  skillPlugin,
  type UseMessagePlugin,
} from '@opentiny/tiny-robot-kit';
import type { SkillTestService } from './services/skill-test.service';

export function createSkillRuntimePlugins(service: SkillTestService): UseMessagePlugin[] {
  return [
    skillPlugin({
      selection: () => ({ mode: 'manual', skills: service.activeDefinitions() }),
      onSkillsResolved: (skillContext) => {
        service.recordResolved(skillContext.skillNames);
      },
      onBeforeRequest(context) {
        const instructions = getSkillRequestContext(context)?.instructions ?? [];
        if (instructions.length === 0) return;
        context.requestBody.messages = [
          { role: 'system', content: instructions.join('\n\n') },
          ...context.requestBody.messages,
        ];
      },
    }),
  ];
}
