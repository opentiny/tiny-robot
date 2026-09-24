<script setup lang="ts">
import { computed, nextTick, ref, shallowRef, watch } from 'vue'
import { IconClose, IconFileFolder, IconSuccess } from '@opentiny/tiny-robot-svgs'
import { useStableId } from '../shared/composables'
import type { SkillImportFormEmits, SkillImportFormInput, SkillImportFormProps, SkillDefinition } from './index.type'
import { resolveSkillWithKit } from './resolver'
import {
  DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE,
  formatSkillAddMaxUploadSize,
  parseSkillAddGithubUrl,
  validateSkillAddBrowserSelection,
} from './validation'

const props = withDefaults(defineProps<SkillImportFormProps>(), {
  source: 'local',
  maxUploadSize: DEFAULT_SKILL_ADD_MAX_UPLOAD_SIZE,
})
const emit = defineEmits<SkillImportFormEmits>()
const fileInput = ref<HTMLInputElement>()
const githubInput = ref<HTMLInputElement>()
const browserFiles = ref<File[]>([])
const githubUrl = ref('')
const resolverErrorMessage = ref('')
const resolvedDefinition = shallowRef<SkillDefinition>()
const resolving = ref(false)
const browserSubmitAttempted = ref(false)
const browserSelectionGeneration = ref(0)
let resolverGeneration = 0
const dragging = ref(false)
const componentId = `skill-add-${useStableId()}`
const browserDescriptionId = `${componentId}-browser-description`
const githubUrlId = `${componentId}-github-url`
const errorId = `${componentId}-error`

const totalSize = computed(() => browserFiles.value.reduce((total, file) => total + file.size, 0))
const maxUploadSizeLabel = computed(() => formatSkillAddMaxUploadSize(props.maxUploadSize))
const hasBrowserFiles = computed(() => browserFiles.value.length > 0)
const browserSelectionError = computed(() =>
  hasBrowserFiles.value || browserSubmitAttempted.value
    ? validateSkillAddBrowserSelection(browserFiles.value, { maxUploadSize: props.maxUploadSize })
    : '',
)
const errorMessage = computed(() => browserSelectionError.value || resolverErrorMessage.value)
const showBrowserSuccess = computed(
  () => hasBrowserFiles.value && !browserSelectionError.value && Boolean(resolvedDefinition.value),
)
const browserSubmitDisabled = computed(
  () => resolving.value || Boolean(browserSelectionError.value) || !resolvedDefinition.value,
)

const packageName = computed(() => {
  const files = browserFiles.value
  const relativePath = files.find((file) => file.webkitRelativePath)?.webkitRelativePath
  const rootName = relativePath?.split('/').filter(Boolean)[0]

  if (rootName) return rootName
  if (files.length === 1) return files[0]?.name ?? 'Skill 包'
  return `已选择 ${files.length} 个文件`
})

const formatFileSize = (size: number) => {
  if (size < 1024) return `${size.toFixed(2)}B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)}KB`
  return `${(size / 1024 / 1024).toFixed(2)}MB`
}

const toSkillAddMessage = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)

  if (message.includes('entry file "SKILL.md" is missing')) return 'Skill 包必须包含 SKILL.md 文件'
  if (message.includes('entry file "SKILL.md" must be a text file')) return 'SKILL.md 必须是文本文件'
  if (message.includes('must contain instructions')) return 'SKILL.md 必须包含技能说明'
  if (error instanceof Error && error.name === 'YAMLParseError') return 'SKILL.md 的 YAML 格式不正确'

  return message
}

const invalidateResolution = () => {
  resolverGeneration += 1
  resolving.value = false
  resolverErrorMessage.value = ''
  resolvedDefinition.value = undefined
}

const resolveSkill = async (input: SkillImportFormInput) => {
  const generation = ++resolverGeneration
  resolving.value = true
  resolverErrorMessage.value = ''
  resolvedDefinition.value = undefined

  try {
    const definition = await (props.resolveSkill ?? resolveSkillWithKit)(input)
    if (generation !== resolverGeneration) return undefined

    resolvedDefinition.value = definition
    return definition
  } catch (error) {
    if (generation !== resolverGeneration) return undefined
    resolverErrorMessage.value = toSkillAddMessage(error)
    return undefined
  } finally {
    if (generation === resolverGeneration) resolving.value = false
  }
}

