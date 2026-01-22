/**
 * 键盘事件工具函数
 *
 * 提供跨平台的键盘事件处理，支持 Windows/Linux/Mac
 */

import { KEYBOARD_KEYS } from '../constants'

/**
 * 键盘按键类型
 */
export type KeyboardKey = keyof typeof KEYBOARD_KEYS

/**
 * 检查是否按下指定按键
 *
 * @param event - 键盘事件
 * @param key - 按键名称
 * @returns 是否按下指定按键
 *
 * @example
 * if (isKey(event, 'ENTER')) { ... }
 * if (isKey(event, 'ARROW_UP')) { ... }
 */
export const isKey = (event: KeyboardEvent, key: KeyboardKey): boolean => {
  return event.key === KEYBOARD_KEYS[key]
}

/**
 * 检查是否按下多个按键中的任意一个
 *
 * @param event - 键盘事件
 * @param keys - 按键名称数组
 * @returns 是否按下指定按键之一
 *
 * @example
 * if (isAnyKey(event, ['ARROW_UP', 'ARROW_DOWN'])) { ... }
 * if (isAnyKey(event, ['ENTER', 'TAB'])) { ... }
 */
export const isAnyKey = (event: KeyboardEvent, keys: KeyboardKey[]): boolean => {
  return keys.some((key) => event.key === KEYBOARD_KEYS[key])
}

/**
 * 检查是否按下方向键
 *
 * @param event - 键盘事件
 * @returns 是否按下方向键
 *
 * @example
 * if (isArrowKey(event)) { ... }
 */
export const isArrowKey = (event: KeyboardEvent): boolean => {
  return isAnyKey(event, ['ARROW_UP', 'ARROW_DOWN', 'ARROW_LEFT', 'ARROW_RIGHT'])
}

/**
 * 检查是否按下删除键（Backspace 或 Delete）
 *
 * @param event - 键盘事件
 * @returns 是否按下删除键
 *
 * @example
 * if (isDeleteKey(event)) { ... }
 */
export const isDeleteKey = (event: KeyboardEvent): boolean => {
  return isAnyKey(event, ['BACKSPACE', 'DELETE'])
}
