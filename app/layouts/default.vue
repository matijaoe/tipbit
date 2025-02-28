<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router'

const routes: { name: string; path: RouteLocationRaw }[] = [
  {
    name: 'login',
    path: '/login',
  },
  {
    name: 'register',
    path: '/register',
  },
]
</script>

<template>
  <div class="container p-4">
    <header>
      <nav class="flex gap-5">
        <NuxtLink
          v-for="route in routes"
          :key="route.name"
          :to="route.path"
          class="text-muted-foreground hover:underline"
          active-class="text-primary"
        >
          {{ route.name }}
        </NuxtLink>
      </nav>
    </header>

    <main class="mt-8 max-w-lg font-mono">
      <slot />
    </main>
  </div>
</template>
