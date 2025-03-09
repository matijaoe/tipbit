<script lang="ts" setup>
useSeoMeta({
  title: 'Tipbit',
})
</script>

<template>
  <Body class="mx-auto min-h-screen">
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ToastToaster />
  </Body>
</template>

<style>
body.dark {
  color-scheme: dark;
}
</style>
