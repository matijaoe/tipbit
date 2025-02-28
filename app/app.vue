<script lang="ts" setup>
useSeoMeta({
  title: 'Tipbit',
})
</script>

<template>
  <Body class="dark mx-auto min-h-screen">
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ToastToaster />
  </Body>
</template>
