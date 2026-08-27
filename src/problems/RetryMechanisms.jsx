// ─────────────────────────────────────────────────────────────────────────────
// Problem 4 – Retry Mechanisms
//
// Real APIs fail. A good client retries — but HOW it retries matters a lot.
// Implement a custom hook for each of the 5 tabs below.
//
// Each hook must return: { status, log, result, run, reset }
//   status  → 'idle' | 'loading' | 'success' | 'failed'
//   log     → [{ attempt, success, delay, error? }]  (one entry per attempt)
//   result  → the resolved value on success, null otherwise
//   run     → () => void  — starts the fetch+retry cycle
//   reset   → () => void  — clears back to idle
//
// The mock API (mockFetch) fails ~70% of the time. Use it as-is.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'

// ── Utilities (provided — do not modify) ─────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Simulates a flaky API. Fails ~70% of the time, resolves after ~400ms. */
function mockFetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.7) reject(new Error('Network error'))
      else resolve({ message: 'Data loaded 🎉' })
    }, 400)
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// ✏️  IMPLEMENT THE 5 HOOKS BELOW
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Immediate Retry ────────────────────────────────────────────────────────
// Retry immediately — no delay between attempts.
//
// Strategy:
//   attempt 1 → fail → attempt 2 → fail → attempt 3 → fail → give up
//
function useImmediateRetry(fn, maxRetries = 4) {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [result, setResult] = useState('')
  const handleRun = async () => {
    setStatus('loading');
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        setStatus('success');
        setResult(result);
        setLog((prev) => [...prev, {error: null, success: true, attempt: i + 1}]);
        break;
      } catch(e) {
        setLog((prev) => [...prev, {error: e.message, success: false, attempt: i + 1}])
      }
      if (i === maxRetries -1 ) setStatus('failed');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLog([]);
    setResult('');
  }

  return {
    status, log, result, run: handleRun, reset: handleReset
  }
}

// ── 2. Fixed Delay ────────────────────────────────────────────────────────────
// Wait a constant amount of time between every retry.
//
// Strategy:
//   attempt 1 → fail → wait 1000ms → attempt 2 → fail → wait 1000ms → ...
//
function useFixedDelayRetry(fn, maxRetries = 4, delay = 1000) {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [result, setResult] = useState('')
  const handleRun = async () => {
    setStatus('loading');
    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await fn();
        setStatus('success');
        setResult(result);
        setLog((prev) => [...prev, {error: null, success: true, attempt: i + 1, delay}]);
        break;
      } catch(e) {
        setLog((prev) => [...prev, {error: e.message, success: false, attempt: i + 1, delay}])
      }
      if (i < maxRetries - 1) {
        await sleep(delay);
      }
      if (i === maxRetries -1 ) setStatus('failed');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLog([]);
    setResult('');
  }

  return {
    status, log, result, run: handleRun, reset: handleReset
  }
}

// ── 3. Linear Backoff ─────────────────────────────────────────────────────────
// Delay grows linearly: 500ms, 1000ms, 1500ms, 2000ms …
//
// Strategy:
//   delay after attempt N  =  N × baseDelay
//
function useLinearBackoffRetry(fn, maxRetries = 4, baseDelay = 500) {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setStatus('loading');
    for (let i = 0; i < maxRetries; i++) {
      let delay = baseDelay * (i + 1);
      try {
        const result = await fn();
        setStatus('success');
        setResult(result);
        setLog((prev) => [...prev, {error: null, success: true, attempt: i + 1, delay}]);
        break;
      } catch(e) {
        setLog((prev) => [...prev, {error: e.message, success: false, attempt: i + 1, delay}])
      }
      if (i < maxRetries - 1) {
        await sleep(delay);
      }
      if (i === maxRetries -1 ) setStatus('failed');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLog([]);
    setResult('');
  }

  return {
    status, log, result, run: handleRun, reset: handleReset
  }
}

// ── 4. Exponential Backoff ────────────────────────────────────────────────────
// Delay doubles each time: 500ms, 1000ms, 2000ms, 4000ms …
// Cap the max delay so it doesn't grow forever.
//
// Strategy:
//   delay after attempt N  =  min(baseDelay × 2^(N-1), maxDelay)
//
function useExponentialBackoffRetry(fn, maxRetries = 4, baseDelay = 500, maxDelay = 8000) {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setStatus('loading');
    for (let i = 0; i < maxRetries; i++) {
      let delay = Math.min(baseDelay * (Math.pow(2, i)), maxDelay)
      try {
        const result = await fn();
        setStatus('success');
        setResult(result);
        setLog((prev) => [...prev, {error: null, success: true, attempt: i + 1, delay}]);
        break;
      } catch(e) {
        setLog((prev) => [...prev, {error: e.message, success: false, attempt: i + 1, delay}])
      }
      if (i < maxRetries) {
        await sleep(delay);
      }
      if (i === maxRetries -1 ) setStatus('failed');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLog([]);
    setResult('');
  }

  return {
    status, log, result, run: handleRun, reset: handleReset
  }
}

