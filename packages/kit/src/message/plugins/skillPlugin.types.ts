import type { BasePluginContext, MessageEnginePlugin } from '../types'
import type { MaybePromise } from '../../types'
import type { SkillCandidate, SkillDefinition } from '../../skills/types'
import type { SkillDeduplication } from '../../skills/session/types'

export type SessionLegacyField =
  | 'selection'
  | 'mode'
  | 'skills'
  | 'skillNames'
  | 'preferredSkillNames'
  | 'maxSelectedSkills'
  | 'onInstructionsResolved'
  | 'onSkillsResolved'
  | 'onSkillSelectionResolved'

export type SessionSkillPluginOptions = MessageEnginePlugin & {
  scope: 'session'
  /** Mark new Skill records and verify saved records that carry a session ID. */
  sessionId?: string
  deduplication?: SkillDeduplication
  /** Resolve an @ mention before requesting the model, or let the model load the named skills. Defaults to preload. */
  explicitSkillLoading?: 'preload' | 'model'
  getSkillCandidates(context: BasePluginContext): MaybePromise<SkillCandidate[]>
  getSkillByName(name: string, context: BasePluginContext): MaybePromise<SkillDefinition | undefined>
} & { [K in SessionLegacyField]?: never }

type ManualSkillSelection =
  | {
      mode: 'manual'
      /**
       * Inline skill definitions.
       */
      skills: SkillDefinition[]
      skillNames?: never
    }
  | {
      mode: 'manual'
      /**
       * Final skill names to resolve via getSkillByName.
       */
      skillNames: string[]
      skills?: never
    }

export interface AutoSkillSelection {
  mode: 'auto'
  /**
   * User-preferred skill names as an automatic selection preference.
   * These are not final selected skills; the selector still decides the final skill set.
   */
  preferredSkillNames?: string[]
  /**
   * Maximum number of skills the selector may enable.
   */
  maxSelectedSkills?: number
}

interface NoSkillSelection {
  mode: 'none'
}

export type SkillSelection = ManualSkillSelection | AutoSkillSelection | NoSkillSelection

export type SkillSelectionStatus =
  | {
      mode: 'manual' | 'none'
      phase: 'ready'
    }
  | {
      mode: 'auto'
      phase: 'selecting'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
      maxSelectedSkills?: number
    }
  | {
      mode: 'auto'
      phase: 'ready'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
      maxSelectedSkills?: number
    }

/**
 * Current request skill context.
 *
 * This context is written to customContext.__tiny_robot_skill so hooks and callbacks
 * can read the same request-level skill state.
 */
export interface SkillRequestContext {
  /**
   * Successfully enabled full skill definitions.
   */
  skills: SkillDefinition[]
  /**
   * Successfully enabled skill names.
   */
  skillNames: string[]
  /**
   * Skill names requested by manual selection or auto select_skills.
   */
  requestedSkillNames: string[]
  /**
   * Requested skill names that could not be resolved into enabled skills.
   */
  unresolvedSkillNames: string[]
  /**
   * Instructions generated for the current skill selection state.
   */
  instructions: string[]
  selection: SkillSelectionStatus
}

export interface SkillResolver {
  /**
   * Resolve full definition by name.
   */
  getSkillByName(name: string, context: BasePluginContext): MaybePromise<SkillDefinition | undefined>
}

interface SkillCandidateProvider {
  /**
   * Returns candidate summaries for automatic selection.
   */
  getSkillCandidates(context: BasePluginContext): MaybePromise<SkillCandidate[]>
}

type ResolverRequiredSelection =
  | AutoSkillSelection
  | Extract<
      ManualSkillSelection,
      {
        skillNames: string[]
      }
    >

type RequireResolver<T extends SkillSelection> =
  Extract<T, ResolverRequiredSelection> extends never ? Partial<SkillResolver> : SkillResolver

type RequireCandidateProvider<T extends SkillSelection> =
  Extract<T, AutoSkillSelection> extends never ? Partial<SkillCandidateProvider> : SkillCandidateProvider

export interface SkillPluginHooks extends MessageEnginePlugin {
  /**
   * Called immediately after new skill instructions are resolved and stored in the skill context.
   */
  onInstructionsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
  /**
   * Called after skills are resolved into their full definitions.
   */
  onSkillsResolved?: (skillContext: SkillRequestContext, context: BasePluginContext) => MaybePromise<void>
  /**
   * Called when the automatic selector chooses skill names.
   */
  onSkillSelectionResolved?: (
    event: {
      mode: 'auto'
      candidates: SkillCandidate[]
      preferredSkillNames?: string[]
      requestedSkillNames: string[]
    },
    context: BasePluginContext,
  ) => MaybePromise<void>
}

type StaticSkillPluginOptions<S extends SkillSelection> = S extends SkillSelection
  ? SkillPluginHooks &
      RequireResolver<S> &
      RequireCandidateProvider<S> & {
        selection: S
      }
  : never

type DynamicSkillPluginOptions<S extends SkillSelection> = SkillPluginHooks &
  RequireResolver<S> &
  RequireCandidateProvider<S> & {
    selection: (context: BasePluginContext) => MaybePromise<S>
  }

export type LegacySkillPluginOptions<S extends SkillSelection = SkillSelection> = (
  | StaticSkillPluginOptions<S>
  | DynamicSkillPluginOptions<S>
) & {
  scope?: 'turn'
  sessionId?: never
  deduplication?: never
  explicitSkillLoading?: never
}

export type SkillPluginOptions<S extends SkillSelection = SkillSelection> = LegacySkillPluginOptions<S>
