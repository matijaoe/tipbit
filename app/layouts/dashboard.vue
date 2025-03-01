<script setup lang="ts">
// TODO: figure out best place to load user data
</script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <div class="flex min-h-screen w-full flex-col font-mono">
      <header class="flex items-center justify-between px-5 py-3">
        <SidebarTrigger />
      </header>

      <main class="flex-1 p-6 py-2">
        <slot />
      </main>
    </div>
  </SidebarProvider>
</template>
