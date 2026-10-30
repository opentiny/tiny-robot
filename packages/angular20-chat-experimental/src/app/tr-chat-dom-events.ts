import type {
  TrChatElementEventMap,
  TrChatUIElementEventMap,
} from '@opentiny/tiny-robot-chat/experimental';

type TrChatDomEventMap = TrChatElementEventMap & TrChatUIElementEventMap;

export type TrChatEventDetail<K extends keyof TrChatDomEventMap> =
  TrChatDomEventMap[K] extends CustomEvent<infer Detail> ? Detail : never;

export function trChatEventDetail<K extends keyof TrChatDomEventMap>(
  event: Event,
  type: K,
): TrChatEventDetail<K> {
  if (event.type !== type) {
    throw new TypeError(`Expected ${type} event, received ${event.type || 'unknown'}`);
  }

  return (event as TrChatDomEventMap[K]).detail as TrChatEventDetail<K>;
}
