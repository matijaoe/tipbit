<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next';
</script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <div class="flex min-h-screen w-full flex-col font-mono">
      <header class="flex items-center justify-between px-5 py-3">
        <SidebarTrigger />

        <ClientOnly>
          <ColorScheme placeholder="Loading..." tag="div" class="ml-auto">
            <Button
              variant="ghost"
              size="icon-sm"
              title="Toggle dark mode"
              @click="$colorMode.preference = $colorMode.preference === 'dark' ? 'light' : 'dark'"
            >
              <Sun v-if="$colorMode.preference === 'dark'" class="h-5 w-5" />
              <Moon v-else class="h-5 w-5" />
            </Button>
          </ColorScheme>
        </ClientOnly>
      </header>

      <main class="flex-1 p-6 py-2">
        <slot />
      </main>
    </div>
  </SidebarProvider>
</template>
