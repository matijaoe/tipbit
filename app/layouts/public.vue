<script lang="ts" setup>
const { user } = useUserSession()

// TODO: check if own profile
</script>

<template>
  <div class="container px-4 py-12">
    <header class="absolute left-0 top-3">
      <Button v-if="user" as-child variant="link" class="font-light">
        <NuxtLink to="/dashboard"> Your dashboard </NuxtLink>
      </Button>

      <Button v-else as-child variant="link" class="font-light">
        <NuxtLink to="/login"> Join </NuxtLink>
      </Button>
    </header>

    <main class="mx-auto mt-[12vh] max-w-lg">
      <slot />
    </main>
  </div>
</template>
