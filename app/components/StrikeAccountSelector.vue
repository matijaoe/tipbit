<script setup lang="ts">
import { isBoolean } from 'es-toolkit'
import { ArrowLeft, ChevronRight, Edit, Eye, EyeOff, X as XIcon } from 'lucide-vue-next'
import { useToast } from '~/components/ui/toast'
import { useStrikeConnection } from '~/composables/connections/strike'
import type { StrikeConnectionRequestBody } from '~~/server/api/connections/strike/index.post'
import { encryptForServer } from '~~/server/utils/encryption'
const { toast } = useToast()

const {
  // Current connection
  connection,
  isConnected,
  isConnectionLoading,
  connectAccount,
  disconnectAccount,

  // Strike profile
  profile,
  profileHandle,
} = useStrikeConnection()

// Edit mode state
const isEditMode = ref(false)
const isDetailsOpen = ref(false)
const showApiKey = ref(false)

// Check if API key is connected
const hasApiKey = computed(() => isBoolean(connection.value?.apiKey) && connection.value.apiKey === true)

// Form data
const localHandle = ref(profileHandle.value ?? '')
const apiKey = ref('')

// Step management
const currentStep = ref(1) // 1 = handle entry, 2 = optional API key

// Refs for input elements
const handleInputRef = useTemplateRef('handle-input')
const apiKeyInputRef = useTemplateRef('api-key-input')

// Computed properties for display
const strikeProfileAddress = computed(() => {
  if (!isDefined(profileHandle)) {
    return ''
  }
  return `${profileHandle.value}@strike.me`
})

const strikeProfileTipUrl = computed(() => {
  if (!isDefined(profileHandle)) {
    return ''
  }
  const url = new URL('https://strike.me')
  url.pathname = profileHandle.value
  return url.href
})

const prettyStrikeProfileTipUrl = computed(() => {
  if (!isDefined(profileHandle)) {
    return ''
  }
  return strikeProfileTipUrl.value.replace('https://', '')
})

// Step 1: Collect handle
const goToApiKeyStep = () => {
  if (!localHandle.value) {
    toast({
      title: 'Error',
      description: 'Strike handle is required',
      variant: 'destructive',
    })
    return
  }

  // Move to step 2 (optional API key)
  currentStep.value = 2

  // Focus the API key input after the DOM updates
  nextTick(() => {
    const el = apiKeyInputRef.value?.$el as HTMLElement | null
    el?.focus()
  })
}

// Go back to handle step
const goBackToHandleStep = () => {
  currentStep.value = 1

  // Focus the handle input after the DOM updates
  nextTick(() => {
    const el = handleInputRef.value?.$el as HTMLElement | null
    el?.focus()
  })
}

// Create connection with or without API key
const createConnection = async (includeApiKey = false) => {
  try {
    if (!localHandle.value) {
      toast({
        title: 'Error',
        description: 'Strike handle is required',
        variant: 'destructive',
      })
      return
    }

    // Prepare request body
    const requestBody: StrikeConnectionRequestBody = {
      handle: localHandle.value,
    }

    // Add API key if provided and requested
    if (includeApiKey && apiKey.value) {
      const encryptedApiKey = await encryptForServer(apiKey.value)
      requestBody.apiKey = encryptedApiKey
    }

    // Call API with collected data
    const response = await $fetch('/api/connections/strike', {
      method: 'POST',
      body: requestBody,
    })

    if (!response) {
      throw new Error('Failed to connect Strike account')
    }

    // Show success toast
    toast({
      title: 'Success!',
      description:
        includeApiKey && apiKey.value
          ? 'Strike account connected with API key. You can now use advanced payment features.'
          : 'Strike account connected successfully.',
    })

    finishSetup()
  } catch (error) {
    console.error('Error connecting Strike account:', error)
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Failed to connect Strike account',
      variant: 'destructive',
    })
  }
}

// Skip API key and connect with handle only
const skipApiKey = () => {
  createConnection(false)
}

// Connect with handle and API key
const addApiKey = () => {
  createConnection(true)
}

// Finish the setup process
const finishSetup = () => {
  isEditMode.value = false
  currentStep.value = 1
  // Refresh connection data
  connectAccount(localHandle.value)
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value

  // Reset form values when entering edit mode
  if (isEditMode.value) {
    localHandle.value = profileHandle.value ?? ''
    apiKey.value = ''
    currentStep.value = 1

    // Focus the handle input after the DOM updates
    nextTick(() => {
      const el = handleInputRef.value?.$el as HTMLElement | null
      el?.focus()
    })
  }
}

const clearConnection = () => {
  localHandle.value = ''
  apiKey.value = ''
  isDetailsOpen.value = false
  isEditMode.value = false
  currentStep.value = 1
  disconnectAccount()
}

defineExpose({
  connection,
  clearConnection,
  isEditMode,
})
</script>

