<script setup lang="ts">
import { useSenderContext } from '../../sender/context'
import { IconClose } from '@opentiny/tiny-robot-svgs'
import ActionButton from '../action-button/index.vue'
import { useClearButtonState } from './useClearButtonState'

const { clear } = useSenderContext()
const { isDisabled, tooltip, tooltipPlacement, show } = useClearButtonState()

const handleClick = () => {
  if (!isDisabled.value) {
    clear()
  }
}
</script>

<template>
  <ActionButton
    v-if="show"
    :icon="IconClose"
    :disabled="isDisabled"
    :tooltip="tooltip"
    :tooltip-placement="tooltipPlacement"
    @click="handleClick"
  />
</template>
