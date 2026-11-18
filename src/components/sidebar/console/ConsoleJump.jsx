import { useEffect, useMemo, useRef, useState } from "react"
import { CornerDownLeft, Pin, Search } from "lucide-react"
import { ADMIN_NAV_CATEGORY_HOSTELS } from "../../../constants/navigationConfig"

/** "Go to page" (Ctrl+K): type to filter, arrows to move, Enter to open. Same search as V6's Warp. */

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

const ConsoleJump = ({ items, categories, isPinned, onClose, onNavigate }) => {
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = items.filter((item) => item.path)
    if (!q) return [...pool.filter((item) => isPinned(item)), ...pool.filter((item) => !isPinned(item))].slice(0, MAX_RESULTS)
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
    } else if (event.key === "Enter" && results[cursor]) {
      event.preventDefault()
      onNavigate(results[cursor])
    }
  }

  return (
    <div className="cnj" role="dialog" aria-modal="true" aria-label="Go to page" onKeyDown={onKeyDown}>
      <div className="cnj-backdrop" aria-hidden="true" onClick={onClose} />
      <div className="cnj-box">
        <div className="cnj-field">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCursor(0)
            }}
            placeholder="Go to page…"
            aria-label="Search pages"
            aria-controls="cnj-results"
            aria-activedescendant={results[cursor] ? `cnj-r-${cursor}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>
        <ul className="cnj-results" id="cnj-results" role="listbox">
          {results.length === 0 && <li className="cnj-none">No page matches “{query.trim()}”.</li>}
          {results.map((item, index) => {
            const category = categoryById[categoryOf(item)]
            const Icon = item.icon
            return (
              <li
                key={item.path}
                id={`cnj-r-${index}`}
                role="option"
                aria-selected={index === cursor}
                className="cnj-result"
                data-cat={category?.id}
                onMouseMove={() => setCursor(index)}
                onClick={() => onNavigate(item)}
              >
                <span className="cnj-result__icon" aria-hidden="true">
                  {Icon && <Icon size={16} strokeWidth={1.9} />}
                </span>
                <span className="cnj-result__name">{item.name}</span>
                {isPinned(item) && <Pin className="cnj-result__pin" size={12} aria-label="Pinned" />}
                <span className="cnj-result__cat">{category?.name}</span>
                <CornerDownLeft className="cnj-result__enter" size={14} aria-hidden="true" />
              </li>
            )
          })}
        </ul>
        <p className="cnj-hint">
          <span><kbd>↑</kbd> <kbd>↓</kbd> move</span>
          <span><kbd>Enter</kbd> open</span>
          <span><kbd>Esc</kbd> close</span>
        </p>
      </div>
    </div>
  )
}

export default ConsoleJump
