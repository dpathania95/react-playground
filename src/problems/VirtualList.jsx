// ─────────────────────────────────────────────────────────────────────────────
// Problem 3 – List Virtualization
//
// The Problem:
//   Rendering 10 000 DOM nodes at once is slow. The browser has to lay out,
//   paint, and keep in memory every single row — even the ones you can't see.
//   Open the "🐌 Naive" tab below, scroll around, and feel the jank.
//
// Your Task:
//   Implement the <VirtualList> component in the section marked ✏️ below.
//   It receives the same `items` array but must only render the rows that are
//   actually visible inside the fixed-height scroll container.
//
// Requirements:
//   ✅ Container height: CONTAINER_HEIGHT (500px), overflow-y: scroll
//   ✅ Each row has a fixed height: ITEM_HEIGHT (40px)
//   ✅ Only the visible rows (+ a small overscan buffer) are in the DOM
//   ✅ The scrollbar range must feel identical to the naïve version
//      (i.e. the total scrollable height = items.length × ITEM_HEIGHT)
//   ✅ Rows must stay aligned correctly at every scroll position
//
// Hints (expand if stuck):
//   1. You need a ref on the outer div to measure/track scroll.
//   2. startIndex  = Math.floor(scrollTop / ITEM_HEIGHT)
//   3. visibleCount = Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT)
//   4. Render a single tall "spacer" div (totalHeight) so the scrollbar is right.
//   5. Offset the visible rows with paddingTop = startIndex * ITEM_HEIGHT
//      (or position them absolutely with top = index * ITEM_HEIGHT).
//
// Bonus:
//   ⭐ Add an OVERSCAN of 3–5 rows above and below to prevent blank flicker
//   ⭐ Accept a variable `itemHeight` prop instead of the constant
//   ⭐ Expose an `onEndReached` prop that fires when the user scrolls near
//      the bottom (infinite-scroll pattern)
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useRef, useState } from 'react'

// ── Constants ─────────────────────────────────────────────────────────────────
const ITEM_HEIGHT      = 40          // px — fixed row height
const CONTAINER_HEIGHT = 500         // px — visible scroll window
const TOTAL_ITEMS      = 10_000
const OVERSCAN         = 3           // extra rows to render above & below

// ── Data ──────────────────────────────────────────────────────────────────────
const ITEMS = Array.from({ length: TOTAL_ITEMS }, (_, i) => ({
  id: i,
  name: `User #${String(i + 1).padStart(5, '0')}`,
  email: `user${i + 1}@example.com`,
  score: Math.floor(Math.random() * 100),
}))

// ── Shared row renderer (used by both implementations) ────────────────────────
function Row({ item, style }) {
  return (
    <div data-row style={{ ...rowStyle, ...style }}>
      <span style={avatarStyle}>{item.name[0]}</span>
      <span style={{ flex: 1 }}>{item.name}</span>
      <span style={{ color: '#888', fontSize: 13 }}>{item.email}</span>
      <span style={scoreStyle(item.score)}>{item.score}</span>
    </div>
  )
}

// ── 🐌 Naive list (already implemented — DO NOT change) ───────────────────────
function NaiveList() {
  return (
    <div style={{ height: CONTAINER_HEIGHT, overflowY: 'scroll', border: '1px solid #e2e8f0', borderRadius: 8 }}>
      {ITEMS.map((item) => (
        <Row key={item.id} item={item} style={{ height: ITEM_HEIGHT }} />
      ))}
    </div>
  )
}

