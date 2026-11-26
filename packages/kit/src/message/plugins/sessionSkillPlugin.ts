import type { BasePluginContext, MessageEnginePlugin, MessageRequestBody } from '../types'
import { projectRequestWhenDisabled, type RequestProjectionPlugin } from '../core/requestProjection'
import type { ToolProvider } from './toolPlugin'
import type { SessionSkillPluginOptions } from './skillPlugin.types'
import { makeAbortable } from '../utils'
import { createSessionSkillLoader } from '../../skills/session/loading'
import { createSkillLoadingRuntimeTools } from '../../skills/capabilities/loading'
import { createSessionSkillResourceRuntimeTools } from '../../skills/capabilities/resources'
import { attachSkillPreload, insertInitialSkillCatalog, projectSkillMessages } from '../../skills/session/messages'
import {
  createSkillCatalogMessage,
  isOptionalSkillSessionId,
  readRequestedSkillNames,
  readSessionCatalog,
  asRecord,
} from '../../skills/session/protocol'

const legacyFields = [
  'selection',
  'mode',
  'skills',
  'skillNames',
  'preferredSkillNames',
  'maxSelectedSkills',
  'onInstructionsResolved',
  'onSkillsResolved',
  'onSkillSelectionResolved',
] as const

export const validateSessionSkillOptions = (input: unknown): void => {
  const options = asRecord(input)
  if (!options) throw new TypeError('Invalid session skill options')
  if (options.scope !== 'session') throw new TypeError('Session skills require scope: session')
  if (!isOptionalSkillSessionId(options.sessionId)) throw new TypeError('sessionId must be a non-empty string')
  if (options.deduplication !== undefined && options.deduplication !== 'none' && options.deduplication !== 'context') {
    throw new TypeError('Invalid skill deduplication mode')
  }
  if (
    options.explicitSkillLoading !== undefined &&
    options.explicitSkillLoading !== 'preload' &&
    options.explicitSkillLoading !== 'model'
  ) {
    throw new TypeError('Invalid explicit skill loading mode')
  }
  if (typeof options.getSkillCandidates !== 'function' || typeof options.getSkillByName !== 'function') {
    throw new TypeError('Session skills require getSkillCandidates and getSkillByName')
  }
  if (legacyFields.some((field) => options[field] !== undefined))
    throw new TypeError('Cannot mix session and legacy skill options')
}

const getToolPlugin = (context: BasePluginContext) => context.plugins.find((plugin) => plugin.name === 'tool')
const toolsEnabled = (context: BasePluginContext) => {
  const tool = getToolPlugin(context)
  return Boolean(tool && !(typeof tool.disabled === 'function' ? tool.disabled(context) : tool.disabled))
}

export const createSessionSkillPlugin = (options: SessionSkillPluginOptions): MessageEnginePlugin & ToolProvider => {
  validateSessionSkillOptions(options)
  const {
    scope: _scope,
    sessionId,
    deduplication,
    explicitSkillLoading = 'preload',
    getSkillCandidates,
    getSkillByName,
    ...hooks
  } = options
  const loader = createSessionSkillLoader({ sessionId, deduplication, getSkillByName })
  const tools = [
    ...createSkillLoadingRuntimeTools(sessionId, loader),
    ...createSessionSkillResourceRuntimeTools(getSkillByName),
  ]
  const skillEnabled = (context: BasePluginContext) =>
    !(typeof hooks.disabled === 'function' ? hooks.disabled(context) : hooks.disabled)
  const canDiscover = (context: BasePluginContext) => toolsEnabled(context) && skillEnabled(context)
  const modelLoadsSkills = explicitSkillLoading === 'model'
  const projectRequest = (requestBody: MessageRequestBody) => {
    requestBody.messages = projectSkillMessages(requestBody.messages, sessionId, modelLoadsSkills)
  }

  const plugin: RequestProjectionPlugin & ToolProvider = {
    ...hooks,
    name: 'skill',
    [projectRequestWhenDisabled]: projectRequest,
    onInit(context) {
      readSessionCatalog(context.initialMessages, sessionId)
      return hooks.onInit?.(context)
    },
    async onTurnStart(context) {
      if (!getToolPlugin(context)) throw new Error('skillPlugin session mode requires a toolPlugin')
      if (canDiscover(context) && readSessionCatalog(context.getState().messages, sessionId) === undefined) {
        const candidates = await makeAbortable(Promise.resolve(getSkillCandidates(context)), context.abortSignal)
        context.abortSignal.throwIfAborted()
        if (candidates.length && canDiscover(context)) {
          insertInitialSkillCatalog(context, createSkillCatalogMessage(sessionId, candidates))
        }
      }
      if (skillEnabled(context)) {
        const requests = context.currentTurn.flatMap((message) => {
          const names = readRequestedSkillNames(message)
          return names.length ? [{ message, names }] : []
        })
        if (!modelLoadsSkills) {
          const replacingPreloads = new Set(requests.map(({ message }) => message))
          for (const { message, names } of requests) {
            const result = await loader.load(names, context, replacingPreloads)
            context.abortSignal.throwIfAborted()
            if (!skillEnabled(context)) break
            attachSkillPreload(context, message, sessionId, result)
            replacingPreloads.delete(message)
          }
        }
      }
      if (skillEnabled(context)) await hooks.onTurnStart?.(context)
    },
    async onBeforeRequest(context) {
      if (modelLoadsSkills) await hooks.onBeforeRequest?.(context)
      projectRequest(context.requestBody)
      if (!modelLoadsSkills) await hooks.onBeforeRequest?.(context)
    },
    provideTools(context) {
      return toolsEnabled(context) ? tools : []
    },
  }
  return plugin
}
