<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '~/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <ul data-sidebar="menu" :class="cn('flex w-full min-w-0 flex-col gap-0.5', props.class)">
    <slot />
  </ul>
</template>
