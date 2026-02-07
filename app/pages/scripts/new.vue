<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

interface TemplateVariable {
  key: string
  label: string
  placeholder: string
  default: string
  type?: 'text' | 'number' | 'password'
}

interface ScriptTemplate {
  id: string
  name: string
  description: string
  icon: string
  color: string
  variables: TemplateVariable[]
  script: string // Uses {{key}} placeholders
}

const templates: ScriptTemplate[] = [
  {
    id: 'http-get',
    name: 'HTTP GET',
    description: 'Basic GET request with response validation',
    icon: 'i-heroicons-arrow-down-tray',
    color: 'text-emerald-600',
    variables: [
      { key: 'TARGET_URL', label: 'Target URL', placeholder: 'https://api.example.com/health', default: 'https://httpbin.org/get' },
      { key: 'VUS', label: 'Virtual Users', placeholder: '10', default: '10', type: 'number' },
      { key: 'DURATION', label: 'Duration', placeholder: '30s', default: '30s' },
      { key: 'THRESHOLD_P95', label: 'P95 Threshold (ms)', placeholder: '500', default: '500', type: 'number' },
    ],
    script: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: {{VUS}},
  duration: '{{DURATION}}',
  thresholds: {
    http_req_duration: ['p(95)<{{THRESHOLD_P95}}'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('{{TARGET_URL}}');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < {{THRESHOLD_P95}}ms': (r) => r.timings.duration < {{THRESHOLD_P95}},
  });

  sleep(1);
}
`,
  },
  {
    id: 'rest-api',
    name: 'REST API CRUD',
    description: 'Full CRUD operations against a REST API',
    icon: 'i-heroicons-server-stack',
    color: 'text-blue-600',
    variables: [
      { key: 'BASE_URL', label: 'API Base URL', placeholder: 'https://api.example.com', default: 'https://jsonplaceholder.typicode.com' },
      { key: 'RESOURCE', label: 'Resource Path', placeholder: '/posts', default: '/posts' },
      { key: 'RAMP_DURATION', label: 'Ramp Up Duration', placeholder: '30s', default: '30s' },
      { key: 'SUSTAIN_DURATION', label: 'Sustain Duration', placeholder: '1m', default: '1m' },
      { key: 'TARGET_VUS', label: 'Target VUs', placeholder: '20', default: '20', type: 'number' },
    ],
    script: `import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
  stages: [
    { duration: '{{RAMP_DURATION}}', target: {{TARGET_VUS}} },
    { duration: '{{SUSTAIN_DURATION}}', target: {{TARGET_VUS}} },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = '{{BASE_URL}}';

export default function () {
  group('Create', () => {
    const payload = JSON.stringify({
      title: 'Load Test Item',
      body: 'Created during load testing',
    });
    const res = http.post(\`\${BASE_URL}{{RESOURCE}}\`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'created (201)': (r) => r.status === 201 });
  });

  group('Read', () => {
    const res = http.get(\`\${BASE_URL}{{RESOURCE}}/1\`);
    check(res, { 'fetched (200)': (r) => r.status === 200 });
  });

  group('Update', () => {
    const payload = JSON.stringify({ title: 'Updated Title' });
    const res = http.put(\`\${BASE_URL}{{RESOURCE}}/1\`, payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, { 'updated (200)': (r) => r.status === 200 });
  });

  group('Delete', () => {
    const res = http.del(\`\${BASE_URL}{{RESOURCE}}/1\`);
    check(res, { 'deleted (200)': (r) => r.status === 200 });
  });

  sleep(1);
}
`,
  },
  {
    id: 'staged-load',
    name: 'Staged Load Test',
    description: 'Gradually ramp up, sustain, then ramp down traffic',
    icon: 'i-heroicons-chart-bar',
    color: 'text-purple-600',
    variables: [
      { key: 'TARGET_URL', label: 'Target URL', placeholder: 'https://your-api.example.com/', default: 'https://test.k6.io' },
      { key: 'STAGE1_VUS', label: 'Stage 1 VUs', placeholder: '50', default: '50', type: 'number' },
      { key: 'STAGE2_VUS', label: 'Stage 2 VUs', placeholder: '100', default: '100', type: 'number' },
      { key: 'SUSTAIN_DURATION', label: 'Sustain Duration', placeholder: '5m', default: '5m' },
      { key: 'THRESHOLD_P95', label: 'P95 Threshold (ms)', placeholder: '500', default: '500', type: 'number' },
    ],
    script: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: {{STAGE1_VUS}} },
    { duration: '{{SUSTAIN_DURATION}}', target: {{STAGE1_VUS}} },
    { duration: '2m', target: {{STAGE2_VUS}} },
    { duration: '{{SUSTAIN_DURATION}}', target: {{STAGE2_VUS}} },
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<{{THRESHOLD_P95}}', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get('{{TARGET_URL}}');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time OK': (r) => r.timings.duration < {{THRESHOLD_P95}},
  });

  sleep(Math.random() * 3 + 1);
}
`,
  },
  {
    id: 'spike-test',
    name: 'Spike Test',
    description: 'Sudden burst of traffic to test system resilience',
    icon: 'i-heroicons-bolt',
    color: 'text-amber-600',
    variables: [
      { key: 'TARGET_URL', label: 'Target URL', placeholder: 'https://your-api.example.com/', default: 'https://test.k6.io' },
      { key: 'BASELINE_VUS', label: 'Baseline VUs', placeholder: '10', default: '10', type: 'number' },
      { key: 'SPIKE_VUS', label: 'Spike VUs', placeholder: '200', default: '200', type: 'number' },
      { key: 'SPIKE_DURATION', label: 'Spike Hold Duration', placeholder: '3m', default: '3m' },
    ],
    script: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: {{BASELINE_VUS}} },
    { duration: '1m',  target: {{BASELINE_VUS}} },
    { duration: '10s', target: {{SPIKE_VUS}} },
    { duration: '{{SPIKE_DURATION}}', target: {{SPIKE_VUS}} },
    { duration: '10s', target: {{BASELINE_VUS}} },
    { duration: '1m',  target: {{BASELINE_VUS}} },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<2000'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  const res = http.get('{{TARGET_URL}}');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response under 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}
`,
  },
  {
    id: 'auth-flow',
    name: 'Authenticated API',
    description: 'Login then hit protected endpoints with a token',
    icon: 'i-heroicons-lock-closed',
    color: 'text-red-600',
    variables: [
      { key: 'BASE_URL', label: 'API Base URL', placeholder: 'https://api.example.com', default: 'https://api.example.com' },
      { key: 'LOGIN_PATH', label: 'Login Endpoint', placeholder: '/auth/login', default: '/auth/login' },
      { key: 'PROTECTED_PATH', label: 'Protected Endpoint', placeholder: '/api/profile', default: '/api/profile' },
      { key: 'AUTH_EMAIL', label: 'Test Email', placeholder: 'test@example.com', default: 'test@example.com' },
      { key: 'AUTH_PASSWORD', label: 'Test Password', placeholder: 'password123', default: 'password123', type: 'password' },
      { key: 'VUS', label: 'Virtual Users', placeholder: '10', default: '10', type: 'number' },
      { key: 'DURATION', label: 'Duration', placeholder: '1m', default: '1m' },
    ],
    script: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: {{VUS}},
  duration: '{{DURATION}}',
  thresholds: {
    http_req_duration: ['p(95)<800'],
  },
};

const BASE_URL = '{{BASE_URL}}';

export function setup() {
  const loginRes = http.post(\`\${BASE_URL}{{LOGIN_PATH}}\`, JSON.stringify({
    email: '{{AUTH_EMAIL}}',
    password: '{{AUTH_PASSWORD}}',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, { 'logged in': (r) => r.status === 200 });
  return { token: loginRes.json('token') };
}

export default function (data) {
  const headers = {
    Authorization: \`Bearer \${data.token}\`,
    'Content-Type': 'application/json',
  };

  const res = http.get(\`\${BASE_URL}{{PROTECTED_PATH}}\`, { headers });
  check(res, {
    'status is 200': (r) => r.status === 200,
    'has user data': (r) => r.json('id') !== undefined,
  });

  sleep(1);
}
`,
  },
  {
    id: 'websocket',
    name: 'WebSocket',
    description: 'Test WebSocket connections and message throughput',
    icon: 'i-heroicons-signal',
    color: 'text-sky-600',
    variables: [
      { key: 'WS_URL', label: 'WebSocket URL', placeholder: 'wss://your-app.example.com/ws', default: 'wss://echo.websocket.org' },
      { key: 'MESSAGE', label: 'Test Message', placeholder: 'Hello from loadtest.dev!', default: 'Hello from loadtest.dev!' },
      { key: 'PING_INTERVAL', label: 'Ping Interval (ms)', placeholder: '1000', default: '1000', type: 'number' },
      { key: 'CONNECTION_DURATION', label: 'Connection Duration (ms)', placeholder: '10000', default: '10000', type: 'number' },
      { key: 'VUS', label: 'Virtual Users', placeholder: '10', default: '10', type: 'number' },
      { key: 'DURATION', label: 'Test Duration', placeholder: '30s', default: '30s' },
    ],
    script: `import ws from 'k6/ws';
import { check } from 'k6';

export const options = {
  vus: {{VUS}},
  duration: '{{DURATION}}',
};

export default function () {
  const url = '{{WS_URL}}';

  const res = ws.connect(url, {}, function (socket) {
    socket.on('open', () => {
      console.log('Connected');
      socket.send('{{MESSAGE}}');

      socket.setInterval(() => {
        socket.send(\`Ping \${Date.now()}\`);
      }, {{PING_INTERVAL}});
    });

    socket.on('message', (data) => {
      console.log(\`Received: \${data}\`);
    });

    socket.on('close', () => console.log('Disconnected'));
    socket.on('error', (e) => console.log('Error:', e.error()));

    socket.setTimeout(() => {
      socket.close();
    }, {{CONNECTION_DURATION}});
  });

  check(res, {
    'status is 101': (r) => r && r.status === 101,
  });
}
`,
  },
  {
    id: 'graphql',
    name: 'GraphQL API',
    description: 'Query and mutation load test for GraphQL endpoints',
    icon: 'i-heroicons-circle-stack',
    color: 'text-pink-600',
    variables: [
      { key: 'GRAPHQL_URL', label: 'GraphQL Endpoint', placeholder: 'https://api.example.com/graphql', default: 'https://api.example.com/graphql' },
      { key: 'QUERY_NAME', label: 'Query Name', placeholder: 'GetUsers', default: 'GetUsers' },
      { key: 'QUERY_FIELDS', label: 'Query Fields', placeholder: 'id name email', default: 'id name email' },
      { key: 'VUS', label: 'Virtual Users', placeholder: '20', default: '20', type: 'number' },
      { key: 'DURATION', label: 'Duration', placeholder: '1m', default: '1m' },
    ],
    script: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: {{VUS}},
  duration: '{{DURATION}}',
  thresholds: {
    http_req_duration: ['p(95)<600'],
    http_req_failed: ['rate<0.01'],
  },
};

const GRAPHQL_URL = '{{GRAPHQL_URL}}';
const HEADERS = { 'Content-Type': 'application/json' };

export default function () {
  const query = JSON.stringify({
    query: \`
      query {{QUERY_NAME}} {
        users(first: 10) {
          {{QUERY_FIELDS}}
        }
      }
    \`,
  });

  const queryRes = http.post(GRAPHQL_URL, query, { headers: HEADERS });
  check(queryRes, {
    'query success': (r) => r.status === 200,
    'has data': (r) => r.json('data') !== null,
    'no errors': (r) => r.json('errors') === undefined,
  });

  const mutation = JSON.stringify({
    query: \`
      mutation CreatePost($input: CreatePostInput!) {
        createPost(input: $input) {
          id
          title
        }
      }
    \`,
    variables: {
      input: {
        title: \`Load test post \${Date.now()}\`,
        body: 'Generated during load testing',
      },
    },
  });

  const mutateRes = http.post(GRAPHQL_URL, mutation, { headers: HEADERS });
  check(mutateRes, {
    'mutation success': (r) => r.status === 200,
  });

  sleep(1);
}
`,
  },
  {
    id: 'blank',
    name: 'Blank Script',
    description: 'Start from scratch with a minimal template',
    icon: 'i-heroicons-document',
    color: 'text-slate-400',
    variables: [
      { key: 'TARGET_URL', label: 'Target URL', placeholder: 'https://your-api.example.com', default: 'https://test.k6.io' },
    ],
    script: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '10s',
};

export default function () {
  const res = http.get('{{TARGET_URL}}');
  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1);
}
`,
  },
]

const selectedTemplate = ref<ScriptTemplate | null>(null)
const name = ref('')
const description = ref('')
const script = ref('')
const variableValues = ref<Record<string, string>>({})

const loading = ref(false)
const error = ref('')

function selectTemplate(template: ScriptTemplate) {
  selectedTemplate.value = template
  // Initialize variable values with defaults
  const vals: Record<string, string> = {}
  for (const v of template.variables) {
    vals[v.key] = v.default
  }
  variableValues.value = vals

  if (!name.value) {
    name.value = template.name === 'Blank Script' ? '' : `${template.name} Test`
  }
  if (!description.value && template.id !== 'blank') {
    description.value = template.description
  }

  // Generate initial script from template
  rebuildScript()
}

function rebuildScript() {
  if (!selectedTemplate.value) return
  let s = selectedTemplate.value.script
  for (const [key, value] of Object.entries(variableValues.value)) {
    s = s.replaceAll(`{{${key}}}`, value)
  }
  script.value = s
}

// Watch variable changes and rebuild
watch(variableValues, () => rebuildScript(), { deep: true })

async function saveScript() {
  if (!name.value.trim()) {
    error.value = 'Script name is required'
    return
  }
  if (!script.value.trim()) {
    error.value = 'Script content is required'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await $fetch('/api/scripts', {
      method: 'POST',
      body: {
        name: name.value,
        description: description.value,
        script: script.value,
      },
    })

    const { track } = useAnalytics()
    track('script_created', { 
      name: name.value, 
      template: selectedTemplate.value?.id 
    })

    navigateTo(`/scripts/${result.script.id}`)
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save script'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-8 max-w-5xl">
    <div class="flex items-center gap-4 mb-8">
      <NuxtLink to="/scripts">
        <UButton variant="ghost" color="neutral" icon="i-heroicons-arrow-left" />
      </NuxtLink>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">New Script</h1>
        <p class="text-slate-500 text-sm">Choose a template or start from scratch</p>
      </div>
    </div>

    <!-- Template Selector -->
    <div v-if="!selectedTemplate" class="mb-8">
      <h2 class="text-sm font-semibold text-slate-900 mb-3">Choose a Template</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="tmpl in templates"
          :key="tmpl.id"
          class="bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-indigo-200 hover:shadow-md transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          @click="selectTemplate(tmpl)"
        >
          <div class="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center mb-3">
            <UIcon :name="tmpl.icon" :class="['w-4.5 h-4.5', tmpl.color]" />
          </div>
          <h3 class="font-semibold text-slate-900 text-sm mb-1">{{ tmpl.name }}</h3>
          <p class="text-slate-500 text-xs line-clamp-2">{{ tmpl.description }}</p>
        </button>
      </div>
    </div>

    <!-- Editor (shown after template selection) -->
    <div v-else class="space-y-6">
      <!-- Template badge -->
      <div class="flex items-center gap-3">
        <UBadge variant="subtle" color="primary" class="capitalize">
          <UIcon :name="selectedTemplate.icon" class="w-3.5 h-3.5 mr-1" />
          {{ selectedTemplate.name }}
        </UBadge>
        <button class="text-xs text-slate-500 hover:text-slate-700 transition" @click="selectedTemplate = null; script = ''; variableValues = {}">
          Change template
        </button>
      </div>

      <div class="grid grid-cols-2 gap-6">
        <UFormField label="Script Name" name="name" required>
          <UInput
            v-model="name"
            placeholder="My API Load Test"
            size="lg"
            class="w-full"
          />
        </UFormField>

        <UFormField label="Description" name="description">
          <UInput
            v-model="description"
            placeholder="Tests the main API endpoints under load"
            size="lg"
            class="w-full"
          />
        </UFormField>
      </div>

      <!-- Template Variables -->
      <div v-if="selectedTemplate.variables.length > 0" class="rounded-xl bg-slate-50 border border-slate-200 p-5">
        <h3 class="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-adjustments-horizontal" class="w-4 h-4 text-indigo-600" />
          Configure Your Test
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <UFormField
            v-for="v in selectedTemplate.variables"
            :key="v.key"
            :label="v.label"
            :name="v.key"
          >
            <UInput
              v-model="variableValues[v.key]"
              :type="v.type || 'text'"
              :placeholder="v.placeholder"
              size="sm"
              class="w-full font-mono"
            />
          </UFormField>
        </div>
      </div>

      <!-- Code Editor -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-2">
          k6 Script (JavaScript)
          <span class="text-slate-400 font-normal ml-2">— auto-generated from your config above</span>
        </label>
        <div class="rounded-xl bg-slate-950 border border-slate-200 overflow-hidden shadow-sm">
          <div class="flex items-center gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/80">
            <div class="w-3 h-3 rounded-full bg-red-400" />
            <div class="w-3 h-3 rounded-full bg-amber-400" />
            <div class="w-3 h-3 rounded-full bg-green-400" />
            <span class="ml-2 text-xs text-slate-500 font-mono">test.js</span>
          </div>
          <textarea
            v-model="script"
            class="w-full h-96 p-4 bg-transparent text-slate-200 font-mono text-sm resize-none focus:outline-none"
            spellcheck="false"
            placeholder="Write your k6 script here..."
          />
        </div>
        <p class="mt-2 text-xs text-slate-400">
          You can edit the script directly or change values above.
          <a href="https://grafana.com/docs/k6/latest/" target="_blank" class="text-indigo-600 hover:text-indigo-700">
            View k6 docs →
          </a>
        </p>
      </div>

      <UAlert v-if="error" color="error" variant="soft" :title="error" />

      <div class="flex items-center gap-4">
        <UButton
          color="primary"
          size="lg"
          :loading="loading"
          class="btn-primary"
          @click="saveScript"
        >
          <UIcon name="i-heroicons-document-check" class="w-5 h-5 mr-2" />
          Save Script
        </UButton>
        <NuxtLink to="/scripts">
          <UButton variant="ghost" color="neutral" size="lg">Cancel</UButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
