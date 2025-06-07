<template>
  <div class="container max-w-2xl">
    <div class="space-y-6">
      <div>
        <h1 class="text-2xl font-bold">Account Settings</h1>
        <p class="text-muted-foreground">Manage your account preferences and public profile.</p>
      </div>

      <!-- Username Section -->
      <Card>
        <CardHeader>
          <CardTitle>Username</CardTitle>
          <CardDescription> Your unique handle used in your public profile URL. </CardDescription>
        </CardHeader>
        <CardContent>
          <form class="space-y-4" @submit.prevent="updateUsername">
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <div class="flex space-x-2">
                <Input
                  id="username"
                  v-model="newUsername"
                  :placeholder="user?.username"
                  :disabled="usernameLoading"
                  class="flex-1"
                />
                <Button type="submit" :disabled="usernameLoading || newUsername === user?.username">
                  {{ usernameLoading ? 'Updating...' : 'Update' }}
                </Button>
              </div>
              <p class="text-xs text-muted-foreground">
                Your profile will be available at: {{ $config.public.baseUrl }}/{{ newUsername || user?.username }}
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      <!-- Profile Settings -->
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription> Configure how your profile appears to others. </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="space-y-2">
            <Label for="displayName">Display Name</Label>
            <Input id="displayName" v-model="displayName" :placeholder="user?.username" @blur="updateSettings" />
          </div>

          <div class="flex items-center space-x-2">
            <input id="isPublic" v-model="isPublic" type="checkbox" class="h-4 w-4" @change="updateSettings" />
            <Label for="isPublic">Public Profile</Label>
          </div>
          <p class="text-xs text-muted-foreground">
            When enabled, others can view your profile and send you payment requests.
          </p>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { user, clearCurrentUser } = useCurrentUser()

// Reactive form data
const newUsername = ref(user.value?.username || '')
const displayName = ref(user.value?.displayName || '')
const isPublic = ref(user.value?.isPublic || false)

// Loading states
const usernameLoading = ref(false)
const settingsLoading = ref(false)

// Watch for user changes to update form
watch(
  user,
  (newUser) => {
    if (newUser) {
      newUsername.value = newUser.username || ''
      displayName.value = newUser.displayName || ''
      isPublic.value = newUser.isPublic || false
    }
  },
  { immediate: true }
)

async function updateUsername() {
  if (!newUsername.value || newUsername.value === user.value?.username) return

  usernameLoading.value = true

  try {
    await $fetch('/api/users/username', {
      method: 'PUT',
      body: { newUsername: newUsername.value },
    })

    // Refresh user data
    clearCurrentUser()
    await refreshCookie('user')

    // Show success message
    // TODO: Add toast notification
    console.log('Username updated successfully')
  } catch (error: unknown) {
    console.error('Failed to update username:', error)
    // TODO: Add error toast
    const errorMessage =
      error && typeof error === 'object' && 'data' in error
        ? (error.data as any)?.message || 'Failed to update username'
        : 'Failed to update username'
    alert(errorMessage)
  } finally {
    usernameLoading.value = false
  }
}

async function updateSettings() {
  settingsLoading.value = true

  try {
    await $fetch('/api/users/settings', {
      method: 'PUT',
      body: {
        displayName: displayName.value,
        isPublic: isPublic.value,
      },
    })

    // Refresh user data
    clearCurrentUser()
    refreshCookie('user')
  } catch (error: unknown) {
    console.error('Failed to update settings:', error)
    // TODO: Add error toast
  } finally {
    settingsLoading.value = false
  }
}
</script>