const updateBrowserFiles = (files: File[]) => {
  browserSubmitAttempted.value = false
  browserFiles.value = files
  invalidateResolution()

  if (!validateSkillAddBrowserSelection(files, { maxUploadSize: props.maxUploadSize })) {
    void resolveSkill({ source: 'local', files: [...files] })
  }
}

const handleRemoveBrowserFiles = () => {
  browserSelectionGeneration.value += 1
  updateBrowserFiles([])
  void nextTick(() => fileInput.value?.focus())
}

const handleFileChange = (event: Event) => {
  browserSelectionGeneration.value += 1
  const input = event.target as HTMLInputElement
  updateBrowserFiles(Array.from(input.files ?? []))
  input.value = ''
}

const withRelativePath = (file: File, path: string) => {
  const result = new File([file], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  })
  Object.defineProperty(result, 'webkitRelativePath', { configurable: true, value: path })
  return result
}

const readDirectoryEntries = async (reader: FileSystemDirectoryReader) => {
  const entries: FileSystemEntry[] = []

  while (true) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject))
    if (!batch.length) return entries
    entries.push(...batch)
  }
}

const readDroppedEntry = async (entry: FileSystemEntry, parentPath = ''): Promise<File[]> => {
  const path = parentPath ? `${parentPath}/${entry.name}` : entry.name

  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => (entry as FileSystemFileEntry).file(resolve, reject))
    return [withRelativePath(file, path)]
  }

  if (!entry.isDirectory) return []

  const children = await readDirectoryEntries((entry as FileSystemDirectoryEntry).createReader())
  const nestedFiles = await Promise.all(children.map((child) => readDroppedEntry(child, path)))
  return nestedFiles.flat()
}

const getDroppedFiles = async (dataTransfer: DataTransfer) => {
  const entries = Array.from(dataTransfer.items ?? [])
    .map((item) => item.webkitGetAsEntry())
    .filter((entry): entry is FileSystemEntry => entry !== null)

  if (!entries.length) return Array.from(dataTransfer.files ?? [])

  const files = await Promise.all(entries.map((entry) => readDroppedEntry(entry)))
  return files.flat()
}

const handleDrop = async (event: DragEvent) => {
  dragging.value = false
  if (!event.dataTransfer) return

  const selectionGeneration = ++browserSelectionGeneration.value
  let files: File[]

  try {
    files = await getDroppedFiles(event.dataTransfer)
  } catch (error) {
    if (selectionGeneration !== browserSelectionGeneration.value) return

    invalidateResolution()
    resolverErrorMessage.value = toSkillAddMessage(error)
    return
  }

  if (selectionGeneration !== browserSelectionGeneration.value) return

  updateBrowserFiles(files)
}

const handleDragEnter = () => {
  dragging.value = true
}

const handleDragLeave = (event: DragEvent) => {
  const currentTarget = event.currentTarget as HTMLElement
  if (!currentTarget.contains(event.relatedTarget as Node | null)) dragging.value = false
}

const handleGithubInput = (event: Event) => {
  githubUrl.value = (event.target as HTMLInputElement).value
  invalidateResolution()
}

const focusInvalidInput = () => {
  void nextTick(() => {
    if (props.source === 'local') fileInput.value?.focus()
    else githubInput.value?.focus()
  })
}

const handleSubmit = async () => {
  if (resolving.value) return

  if (props.source === 'local') {
    browserSubmitAttempted.value = true
    if (browserSelectionError.value) {
      focusInvalidInput()
      return
    }

    if (resolvedDefinition.value) emit('submit', resolvedDefinition.value)
    return
  }

  let input: Extract<SkillImportFormInput, { source: 'github' }>
  try {
    input = parseSkillAddGithubUrl(githubUrl.value)
  } catch (error) {
    resolverErrorMessage.value = toSkillAddMessage(error)
    focusInvalidInput()
    return
  }

  const definition = await resolveSkill(input)
  if (definition) emit('submit', definition)
}

const handleCancel = () => {
  emit('cancel')
}

watch(
  () => props.source,
  () => {
    browserSelectionGeneration.value += 1
    browserFiles.value = []
    githubUrl.value = ''
    browserSubmitAttempted.value = false
    invalidateResolution()
    dragging.value = false
  },
)
</script>

