<script setup lang="ts"></script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <div class="flex min-h-screen w-full flex-col font-mono">
      <header class="flex items-center justify-between border-b px-4 py-3">
        <SidebarTrigger />
      </header>

      <main class="max-w-lg flex-1 p-6">
        <slot />
      </main>
    </div>
  </SidebarProvider>
</template>
