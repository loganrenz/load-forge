export interface ToolPage {
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  headline: string
  subheadline: string
  description: string
  features: string[]
  codeExample: {
    filename: string
    code: string
  }
  faqs: { question: string; answer: string }[]
  relatedTools: string[]
}

export const tools: ToolPage[] = [
  {
    slug: 'api-load-testing',
    title: 'API Load Testing',
    metaTitle: 'API Load Testing — Free Online Tool | loadtest.dev',
    metaDescription: 'Load test your REST and GraphQL APIs with up to 200 virtual users for free. Real-time metrics, JavaScript scripting, and instant results.',
    headline: 'API Load Testing',
    subheadline: 'Test your APIs under realistic traffic conditions',
    description: 'Simulate hundreds of concurrent API requests to find bottlenecks before your users do. loadtest.dev supports REST, GraphQL, WebSocket, and gRPC protocols with full k6 scripting.',
    features: [
      'Test REST, GraphQL, WebSocket, and gRPC APIs',
      'Simulate up to 200 concurrent users for free',
      'Real-time response time and error rate monitoring',
      'Custom headers, authentication, and payloads',
      'JavaScript-based test scripting with k6',
      'Detailed percentile breakdowns (p50, p95, p99)',
    ],
    codeExample: {
      filename: 'api-load-test.js',
      code: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '2m',
};

export default function () {
  const res = http.get('https://api.example.com/users');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}`,
    },
    faqs: [
      { question: 'What APIs can I load test?', answer: 'Any publicly accessible HTTP/HTTPS endpoint — REST APIs, GraphQL, WebSockets, and gRPC services. You can test internal APIs too if they\'re reachable from our global load zones.' },
      { question: 'How many concurrent requests can I simulate?', answer: 'The free tier supports up to 200 virtual users. Each virtual user sends requests in a loop, so 200 VUs can generate thousands of requests per second depending on your API\'s response time.' },
      { question: 'Can I test authenticated APIs?', answer: 'Yes. k6 scripts support custom headers, cookies, OAuth tokens, API keys, and session management. You have full control over the request lifecycle.' },
    ],
    relatedTools: ['rest-api-benchmark', 'graphql-load-testing', 'websocket-load-testing'],
  },
  {
    slug: 'stress-test-website',
    title: 'Website Stress Testing',
    metaTitle: 'Stress Test Your Website — Free Tool | loadtest.dev',
    metaDescription: 'Stress test your website with up to 200 virtual users for free. Find performance bottlenecks and ensure your site handles traffic spikes.',
    headline: 'Stress Test Your Website',
    subheadline: 'Ensure your site handles traffic spikes',
    description: 'Push your website to its limits with realistic user simulations. Identify the breaking point of your infrastructure and fix issues before peak traffic events hit.',
    features: [
      'Simulate real browser-like HTTP requests',
      'Test landing pages, checkouts, and user flows',
      'Identify server bottlenecks under load',
      'Monitor response times and error rates in real-time',
      'Free tier with 200 virtual users',
      'Scale to 5,000+ VUs on paid plans',
    ],
    codeExample: {
      filename: 'stress-test.js',
      code: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up
    { duration: '3m', target: 200 },  // Peak load
    { duration: '1m', target: 0 },    // Ramp down
  ],
};

export default function () {
  const res = http.get('https://mysite.com');
  check(res, {
    'page loads': (r) => r.status === 200,
    'fast response': (r) => r.timings.duration < 1000,
  });
  sleep(Math.random() * 3);
}`,
    },
    faqs: [
      { question: 'What\'s the difference between load testing and stress testing?', answer: 'Load testing verifies your system handles expected traffic levels. Stress testing pushes beyond normal capacity to find the breaking point. loadtest.dev supports both scenarios through configurable VU ramp-up stages.' },
      { question: 'Will stress testing affect my live site?', answer: 'Yes — stress tests send real HTTP requests. We recommend testing against a staging environment first or scheduling tests during low-traffic periods.' },
      { question: 'How do I know my site is performing well?', answer: 'Key metrics to watch: response time under 200ms for API calls, error rate below 1%, and consistent throughput as VUs increase. Our dashboard shows all of these in real-time.' },
    ],
    relatedTools: ['api-load-testing', 'spike-test', 'soak-test'],
  },
  {
    slug: 'k6-cloud-alternative',
    title: 'k6 Cloud Alternative',
    metaTitle: 'k6 Cloud Alternative — Self-Hosted Load Testing | loadtest.dev',
    metaDescription: 'Looking for a k6 Cloud alternative? loadtest.dev offers the same k6 scripting with generous free limits — 200 VUs, 5 minute tests, no credit card.',
    headline: 'The k6 Cloud Alternative',
    subheadline: 'Same k6 scripts. More generous free tier.',
    description: 'If you love k6 but find Grafana Cloud k6 pricing steep, loadtest.dev is built on the same open-source k6 engine with a more generous free tier. Paste your existing k6 scripts and run them instantly.',
    features: [
      '100% compatible with existing k6 scripts',
      '200 free virtual users (4x more than k6 Cloud)',
      '5 minute test duration on free tier',
      'No credit card required to start',
      'Real-time streaming results dashboard',
      'From $29/mo for 1,000 VUs',
    ],
    codeExample: {
      filename: 'existing-k6-test.js',
      code: `// Your existing k6 scripts work as-is
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  vus: 200,
  duration: '5m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.post('https://api.example.com/checkout', 
    JSON.stringify({ item: 'widget', qty: 1 }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, { 'checkout ok': (r) => r.status === 200 });
}`,
    },
    faqs: [
      { question: 'Are k6 scripts compatible with loadtest.dev?', answer: 'Yes. loadtest.dev runs the standard k6 engine. Any valid k6 script — including thresholds, checks, stages, and custom metrics — works without modification.' },
      { question: 'How does pricing compare to k6 Cloud?', answer: 'Our free tier includes 200 VUs and 5-minute tests vs. k6 Cloud\'s 50 VUs. Paid plans start at $29/mo for 1,000 VUs — typically 50-70% less than equivalent k6 Cloud pricing.' },
      { question: 'Can I migrate from k6 Cloud?', answer: 'Absolutely. Just copy your k6 test scripts to loadtest.dev. No code changes needed. Your thresholds, checks, and custom metrics all carry over.' },
    ],
    relatedTools: ['api-load-testing', 'http-load-test', 'performance-testing-checklist'],
  },
  {
    slug: 'http-load-test',
    title: 'HTTP Load Testing',
    metaTitle: 'HTTP Load Testing Tool — Test Any Endpoint | loadtest.dev',
    metaDescription: 'Run HTTP load tests against any endpoint. Support for GET, POST, PUT, DELETE with custom headers and payloads. Free for up to 200 VUs.',
    headline: 'HTTP Load Testing',
    subheadline: 'Test any HTTP endpoint under load',
    description: 'Send thousands of HTTP requests to any endpoint and measure response times, throughput, and error rates. Full support for all HTTP methods, custom headers, cookies, and request bodies.',
    features: [
      'All HTTP methods: GET, POST, PUT, DELETE, PATCH',
      'Custom headers, cookies, and authentication',
      'JSON, form-data, and binary payloads',
      'Response validation with checks',
      'Configurable think time between requests',
      'Real-time metrics dashboard',
    ],
    codeExample: {
      filename: 'http-test.js',
      code: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = { vus: 50, duration: '3m' };

const BASE_URL = 'https://api.example.com';

export default function () {
  // GET request
  const list = http.get(\`\${BASE_URL}/items\`);
  check(list, { 'list ok': (r) => r.status === 200 });

  // POST request with JSON body
  const created = http.post(\`\${BASE_URL}/items\`, 
    JSON.stringify({ name: 'Test Item' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(created, { 'created': (r) => r.status === 201 });
  
  sleep(1);
}`,
    },
    faqs: [
      { question: 'What HTTP methods are supported?', answer: 'All standard methods — GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS. You can also send custom HTTP methods via k6\'s http.request() function.' },
      { question: 'Can I send JSON payloads?', answer: 'Yes. Use JSON.stringify() for the body and set Content-Type to application/json. k6 handles serialization and content negotiation transparently.' },
      { question: 'How do I handle cookies and sessions?', answer: 'k6 automatically manages cookies across requests within a VU iteration. You can also set custom cookies via the headers parameter or use k6\'s cookie jar API for fine-grained control.' },
    ],
    relatedTools: ['api-load-testing', 'rest-api-benchmark', 'graphql-load-testing'],
  },
  {
    slug: 'rest-api-benchmark',
    title: 'REST API Benchmarking',
    metaTitle: 'REST API Benchmark Tool — Measure Performance | loadtest.dev',
    metaDescription: 'Benchmark your REST API performance with precise p50, p95, p99 latency metrics. Compare endpoints and track regressions over time.',
    headline: 'REST API Benchmarking',
    subheadline: 'Measure and compare API endpoint performance',
    description: 'Get precise latency percentiles (p50, p95, p99) for every REST endpoint. Compare performance across deployments, identify slow queries, and establish SLA baselines.',
    features: [
      'Percentile-based latency metrics (p50, p95, p99)',
      'Endpoint-by-endpoint comparison',
      'Throughput measurement (requests/second)',
      'Error rate tracking',
      'Custom thresholds and SLA validation',
      'Historical comparison across test runs',
    ],
    codeExample: {
      filename: 'benchmark.js',
      code: `import http from 'k6/http';
import { check } from 'k6';
import { Trend } from 'k6/metrics';

const getUsers = new Trend('get_users_duration');
const getOrders = new Trend('get_orders_duration');

export const options = {
  vus: 100,
  duration: '5m',
  thresholds: {
    get_users_duration: ['p(95)<300'],
    get_orders_duration: ['p(95)<500'],
  },
};

export default function () {
  const users = http.get('https://api.example.com/users');
  getUsers.add(users.timings.duration);

  const orders = http.get('https://api.example.com/orders');
  getOrders.add(orders.timings.duration);
}`,
    },
    faqs: [
      { question: 'What metrics does the benchmark provide?', answer: 'Response time percentiles (p50, p95, p99), throughput (requests/second), data transfer rates, and error rates. You can also define custom metrics for business-specific measurements.' },
      { question: 'Can I set pass/fail thresholds?', answer: 'Yes. k6 thresholds let you define SLAs like "95th percentile must be under 300ms". Tests automatically fail if thresholds are breached, making it easy to integrate with CI/CD.' },
    ],
    relatedTools: ['api-load-testing', 'http-load-test', 'performance-testing-checklist'],
  },
  {
    slug: 'graphql-load-testing',
    title: 'GraphQL Load Testing',
    metaTitle: 'GraphQL API Load Testing — Send Queries Under Load | loadtest.dev',
    metaDescription: 'Load test your GraphQL API with realistic queries and mutations. Measure resolver performance and find N+1 query bottlenecks.',
    headline: 'GraphQL Load Testing',
    subheadline: 'Test your GraphQL resolvers under pressure',
    description: 'Send realistic GraphQL queries and mutations at scale. Identify slow resolvers, N+1 query problems, and connection pool exhaustion before they affect users.',
    features: [
      'Queries, mutations, and subscriptions',
      'Variable parameterization',
      'Authentication header injection',
      'Per-operation latency tracking',
      'Complexity-based testing scenarios',
      'Works with Apollo, Hasura, and any GraphQL server',
    ],
    codeExample: {
      filename: 'graphql-test.js',
      code: `import http from 'k6/http';
import { check } from 'k6';

export const options = { vus: 50, duration: '3m' };

const query = \`
  query GetProducts($limit: Int!) {
    products(limit: $limit) {
      id
      name
      price
      reviews { rating }
    }
  }
\`;

export default function () {
  const res = http.post('https://api.example.com/graphql', 
    JSON.stringify({ query, variables: { limit: 20 } }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(res, {
    'status 200': (r) => r.status === 200,
    'no errors': (r) => !JSON.parse(r.body).errors,
  });
}`,
    },
    faqs: [
      { question: 'Can I test GraphQL subscriptions?', answer: 'k6 supports WebSocket connections, so you can test GraphQL subscriptions over WebSocket. Use the k6/ws module to establish and maintain subscription connections.' },
      { question: 'How do I test different query complexities?', answer: 'Create separate test scenarios with varying query depths and field selections. Use k6 stages to gradually increase complexity and VU count to find your server\'s limits.' },
    ],
    relatedTools: ['api-load-testing', 'websocket-load-testing', 'http-load-test'],
  },
  {
    slug: 'websocket-load-testing',
    title: 'WebSocket Load Testing',
    metaTitle: 'WebSocket Load Testing — Test Real-Time Connections | loadtest.dev',
    metaDescription: 'Load test WebSocket servers with hundreds of concurrent connections. Validate message throughput, latency, and connection stability.',
    headline: 'WebSocket Load Testing',
    subheadline: 'Validate real-time connection performance',
    description: 'Open hundreds of concurrent WebSocket connections and exchange messages at scale. Measure connection establishment time, message latency, and throughput under load.',
    features: [
      'Concurrent WebSocket connection testing',
      'Message send/receive latency tracking',
      'Connection stability under load',
      'Custom message payloads (JSON, binary)',
      'Reconnection and error handling patterns',
      'Compatible with Socket.io and raw WebSockets',
    ],
    codeExample: {
      filename: 'websocket-test.js',
      code: `import ws from 'k6/ws';
import { check } from 'k6';

export const options = { vus: 100, duration: '2m' };

export default function () {
  const res = ws.connect('wss://echo.example.com', {}, (socket) => {
    socket.on('open', () => {
      socket.send(JSON.stringify({ type: 'ping' }));
    });

    socket.on('message', (msg) => {
      check(msg, {
        'got response': (m) => m.length > 0,
      });
    });

    socket.setTimeout(() => socket.close(), 10000);
  });

  check(res, { 'connected': (r) => r && r.status === 101 });
}`,
    },
    faqs: [
      { question: 'How many WebSocket connections can I test?', answer: 'Each virtual user maintains one WebSocket connection. With 200 free VUs, you can test 200 concurrent connections. Scale to thousands on paid plans.' },
      { question: 'Does it work with Socket.io?', answer: 'Yes. Socket.io uses WebSocket as the transport layer. You can test Socket.io servers by connecting to the WebSocket endpoint directly with appropriate handshake headers.' },
    ],
    relatedTools: ['api-load-testing', 'graphql-load-testing', 'spike-test'],
  },
  {
    slug: 'spike-test',
    title: 'Spike Testing',
    metaTitle: 'Spike Testing — Simulate Sudden Traffic Surges | loadtest.dev',
    metaDescription: 'Test how your application handles sudden traffic spikes. Simulate flash sales, viral moments, and DDoS-like scenarios safely.',
    headline: 'Spike Testing',
    subheadline: 'Simulate sudden traffic surges',
    description: 'Model sudden, dramatic increases in traffic — like a product going viral or a flash sale starting. Verify your auto-scaling works, your caches hold, and your users get served.',
    features: [
      'Instant traffic ramp-up scenarios',
      'Test auto-scaling and CDN behavior',
      'Measure recovery time after spikes',
      'Identify cascade failures',
      'Custom spike patterns and durations',
      'Real-time monitoring during spikes',
    ],
    codeExample: {
      filename: 'spike-test.js',
      code: `import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm up
    { duration: '10s', target: 200 },   // SPIKE!
    { duration: '1m', target: 200 },    // Hold spike
    { duration: '10s', target: 10 },    // Recovery
    { duration: '30s', target: 10 },    // Verify recovery
    { duration: '10s', target: 0 },     // Ramp down
  ],
};

export default function () {
  http.get('https://myapp.com/api/products');
  sleep(1);
}`,
    },
    faqs: [
      { question: 'What\'s the difference between spike and stress testing?', answer: 'Stress testing gradually increases load to find the breaking point. Spike testing instantly jumps to high load to test how your system handles sudden surges and recovers afterward.' },
      { question: 'How fast can VUs ramp up?', answer: 'k6 can ramp from 0 to your VU limit in seconds. The 10-second stage in the example above jumps from 10 to 200 VUs almost instantly — perfect for simulating viral traffic.' },
    ],
    relatedTools: ['stress-test-website', 'soak-test', 'capacity-planning'],
  },
  {
    slug: 'soak-test',
    title: 'Soak Testing',
    metaTitle: 'Soak Testing — Long-Running Stability Tests | loadtest.dev',
    metaDescription: 'Run extended soak tests to find memory leaks, connection pool exhaustion, and performance degradation over time.',
    headline: 'Soak Testing',
    subheadline: 'Find issues that only appear over time',
    description: 'Run tests for extended periods to uncover problems that don\'t surface in short bursts — memory leaks, connection pool exhaustion, database connection limits, and gradual performance degradation.',
    features: [
      'Extended test durations (15-60 minutes)',
      'Memory leak detection through metric trends',
      'Connection pool exhaustion testing',
      'Gradual performance degradation monitoring',
      'Resource utilization tracking',
      'Ideal for pre-release validation',
    ],
    codeExample: {
      filename: 'soak-test.js',
      code: `import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up
    { duration: '30m', target: 100 },   // Sustained load
    { duration: '2m', target: 0 },      // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // Should stay consistent
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  http.get('https://myapp.com/api/data');
  sleep(2);
}`,
    },
    faqs: [
      { question: 'How long should a soak test run?', answer: 'At minimum 15-30 minutes to detect most issues. For production validation, 1-4 hours is ideal. The Pro plan supports 15-minute tests; Business supports up to 60 minutes.' },
      { question: 'What issues does soak testing find?', answer: 'Memory leaks, connection pool exhaustion, disk space fill-up, log rotation failures, cache eviction problems, and gradual response time degradation that only appears under sustained load.' },
    ],
    relatedTools: ['stress-test-website', 'spike-test', 'capacity-planning'],
  },
  {
    slug: 'capacity-planning',
    title: 'Capacity Planning',
    metaTitle: 'Capacity Planning Guide for Web Apps | loadtest.dev',
    metaDescription: 'Use load testing for infrastructure capacity planning. Determine how many users your servers can handle and when to scale.',
    headline: 'Capacity Planning',
    subheadline: 'Know your limits before your users find them',
    description: 'Use systematic load testing to determine your infrastructure\'s capacity. Find out exactly how many concurrent users your app can handle, at what point performance degrades, and when you need to scale.',
    features: [
      'Progressive load testing methodology',
      'Identify exact breaking points',
      'Cost-per-user infrastructure analysis',
      'Auto-scaling validation',
      'Baseline establishment for monitoring',
      'Data-driven scaling decisions',
    ],
    codeExample: {
      filename: 'capacity-test.js',
      code: `import http from 'k6/http';
import { check, sleep } from 'k6';

// Gradually increase load to find the breaking point
export const options = {
  stages: [
    { duration: '2m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 150 },
    { duration: '2m', target: 200 },  // Free tier max
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  http.get('https://myapp.com');
  sleep(1);
}`,
    },
    faqs: [
      { question: 'How do I determine my app\'s capacity?', answer: 'Run progressively increasing load tests. When response times exceed your SLA or error rates spike above 1-5%, you\'ve found your capacity limit. This is the point where you need to scale.' },
      { question: 'How often should I do capacity planning?', answer: 'Before major launches, after significant architecture changes, and quarterly as a baseline check. Automated load tests in CI/CD can catch regressions early.' },
    ],
    relatedTools: ['stress-test-website', 'soak-test', 'spike-test'],
  },
  {
    slug: 'performance-testing-checklist',
    title: 'Performance Testing Checklist',
    metaTitle: 'Performance Testing Checklist for 2026 | loadtest.dev',
    metaDescription: 'Complete performance testing checklist: test types, metrics to measure, tools to use, and common mistakes to avoid.',
    headline: 'Performance Testing Checklist',
    subheadline: 'Everything you need to get started',
    description: 'A comprehensive checklist covering every aspect of performance testing — from choosing the right test type and defining SLAs to analyzing results and setting up continuous testing in CI/CD.',
    features: [
      'Choose the right test type for your scenario',
      'Define meaningful SLAs and thresholds',
      'Set up realistic test data and scenarios',
      'Monitor the right metrics (latency, throughput, errors)',
      'Analyze results with percentile-based metrics',
      'Integrate load testing into CI/CD pipelines',
    ],
    codeExample: {
      filename: 'ci-test.js',
      code: `import http from 'k6/http';
import { check } from 'k6';

// CI/CD-friendly: short test with strict thresholds
export const options = {
  vus: 20,
  duration: '1m',
  thresholds: {
    http_req_duration: ['p(95)<300', 'p(99)<500'],
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
  },
};

export default function () {
  const res = http.get('https://staging.myapp.com/api/health');
  check(res, {
    'status 200': (r) => r.status === 200,
    'has body': (r) => r.body.length > 0,
  });
}`,
    },
    faqs: [
      { question: 'What\'s the minimum performance test I should run?', answer: 'At minimum: a 1-minute smoke test with 5-10 VUs against your critical endpoints, with thresholds on p95 latency and error rate. This catches major regressions in seconds.' },
      { question: 'Should I load test in production?', answer: 'Start with staging/pre-production environments. Once comfortable, canary load tests in production (low VUs, short duration) can catch issues that only appear with real infrastructure.' },
      { question: 'How do I integrate load tests into CI/CD?', answer: 'Run short smoke tests (10-20 VUs, 1 minute) on every PR. Run full load tests nightly or before releases. Use k6 thresholds for automatic pass/fail decisions.' },
    ],
    relatedTools: ['api-load-testing', 'rest-api-benchmark', 'capacity-planning'],
  },
  {
    slug: 'grpc-load-testing',
    title: 'gRPC Load Testing',
    metaTitle: 'gRPC Load Testing — Test Microservices | loadtest.dev',
    metaDescription: 'Load test gRPC services with k6. Measure unary and streaming RPC performance under concurrent connections.',
    headline: 'gRPC Load Testing',
    subheadline: 'Test your microservices at scale',
    description: 'Load test gRPC services with full protocol support. Measure unary RPC latency, test streaming endpoints, and validate your microservice architecture under realistic traffic patterns.',
    features: [
      'Unary and streaming RPC support',
      'Protocol buffer message serialization',
      'TLS and mutual TLS authentication',
      'Service reflection for auto-discovery',
      'Per-method latency tracking',
      'Microservice dependency chain testing',
    ],
    codeExample: {
      filename: 'grpc-test.js',
      code: `import grpc from 'k6/net/grpc';
import { check } from 'k6';

const client = new grpc.Client();
client.load(['proto'], 'hello.proto');

export const options = { vus: 50, duration: '3m' };

export default () => {
  client.connect('grpc.example.com:443', { tls: true });

  const res = client.invoke('hello.HelloService/SayHello', {
    greeting: 'loadtest',
  });

  check(res, {
    'status OK': (r) => r && r.status === grpc.StatusOK,
  });

  client.close();
};`,
    },
    faqs: [
      { question: 'Do I need proto files to test gRPC?', answer: 'You can either provide .proto files or use server reflection. k6 supports both approaches for service discovery and message serialization.' },
      { question: 'Can I test bidirectional streaming?', answer: 'k6 supports unary RPCs and server-side streaming. Client streaming and bidirectional streaming have limited support — check the k6 gRPC documentation for the latest capabilities.' },
    ],
    relatedTools: ['api-load-testing', 'http-load-test', 'websocket-load-testing'],
  },
]

export function getToolBySlug(slug: string): ToolPage | undefined {
  return tools.find(t => t.slug === slug)
}

export function getRelatedTools(slugs: string[]): ToolPage[] {
  return slugs.map(s => tools.find(t => t.slug === s)).filter(Boolean) as ToolPage[]
}
