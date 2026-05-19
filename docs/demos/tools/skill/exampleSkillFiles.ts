import type { SkillFile } from '@opentiny/tiny-robot-kit/core'

export const exampleSkillFiles: SkillFile[] = [
  {
    path: 'SKILL.md',
    kind: 'text',
    content: `---
name: weather
description: Answer weather questions with concise current conditions and forecast guidance.
---

# Weather Skill

Use this skill when the user asks about weather, temperature, rain, wind, or forecast.
Always mention the target location and keep the answer concise.`,
  },
  {
    path: 'references/weather-format.md',
    kind: 'text',
    content: 'Return current condition first, then list the next forecast point when available.',
  },
]
