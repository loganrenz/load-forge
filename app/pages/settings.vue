<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const { data: user } = await useFetch('/api/auth/me')
const tier = computed(() => user.value?.user?.subscription?.tier || 'free')
const isPaid = computed(() => tier.value !== 'free')
const loading = ref(false)
const portalLoading = ref(false)

const tierLimits: Record<string, any> = {
  free: {
    maxVUs: 50,
    maxDuration: '1 minute',
    maxConcurrentTests: 1,
    historyDays: 7,
    apiAccess: false,
    scheduledTests: false,
  },
  pro: {
    maxVUs: 500,
    maxDuration: '10 minutes',
    maxConcurrentTests: 3,
    historyDays: 30,
    apiAccess: true,
    scheduledTests: true,
  },
  business: {
    maxVUs: 2000,
    maxDuration: '30 minutes',
    maxConcurrentTests: 10,
    historyDays: 90,
    apiAccess: true,
    scheduledTests: true,
  },
}

const currentLimits = computed(() => tierLimits[tier.value] || tierLimits.free)

async function openBillingPortal() {
  portalLoading.value = true
  try {
    const { url } = await $fetch<{ url: string }>('/api/billing/portal', {
      method: 'POST',
    })
    if (url) {
      window.location.href = url
    }
  }
  catch (e: any) {
    console.error('Portal error:', e)
  }
  finally {
    portalLoading.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-2xl">
    <h1 class="text-2xl font-bold text-slate-900 mb-1">Settings</h1>
    <p class="text-slate-500 text-sm mb-8">Manage your account and subscription</p>
    
    <!-- Account Info -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm mb-5">
      <h2 class="font-semibold text-slate-900 text-sm mb-4">Account</h2>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">Email</span>
          <span class="text-slate-900 text-sm font-medium">{{ user?.user?.email }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">Name</span>
          <span class="text-slate-900 text-sm font-medium">{{ user?.user?.name || '-' }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">Member since</span>
          <span class="text-slate-900 text-sm font-medium">-</span>
        </div>
      </div>
    </div>
    
    <!-- Subscription -->
    <div class="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm mb-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-slate-900 text-sm">Subscription</h2>
        <UBadge :color="tier === 'free' ? 'neutral' : 'primary'" variant="subtle" class="capitalize">
          {{ tier }} Plan
        </UBadge>
      </div>
      
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">Max VUs</span>
          <span class="text-slate-900 text-sm font-medium">{{ currentLimits.maxVUs.toLocaleString() }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">Max Duration</span>
          <span class="text-slate-900 text-sm font-medium">{{ currentLimits.maxDuration }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">Concurrent Tests</span>
          <span class="text-slate-900 text-sm font-medium">{{ currentLimits.maxConcurrentTests }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">History Retention</span>
          <span class="text-slate-900 text-sm font-medium">{{ currentLimits.historyDays }} days</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-slate-500 text-sm">API Access</span>
          <UIcon 
            :name="currentLimits.apiAccess ? 'i-heroicons-check-circle' : 'i-heroicons-x-circle'" 
            :class="currentLimits.apiAccess ? 'text-emerald-500' : 'text-slate-300'"
            class="w-4.5 h-4.5"
          />
        </div>
      </div>
      
      <!-- Upgrade CTA (free users) -->
      <div v-if="!isPaid" class="mt-5 pt-4 border-t border-slate-100">
        <p class="text-slate-500 text-sm mb-3">
          Upgrade to unlock more VUs, longer tests, and API access.
        </p>
        <NuxtLink to="/pricing">
          <UButton color="primary" size="sm" class="btn-primary">
            View Plans & Upgrade
          </UButton>
        </NuxtLink>
      </div>

      <!-- Manage Subscription (paid users) -->
      <div v-else class="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
        <UButton 
          color="neutral" 
          variant="outline" 
          size="sm" 
          :loading="portalLoading"
          @click="openBillingPortal"
        >
          Manage Subscription
        </UButton>
        <NuxtLink to="/pricing">
          <UButton variant="ghost" size="sm" class="text-slate-500">
            Change Plan
          </UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
