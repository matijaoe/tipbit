<script setup lang="ts">
import { LayoutDashboard, FileText, Inbox, LogOut } from 'lucide-vue-next'

const { user, clear } = useUserSession()

const handleLogout = async () => {
  await clear()
  navigateTo('/login')
}

const menuItems = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Invoice',
    url: '/dashboard/invoice',
    icon: FileText,
  },
  {
    title: 'Receive Request',
    url: '/dashboard/receive-request',
    icon: Inbox,
  },
]
</script>

<template>
  <Sidebar>
    <SidebarHeader>
      <span class="p-2"> tipbit </span>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in menuItems" :key="item.title">
              <SidebarMenuButton as-child>
                <NuxtLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <div class="flex items-center justify-between px-4 py-2">
        <div class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-full bg-primary text-center leading-8 text-primary-foreground">
            {{ user?.username?.charAt(0).toUpperCase() }}
          </div>
          <span>{{ user?.username }}</span>
        </div>
        <Button variant="ghost" size="icon" @click="handleLogout">
          <LogOut />
        </Button>
      </div>
    </SidebarFooter>
  </Sidebar>
</template>
