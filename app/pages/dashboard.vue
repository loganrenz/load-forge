<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { data: user } = await useFetch('/api/auth/me')
const { data: scripts } = await useFetch('/api/scripts')
const { data: runs } = await useFetch('/api/runs')

const stats = computed(() => [
  {
    label: 'Total Scripts',
    value: scripts.value?.scripts?.length || 0,
    icon: 'i-heroicons-code-bracket',
    color: 'text-indigo-600',
  },
  {
    label: 'Total Runs',
    value: runs.value?.runs?.length || 0,
    icon: 'i-heroicons-play-circle',
    color: 'text-emerald-600',
  },
  {
    label: 'Plan',
    value: user.value?.user?.subscription?.tier || 'Free',
    icon: 'i-heroicons-sparkles',
    color: 'text-amber-600',
  },
  {
    label: 'Status',
    value: user.value?.user?.subscription?.status || 'Active',
    icon: 'i-heroicons-check-badge',
    color: 'text-sky-600',
  },
])

const recentRuns = computed(() => runs.value?.runs?.slice(0, 5) || [])

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
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 mb-1">
        Welcome back, {{ user?.user?.name || 'there' }} 👋
      </h1>
      <p class="text-slate-500 text-sm">
        Here's what's happening with your load tests
      </p>
    </div>
    
    <!-- Stats Grid -->
    <div class="grid grid-cols-4 gap-4 mb-8">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-slate-500 text-sm">{{ stat.label }}</span>
          <UIcon :name="stat.icon" :class="['w-4.5 h-4.5', stat.color]" />
        </div>
        <p class="text-xl font-bold text-slate-900 capitalize">{{ stat.value }}</p>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid grid-cols-2 gap-4 mb-8">
      <NuxtLink to="/scripts/new" class="group block">
        <div class="p-5 rounded-xl bg-indigo-50 border border-indigo-100 hover:border-indigo-200 transition-all duration-200 hover:shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition">
              <UIcon name="i-heroicons-plus" class="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 text-sm mb-0.5">Create New Script</h3>
              <p class="text-slate-500 text-xs">Write a new k6 load test script</p>
            </div>
          </div>
        </div>
      </NuxtLink>
      
      <NuxtLink to="/scripts" class="group block">
        <div class="p-5 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all duration-200 hover:shadow-md">
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center group-hover:bg-slate-200 transition">
              <UIcon name="i-heroicons-folder-open" class="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <h3 class="font-semibold text-slate-900 text-sm mb-0.5">View All Scripts</h3>
              <p class="text-slate-500 text-xs">Manage your existing test scripts</p>
            </div>
          </div>
        </div>
      </NuxtLink>
    </div>
    
    <!-- Recent Runs -->
    <div class="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
      <div class="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-semibold text-slate-900 text-sm">Recent Test Runs</h2>
        <NuxtLink to="/runs" class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
          View all →
        </NuxtLink>
      </div>
      
      <div v-if="recentRuns.length === 0" class="p-10 text-center">
        <UIcon name="i-heroicons-beaker" class="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500 text-sm mb-4">No test runs yet</p>
        <NuxtLink to="/scripts/new">
          <UButton color="primary" variant="soft" size="sm">Create your first test</UButton>
        </NuxtLink>
      </div>
      
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Script</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">VUs</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="item in recentRuns" 
            :key="item.run.id"
            class="hover:bg-slate-50 transition cursor-pointer"
            @click="navigateTo(`/runs/${item.run.id}`)"
          >
            <td class="px-5 py-3">
              <span class="text-slate-900 font-medium text-sm">{{ item.script?.name || 'Untitled' }}</span>
            </td>
            <td class="px-5 py-3">
              <span class="inline-flex items-center gap-2">
                <span :class="['w-1.5 h-1.5 rounded-full', getStatusColor(item.run.status)]" />
                <span class="text-slate-600 capitalize text-sm">{{ item.run.status }}</span>
              </span>
            </td>
            <td class="px-5 py-3 text-slate-600 text-sm">{{ item.run.config?.vus || '-' }}</td>
            <td class="px-5 py-3 text-slate-600 text-sm">{{ item.run.config?.duration || '-' }}</td>
            <td class="px-5 py-3 text-slate-400 text-sm">
              {{ new Date(item.run.createdAt).toLocaleDateString() }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
