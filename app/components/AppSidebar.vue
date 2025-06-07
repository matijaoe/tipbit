<script setup lang="ts">
import { Globe, LayoutDashboard, Users } from 'lucide-vue-next'
import type { RouteLocationRaw } from 'vue-router'
import AppSidebarUserSwitcher from './AppSidebarUserSwitcher.vue'

const { user } = useUserSession()
const { user: currentUser } = useCurrentUser()

const username = computed(() => currentUser.value?.username ?? '')

type MenuItem = {
  title: string
  url: RouteLocationRaw
  icon: Component
}

const menuItems = computed<MenuItem[]>(() => [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Connections',
    url: '/dashboard/connections',
    icon: Users,
  },
])

const adminItems: MenuItem[] = [
  {
    title: 'Users',
    url: '/dashboard/admin/users',
    icon: Users,
  },
]
</script>

<template>
  <Sidebar variant="floating" class="pr-0">
    <SidebarHeader>
      <div class="flex items-center gap-2 p-2">
        <div class="h-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" fill="none" viewBox="0 0 40 40">
            <path
              fill="#F06225"
              d="M20 0c11.046 0 20 8.954 20 20v14a6 6 0 0 1-6 6H21v-8.774c0-2.002.122-4.076 1.172-5.78a10 10 0 0 1 6.904-4.627l.383-.062a.8.8 0 0 0 0-1.514l-.383-.062a10 10 0 0 1-8.257-8.257l-.062-.383a.8.8 0 0 0-1.514 0l-.062.383a9.999 9.999 0 0 1-4.627 6.904C12.85 18.878 10.776 19 8.774 19H.024C.547 8.419 9.29 0 20 0Z"
            ></path>
            <path
              fill="#F06225"
              d="M0 21h8.774c2.002 0 4.076.122 5.78 1.172a10.02 10.02 0 0 1 3.274 3.274C18.878 27.15 19 29.224 19 31.226V40H6a6 6 0 0 1-6-6V21ZM40 2a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
            ></path>
          </svg>
        </div>
        <span class="font-mono text-xl font-medium italic tracking-wider"> tipbit </span>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink :to="`/${username}`">
                  <Globe />
                  <div class="leading flex w-full items-center justify-between gap-2">
                    <span>Public page</span>
                    <Badge size="sm" variant="secondary">external</Badge>
                  </div>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

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

      <SidebarGroup v-if="user?.role === 'ADMIN'">
        <SidebarGroupLabel>Admin</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in adminItems" :key="item.title">
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
      <AppSidebarUserSwitcher />
    </SidebarFooter>
  </Sidebar>
</template>
