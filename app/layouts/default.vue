<script lang="ts" setup></script>

<template>
  <div class="max-w-lg px-5">
    <header>
      <nav class="flex gap-5">
        <NuxtLink to="/invoice" class="text-muted-foreground hover:underline" active-class="text-primary">
          invoice
        </NuxtLink>
        <NuxtLink to="/receive-request" class="text-muted-foreground hover:underline" active-class="text-primary">
          receive request
        </NuxtLink>
      </nav>
    </header>

    <main class="mt-8 font-mono">
      <slot />
    </main>
  </div>
</template>
