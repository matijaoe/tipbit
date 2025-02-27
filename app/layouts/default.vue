<template>
  <div class="container p-5">
    <header>
      <nav class="flex gap-5">
        <NuxtLink to="/" class="text-muted-foreground hover:underline" active-class="text-primary">home</NuxtLink>

        <NuxtLink to="/dashboard" class="text-muted-foreground hover:underline" active-class="text-primary"
          >dashboard</NuxtLink
        >

        <NuxtLink to="/dashboard/invoice" class="text-muted-foreground hover:underline" active-class="text-primary"
          >invoice</NuxtLink
        >
        <NuxtLink
          to="/dashboard/receive-request"
          class="text-muted-foreground hover:underline"
          active-class="text-primary"
        >
          receive request
        </NuxtLink>
      </nav>
    </header>

    <main class="mt-8 max-w-lg font-mono">
      <slot />
    </main>
  </div>
</template>