<template>
  <form class="skill-add" novalidate @submit.prevent="handleSubmit">
    <template v-if="props.source === 'local'">
      <div class="skill-add__browser">
        <div class="skill-add__dropzone-wrapper">
          <label
            class="skill-add__dropzone"
            :class="{
              'skill-add__dropzone--dragging': dragging,
              'skill-add__dropzone--selected': showBrowserSuccess,
              'skill-add__dropzone--invalid': Boolean(errorMessage),
            }"
            data-testid="skill-dropzone"
            @dragenter.prevent="handleDragEnter"
            @dragover.prevent
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <input
              ref="fileInput"
              class="skill-add__file-input"
              type="file"
              aria-label="Skill 包"
              :aria-describedby="errorMessage ? errorId : browserDescriptionId"
              :aria-invalid="Boolean(errorMessage)"
              webkitdirectory
              directory
              multiple
              @change="handleFileChange"
            />

            <template v-if="showBrowserSuccess">
              <span class="skill-add__folder" aria-hidden="true"><IconFileFolder /></span>
              <span class="skill-add__file-details">
                <strong>{{ packageName }}</strong>
                <small>{{ formatFileSize(totalSize) }}</small>
              </span>
              <IconSuccess class="skill-add__success" data-testid="skill-validation-success" aria-hidden="true" />
            </template>

            <template v-else>
              <svg class="skill-add__upload-icon" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M10 12.5V3.5m0 0L6.5 7M10 3.5 13.5 7M3 12v2.25A2.75 2.75 0 0 0 5.75 17h8.5A2.75 2.75 0 0 0 17 14.25V12"
                />
              </svg>
              <strong class="skill-add__upload-title">
                {{ resolving ? '正在校验…' : '点击或拖拽上传Skill包' }}
              </strong>
              <span :id="browserDescriptionId" class="skill-add__upload-description"
                >技能包需要包含SKILL.md文件、以YAML格式编辑技能名称和描述，{{ maxUploadSizeLabel }}M以内</span
              >
            </template>
          </label>

          <button
            v-if="showBrowserSuccess"
            class="skill-add__remove"
            type="button"
            :aria-label="`移除 ${packageName}`"
            @click="handleRemoveBrowserFiles"
          >
            <IconClose aria-hidden="true" />
          </button>
        </div>

        <p v-if="errorMessage" :id="errorId" class="skill-add__error" role="alert">{{ errorMessage }}</p>

        <div class="skill-add__footer">
          <button class="skill-add__button skill-add__button--secondary" type="button" @click="handleCancel">
            取消
          </button>
          <button class="skill-add__button skill-add__button--primary" type="submit" :disabled="browserSubmitDisabled">
            确定
          </button>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="skill-add__github">
        <label class="skill-add__field-label" :for="githubUrlId">URL</label>
        <input
          :id="githubUrlId"
          ref="githubInput"
          class="skill-add__url-input"
          type="url"
          :value="githubUrl"
          :aria-describedby="errorMessage ? errorId : undefined"
          :aria-invalid="Boolean(errorMessage)"
          :disabled="resolving"
          placeholder="https://github.com/username/repo/tree/main/skills"
          @input="handleGithubInput"
        />
        <p v-if="errorMessage" :id="errorId" class="skill-add__error" role="alert">{{ errorMessage }}</p>

        <div class="skill-add__footer">
          <button class="skill-add__button skill-add__button--primary" type="submit" :disabled="resolving">
            {{ resolving ? '导入中…' : '导入' }}
          </button>
        </div>
      </div>
    </template>
  </form>
</template>

