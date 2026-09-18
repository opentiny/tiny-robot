import { SkillAdd, TrSkillAdd } from '../index'
import type { SkillDefinition as KitSkillDefinition } from '@opentiny/tiny-robot-kit'
import type { SkillAddEmits, SkillAddInput, SkillAddProps, SkillDefinition, SkillResolver } from '../index'

type ComponentsPublicApi = typeof import('../index')
type SkillAddValidationExportsAreInternal =
  Extract<
    keyof ComponentsPublicApi,
    'DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE' | 'validateSkillAddBrowserSelection'
  > extends never
    ? true
    : false

const localInput: SkillAddInput = { source: 'local', files: [] }
const githubInput: SkillAddInput = {
  source: 'github',
  url: 'https://github.com/opentiny/tiny-robot/tree/main/skills/demo',
  repo: 'opentiny/tiny-robot',
  ref: 'main',
  path: 'skills/demo',
}
const definition: SkillDefinition = {
  name: 'demo',
  description: 'Demo skill',
  instructions: '# Demo',
}
const resolver: SkillResolver = async (input) => ({ ...definition, metadata: { source: input.source } })
const props: SkillAddProps = {
  source: 'local',
  maxUploadSize: 10 * 1024 * 1024,
  resolveSkill: resolver,
}
const kitDefinition: KitSkillDefinition = definition
const compatibleDefinition: SkillDefinition = kitDefinition
const skillAddValidationExportsAreInternal: SkillAddValidationExportsAreInternal = true

declare const emit: SkillAddEmits
emit('submit', definition)
emit('cancel')

void SkillAdd
void TrSkillAdd
void localInput
void githubInput
void props
void compatibleDefinition
void skillAddValidationExportsAreInternal