// ── 5. Exponential Backoff + Jitter ───────────────────────────────────────────
// Same as exponential but adds a random offset ("jitter").
// Why? If 1000 clients all hit the same server and get 503 together,
// they'd all retry at the exact same moment — making things worse.
// Jitter spreads retries across time to avoid that "thundering herd".
//
// Strategy:
//   delay = min(baseDelay × 2^(N-1), maxDelay) + random(0, jitter)
//
function useJitterRetry(fn, maxRetries = 4, baseDelay = 500, maxDelay = 8000, jitter = 300) {
  const [status, setStatus] = useState('idle');
  const [log, setLog] = useState([]);
  const [result, setResult] = useState(null);

  const handleRun = async () => {
    setStatus('loading');
    for (let i = 0; i < maxRetries; i++) {
      let delay = Math.min(baseDelay * (Math.pow(2, i)), maxDelay) + parseInt(Math.random() * jitter);
      try {
        const result = await fn();
        setStatus('success');
        setResult(result);
        setLog((prev) => [...prev, {error: null, success: true, attempt: i + 1, delay}]);
        break;
      } catch(e) {
        setLog((prev) => [...prev, {error: e.message, success: false, attempt: i + 1, delay}])
      }
      if (i < maxRetries) {
        await sleep(delay);
      }
      if (i === maxRetries -1 ) setStatus('failed');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setLog([]);
    setResult('');
  }

  return {
    status, log, result, run: handleRun, reset: handleReset
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provided UI — no need to modify below this line
// ─────────────────────────────────────────────────────────────────────────────

/** Plug any of your hooks in here to see them work */
function DemoShell({ hookResult, strategyName, description, delayFormula }) {
  const { status = 'idle', log = [], result = null, run, reset } = hookResult ?? {}
  const notImplemented = !run

  return (
    <div style={shellStyle}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: '1rem' }}>{strategyName}</h3>
        <p style={{ margin: '0 0 6px', color: '#475569', fontSize: 13 }}>{description}</p>
        <code style={codeTag}>{delayFormula}</code>
      </div>

      {/* Status banner */}
      {status !== 'idle' && (
        <div style={bannerStyle(status)}>
          {status === 'loading' && '⏳ Fetching…'}
          {status === 'success' && `✅ ${result?.message}`}
          {status === 'failed'  && '❌ All retries exhausted'}
        </div>
      )}

      {/* Attempt log */}
      {log.length > 0 && (
        <div style={logContainer}>
          <p style={logLabel}>Attempt log</p>
          {log.map((entry, i) => (
            <div key={i} style={logRow(entry.success)}>
              <span style={attemptNum}>#{entry.attempt}</span>
              <span style={{ flex: 1 }}>{entry.success ? '✅ Success' : '❌ Failed'}</span>
              {entry.delay > 0
                ? <span style={delayTag}>waited {entry.delay}ms</span>
                : <span style={{ ...delayTag, color: '#94a3b8' }}>no delay</span>
              }
              {entry.error && <span style={errorTag}>{entry.error}</span>}
            </div>
          ))}
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button
          style={btn(notImplemented || status === 'loading', 'primary')}
          onClick={run}
          disabled={notImplemented || status === 'loading'}
        >
          {status === 'loading' ? 'Running…' : '▶ Run'}
        </button>
        <button
          style={btn(notImplemented || status === 'idle', 'secondary')}
          onClick={reset}
          disabled={notImplemented || status === 'idle'}
        >
          ↺ Reset
        </button>
        {notImplemented && (
          <span style={{ fontSize: 12, color: '#f59e0b', alignSelf: 'center' }}>
            ⚠ Hook not implemented yet
          </span>
        )}
      </div>
    </div>
  )
}

// ── Tab configuration ─────────────────────────────────────────────────────────

function ImmediateTab() {
  const hook = useImmediateRetry(mockFetch, 4);
  return (
    <DemoShell
      hookResult={hook}
      strategyName="1. Immediate Retry"
      description="Retry N times with zero delay. Fast but hammers the server. Good for idempotent operations where the failure is likely transient (e.g. lock contention)."
      delayFormula="delay = 0ms (every attempt)"
    />
  )
}

function FixedDelayTab() {
  const hook = useFixedDelayRetry(mockFetch, 4, 1000);
  return (
    <DemoShell
      hookResult={hook}
      strategyName="2. Fixed Delay"
      description="Wait the same amount of time before every retry. Simple and predictable. Can still cause thundering herds if many clients share the same fixed delay."
      delayFormula="delay = 1000ms (constant)"
    />
  )
}

function LinearTab() {
  const hook = useLinearBackoffRetry(mockFetch, 10, 500)
  return (
    <DemoShell
      hookResult={hook}
      strategyName="3. Linear Backoff"
      description="Delay increases by a fixed step each time. Gives the server progressively more breathing room. Easy to reason about."
      delayFormula="delay = attempt × 500ms  →  500, 1000, 1500, 2000"
    />
  )
}

function ExponentialTab() {
  const hook = useExponentialBackoffRetry(mockFetch, 4, 500, 8000);
  return (
    <DemoShell
      hookResult={hook}
      strategyName="4. Exponential Backoff"
      description="Delay doubles each retry. The industry standard — used by AWS, GCP, and most HTTP clients. Quickly backs off under heavy load while capping at a max delay."
      delayFormula="delay = min(500 × 2^(n-1), 8000ms)  →  500, 1000, 2000, 4000"
    />
  )
}

function JitterTab() {
  const hook = useJitterRetry(mockFetch, 4, 500, 8000, 300);
  return (
    <DemoShell
      hookResult={hook}
      strategyName="5. Exponential Backoff + Jitter"
      description='Same as exponential but adds a random offset. Solves the "thundering herd" problem — 1000 clients that fail simultaneously will retry at slightly different times instead of all at once.'
      delayFormula="delay = min(500 × 2^(n-1), 8000) + random(0, 300ms)"
    />
  )
}

const TABS = [
  { id: 'immediate',   label: 'Immediate',    component: ImmediateTab },
  { id: 'fixed',       label: 'Fixed Delay',  component: FixedDelayTab },
  { id: 'linear',      label: 'Linear',       component: LinearTab },
  { id: 'exponential', label: 'Exponential',  component: ExponentialTab },
  { id: 'jitter',      label: '+ Jitter',     component: JitterTab },
]

// ── Main export ───────────────────────────────────────────────────────────────

export default function RetryMechanisms() {
  const [activeTab, setActiveTab] = useState('immediate')
  const ActiveComponent = TABS.find((t) => t.id === activeTab)?.component

  return (
    <div>
      {/* Concept callout */}
      <div style={callout}>
        <strong>Why does this matter?</strong> A naive retry that fires instantly
        can DDoS your own backend when it's already struggling. Each strategy
        below trades off <em>speed of recovery</em> vs <em>load on the server</em>.
        The mock API fails ~70% of the time — click Run and watch the attempt log.
      </div>

      {/* Tabs */}
      <div style={tabBar}>
        {TABS.map((t) => (
          <button
            key={t.id}
            style={tabBtn(activeTab === t.id)}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active strategy */}
      {ActiveComponent && <ActiveComponent />}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────

const callout = {
  background: '#f0f9ff', color: '#0c4a6e',
  border: '1px solid #bae6fd', borderRadius: 8,
  padding: '10px 14px', fontSize: 13, lineHeight: 1.6, marginBottom: 16,
}

const tabBar = { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }

const tabBtn = (active) => ({
  padding: '6px 14px', borderRadius: 20,
  border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
  background: active ? '#eef2ff' : '#fff',
  color: active ? '#4338ca' : '#64748b',
  fontWeight: active ? 700 : 400,
  cursor: 'pointer', fontSize: 13, transition: 'all 0.15s',
})

const shellStyle = {
  background: '#fff', border: '1px solid #e2e8f0',
  borderRadius: 10, padding: 20,
}

const bannerStyle = (status) => ({
  padding: '10px 14px', borderRadius: 8, marginBottom: 12, fontSize: 14,
  background: status === 'loading' ? '#fef9c3' : status === 'success' ? '#dcfce7' : '#fee2e2',
  color:      status === 'loading' ? '#854d0e' : status === 'success' ? '#166534' : '#991b1b',
})

const logContainer = { marginBottom: 4 }
const logLabel     = { margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em' }

const logRow = (success) => ({
  display: 'flex', alignItems: 'center', gap: 10,
  padding: '6px 10px', borderRadius: 6, marginBottom: 4, fontSize: 13,
  background: success ? '#f0fdf4' : '#fff1f2',
  border: `1px solid ${success ? '#bbf7d0' : '#fecdd3'}`,
})

const attemptNum = { fontFamily: 'monospace', fontWeight: 700, width: 28, color: '#64748b', fontSize: 12 }
const delayTag   = { fontSize: 11, fontWeight: 600, color: '#6366f1', background: '#eef2ff', padding: '1px 6px', borderRadius: 4, whiteSpace: 'nowrap' }
const errorTag   = { fontSize: 11, color: '#991b1b', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
const codeTag    = { fontSize: 12, background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 5, display: 'inline-block', marginTop: 2 }

const btn = (disabled, variant) => ({
  padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
  border: variant === 'primary' ? 'none' : '1.5px solid #e2e8f0',
  background: disabled ? '#f1f5f9' : variant === 'primary' ? '#6366f1' : '#fff',
  color: disabled ? '#94a3b8' : variant === 'primary' ? '#fff' : '#475569',
  opacity: disabled ? 0.6 : 1,
  transition: 'all 0.15s',
})