<template>
  <section>
    <!-- Connection Form (Not Connected) -->
    <Card v-if="(!isConnected && !profile) || isEditMode" class="w-full">
      <CardHeader>
        <CardTitle>{{ isEditMode ? 'Edit Strike Connection' : 'Connect Strike Account' }}</CardTitle>
        <CardDescription>
          {{ currentStep === 1 ? 'Enter your Strike handle' : 'Optionally add an API key for advanced features' }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Step 1: Handle Input -->
        <form v-if="currentStep === 1" class="space-y-4" @submit.prevent="goToApiKeyStep">
          <div>
            <Label for="handle-input">Strike Handle</Label>
            <Input
              id="handle-input"
              ref="handle-input"
              v-model.trim="localHandle"
              placeholder="Your Strike handle"
              :disabled="isConnectionLoading"
              required
            />
          </div>

          <Button type="submit" variant="default" :loading="isConnectionLoading" class="w-full">Continue</Button>
        </form>

        <!-- Step 2: Optional API Key -->
        <div v-else-if="currentStep === 2" class="space-y-4">
          <div>
            <Label for="api-key-input">API Key (Optional)</Label>
            <div class="relative">
              <Input
                id="api-key-input"
                ref="api-key-input"
                v-model.trim="apiKey"
                full-width
                :type="showApiKey ? 'text' : 'password'"
                placeholder="Strike API Key"
                :disabled="isConnectionLoading"
              />
              <button
                type="button"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                @click="showApiKey = !showApiKey"
              >
                <Eye v-if="!showApiKey" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
            <p class="mt-1 text-xs text-gray-500">Providing an API key enables advanced payment features.</p>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex gap-2">
              <Button type="button" variant="outline" class="flex-1" :loading="isConnectionLoading" @click="skipApiKey">
                Connect without API Key
              </Button>
              <Button
                type="button"
                variant="default"
                :loading="isConnectionLoading"
                class="flex-1"
                :disabled="!apiKey"
                @click="addApiKey"
              >
                Connect with API Key
              </Button>
            </div>

            <!-- Back button -->
            <div class="mt-2">
              <Button type="button" variant="ghost" @click="goBackToHandleStep">
                <ArrowLeft class="size-4" />
                Back
              </Button>
            </div>
          </div>
        </div>

        <!-- Cancel Edit Button -->
        <div v-if="isEditMode" class="mt-4 flex justify-end">
          <Button variant="ghost" @click="isEditMode = false">Cancel</Button>
        </div>
      </CardContent>
    </Card>

    <!-- Connected Profile View (Read-only) -->
    <Card v-else-if="profile && !isEditMode" class="w-full">
      <CardHeader class="cursor-pointer" @click="isDetailsOpen = !isDetailsOpen">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ChevronRight class="size-4 transition-transform duration-200" :class="{ 'rotate-90': isDetailsOpen }" />
            <CardTitle>{{ strikeProfileAddress }}</CardTitle>
            <img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="Avatar" class="size-8 rounded-full" />
          </div>
          <div class="flex items-center gap-2">
            <Button variant="ghost" size="icon" @click.stop="toggleEditMode">
              <Edit class="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" @click.stop="clearConnection">
              <XIcon class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent v-show="isDetailsOpen" class="space-y-3 text-sm">
        <div>
          <p class="flex items-center gap-2">
            <span class="font-bold">API Key:</span>
            <span v-if="hasApiKey" class="text-green-600 dark:text-green-400">Connected ✅</span>
            <span v-else class="text-gray-500">Not provided</span>
          </p>
        </div>
        <div v-if="profile.description">
          <p class="font-bold">Description:</p>
          <p>{{ profile.description }}</p>
        </div>
        <div>
          <p class="flex items-center gap-2">
            <span class="font-bold">Can receive:</span>
            <span class="font-bold">{{ profile.canReceive ? '✅' : '❌' }}</span>
          </p>
        </div>
        <div>
          <p class="font-bold">Currencies:</p>
          <div class="flex items-center gap-2">
            <span v-for="(currency, index) in profile.currencies" :key="currency.currency">
              {{ currency.currency }}
              <span v-if="index !== profile.currencies.length - 1"> / </span>
            </span>
          </div>
        </div>
        <div>
          <NuxtLink external :href="strikeProfileTipUrl" class="text-blue-400 hover:underline" target="_blank">
            {{ prettyStrikeProfileTipUrl }}
          </NuxtLink>
        </div>
      </CardContent>
    </Card>

    <!-- Error State -->
    <Card v-else-if="!isConnectionLoading" class="w-full">
      <CardHeader>
        <CardTitle>No Strike account profile found</CardTitle>
        <CardDescription>Please try connecting your Strike account again</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="flex gap-2">
          <Button variant="destructive" @click="clearConnection">Clear connection</Button>
        </div>
      </CardContent>
    </Card>
  </section>
</template>
