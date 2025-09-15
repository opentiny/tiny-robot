import { MaybeElementRef, onClickOutside, useElementBounding, useElementSize } from '@vueuse/core'
import { computed, CSSProperties, ref, type Ref, type ComputedRef } from 'vue'
import { toCssUnit } from '../../shared/utils'

export interface UseMenuListProps<T> {
  onItemAction: (action: { id: string; text: string }, editingItem: T) => void
}

export interface UseMenuListReturn<T> {
  opendedMenuRef: Ref<HTMLButtonElement | null>
  opendedMenuItem: Ref<T | null>
  menuListRef: Ref<MaybeElementRef>
  menuListStyle: ComputedRef<CSSProperties>
  handleClickMenu: (ev: MouseEvent, item: T) => void
  handleClickMenuItem: (item: { id: string; text: string }) => void
}

export const useMenuList = <T>({ onItemAction }: UseMenuListProps<T>): UseMenuListReturn<T> => {
  const opendedMenuRef = ref<HTMLButtonElement | null>(null)
  const opendedMenuItem = ref<T | null>(null) as Ref<T | null>
  const menuListRef = ref<MaybeElementRef>(null)

  onClickOutside(
    menuListRef,
    () => {
      opendedMenuRef.value = null
      opendedMenuItem.value = null
    },
    {
      ignore: [opendedMenuRef],
    },
  )

  const handleClickMenu = (ev: MouseEvent, item: T) => {
    if (ev.currentTarget instanceof HTMLButtonElement) {
      if (opendedMenuItem.value === item) {
        opendedMenuRef.value = null
        opendedMenuItem.value = null
        return
      }

      opendedMenuRef.value = ev.currentTarget
      opendedMenuItem.value = item
    } else {
      opendedMenuRef.value = null
      opendedMenuItem.value = null
    }
  }

  const { top, bottom, left } = useElementBounding(opendedMenuRef)
  const { width: menuListWidth, height: menuListHeight } = useElementSize(menuListRef, undefined, { box: 'border-box' })

  const menuListGap = 12
  const threhold = 4

  const menuListStyle = computed(() => {
    const styles: CSSProperties = {
      left: `min(${toCssUnit(left.value)}, calc(100% - ${toCssUnit(menuListWidth.value + threhold)}))`,
    }

    const topValue = bottom.value + menuListGap
    if (topValue + menuListHeight.value + threhold > window.innerHeight) {
      styles.bottom = `calc(100% - ${toCssUnit(top.value - threhold)})`
    } else {
      styles.top = toCssUnit(topValue)
    }

    return styles
  })

  const handleClickMenuItem = (item: { id: string; text: string }) => {
    if (opendedMenuItem.value) {
      onItemAction(item, opendedMenuItem.value)
    }
    opendedMenuRef.value = null
    opendedMenuItem.value = null
  }

  return {
    opendedMenuRef,
    opendedMenuItem,
    menuListRef,
    menuListStyle,
    handleClickMenu,
    handleClickMenuItem,
  }
}
