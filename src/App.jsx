import { useState } from 'react'
import './App.css'

// ─── Import problems here as you add them ───────────────────────────────────
import Counter from './problems/Counter'
import TodoList from './problems/TodoList'
import VirtualList from './problems/VirtualList'
import RetryMechanisms from './problems/RetryMechanisms'
import Autocomplete from './problems/Autocomplete'
import ConfigDrivenForm from './problems/ConfigDrivenForm'

const PROBLEMS = [
  {
    id: 'counter',
    title: '1. Counter',
    difficulty: 'Easy',
    description:
      'Build a counter with increment, decrement, and reset buttons. Bonus: add a step input so the user can change how much each click adds/subtracts.',
    component: Counter,
  },
  {
    id: 'todo',
    title: '2. Todo List',
    difficulty: 'Medium',
    description:
      'Build a todo list with add, toggle-complete, and delete functionality. Bonus: add a filter (All / Active / Completed).',
    component: TodoList,
  },
  {
    id: 'virtual-list',
    title: '3. List Virtualization',
    difficulty: 'Hard',
    description:
      'Rendering 10 000 rows at once tanks performance. Implement a VirtualList component that only renders the rows visible in the scroll window — keeping the DOM lean at any scroll position.',
    component: VirtualList,
  },
  {
    id: 'retry-mechanisms',
    title: '4. Retry Mechanisms',
    difficulty: 'Medium',
    description:
      'A flaky API fails 70% of the time. Implement 5 custom hooks — one per tab — each with a different retry strategy: immediate, fixed delay, linear backoff, exponential backoff, and exponential + jitter.',
    component: RetryMechanisms,
  },
  {
    id: 'autocomplete',
    title: '5. Autocomplete',
    difficulty: 'Hard',
    description:
      'Build an autocomplete input across 4 progressive tabs: basic sync filter → debounced → async with race-condition fix → full-featured with keyboard navigation, match highlighting, and click-outside.',
    component: Autocomplete,
  },
  {
    id: 'config-driven-form',
    title: '6. Config-Driven Form',
    difficulty: 'Hard',
    description:
      'Render a fully-validated form from a JSON config — no hardcoded fields. Support 8 field types, inline validation (required, minLength, maxLength, min, max, pattern, custom), and conditional fields that show/hide based on other field values.',
    component: ConfigDrivenForm,
  },
]

const DIFFICULTY_COLOR = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
}

export default function App() {
  const [selected, setSelected] = useState(null)
  const Problem = selected?.component

  return (
    <div className="app">
      <header className="app-header">
        <h1>⚛️ React Practice Playground</h1>
        <p>Select a problem from the sidebar and implement it from scratch</p>
      </header>

      <div className="layout">
        {/* ── Sidebar ───────────────────────────────────────────── */}
        <aside className="sidebar">
          <p className="sidebar-label">PROBLEMS</p>
          {PROBLEMS.map((p) => (
            <button
              key={p.id}
              className={`problem-btn ${selected?.id === p.id ? 'active' : ''}`}
              onClick={() => setSelected(p)}
            >
              <span>{p.title}</span>
              <span
                className="badge"
                style={{ color: DIFFICULTY_COLOR[p.difficulty] }}
              >
                {p.difficulty}
              </span>
            </button>
          ))}
        </aside>

        {/* ── Main panel ────────────────────────────────────────── */}
        <main className="main">
          {selected ? (
            <>
              <div className="problem-header">
                <div className="problem-title-row">
                  <h2>{selected.title}</h2>
                  <span
                    className="badge-large"
                    style={{ color: DIFFICULTY_COLOR[selected.difficulty] }}
                  >
                    {selected.difficulty}
                  </span>
                </div>
                <p className="description">{selected.description}</p>
              </div>
              <hr className="divider" />
              <div className="problem-area">
                <Problem />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">👈</div>
              <p>Select a problem from the sidebar to get started</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
