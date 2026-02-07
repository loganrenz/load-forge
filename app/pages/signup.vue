<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const email = ref('')
const password = ref('')
const name = ref('')
const loading = ref(false)
const error = ref('')

async function handleSignup() {
  loading.value = true
  error.value = ''
  
  try {
    const { user } = await $fetch<{ user: any }>('/api/auth/signup', {
      method: 'POST',
      body: { email: email.value, password: password.value, name: name.value },
    })

    const { track, identify } = useAnalytics()
    if (user?.id) {
      identify(user.id, { email: user.email })
    }
    track('signup', { method: 'email' })
    
    navigateTo('/dashboard')
  } catch (e: any) {
    error.value = e.data?.message || 'An error occurred'
  } finally {
    loading.value = false
  }
}

function signInWithApple() {
  window.location.href = '/api/auth/apple'
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 px-4">
    <div class="absolute inset-0 gradient-mesh-light" />
    
    <div class="relative w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <UIcon name="i-heroicons-bolt" class="w-5 h-5 text-white" />
          </div>
          <span class="font-bold text-xl text-slate-900">loadtest.dev</span>
        </NuxtLink>
      </div>
      
      <!-- Card -->
      <div class="bg-white border border-slate-200 rounded-2xl p-7 shadow-sm">
        <h1 class="text-xl font-bold text-slate-900 mb-1">Create your account</h1>
        <p class="text-slate-500 text-sm mb-7">Start load testing in minutes</p>

        <!-- Apple SSO -->
        <button
          type="button"
          class="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg bg-black text-white font-medium text-sm hover:bg-gray-900 transition cursor-pointer"
          @click="signInWithApple"
        >
          <svg class="w-4.5 h-4.5" viewBox="0 0 814 1000" fill="currentColor">
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76.5 0-103.7 40.8-165.9 40.8s-105.6-57.8-155.5-127.4c-58.3-81.4-105.1-209.5-105.1-330.4C0 359 74.5 220.5 193.3 220.5c60.6 0 111.1 40.8 149 40.8 35.9 0 91.9-43.4 161.2-43.4 26 0 119.5 2.6 181.2 96.3l-3.6 2.7c30.1 22.9 67.4 63.1 106.5 124z M554.1 0c-4.5 28.8-16.9 62.2-35.9 87.5C497.3 112.4 459.4 137.3 411.9 137.3c-3.2-20.7 0-57.8 15.6-85.5C443.8 26 490 2.6 554.1 0z" />
          </svg>
          Sign up with Apple
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3 my-6">
          <div class="flex-1 h-px bg-slate-200" />
          <span class="text-xs text-slate-400 font-medium">or continue with email</span>
          <div class="flex-1 h-px bg-slate-200" />
        </div>
        
        <form @submit.prevent="handleSignup" class="space-y-4">
          <UFormField label="Name" name="name">
            <UInput 
              v-model="name" 
              placeholder="John Doe"
              size="lg"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Email" name="email" required>
            <UInput 
              v-model="email" 
              type="email" 
              placeholder="you@example.com"
              size="lg"
              class="w-full"
            />
          </UFormField>
          
          <UFormField label="Password" name="password" required>
            <UInput 
              v-model="password" 
              type="password" 
              placeholder="••••••••"
              size="lg"
              class="w-full"
            />
            <template #hint>
              <span class="text-slate-400 text-xs">Minimum 8 characters</span>
            </template>
          </UFormField>
          
          <UAlert v-if="error" color="error" variant="soft" :title="error" />
          
          <UButton 
            type="submit" 
            block 
            size="lg" 
            color="primary"
            :loading="loading"
            class="btn-primary"
          >
            Create Account
          </UButton>
        </form>
        
        <p class="text-center text-slate-500 text-sm mt-6">
          Already have an account?
          <NuxtLink to="/login" class="text-indigo-600 hover:text-indigo-700 font-medium">
            Log in
          </NuxtLink>
        </p>
      </div>
      
      <p class="text-center text-slate-400 text-xs mt-6">
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  </div>
</template>

