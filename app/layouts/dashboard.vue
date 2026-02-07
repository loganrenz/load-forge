<script setup lang="ts">
const { data: user, refresh } = await useFetch('/api/auth/me')

// Redirect if not logged in
if (!user.value?.user) {
  navigateTo('/login')
}

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: 'i-heroicons-home' },
  { name: 'Scripts', to: '/scripts', icon: 'i-heroicons-code-bracket' },
  { name: 'Test Runs', to: '/runs', icon: 'i-heroicons-play-circle' },
  { name: 'Settings', to: '/settings', icon: 'i-heroicons-cog-6-tooth' },
]

async function handleLogout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-60 bg-white border-r border-slate-200 flex flex-col">
      <!-- Logo -->
      <div class="h-14 px-5 flex items-center border-b border-slate-100">
        <NuxtLink to="/dashboard" class="flex items-center gap-2.5">
          <div class="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-sm text-slate-900">loadtest.dev</span>
        </NuxtLink>
      </div>
      
      <!-- Navigation -->
      <nav class="flex-1 p-3 space-y-0.5">
        <NuxtLink 
          v-for="item in navigation" 
          :key="item.name"
          :to="item.to"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition text-sm font-medium"
          active-class="!text-indigo-700 !bg-indigo-50"
        >
          <UIcon :name="item.icon" class="w-4.5 h-4.5" />
          <span>{{ item.name }}</span>
        </NuxtLink>
        
        <!-- Admin Link -->
        <NuxtLink 
          v-if="user?.user?.isAdmin"
          to="/admin"
          class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition text-sm font-medium mt-2 border-t border-slate-100 pt-3"
          active-class="!text-rose-700 !bg-rose-50"
        >
          <UIcon name="i-heroicons-shield-check" class="w-4.5 h-4.5" />
          <span>Admin</span>
        </NuxtLink>
      </nav>
      
      <!-- User section -->
      <div class="p-3 border-t border-slate-100">
        <div class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-slate-50">
          <UAvatar 
            :src="user?.user?.avatarUrl" 
            :alt="user?.user?.name || user?.user?.email"
            size="xs"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-slate-900 truncate">
              {{ user?.user?.name || 'User' }}
            </p>
            <p class="text-xs text-slate-400 truncate">
              {{ user?.user?.subscription?.tier || 'free' }} plan
            </p>
          </div>
          <UButton 
            icon="i-heroicons-arrow-right-on-rectangle" 
            variant="ghost" 
            color="neutral"
            size="xs"
            @click="handleLogout"
          />
        </div>
      </div>
    </aside>
    
    <!-- Main content -->
    <main class="flex-1 ml-60">
      <slot />
    </main>
  </div>
</template>
