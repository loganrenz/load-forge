<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

const search = ref('')
const page = ref(1)
const limit = 20

const queryParams = computed(() => ({
  page: page.value,
  limit,
  search: search.value || undefined,
}))

const { data, pending, refresh } = await useFetch('/api/admin/users', {
  query: queryParams,
  watch: [queryParams],
})

const users = computed(() => data.value?.users || [])
const pagination = computed(() => data.value?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 })

// Debounce search
let searchTimeout: ReturnType<typeof setTimeout>
function onSearch(value: string) {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    search.value = value
    page.value = 1
  }, 300)
}

async function toggleAdmin(userId: string, currentStatus: boolean) {
  if (!confirm(`Are you sure you want to ${currentStatus ? 'remove' : 'grant'} admin access?`)) return
  
  await $fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: { isAdmin: !currentStatus },
  })
  refresh()
}

async function deleteUser(userId: string, email: string) {
  if (!confirm(`Delete user "${email}"? This will permanently remove all their data.`)) return
  
  await $fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
  })
  refresh()
}

function formatDate(date: string | Date | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
</script>

<template>
  <div class="p-8">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 mb-1">Users</h1>
        <p class="text-slate-500 text-sm">
          {{ pagination.total.toLocaleString() }} registered user{{ pagination.total === 1 ? '' : 's' }}
        </p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="mb-6">
      <UInput
        placeholder="Search by email or name..."
        icon="i-heroicons-magnifying-glass"
        size="lg"
        :model-value="search"
        @update:model-value="onSearch"
        class="max-w-md"
      />
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200/80 rounded-xl overflow-hidden shadow-sm">
      <!-- Loading -->
      <div v-if="pending" class="flex items-center justify-center py-16">
        <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 text-slate-300 animate-spin" />
      </div>

      <!-- Empty State -->
      <div v-else-if="users.length === 0" class="p-12 text-center">
        <UIcon name="i-heroicons-users" class="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p class="text-slate-500 text-sm">{{ search ? 'No users match your search' : 'No users registered yet' }}</p>
      </div>

      <!-- User Table -->
      <table v-else class="w-full">
        <thead>
          <tr class="border-b border-slate-100">
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tier</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
            <th class="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
            <th class="px-5 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr 
            v-for="u in users" 
            :key="u.id"
            class="hover:bg-slate-50/50 transition"
          >
            <td class="px-5 py-3.5">
              <NuxtLink :to="`/admin/users/${u.id}`" class="group">
                <p class="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition">
                  {{ u.name || 'Unnamed User' }}
                </p>
                <p class="text-xs text-slate-400 mt-0.5">{{ u.email }}</p>
              </NuxtLink>
            </td>
            <td class="px-5 py-3.5">
              <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize', getTierColor(u.tier)]">
                {{ u.tier || 'free' }}
              </span>
            </td>
            <td class="px-5 py-3.5">
              <span v-if="u.isAdmin" class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700">
                <UIcon name="i-heroicons-shield-check" class="w-3 h-3" />
                Admin
              </span>
              <span v-else class="text-xs text-slate-400">User</span>
            </td>
            <td class="px-5 py-3.5 text-sm text-slate-500">
              {{ formatDate(u.createdAt) }}
            </td>
            <td class="px-5 py-3.5 text-right">
              <div class="flex items-center justify-end gap-1">
                <NuxtLink :to="`/admin/users/${u.id}`">
                  <UButton 
                    icon="i-heroicons-eye" 
                    variant="ghost" 
                    color="neutral" 
                    size="xs"
                  />
                </NuxtLink>
                <UButton 
                  :icon="u.isAdmin ? 'i-heroicons-shield-exclamation' : 'i-heroicons-shield-check'" 
                  variant="ghost" 
                  :color="u.isAdmin ? 'warning' : 'neutral'"
                  size="xs"
                  @click="toggleAdmin(u.id, !!u.isAdmin)"
                />
                <UButton 
                  icon="i-heroicons-trash" 
                  variant="ghost" 
                  color="error"
                  size="xs"
                  @click="deleteUser(u.id, u.email)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="border-t border-slate-100 px-5 py-3 flex items-center justify-between">
        <p class="text-xs text-slate-400">
          Showing {{ (pagination.page - 1) * pagination.limit + 1 }}–{{ Math.min(pagination.page * pagination.limit, pagination.total) }} of {{ pagination.total }}
        </p>
        <div class="flex items-center gap-1">
          <UButton 
            icon="i-heroicons-chevron-left" 
            variant="ghost" 
            color="neutral" 
            size="xs"
            :disabled="page <= 1"
            @click="page--"
          />
          <span class="text-xs text-slate-500 px-2">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
          <UButton 
            icon="i-heroicons-chevron-right" 
            variant="ghost" 
            color="neutral" 
            size="xs"
            :disabled="page >= pagination.totalPages"
            @click="page++"
          />
        </div>
      </div>
    </div>
  </div>
</template>