<style lang="less" scoped>
.skill-add {
  --skill-import-form-primary-color: var(--tr-skill-import-form-primary-color, #191919);

  width: 100%;
  color: var(--tr-text-primary, #191919);
  font-size: 14px;
  box-sizing: border-box;
}

.skill-add__browser,
.skill-add__github {
  display: flex;
  flex-direction: column;
}

.skill-add__browser {
  min-height: 202px;
}

.skill-add__github {
  min-height: 124px;
}

.skill-add__dropzone {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  min-height: 132px;
  padding: 20px;
  border: 1px dashed var(--tr-border-color, #c2c2c2);
  border-radius: 8px;
  background: var(--tr-container-bg-default, #fff);
  cursor: pointer;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.skill-add__dropzone-wrapper {
  position: relative;
}

.skill-add__dropzone--selected {
  min-height: 80px;
  padding: 16px 72px 16px 24px;
  border-style: solid;
  flex-direction: row;
  justify-content: flex-start;
}

.skill-add__dropzone--dragging {
  border-color: var(--skill-import-form-primary-color);
  background: var(--tr-container-bg-hover, #f5f5f5);
}

.skill-add__dropzone--invalid {
  border-color: var(--tr-color-error, #f23030);
}

.skill-add__dropzone--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.skill-add__dropzone:focus-within {
  outline: 2px solid var(--skill-import-form-primary-color);
  outline-offset: 2px;
}

.skill-add__file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: inherit;
}

.skill-add__upload-icon {
  width: 22px;
  height: 22px;
  margin-bottom: 12px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.25;
}

.skill-add__upload-title {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 20px;
}

.skill-add__upload-description {
  max-width: 290px;
  color: var(--tr-text-secondary, #808080);
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.skill-add__folder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  margin-right: 16px;
  color: #ffb000;
}

.skill-add__folder :deep(svg) {
  width: 44px;
  height: 44px;
}

.skill-add__file-details {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
}

.skill-add__file-details strong {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-add__file-details small {
  color: var(--tr-text-secondary, #808080);
  font-size: 12px;
  line-height: 18px;
}

.skill-add__success {
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  margin-left: 16px;
  color: var(--tr-color-success, #52c41a);
}

.skill-add__remove {
  position: absolute;
  z-index: 1;
  top: 50%;
  right: 24px;
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--tr-text-secondary, #808080);
  cursor: pointer;
  transform: translateY(-50%);
}

.skill-add__remove :deep(svg) {
  width: 16px;
  height: 16px;
}

.skill-add__remove:hover:not(:disabled) {
  background: var(--tr-container-bg-hover, #f5f5f5);
  color: var(--tr-text-primary, #191919);
}

.skill-add__remove:focus-visible {
  outline: 2px solid var(--skill-import-form-primary-color);
  outline-offset: 2px;
}

.skill-add__remove:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.skill-add__field-label {
  margin-bottom: 4px;
  font-size: 12px;
  line-height: 18px;
}

.skill-add__url-input {
  width: 100%;
  height: 30px;
  padding: 4px 10px;
  border: 1px solid var(--tr-border-color, #c2c2c2);
  border-radius: 6px;
  background: var(--tr-container-bg-default, #fff);
  color: var(--tr-text-primary, #191919);
  font: inherit;
  line-height: 20px;
  box-sizing: border-box;
}

.skill-add__url-input:focus-visible {
  border-color: var(--skill-import-form-primary-color);
  outline: 2px solid color-mix(in srgb, var(--skill-import-form-primary-color) 20%, transparent);
  outline-offset: 1px;
}

.skill-add__url-input[aria-invalid='true'] {
  border-color: var(--tr-color-error, #f23030);
}

.skill-add__url-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.skill-add__error {
  margin: 6px 0 0;
  color: var(--tr-color-error, #f23030);
  font-size: 12px;
  line-height: 18px;
}

.skill-add__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: auto;
}

.skill-add__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 76px;
  height: 32px;
  padding: 5px 20px;
  border-radius: 999px;
  font: inherit;
  line-height: 20px;
  cursor: pointer;
  box-sizing: border-box;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.skill-add__button:focus-visible {
  outline: 2px solid var(--skill-import-form-primary-color);
  outline-offset: 2px;
}

.skill-add__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.skill-add__button--secondary {
  border: 1px solid var(--tr-text-primary, #191919);
  background: var(--tr-container-bg-default, #fff);
  color: var(--tr-text-primary, #191919);
}

.skill-add__button--primary {
  border: 1px solid var(--skill-import-form-primary-color);
  background: var(--skill-import-form-primary-color);
  color: var(--tr-text-inverse, #fff);
}

@media (max-width: 480px) {
  .skill-add__browser {
    min-height: 216px;
  }

  .skill-add__dropzone {
    padding: 16px;
  }

  .skill-add__dropzone--selected {
    padding-right: 64px;
  }

  .skill-add__footer {
    gap: 12px;
  }

  .skill-add__button {
    flex: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .skill-add__dropzone,
  .skill-add__button {
    transition: none;
  }
}
</style>
