type Characters<Text extends string> = Text extends `${infer First}${infer Rest}` ? First | Characters<Rest> : never
type LowercaseLetter = Characters<'abcdefghijklmnopqrstuvwxyz'>
type LowercaseOrDigit = LowercaseLetter | Characters<'0123456789'>
type Separator = '_' | ':' | ' ' | '\t' | '\n' | '\r' | '\f' | '\v'

type NormalizeEventName<Text extends string, Previous extends string = ''> = string extends Text
  ? string
  : Text extends `${infer First}${infer Rest}`
    ? First extends Separator
      ? `${Previous extends Separator ? '' : '-'}${NormalizeEventName<Rest, First>}`
      : `${Previous extends LowercaseOrDigit ? (First extends Uppercase<LowercaseLetter> ? '-' : '') : ''}${Lowercase<First>}${NormalizeEventName<Rest, First>}`
    : ''

export type ElementEventName<Name extends string> = Name extends `update:${infer Property}`
  ? `${NormalizeEventName<Property>}-update`
  : NormalizeEventName<Name>

type VueEventName<Text extends string, Previous extends string = ''> = string extends Text
  ? string
  : Text extends `${infer First}${infer Rest}`
    ? `${Previous extends LowercaseOrDigit | Uppercase<LowercaseLetter> | '_' ? (First extends Uppercase<LowercaseLetter> ? '-' : '') : ''}${Lowercase<First>}${VueEventName<Rest, First>}`
    : ''

export type ElementEventMap<Events> = {
  [
    Name in keyof Events & string as Name | VueEventName<Name> | ElementEventName<Name>
  ]: Events[Name] extends readonly unknown[] ? CustomEvent<Events[Name]> : never
}

export function toExperimentalEventName<Name extends string>(name: Name): ElementEventName<Name> {
  const update = name.startsWith('update:')
  const normalized = (update ? name.slice(7) : name)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_:\s]+/g, '-')
    .toLowerCase()
  return (update ? `${normalized}-update` : normalized) as ElementEventName<Name>
}

/** Runtime declaration for defineEmits; tuple-derived payload types remain in the DOM event map. */
export function elementEventNames<Name extends string>(names: readonly Name[]) {
  return [...new Set(['ready' as const, ...names.flatMap((name) => [name, toExperimentalEventName(name)])])]
}

/** Preserve the original event and payload tuple; emit the project alias once when it differs. */
export function createElementEventListeners<Name extends string>(
  names: readonly Name[],
  emit: (name: Name | ElementEventName<Name>, ...args: unknown[]) => void,
) {
  return Object.fromEntries(
    names.map((name) => [
      name,
      (...args: unknown[]) => {
        emit(name, ...args)
        const alias = toExperimentalEventName(name)
        if (alias !== name) emit(alias, ...args)
      },
    ]),
  )
}
