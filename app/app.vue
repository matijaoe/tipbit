<script lang="ts" setup>
import { Toaster as UiToaster } from '~/components/ui/toast'
</script>

<template>
  <Body class="dark mx-auto p-5">
    <NuxtRouteAnnouncer />
    <main>
      <TheDemo />
    </main>
    <UiToaster />
  </Body>
</template>
