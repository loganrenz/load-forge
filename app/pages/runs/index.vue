<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { data, status } = await useFetch('/api/runs')
const runs = computed(() => data.value?.runs || [])

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

function getStatusBadgeColor(status: string): 'error' | 'info' | 'primary' | 'secondary' | 'success' | 'warning' | 'neutral' {
  const colors: Record<string, 'error' | 'info' | 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'> = {
    completed: 'success',
    running: 'info',
    failed: 'error',
    pending: 'warning',
    queued: 'neutral',
    cancelled: 'neutral',
  }
  return colors[status] || 'neutral'
}
</script>

<template>
  <div class="p-8">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 mb-1">Test Runs</h1>
      <p class="text-slate-500 text-sm">View and monitor your load test results</p>
    </div>
    
    <div v-if="status === 'pending'" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-14 rounded-xl bg-slate-100 shimmer" />
    </div>
    
    <div v-else-if="runs.length === 0" class="text-center py-16">
      <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
        <UIcon name="i-heroicons-play-circle" class="w-8 h-8 text-slate-400" />
      </div>
      <h2 class="text-lg font-semibold text-slate-900 mb-2">No test runs yet</h2>
      <p class="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
        Run your first load test to see results here.
      </p>
      <NuxtLink to="/scripts">
        <UButton color="primary" variant="soft" size="sm">Go to Scripts</UButton>
      </NuxtLink>
    </div>
    
    <div v-else class="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
      <table class="w-full">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Script</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">VUs</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Duration</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Response</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Requests</th>
            <th class="px-5 py-2.5 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="item in runs" 
            :key="item.run.id"
            class="hover:bg-slate-50 transition cursor-pointer"
            @click="navigateTo(`/runs/${item.run.id}`)"
          >
            <td class="px-5 py-3">
              <span class="text-slate-900 font-medium text-sm">{{ item.script?.name || 'Untitled' }}</span>
            </td>
            <td class="px-5 py-3">
              <UBadge :color="getStatusBadgeColor(item.run.status)" variant="subtle">
                <span class="flex items-center gap-1.5">
                  <span :class="['w-1.5 h-1.5 rounded-full', getStatusColor(item.run.status)]" />
                  {{ item.run.status }}
                </span>
              </UBadge>
            </td>
            <td class="px-5 py-3 text-slate-600 text-sm">{{ item.run.config?.vus || '-' }}</td>
            <td class="px-5 py-3 text-slate-600 text-sm">{{ item.run.config?.duration || '-' }}</td>
            <td class="px-5 py-3 text-slate-600 text-sm">
              {{ item.run.metrics?.http_req_duration_avg ? `${Math.round(item.run.metrics.http_req_duration_avg)}ms` : '-' }}
            </td>
            <td class="px-5 py-3 text-slate-600 text-sm">
              {{ item.run.metrics?.http_reqs?.toLocaleString() || '-' }}
            </td>
            <td class="px-5 py-3 text-slate-400 text-sm">
              {{ item.run.createdAt ? new Date(item.run.createdAt).toLocaleDateString() : '-' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
