<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const route = useRoute()
const userId = route.params.id as string

const { data, pending, refresh } = await useFetch(`/api/admin/users/${userId}`)

const user = computed(() => data.value?.user)
const stats = computed(() => data.value?.stats || { scripts: 0, runs: 0 })
const recentRuns = computed(() => data.value?.recentRuns || [])

function formatDate(date: string | Date | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getTierColor(tier: string | null) {
  const colors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    pro: 'bg-indigo-100 text-indigo-700',
    business: 'bg-violet-100 text-violet-700',
    enterprise: 'bg-amber-100 text-amber-700',
  }
  return colors[tier || 'free'] || colors.free
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    completed: 'bg-emerald-500',
    running: 'bg-blue-500',
    failed: 'bg-red-500',
    pending: 'bg-amber-500',
    queued: 'bg-slate-400',
    cancelled: 'bg-slate-400',
  }
  return colors[status] || 'bg-slate-400'
}

async function toggleAdmin() {
  if (!user.value) return
  if (!confirm(`Are you sure you want to ${user.value.isAdmin ? 'remove' : 'grant'} admin access?`)) return
  
  await $fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: { isAdmin: !user.value.isAdmin },
  })
  refresh()
}

async function changeTier(tier: string) {
  await $fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: { tier },
  })
  refresh()
}

async function deleteUser() {
  if (!user.value) return
  if (!confirm(`Delete user "${user.value.email}"? This is permanent and cannot be undone.`)) return
  
  await $fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
  navigateTo('/admin/users')
}
</script>

<template>
  <div class="p-8">
    <!-- Back -->
    <div class="mb-6">
      <NuxtLink to="/admin/users" class="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition">
        <UIcon name="i-heroicons-arrow-left" class="w-4 h-4" />
        Back to Users
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-slate-300 animate-spin" />
    </div>

    <!-- Not Found -->
    <div v-else-if="!user" class="text-center py-20">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-slate-500">User not found</p>
    </div>

    <template v-else>
      <!-- User Header -->
      <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm mb-6">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <UAvatar 
              :src="user.avatarUrl ?? undefined" 
              :alt="user.name || user.email"
              size="lg"
            />
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-xl font-bold text-slate-900">{{ user.name || 'Unnamed User' }}</h1>
                <span v-if="user.isAdmin" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                  <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
                  Admin
                </span>
              </div>
              <p class="text-slate-500 text-sm mt-0.5">{{ user.email }}</p>
              <p class="text-slate-400 text-xs mt-1">ID: {{ user.id }}</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <UButton 
              :label="user.isAdmin ? 'Remove Admin' : 'Make Admin'"
              :icon="user.isAdmin ? 'i-heroicons-shield-exclamation' : 'i-heroicons-shield-check'"
              :color="user.isAdmin ? 'warning' : 'neutral'"
              variant="soft"
              size="sm"
              @click="toggleAdmin"
            />
            <UButton 
              label="Delete User"
              icon="i-heroicons-trash"
              color="error"
              variant="soft"
              size="sm"
              @click="deleteUser"
            />
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <!-- Subscription -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">Subscription</p>
          <div class="flex items-center gap-2 mb-2">
            <span :class="['inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize', getTierColor(user.tier)]">
              {{ user.tier || 'free' }}
            </span>
            <span class="text-xs text-slate-400 capitalize">{{ user.subscriptionStatus || 'active' }}</span>
          </div>
          <div class="mt-3 flex flex-wrap gap-1">
            <UButton 
              v-for="t in ['free', 'pro', 'business', 'enterprise']"
              :key="t"
              :label="t"
              size="xs"
              :variant="user.tier === t ? 'solid' : 'ghost'"
              :color="user.tier === t ? 'primary' : 'neutral'"
              class="capitalize"
              @click="changeTier(t)"
            />
          </div>
        </div>

        <!-- Activity -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">Activity</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">Scripts</span>
              <span class="text-sm font-semibold text-slate-900">{{ stats.scripts }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">Test Runs</span>
              <span class="text-sm font-semibold text-slate-900">{{ stats.runs }}</span>
            </div>
          </div>
        </div>

        <!-- Dates -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p class="text-xs text-slate-400 uppercase tracking-wider font-medium mb-2">Dates</p>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">Joined</span>
              <span class="text-sm text-slate-700">{{ formatDate(user.createdAt) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-slate-500">Updated</span>
              <span class="text-sm text-slate-700">{{ formatDate(user.updatedAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Runs -->
      <div class="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
        <div class="px-5 py-3.5 border-b border-slate-100">
          <h2 class="font-semibold text-slate-900 text-sm">Recent Test Runs</h2>
        </div>

        <div v-if="recentRuns.length === 0" class="p-10 text-center">
          <UIcon name="i-heroicons-beaker" class="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p class="text-slate-400 text-sm">No test runs</p>
        </div>

        <table v-else class="w-full">
          <thead>
            <tr class="border-b border-slate-100">
              <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Run ID</th>
              <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">VUs</th>
              <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
              <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="run in recentRuns" :key="run.id" class="hover:bg-slate-50 transition">
              <td class="px-5 py-3 text-sm font-mono text-slate-600">{{ run.id.slice(0, 8) }}…</td>
              <td class="px-5 py-3">
                <span class="inline-flex items-center gap-2">
                  <span :class="['w-1.5 h-1.5 rounded-full', getStatusColor(run.status)]" />
                  <span class="text-slate-600 capitalize text-sm">{{ run.status }}</span>
                </span>
              </td>
              <td class="px-5 py-3 text-slate-600 text-sm">{{ run.config?.vus || '—' }}</td>
              <td class="px-5 py-3 text-slate-600 text-sm">{{ run.config?.duration || '—' }}</td>
              <td class="px-5 py-3 text-slate-400 text-sm">{{ formatDate(run.createdAt) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
