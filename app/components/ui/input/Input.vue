<script setup lang="ts">
import { useVModel } from '@vueuse/core'
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'
import type { InputVariants } from '.'
import { inputVariants } from '.'

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes['class']
  size?: InputVariants['size']
  fullWidth?: boolean
}>()

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})
</script>

<template>
  <input v-model="modelValue" :class="cn(inputVariants({ size, fullWidth }), props.class)" />
</template>
