<script setup lang="ts">
import { Plus, Settings, LogOut } from 'lucide-vue-next'

const { user: currentAccount } = await useUserSession()

function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await navigateTo('/login')
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="sm" class="h-8 w-8 rounded-full">
        <Avatar class="h-8 w-8">
          <AvatarImage :src="currentAccount?.avatarUrl ?? ''" :alt="currentAccount?.displayName || ''" />
          <AvatarFallback>
            {{ getInitials(currentAccount?.displayName || currentAccount?.username || '') }}
          </AvatarFallback>
        </Avatar>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel class="font-normal">
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium leading-none">
            {{ currentAccount?.displayName || `@${currentAccount?.username}` }}
          </p>
          <p class="text-xs leading-none text-muted-foreground">@{{ currentAccount?.username }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <!-- Current Account -->
      <DropdownMenuItem v-if="currentAccount" class="cursor-pointer">
        <div class="flex items-center space-x-2">
          <Avatar class="h-6 w-6">
            <AvatarImage :src="currentAccount.avatarUrl ?? ''" :alt="currentAccount.displayName || ''" />
            <AvatarFallback class="text-xs">
              {{ getInitials(currentAccount.displayName || currentAccount.username || '') }}
            </AvatarFallback>
          </Avatar>
          <div class="flex flex-col">
            <span class="text-sm font-medium">@{{ currentAccount.username }}</span>
            <span class="text-xs text-muted-foreground">Current</span>
          </div>
        </div>
      </DropdownMenuItem>

      <!-- Future: Other accounts will be listed here -->

      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/login')">
        <Plus class="mr-2 h-4 w-4" />
        Add Account
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="cursor-pointer" @click="navigateTo('/dashboard/settings')">
        <Settings class="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem class="cursor-pointer text-red-600" @click="logout">
        <LogOut class="mr-2 h-4 w-4" />
        Sign Out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
