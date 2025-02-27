<script lang="ts" setup>
const { isAuthenticated, user, logout } = useAuth()
</script>

<template>
  <div class="container px-5">
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

    <div class="mt-3">
      <div v-if="isAuthenticated">
        <p>Welcome, {{ user?.username }} ({{ user?.role }})</p>

        <div v-if="user?.role === 'admin'" class="flex gap-2">
          <p>You are a admin</p>
          <NuxtLink to="/admin" class="text-muted-foreground hover:underline" active-class="text-primary">
            admin
          </NuxtLink>
        </div>

        <template v-else-if="user?.role === 'user'">
          <NuxtLink
            :to="`/${user?.username}`"
            class="block text-muted-foreground hover:underline"
            active-class="text-primary"
            >my public page</NuxtLink
          >
        </template>

        <div>
          <Button @click="logout">Logout</Button>
        </div>
      </div>

      <div v-else class="flex gap-5">
        <NuxtLink to="/login" class="text-muted-foreground hover:underline" active-class="text-primary">login</NuxtLink>
        <NuxtLink to="/register" class="text-muted-foreground hover:underline" active-class="text-primary">
          register
        </NuxtLink>
      </div>
    </div>

    <main class="mt-8 max-w-lg font-mono">
      <slot />
    </main>
  </div>
</template>
