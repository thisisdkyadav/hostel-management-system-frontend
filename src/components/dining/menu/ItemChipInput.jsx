import { useEffect, useId, useMemo, useRef, useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { GripVertical, Star, X } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningMenuApi } from "@/service"
import { DietDot } from "./MenuBits"
import { DIET_LABELS, MAX_ITEMS, MAX_NAME, cleanItems, nextDiet, parseItemList } from "./menuHelpers"

const useDebounced = (value, delay = 200) => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

const move = (list, from, to) => {
  if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list
  const next = [...list]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}

/**
 * The dish list of one meal. Type and press Enter (or comma) to add; paste a list to add many; pick a
 * suggestion to reuse a dish with its remembered diet. Click a dot to cycle veg / egg / non-veg, the
 * star to mark a special, the cross to remove. Drag a chip (or Alt + arrow keys) to reorder.
 */
const ItemChipInput = ({ items = [], onChange, disabled = false, placeholder = "Add a dish and press Enter", ariaLabel = "Dishes" }) => {
  const listId = useId()
  const inputRef = useRef(null)
  const [text, setText] = useState("")
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(-1)
  const [dragFrom, setDragFrom] = useState(null)
  const [dropAt, setDropAt] = useState(null)

  const query = useDebounced(text.trim())
  const suggestionsQuery = useQuery({
    queryKey: queryKeys.diningMenu.items(query),
    queryFn: () => diningMenuApi.getItems({ q: query, limit: 20 }),
    enabled: focused && !disabled,
    staleTime: 60000,
    placeholderData: keepPreviousData,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const known = useMemo(() => {
    const map = new Map()
    for (const item of suggestionsQuery.data?.items || []) map.set(item.name.toLowerCase(), item)
    return map
  }, [suggestionsQuery.data])

  const taken = useMemo(() => new Set(items.map((item) => item.name.toLowerCase())), [items])
  const suggestions = useMemo(
    () => (suggestionsQuery.data?.items || []).filter((item) => !taken.has(item.name.toLowerCase())).slice(0, 8),
    [suggestionsQuery.data, taken],
  )
  const full = items.length >= MAX_ITEMS

  const addNames = (names, picked) => {
    if (!names.length) return
    const added = names.map((name) => {
      const hit = picked || known.get(name.toLowerCase())
      return { name, diet: hit?.diet || "", special: false }
    })
    onChange(cleanItems([...items, ...added]))
  }

  const commitText = () => {
    const names = parseItemList(text)
    setText("")
    setActive(-1)
    addNames(names)
  }

  const handleChange = (event) => {
    const value = event.target.value
    if (/[,;\n]/.test(value)) {
      const parts = value.split(/[,;\n]/)
      const rest = parts.pop()
      addNames(parseItemList(parts.join(",")))
      setText(rest)
    } else {
      setText(value)
    }
    setActive(-1)
  }

  const handlePaste = (event) => {
    const pasted = event.clipboardData?.getData("text") || ""
    if (!/[,;\n\r]/.test(pasted)) return
    event.preventDefault()
    addNames(parseItemList(`${text},${pasted}`))
    setText("")
  }

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && suggestions.length) {
      event.preventDefault()
      setActive((index) => (index + 1) % suggestions.length)
    } else if (event.key === "ArrowUp" && suggestions.length) {
      event.preventDefault()
      setActive((index) => (index <= 0 ? suggestions.length - 1 : index - 1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (active >= 0 && suggestions[active]) {
        addNames([suggestions[active].name], suggestions[active])
        setText("")
        setActive(-1)
      } else if (text.trim()) {
        commitText()
      }
    } else if (event.key === "Escape") {
      setFocused(false)
    }
  }

  const update = (index, patch) => onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  const remove = (index) => onChange(items.filter((_, i) => i !== index))

  const showList = focused && !disabled && !full && suggestions.length > 0

  return (
    <div className="dm-chipbox-wrap">
      <div className="dm-chipbox-anchor">
        <div
          className="dm-chipbox"
          data-disabled={disabled || undefined}
          data-focused={focused || undefined}
          onClick={() => inputRef.current?.focus()}
        >
          {items.map((item, index) => (
            <span
              key={item.name}
              className="dm-chip"
              data-special={item.special || undefined}
              data-dragging={dragFrom === index || undefined}
              data-drop={dropAt === index && dragFrom !== null && dragFrom !== index ? true : undefined}
              draggable={!disabled}
              onDragStart={(event) => {
                setDragFrom(index)
                event.dataTransfer.effectAllowed = "move"
                event.dataTransfer.setData("text/plain", item.name)
              }}
              onDragOver={(event) => {
                if (dragFrom === null) return
                event.preventDefault()
                setDropAt(index)
              }}
              onDrop={(event) => {
                event.preventDefault()
                if (dragFrom !== null) onChange(move(items, dragFrom, index))
                setDragFrom(null)
                setDropAt(null)
              }}
              onDragEnd={() => {
                setDragFrom(null)
                setDropAt(null)
              }}
            >
              {!disabled && <GripVertical size={12} className="dm-chip__grip" aria-hidden="true" />}
              <button
                type="button"
                className="dm-chip__diet"
                disabled={disabled}
                onClick={() => update(index, { diet: nextDiet(item.diet) })}
                aria-label={`${item.name}: ${DIET_LABELS[item.diet || ""]}. Change diet`}
                title={`${DIET_LABELS[item.diet || ""]}. Click to change`}
              >
                <DietDot diet={item.diet} />
              </button>
              <span
                className="dm-chip__name"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={(event) => {
                  if (!event.altKey || disabled) return
                  if (event.key === "ArrowLeft") {
                    event.preventDefault()
                    onChange(move(items, index, index - 1))
                  } else if (event.key === "ArrowRight") {
                    event.preventDefault()
                    onChange(move(items, index, index + 1))
                  }
                }}
              >
                {item.name}
              </span>
              <button
                type="button"
                className="dm-chip__star"
                disabled={disabled}
                aria-pressed={item.special}
                aria-label={`${item.name}: ${item.special ? "remove special" : "mark as special"}`}
                title={item.special ? "Special. Click to unmark" : "Mark as special"}
                onClick={() => update(index, { special: !item.special })}
              >
                <Star size={12} fill={item.special ? "currentColor" : "none"} />
              </button>
              {!disabled && (
                <button type="button" className="dm-chip__remove" aria-label={`Remove ${item.name}`} onClick={() => remove(index)}>
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
          {!disabled && (
            <input
              ref={inputRef}
              className="dm-chipbox__input"
              value={text}
              maxLength={MAX_NAME}
              disabled={full}
              placeholder={full ? `Up to ${MAX_ITEMS} dishes` : items.length ? "Add another" : placeholder}
              aria-label={ariaLabel}
              aria-expanded={showList}
              aria-controls={listId}
              aria-autocomplete="list"
              role="combobox"
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onFocus={() => setFocused(true)}
              onBlur={() => {
                setFocused(false)
                if (text.trim()) commitText()
              }}
            />
          )}
        </div>

        {showList && (
          <ul id={listId} className="dm-suggest" role="listbox">
            {suggestions.map((item, index) => (
              <li key={item.name} role="option" aria-selected={index === active}>
                <button
                  type="button"
                  className="dm-suggest__row"
                  data-active={index === active || undefined}
                  // Keep the input focused so blur doesn't commit half a word before the click lands.
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    addNames([item.name], item)
                    setText("")
                    setActive(-1)
                  }}
                >
                  <DietDot diet={item.diet} />
                  <span className="dm-suggest__name">{item.name}</span>
                  {item.uses > 0 && <span className="dm-suggest__uses">{item.uses}×</span>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!disabled && (
        <p className="dm-chipbox__hint">Enter or comma adds a dish. Paste a list to add many. Click a dot to change veg / egg / non-veg.</p>
      )}
    </div>
  )
}

export default ItemChipInput
