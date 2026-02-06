<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const runId = route.params.id as string

const { data, refresh } = await useFetch(`/api/runs/${runId}`, {
  query: { includeMetrics: 'true' },
})

const run = computed(() => data.value?.run)
const script = computed(() => data.value?.script)
const metrics = computed(() => data.value?.metrics || [])

// Auto-refresh for running tests (client-side only)
let refreshInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  watchEffect(() => {
    if (run.value?.status === 'running' || run.value?.status === 'queued') {
      if (!refreshInterval) {
        refreshInterval = setInterval(() => refresh(), 3000)
      }
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }
  })
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    completed: 'text-emerald-600',
    running: 'text-blue-600',
    failed: 'text-red-600',
    pending: 'text-amber-600',
    queued: 'text-slate-400',
    cancelled: 'text-slate-400',
  }
  return colors[status] || 'text-slate-400'
}

function getStatusIcon(status: string) {
  const icons: Record<string, string> = {
    completed: 'i-heroicons-check-circle',
    running: 'i-heroicons-arrow-path',
    failed: 'i-heroicons-x-circle',
    pending: 'i-heroicons-clock',
    queued: 'i-heroicons-queue-list',
    cancelled: 'i-heroicons-stop',
  }
  return icons[status] || 'i-heroicons-question-mark-circle'
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <div v-if="!run" class="text-center py-16">
      <p class="text-slate-500">Test run not found</p>
      <NuxtLink to="/runs">
        <UButton variant="soft" color="primary" size="sm" class="mt-4">Back to Runs</UButton>
      </NuxtLink>
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="flex items-center gap-4 mb-8">
        <NuxtLink to="/runs">
          <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-left" size="sm" />
        </NuxtLink>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-0.5">
            <h1 class="text-xl font-bold text-slate-900">
              {{ script?.name || 'Test Run' }}
            </h1>
            <span :class="['flex items-center gap-1.5 text-sm', getStatusColor(run.status)]">
              <UIcon :name="getStatusIcon(run.status)" class="w-4 h-4" />
              <span class="font-medium capitalize">{{ run.status }}</span>
            </span>
          </div>
          <p class="text-slate-400 text-xs">
            Run ID: {{ run.id }} • Started {{ run.createdAt ? new Date(run.createdAt).toLocaleString() : 'N/A' }}
          </p>
        </div>
      </div>
      
      <!-- Live indicator for running tests -->
      <div v-if="run.status === 'running'" class="mb-6 p-3.5 rounded-xl bg-blue-50 border border-blue-100">
        <div class="live-indicator text-blue-600">
          <span class="font-medium text-sm">Test is running...</span>
          <span class="text-blue-500 text-xs ml-2">Results will update automatically</span>
        </div>
      </div>
      
      <!-- Config Stats -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p class="text-slate-500 text-xs mb-1">Virtual Users</p>
          <p class="text-2xl font-bold text-slate-900">{{ run.config?.vus || '-' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p class="text-slate-500 text-xs mb-1">Duration</p>
          <p class="text-2xl font-bold text-slate-900">{{ run.config?.duration || '-' }}</p>
        </div>
        <div class="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
          <p class="text-slate-500 text-xs mb-1">Region</p>
          <p class="text-2xl font-bold text-slate-900 capitalize">{{ run.config?.regions?.[0] || 'iad' }}</p>
        </div>
      </div>
      
      <!-- Results Metrics (if completed) -->
      <div v-if="run.metrics" class="mb-8">
        <h2 class="text-sm font-semibold text-slate-900 mb-3">Results Summary</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">Total Requests</p>
            <p class="text-xl font-bold text-slate-900">{{ run.metrics.http_reqs?.toLocaleString() || '0' }}</p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">Avg Response</p>
            <p class="text-xl font-bold text-sky-600">
              {{ run.metrics.http_req_duration_avg ? `${Math.round(run.metrics.http_req_duration_avg)}ms` : '-' }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">P95 Response</p>
            <p class="text-xl font-bold text-amber-600">
              {{ run.metrics.http_req_duration_p95 ? `${Math.round(run.metrics.http_req_duration_p95)}ms` : '-' }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">Failed Requests</p>
            <p class="text-xl font-bold" :class="run.metrics.http_req_failed > 0 ? 'text-red-600' : 'text-emerald-600'">
              {{ run.metrics.http_req_failed || 0 }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">P99 Response</p>
            <p class="text-xl font-bold text-orange-600">
              {{ run.metrics.http_req_duration_p99 ? `${Math.round(run.metrics.http_req_duration_p99)}ms` : '-' }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">Data Received</p>
            <p class="text-xl font-bold text-slate-900">
              {{ run.metrics.data_received ? `${(run.metrics.data_received / 1024 / 1024).toFixed(1)} MB` : '-' }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">Data Sent</p>
            <p class="text-xl font-bold text-slate-900">
              {{ run.metrics.data_sent ? `${(run.metrics.data_sent / 1024 / 1024).toFixed(1)} MB` : '-' }}
            </p>
          </div>
          <div class="bg-white rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <p class="text-slate-400 text-xs mb-1">Iterations</p>
            <p class="text-xl font-bold text-slate-900">{{ run.metrics.iterations?.toLocaleString() || '0' }}</p>
          </div>
        </div>
      </div>
      
      <!-- Queued/Pending message -->
      <div v-else-if="run.status === 'queued' || run.status === 'pending'" class="text-center py-12">
        <div class="w-14 h-14 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
          <UIcon name="i-heroicons-clock" class="w-7 h-7 text-slate-400 animate-pulse" />
        </div>
        <p class="text-slate-500 text-sm">Waiting for test to start...</p>
      </div>
      
      <!-- Error message -->
      <div v-if="run.errorMessage" class="mb-8">
        <UAlert color="error" variant="soft" :title="run.errorMessage" />
      </div>
      
      <!-- Script used -->
      <div v-if="script" class="mt-8">
        <h2 class="text-sm font-semibold text-slate-900 mb-3">Script Used</h2>
        <div class="rounded-xl bg-slate-950 border border-slate-200 overflow-hidden shadow-sm">
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
            <div class="w-3 h-3 rounded-full bg-red-400" />
            <div class="w-3 h-3 rounded-full bg-amber-400" />
            <div class="w-3 h-3 rounded-full bg-green-400" />
            <span class="ml-2 text-xs text-slate-500 font-mono">{{ script.name }}.js</span>
          </div>
          <pre class="p-4 text-sm text-slate-300 font-mono overflow-x-auto max-h-72 overflow-y-auto"><code>{{ script.script }}</code></pre>
        </div>
      </div>
    </template>
  </div>
</template>
