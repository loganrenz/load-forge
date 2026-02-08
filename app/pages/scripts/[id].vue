<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

const route = useRoute()
const scriptId = route.params.id as string

const { data, refresh } = await useFetch(`/api/scripts/${scriptId}`)
const script = computed(() => data.value?.script)

const editName = ref('')
const editDescription = ref('')
const editScript = ref('')
const isEditing = ref(false)
const saving = ref(false)
const error = ref('')

// Run test modal
const showRunModal = ref(false)
const runVus = ref(10)
const runDuration = ref('30s')
const runLoading = ref(false)
const runError = ref('')

watchEffect(() => {
  if (script.value) {
    editName.value = script.value.name
    editDescription.value = script.value.description || ''
    editScript.value = script.value.script
  }
})

// Check query for auto-run
if (route.query.run === 'true') {
  showRunModal.value = true
}

async function saveChanges() {
  saving.value = true
  error.value = ''
  
  try {
    await $fetch(`/api/scripts/${scriptId}`, {
      method: 'PUT',
      body: {
        name: editName.value,
        description: editDescription.value,
        script: editScript.value,
      },
    })
    
    await refresh()
    isEditing.value = false
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}

async function runTest() {
  runLoading.value = true
  runError.value = ''
  
  try {
    const result = await $fetch(`/api/scripts/${scriptId}/run`, {
      method: 'POST',
      body: {
        vus: runVus.value,
        duration: runDuration.value,
      },
    })
    
    const { track } = useAnalytics()
    track('test_started', { 
      scriptId: scriptId, 
      vus: runVus.value, 
      duration: runDuration.value 
    })

    showRunModal.value = false
    navigateTo(`/runs/${result.run?.id}`)
  } catch (e: any) {
    runError.value = e.data?.message || 'Failed to start test'
  } finally {
    runLoading.value = false
  }
}

async function deleteScript() {
  if (!confirm('Are you sure you want to delete this script?')) return
  
  await $fetch(`/api/scripts/${scriptId}`, { method: 'DELETE' })
  navigateTo('/scripts')
}
</script>

<template>
  <div class="p-8 max-w-4xl">
    <div v-if="!script" class="text-center py-16">
      <p class="text-slate-500">Script not found</p>
      <NuxtLink to="/scripts">
        <UButton variant="soft" color="primary" size="sm" class="mt-4">Back to Scripts</UButton>
      </NuxtLink>
    </div>
    
    <template v-else>
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
          <NuxtLink to="/scripts">
            <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-left" size="sm" />
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold text-slate-900">{{ script.name }}</h1>
            <p class="text-slate-500 text-xs">{{ script.description || 'No description' }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <UButton 
            v-if="!isEditing"
            variant="outline" 
            color="neutral"
            icon="i-heroicons-pencil"
            size="sm"
            @click="isEditing = true"
          >
            Edit
          </UButton>
          <UButton 
            color="primary"
            icon="i-heroicons-play"
            size="sm"
            class="btn-primary"
            @click="showRunModal = true"
          >
            Run Test
          </UButton>
          <UButton 
            variant="ghost" 
            color="error"
            icon="i-heroicons-trash"
            size="sm"
            @click="deleteScript"
          />
        </div>
      </div>
      
      <!-- Script Content -->
      <div class="rounded-xl bg-slate-950 border border-slate-200 overflow-hidden shadow-sm">
        <div class="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-400" />
            <div class="w-3 h-3 rounded-full bg-amber-400" />
            <div class="w-3 h-3 rounded-full bg-green-400" />
            <span class="ml-2 text-xs text-slate-500 font-mono">{{ script.name }}.js</span>
          </div>
          <span class="text-xs text-slate-500">
            Last updated: {{ script.updatedAt ? new Date(script.updatedAt).toLocaleString() : '-' }}
          </span>
        </div>
        
        <div v-if="isEditing" class="p-0">
          <div class="p-4 border-b border-slate-800 space-y-3 bg-slate-900/30">
            <div class="grid grid-cols-2 gap-3">
              <UFormField label="Name">
                <UInput v-model="editName" size="sm" class="w-full" />
              </UFormField>
              <UFormField label="Description">
                <UInput v-model="editDescription" size="sm" class="w-full" />
              </UFormField>
            </div>
          </div>
          <textarea
            v-model="editScript"
            class="w-full h-96 p-4 bg-transparent text-slate-200 font-mono text-sm resize-none focus:outline-none"
            spellcheck="false"
          />
          <div class="flex items-center gap-3 px-4 py-3 border-t border-slate-800 bg-slate-900/30">
            <UAlert v-if="error" color="error" variant="soft" :title="error" class="flex-1" />
            <div class="ml-auto flex items-center gap-2">
              <UButton variant="ghost" color="neutral" size="sm" @click="isEditing = false">Cancel</UButton>
              <UButton color="primary" size="sm" :loading="saving" @click="saveChanges">Save Changes</UButton>
            </div>
          </div>
        </div>
        
        <pre v-else class="p-4 text-sm text-slate-300 font-mono overflow-x-auto max-h-[500px] overflow-y-auto"><code>{{ script.script }}</code></pre>
      </div>
      
      <!-- Run Test Modal -->
      <UModal
        v-model:open="showRunModal"
        title="Run Load Test"
        description="Configure and start a new load test run"
      >
        <template #body>
          <div class="space-y-4">
            <UFormField label="Virtual Users (VUs)" name="vus">
              <UInput 
                v-model.number="runVus" 
                type="number" 
                :min="1" 
                :max="10000"
                size="lg"
                class="w-full"
              />
              <template #hint>
                <span class="text-slate-400 text-xs">Number of concurrent virtual users</span>
              </template>
            </UFormField>
            
            <UFormField label="Duration" name="duration">
              <UInput 
                v-model="runDuration" 
                placeholder="30s"
                size="lg"
                class="w-full"
              />
              <template #hint>
                <span class="text-slate-400 text-xs">Format: 30s, 5m, 1h</span>
              </template>
            </UFormField>
            
            <UAlert v-if="runError" color="error" variant="soft" :title="runError" />
          </div>
        </template>

        <template #footer>
          <UButton 
            color="primary" 
            block 
            size="lg"
            :loading="runLoading"
            class="btn-primary"
            @click="runTest"
          >
            <UIcon name="i-heroicons-play" class="w-4 h-4 mr-1.5" />
            Start Test
          </UButton>
        </template>
      </UModal>
    </template>
  </div>
</template>
