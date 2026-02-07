<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const { data: stats, pending } = await useFetch('/api/admin/stats')

const statCards = computed(() => [
  {
    label: 'Total Users',
    value: stats.value?.users || 0,
    icon: 'i-heroicons-users',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    label: 'Total Scripts',
    value: stats.value?.scripts || 0,
    icon: 'i-heroicons-code-bracket',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Total Runs',
    value: stats.value?.runs?.total || 0,
    icon: 'i-heroicons-play-circle',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
  },
])

const runStatuses = computed(() => {
  const byStatus = stats.value?.runs?.byStatus || {}
  return [
    { label: 'Completed', value: byStatus.completed || 0, color: 'bg-emerald-500' },
    { label: 'Running', value: byStatus.running || 0, color: 'bg-blue-500' },
    { label: 'Failed', value: byStatus.failed || 0, color: 'bg-red-500' },
    { label: 'Pending', value: byStatus.pending || 0, color: 'bg-amber-500' },
    { label: 'Queued', value: byStatus.queued || 0, color: 'bg-slate-400' },
    { label: 'Cancelled', value: byStatus.cancelled || 0, color: 'bg-slate-300' },
  ].filter(s => s.value > 0)
})

const tierDistribution = computed(() => {
  const subs = stats.value?.subscriptions || {}
  return [
    { label: 'Free', value: subs.free || 0, color: 'bg-slate-400' },
    { label: 'Pro', value: subs.pro || 0, color: 'bg-indigo-500' },
    { label: 'Business', value: subs.business || 0, color: 'bg-violet-500' },
    { label: 'Enterprise', value: subs.enterprise || 0, color: 'bg-amber-500' },
  ].filter(s => s.value > 0)
})
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-900 mb-1">Platform Overview</h1>
      <p class="text-slate-500 text-sm">Global stats for your loadtest.dev instance</p>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="flex items-center justify-center py-20">
      <div class="text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-slate-300 animate-spin mx-auto mb-3" />
        <p class="text-slate-400 text-sm">Loading stats...</p>
      </div>
    </div>

    <template v-else>
      <!-- Stat Cards -->
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div 
          v-for="stat in statCards" 
          :key="stat.label"
          class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="text-slate-500 text-sm font-medium">{{ stat.label }}</span>
            <div :class="['w-9 h-9 rounded-lg flex items-center justify-center', stat.bg]">
              <UIcon :name="stat.icon" :class="['w-5 h-5', stat.color]" />
            </div>
          </div>
          <p class="text-3xl font-bold text-slate-900">{{ stat.value.toLocaleString() }}</p>
        </div>
      </div>

      <!-- Run Status Breakdown & Subscription Tiers -->
      <div class="grid grid-cols-2 gap-4">
        <!-- Runs by Status -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 class="font-semibold text-slate-900 text-sm mb-4">Test Runs by Status</h2>
          <div v-if="runStatuses.length === 0" class="text-slate-400 text-sm py-4 text-center">
            No test runs yet
          </div>
          <div v-else class="space-y-3">
            <div v-for="status in runStatuses" :key="status.label" class="flex items-center gap-3">
              <span :class="['w-2.5 h-2.5 rounded-full', status.color]" />
              <span class="text-sm text-slate-600 flex-1">{{ status.label }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ status.value }}</span>
            </div>
          </div>
        </div>

        <!-- Subscription Tier Breakdown -->
        <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
          <h2 class="font-semibold text-slate-900 text-sm mb-4">Subscriptions by Tier</h2>
          <div v-if="tierDistribution.length === 0" class="text-slate-400 text-sm py-4 text-center">
            No subscriptions yet
          </div>
          <div v-else class="space-y-3">
            <div v-for="tier in tierDistribution" :key="tier.label" class="flex items-center gap-3">
              <span :class="['w-2.5 h-2.5 rounded-full', tier.color]" />
              <span class="text-sm text-slate-600 flex-1">{{ tier.label }}</span>
              <span class="text-sm font-semibold text-slate-900">{{ tier.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="mt-8">
        <NuxtLink to="/admin/users" class="group block">
          <div class="p-5 rounded-xl bg-rose-50 border border-rose-100 hover:border-rose-200 transition-all duration-200 hover:shadow-md">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition">
                <UIcon name="i-heroicons-users" class="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 class="font-semibold text-slate-900 text-sm mb-0.5">Manage Users</h3>
                <p class="text-slate-500 text-xs">View, search, and manage all registered users</p>
              </div>
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 text-slate-400 ml-auto group-hover:text-rose-500 transition" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </template>
  </div>
</template>