// ── ✏️  YOUR IMPLEMENTATION ───────────────────────────────────────────────────
//
//  Implement VirtualList here.
//  Props available (already wired up in the demo below):
//    items            — the full ITEMS array
//    itemHeight       — ITEM_HEIGHT constant
//    containerHeight  — CONTAINER_HEIGHT constant
//
function VirtualList({ items, itemHeight, containerHeight }) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const startIndex = Math.floor(scrollTop / itemHeight)
  const endIndex = Math.min(items.length - 1, startIndex + visibleCount + 6)

  const activeItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1);
  }, [startIndex, endIndex, items]);

  const throttle = (callback, ms) => {
    let throttle = false;
    return function(...args) {
      if (throttle) return;
      throttle=true;
      setTimeout(() => {
        throttle = false;
      }, ms);
      callback.call(this, ...args);
    }
  }

  const handleScroll = (event) => setScrollTop(event.target.scrollTop);

  const throttledScroll = throttle(handleScroll, 1000);

  return (
    <div
      style={{
        height: containerHeight,
        overflowY: 'scroll',
        border: '1px solid #e2e8f0',
        borderRadius: 8,
        // display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontStyle: 'italic',
      }}
      onScroll={throttledScroll}
    >
      <div
        style={{
          height: itemHeight*(items.length - 1),
          paddingTop: startIndex * itemHeight,
          boxSizing: 'border-box'
        }}
      >
        {activeItems.map((item) => (
          <Row key={item.id} item={item} style={{ height: ITEM_HEIGHT }} />
        ))}
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────


// ── Demo shell (no need to modify) ───────────────────────────────────────────
export default function VirtualListProblem() {
  const [tab, setTab] = useState('naive')

  return (
    <div>
      {/* Stats bar */}
      <div style={statsBar}>
        <Stat label="Total items" value={TOTAL_ITEMS.toLocaleString()} />
        <Stat label="Item height" value={`${ITEM_HEIGHT}px`} />
        <Stat label="Container height" value={`${CONTAINER_HEIGHT}px`} />
        <Stat label="Max DOM rows (naive)" value={TOTAL_ITEMS.toLocaleString()} highlight />
        <Stat label="Target DOM rows (yours)" value={`~${Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + OVERSCAN * 2}`} good />
      </div>

      {/* Tab switcher */}
      <div style={tabBar}>
        <TabBtn active={tab === 'naive'}  onClick={() => setTab('naive')} >🐌 Naive (slow)</TabBtn>
        <TabBtn active={tab === 'virtual'} onClick={() => setTab('virtual')}>⚡ Virtualized (your task)</TabBtn>
      </div>

      {tab === 'naive' ? (
        <>
          <Notice type="warn">
            This renders all <strong>{TOTAL_ITEMS.toLocaleString()} rows</strong> at once.
            Open DevTools → Performance to see the cost.
          </Notice>
          <NaiveList />
        </>
      ) : (
        <>
          <Notice type="info">
            Implement <code>VirtualList</code> in the file so only ~
            {Math.ceil(CONTAINER_HEIGHT / ITEM_HEIGHT) + OVERSCAN * 2} rows exist in the DOM at any time.
          </Notice>
          <VirtualList
            items={ITEMS}
            itemHeight={ITEM_HEIGHT}
            containerHeight={CONTAINER_HEIGHT}
          />
        </>
      )}

      {/* DOM counter — updates every second */}
      <DomCounter />
    </div>
  )
}

// ── Tiny helper components ────────────────────────────────────────────────────
function Stat({ label, value, highlight, good }) {
  return (
    <div style={statBox}>
      <span style={{ fontSize: 11, color: '#94a3b8' }}>{label}</span>
      <span style={{ fontWeight: 700, color: highlight ? '#ef4444' : good ? '#22c55e' : 'inherit' }}>
        {value}
      </span>
    </div>
  )
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={tabBtnStyle(active)}>
      {children}
    </button>
  )
}

function Notice({ type, children }) {
  const bg    = type === 'warn' ? '#fef9c3' : '#e0f2fe'
  const color = type === 'warn' ? '#854d0e' : '#075985'
  return (
    <div style={{ background: bg, color, borderRadius: 8, padding: '10px 14px', marginBottom: 10, fontSize: 13 }}>
      {children}
    </div>
  )
}

function DomCounter() {
  const [count, setCount] = useState(null)
  const ref = useRef(null)

  // Count rendered rows once per second
  useState(() => {
    const id = setInterval(() => {
      setCount(document.querySelectorAll('[data-row]').length)
    }, 800)
    return () => clearInterval(id)
  })

  return (
    <div ref={ref} style={{ marginTop: 12, fontSize: 12, color: '#64748b', textAlign: 'right' }}>
      🔍 Rows currently in the DOM:{' '}
      <strong style={{ color: count > 50 ? '#ef4444' : '#22c55e' }}>
        {count ?? '…'}
      </strong>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const rowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '0 14px',
  borderBottom: '1px solid #f1f5f9',
  fontSize: 13,
}

const avatarStyle = {
  width: 26, height: 26,
  borderRadius: '50%',
  background: '#6366f1',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 700,
  flexShrink: 0,
}

const scoreStyle = (s) => ({
  fontWeight: 700,
  color: s >= 80 ? '#22c55e' : s >= 50 ? '#f59e0b' : '#ef4444',
  width: 30,
  textAlign: 'right',
})

const statsBar = {
  display: 'flex',
  gap: 12,
  flexWrap: 'wrap',
  marginBottom: 16,
}

const statBox = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: '8px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  minWidth: 130,
}

const tabBar = {
  display: 'flex',
  gap: 8,
  marginBottom: 12,
}

const tabBtnStyle = (active) => ({
  padding: '7px 16px',
  borderRadius: 8,
  border: `1.5px solid ${active ? '#6366f1' : '#e2e8f0'}`,
  background: active ? '#eef2ff' : '#fff',
  color: active ? '#4338ca' : '#64748b',
  fontWeight: active ? 700 : 400,
  cursor: 'pointer',
  fontSize: 13,
})
