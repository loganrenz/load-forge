<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard',
})

const { data, refresh, status } = await useFetch('/api/scripts')

const scripts = computed(() => data.value?.scripts || [])

async function deleteScript(id: string) {
  if (!confirm('Are you sure you want to delete this script?')) return
  
  await $fetch(`/api/scripts/${id}`, { method: 'DELETE' })
  await refresh()
}

function getMenuItems(script: any): DropdownMenuItem[][] {
  return [
    [
      { label: 'Edit', icon: 'i-heroicons-pencil', onSelect: () => navigateTo(`/scripts/${script.id}`) },
      { label: 'Run Test', icon: 'i-heroicons-play', onSelect: () => navigateTo(`/scripts/${script.id}?run=true`) },
    ],
    [
      { label: 'Delete', icon: 'i-heroicons-trash', color: 'error' as const, onSelect: () => deleteScript(script.id) },
    ],
  ]
}
</script>

<template>
  <div class="p-8">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 mb-1">Test Scripts</h1>
        <p class="text-slate-500 text-sm">Manage your k6 load test scripts</p>
      </div>
      <NuxtLink to="/scripts/new">
        <UButton color="primary" icon="i-heroicons-plus" size="sm" class="btn-primary">
          New Script
        </UButton>
      </NuxtLink>
    </div>
    
    <div v-if="status === 'pending'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="i in 3" :key="i" class="bg-white rounded-xl border border-slate-200 h-44 shimmer" />
    </div>
    
    <div v-else-if="scripts.length === 0" class="text-center py-16">
      <div class="w-16 h-16 mx-auto mb-5 rounded-2xl bg-slate-100 flex items-center justify-center">
        <UIcon name="i-heroicons-code-bracket" class="w-8 h-8 text-slate-400" />
      </div>
      <h2 class="text-lg font-semibold text-slate-900 mb-2">No scripts yet</h2>
      <p class="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
        Create your first k6 load test script. Write tests in JavaScript to simulate user traffic.
      </p>
      <NuxtLink to="/scripts/new">
        <UButton color="primary" icon="i-heroicons-plus" size="sm" class="btn-primary">
          Create Your First Script
        </UButton>
      </NuxtLink>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="script in scripts" 
        :key="script.id"
        class="group cursor-pointer bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200"
        @click="navigateTo(`/scripts/${script.id}`)"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
            <UIcon name="i-heroicons-code-bracket" class="w-4.5 h-4.5 text-indigo-600" />
          </div>
          <UDropdownMenu
            :items="getMenuItems(script)"
            @click.stop
          >
            <UButton 
              icon="i-heroicons-ellipsis-vertical" 
              variant="ghost" 
              color="neutral" 
              size="xs"
              class="opacity-0 group-hover:opacity-100 transition"
            />
          </UDropdownMenu>
        </div>
        
        <h3 class="font-semibold text-slate-900 text-sm mb-1 truncate">{{ script.name }}</h3>
        <p class="text-slate-500 text-xs mb-3 line-clamp-2">
          {{ script.description || 'No description' }}
        </p>
        
        <div class="flex items-center gap-4 text-xs text-slate-400">
          <span>{{ new Date(script.createdAt).toLocaleDateString() }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
