<script setup lang="ts">
import { LayoutDashboard, FileText, Inbox, Globe, Users } from 'lucide-vue-next'
import type { RouteLocationRaw } from 'vue-router'
import AppSidebarUserSwitcher from './AppSidebarUserSwitcher.vue'

const { user } = useUserSession()
const username = computed(() => user?.value?.username ?? '')

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

const publicItems: MenuItem[] = [
  {
    title: 'Public Page',
    url: `/${username.value}`,
    icon: Globe,
  },
]

const invoiceItems: MenuItem[] = [
  {
    title: 'Invoice',
    url: '/dashboard/invoice',
    icon: FileText,
  },
  {
    title: 'Receive Requests',
    url: '/dashboard/receive-request',
    icon: Inbox,
  },
]
</script>

<template>
  <Sidebar c>
    <SidebarHeader>
      <div class="flex items-center gap-2 p-2">
        <img src="https://img.logoipsum.com/359.svg" alt="Tipbit Logo" class="h-5 w-auto shrink-0" />
        <span class="font-mono text-xl font-medium italic tracking-wider"> tipbit </span>
      </div>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Public</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in publicItems" :key="item.title">
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

      <SidebarGroup>
        <SidebarGroupLabel>Invoices</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in invoiceItems" :key="item.title">
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
