<script setup lang="ts">
import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-vue-next'
import { useSidebar } from '~/components/ui/sidebar/utils'

const { user: sessionUser } = useUserSession()
const { user } = useCurrentUser()
const { logout } = useAuth()

if (!user.value) {
  createError({
    statusCode: 401,
    statusMessage: 'Unauthorized',
  })
}

const accountIdentifier = computed(() => sessionUser.value?.identifier ?? '')
const avatarUrl = computed(() => user.value?.avatarUrl ?? '')
const role = computed(() => sessionUser.value?.role ?? '')

const { isMobile } = useSidebar()

const handleLogout = async () => {
  await logout()
}
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            size="lg"
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <Avatar size="sm" shape="square">
              <AvatarImage :src="avatarUrl" :alt="accountIdentifier" />
              <AvatarFallback>
                {{ accountIdentifier.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ accountIdentifier }}</span>
              <span class="truncate text-xs">
                <Badge size="xs" :variant="role === 'ADMIN' ? 'default' : 'secondary'">{{ role }}</Badge>
              </span>
            </div>
            <ChevronsUpDown class="ml-auto size-4" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          class="w-[--reka-dropdown-menu-trigger-width]"
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          :side-offset="4"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar size="sm" shape="square">
                <AvatarImage :src="avatarUrl" :alt="accountIdentifier" />
                <AvatarFallback>
                  {{ accountIdentifier.charAt(0).toUpperCase() }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ accountIdentifier }}</span>
                <span class="truncate text-xs">
                  <Badge size="xs" :variant="role === 'ADMIN' ? 'default' : 'secondary'">{{ role }}</Badge>
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <BadgeCheck class="size-4" />
              Account
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Bell class="size-4" />
              Notifications
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout">
            <LogOut class="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>
</template>
