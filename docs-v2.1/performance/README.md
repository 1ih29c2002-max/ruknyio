# Performance Monitoring System

Comprehensive performance monitoring for tracking Core Web Vitals, API request performance, and page load metrics.

## Features

- ✅ **Core Web Vitals Tracking**
  - LCP (Largest Contentful Paint)
  - FID/INP (First Input Delay / Interaction to Next Paint)
  - CLS (Cumulative Layout Shift)
  - FCP (First Contentful Paint)
  - TTFB (Time to First Byte)

- ✅ **API Request Performance**
  - Automatic tracking of all API requests
  - Request duration, status codes, success/failure
  - Integrated with API client

- ✅ **Page Load Metrics**
  - DOM content loaded time
  - First paint / First contentful paint
  - Full page load time

## Usage

### Basic Setup

The performance monitoring is automatically initialized via `PerformanceProvider` in `AppProviders`.

### Access Metrics in Components

```tsx
import { usePerformance } from '@/hooks';

function MyComponent() {
  const { metrics, webVitals, clearMetrics } = usePerformance();

  return (
    <div>
      <h2>Web Vitals</h2>
      {webVitals.lcp && (
        <p>LCP: {webVitals.lcp.value}ms ({webVitals.lcp.rating})</p>
      )}
    </div>
  );
}
```

### Manual Tracking

```tsx
import { trackApiRequest, trackPageLoad } from '@/lib/performance';

// Track custom API request
trackApiRequest('/api/users', 'GET', 150, 200, true);

// Track page load
trackPageLoad('/dashboard');
```

### Configuration

Configure performance monitoring in `PerformanceProvider`:

```tsx
<PerformanceProvider
  config={{
    enabled: true,
    sampleRate: 0.5, // Track 50% of sessions
    logToConsole: true,
    trackApiRequests: true,
    trackPageLoads: true,
    trackWebVitals: true,
    apiEndpoint: '/api/v1/analytics/performance', // Optional backend endpoint
  }}
>
  {children}
</PerformanceProvider>
```

## Environment Variables

- `NEXT_PUBLIC_ENABLE_PERFORMANCE=true` - Enable performance tracking in production
- Performance is automatically enabled in production mode

## Metrics Format

### Web Vital Metric
```typescript
{
  name: 'LCP',
  value: 2500,
  rating: 'good' | 'needs-improvement' | 'poor',
  delta: 100,
  id: 'lcp',
  navigationType: 'navigation'
}
```

### API Request Metric
```typescript
{
  endpoint: '/api/users',
  method: 'GET',
  duration: 150,
  status: 200,
  timestamp: 1234567890,
  success: true,
  error?: string
}
```

### Page Load Metric
```typescript
{
  page: '/dashboard',
  loadTime: 1200,
  domContentLoaded: 800,
  firstPaint: 500,
  firstContentfulPaint: 600,
  timestamp: 1234567890
}
```

## Thresholds

Core Web Vitals thresholds (based on Google's recommendations):

- **LCP**: Good ≤ 2.5s, Poor > 4.0s
- **FID/INP**: Good ≤ 100ms, Poor > 300ms
- **CLS**: Good ≤ 0.1, Poor > 0.25
- **FCP**: Good ≤ 1.8s, Poor > 3.0s
- **TTFB**: Good ≤ 800ms, Poor > 1.8s

## Backend Integration

To send metrics to your backend, configure the `apiEndpoint`:

```tsx
<PerformanceProvider
  config={{
    apiEndpoint: '/api/v1/analytics/performance',
  }}
/>
```

Metrics will be sent via `navigator.sendBeacon` (or fetch with `keepalive`) for reliable delivery even during page unload.
