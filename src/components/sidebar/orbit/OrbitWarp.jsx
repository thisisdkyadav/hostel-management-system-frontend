import { useEffect, useMemo, useRef, useState } from "react"
import { CornerDownLeft, Pin } from "lucide-react"
import { ADMIN_NAV_CATEGORY_HOSTELS } from "../../../constants/navigationConfig"

/**
 * Warp: a full-screen jump to any tab. Type to filter; arrows move; Enter jumps.
 * The starfield streaks while it is open and the panel punches forward on a jump.
 */

const JUMP_MS = 260
const MAX_RESULTS = 9

const categoryOf = (item) => item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS

/** Higher is better; 0 means no match. Whole-name prefix > word prefix > substring > initials > in-order letters. */
const scoreItem = (name, query) => {
  const hay = name.toLowerCase()
  if (!query) return 1
  if (hay.startsWith(query)) return 100 - hay.length / 100
  const words = hay.split(/[\s/&-]+/)
  if (words.some((word) => word.startsWith(query))) return 80
  if (hay.includes(query)) return 60
  if (words.map((word) => word[0]).join("").startsWith(query)) return 50
  let at = 0
  for (const char of query) {
    at = hay.indexOf(char, at)
    if (at === -1) return 0
    at += 1
  }
  return 20
}

const OrbitWarp = ({ items, categories, isPinned, onClose, onNavigate }) => {
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const [jumping, setJumping] = useState(false)
  const inputRef = useRef(null)
  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = items.filter((item) => item.path)
    if (!q) {
      // Nothing typed: pinned tabs first, then a taste of everything else.
      const pinned = pool.filter((item) => isPinned(item))
      const rest = pool.filter((item) => !isPinned(item))
      return [...pinned, ...rest].slice(0, MAX_RESULTS)
    }
    return pool
      .map((item) => ({ item, score: Math.max(scoreItem(item.name, q), scoreItem(categoryById[categoryOf(item)]?.name || "", q) / 4) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS)
      .map((entry) => entry.item)
  }, [categoryById, isPinned, items, query])

  useEffect(() => {
    inputRef.current?.focus()
    const { overflow } = document.body.style
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = overflow
    }
  }, [])

  const jump = (item) => {
    if (!item || jumping) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      onNavigate(item)
      return
    }
    setJumping(true)
    window.setTimeout(() => onNavigate(item), JUMP_MS)
  }

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault()
      onClose()
    } else if (event.key === "ArrowDown") {
      event.preventDefault()
      setCursor((value) => (results.length ? (value + 1) % results.length : 0))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setCursor((value) => (results.length ? (value - 1 + results.length) % results.length : 0))
    } else if (event.key === "Enter") {
      event.preventDefault()
      jump(results[cursor])
    }
  }

  return (
    <div className="obw" data-jumping={jumping || undefined} role="dialog" aria-modal="true" aria-label="Warp to a page" onKeyDown={onKeyDown}>
      <div className="obw-stars" aria-hidden="true" onClick={onClose} />
      <div className="obw-panel">
        <p className="obw-kicker">Warp</p>
        <input
          ref={inputRef}
          className="obw-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setCursor(0)
          }}
          placeholder="Where to?"
          aria-label="Search pages"
          aria-controls="obw-results"
          aria-activedescendant={results[cursor] ? `obw-r-${cursor}` : undefined}
          autoComplete="off"
          spellCheck={false}
        />
        <ul className="obw-results" id="obw-results" role="listbox">
          {results.length === 0 && <li className="obw-none">No page by that name in this galaxy.</li>}
          {results.map((item, index) => {
            const category = categoryById[categoryOf(item)]
            const Icon = item.icon
            return (
              <li
                key={item.path}
                id={`obw-r-${index}`}
                role="option"
                aria-selected={index === cursor}
                className="obw-result"
                data-cat={category?.id}
                onMouseEnter={() => setCursor(index)}
                onClick={() => jump(item)}
                style={{ "--i": index }}
              >
                <span className="obw-result__orb" aria-hidden="true">
                  {Icon && <Icon size={16} strokeWidth={2} />}
                </span>
                <span className="obw-result__name">{item.name}</span>
                {isPinned(item) && <Pin className="obw-result__pin" size={12} aria-label="Pinned" />}
                <span className="obw-result__cat">{category?.name}</span>
                <CornerDownLeft className="obw-result__enter" size={14} aria-hidden="true" />
              </li>
            )
          })}
        </ul>
        <p className="obw-hint">
          <kbd>↑</kbd>
          <kbd>↓</kbd> move · <kbd>Enter</kbd> jump · <kbd>Esc</kbd> stay
        </p>
      </div>
    </div>
  )
}

export default OrbitWarp
