import type { BasePluginContext, MessageEnginePlugin } from '../types'
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
  const active = (context: BasePluginContext) => toolsEnabled(context) && skillEnabled(context)
  let emptyCatalogChecked = false

  return {
    ...hooks,
    name: 'skill',
    onInit(context) {
      readSessionCatalog(context.initialMessages, sessionId)
      return hooks.onInit?.(context)
    },
    async onTurnStart(context) {
      if (!getToolPlugin(context)) throw new Error('skillPlugin session mode requires a toolPlugin')
      if (active(context)) {
        const restored = readSessionCatalog(context.getState().messages, sessionId)
        if (restored === undefined && !emptyCatalogChecked) {
          const candidates = await makeAbortable(Promise.resolve(getSkillCandidates(context)), context.abortSignal)
          context.abortSignal.throwIfAborted()
          if (active(context)) {
            if (candidates.length) insertInitialSkillCatalog(context, createSkillCatalogMessage(sessionId, candidates))
            else emptyCatalogChecked = true
          }
        }
      }
      if (active(context)) {
        const requests = context.currentTurn.flatMap((message) => {
          const names = readRequestedSkillNames(message)
          return names.length ? [{ message, names }] : []
        })
        if (explicitSkillLoading === 'preload') {
          const replacingPreloads = new Set(requests.map(({ message }) => message))
          for (const { message, names } of requests) {
            const result = await loader.load(names, context, replacingPreloads)
            context.abortSignal.throwIfAborted()
            if (!active(context)) break
            attachSkillPreload(context, message, sessionId, result)
            replacingPreloads.delete(message)
          }
        }
      }
      if (skillEnabled(context)) await hooks.onTurnStart?.(context)
    },
    async onBeforeRequest(context) {
      const modelLoadsSkills = explicitSkillLoading === 'model'
      if (modelLoadsSkills) await hooks.onBeforeRequest?.(context)
      context.requestBody.messages = projectSkillMessages(
        context.requestBody.messages,
        sessionId,
        modelLoadsSkills && active(context),
      )
      if (!modelLoadsSkills) await hooks.onBeforeRequest?.(context)
    },
    provideTools(context) {
      return toolsEnabled(context) ? tools : []
    },
  }
}
