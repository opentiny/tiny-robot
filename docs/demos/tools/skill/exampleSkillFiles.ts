import type { SkillDefinition } from '@opentiny/tiny-robot-kit'

export const exampleSkills: SkillDefinition[] = [
  {
    name: 'weather',
    description: 'Answer weather questions with concise current conditions and forecast guidance.',
    instructions: `# Weather Skill

Use this skill when the user asks about weather, temperature, rain, wind, or forecast.
Always mention the target location and keep the answer concise.`,
    resources: [
      {
        path: 'references/weather-format.md',
        kind: 'text',
        resourceId: 'references/weather-format.md',
        text: 'Return current condition first, then list the next forecast point when available.',
        mimeType: 'text/markdown',
      },
      {
        path: 'references/examples/current-weather.md',
        kind: 'text',
        resourceId: 'references/examples/current-weather.md',
        text: 'Example: Shanghai is cloudy, 24°C. Light rain is possible tonight.',
        mimeType: 'text/markdown',
      },
    ],
  },
]
