import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronRight, History, Pin, Search } from "lucide-react"
import { SearchInput } from "@/components/ui"
import { ADMIN_NAV_CATEGORIES, ADMIN_NAV_CATEGORY_HOME, ADMIN_NAV_CATEGORY_HOSTELS } from "../../constants/navigationConfig"
import SidebarNavItem from "./SidebarNavItem"

const EXPANDED_CATEGORIES_STORAGE_KEY = "admin_sidebar_v3_expanded_v1"
const MAX_RECENT_ITEMS = 4

const readStoredExpandedCategories = () => {
  if (typeof window === "undefined") return null
  try {
    const parsed = JSON.parse(window.localStorage.getItem(EXPANDED_CATEGORIES_STORAGE_KEY) || "null")
    return Array.isArray(parsed) ? new Set(parsed) : null
  } catch {
    return null
  }
}

const getItemCategory = (item) => item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
    {Icon && <Icon size={10} strokeWidth={2.5} />}
    {children}
  </div>
)

/**
 * V3 "Workspace" layout: quick jump (Ctrl+K or /), Pinned, Recent, and
 * collapsible category sections with persisted expand state.
 */
const WorkspaceNav = ({ items, pinnedPaths, recentPaths, activeName, isOpen, onNavigate, onTogglePin, onRequestExpand }) => {
  const [query, setQuery] = useState("")
  const inputRef = useRef(null)

  const activeItem = items.find((item) => item.name === activeName)
  const activeCategory = activeItem ? getItemCategory(activeItem) : null

  const [expandedCategories, setExpandedCategories] = useState(() => {
    const stored = readStoredExpandedCategories()
    if (stored) return stored
    return new Set([activeCategory || ADMIN_NAV_CATEGORY_HOSTELS])
  })

  // The category of the page you're on should never be hidden
  useEffect(() => {
    if (!activeCategory) return
    setExpandedCategories((previous) => {
      if (previous.has(activeCategory)) return previous
      return new Set([...previous, activeCategory])
    })
  }, [activeCategory])

  const toggleCategory = (categoryId) => {
    setExpandedCategories((previous) => {
      const next = new Set(previous)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      try {
        window.localStorage.setItem(EXPANDED_CATEGORIES_STORAGE_KEY, JSON.stringify([...next]))
      } catch {
        // Persistence failure only loses the expand state
      }
      return next
    })
  }

  const focusQuickJump = () => {
    if (!isOpen) onRequestExpand?.()
    // Defer one tick so the input exists after a collapsed sidebar expands
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  // Ctrl+K / Cmd+K anywhere, or "/" outside editable fields, focuses quick jump
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.defaultPrevented) return
      const isShortcut =
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") ||
        (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey)

      if (!isShortcut) return

      const target = event.target
      const isEditable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable)
      if (event.key === "/" && isEditable) return

      event.preventDefault()
      focusQuickJump()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const pinnedSet = useMemo(() => new Set(pinnedPaths), [pinnedPaths])
  const pinnedItems = useMemo(() => items.filter((item) => item.path && pinnedSet.has(item.path)), [items, pinnedSet])

  const recentItems = useMemo(() => {
    const itemsByPath = new Map(items.filter((item) => item.path).map((item) => [item.path, item]))
    return recentPaths
      .filter((path) => itemsByPath.has(path) && !pinnedSet.has(path) && itemsByPath.get(path).name !== activeName)
      .map((path) => itemsByPath.get(path))
      .slice(0, MAX_RECENT_ITEMS)
  }, [items, recentPaths, pinnedSet, activeName])

  const categoryGroups = useMemo(
    () =>
      ADMIN_NAV_CATEGORIES
        .filter((category) => category.id !== ADMIN_NAV_CATEGORY_HOME)
        .map((category) => ({ ...category, items: items.filter((item) => getItemCategory(item) === category.id) }))
        .filter((category) => category.items.length > 0),
    [items]
  )

  const normalizedQuery = query.trim().toLowerCase()
  const searchResults = normalizedQuery ? items.filter((item) => item.name.toLowerCase().includes(normalizedQuery)) : null

  const renderItem = (item, keyPrefix, accent) => (
    <SidebarNavItem
      key={`${keyPrefix}-${item.name}`}
      item={item}
      isActive={activeName === item.name}
      isOpen={isOpen}
      showPinControl={isOpen && !!item.path}
      isPinned={!!item.path && pinnedSet.has(item.path)}
      accent={accent}
      onNavigate={(navItem) => {
        setQuery("")
        onNavigate(navItem)
      }}
      onTogglePin={onTogglePin}
    />
  )

  if (!isOpen) {
    const collapsedExtras = activeItem && !pinnedSet.has(activeItem.path) ? [activeItem] : []
    return (
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-2 py-3">
        <button
          type="button"
          onClick={focusQuickJump}
          title="Quick jump (Ctrl+K)"
          aria-label="Quick jump"
          className="w-full py-2.5 rounded-xl flex items-center justify-center text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-primary)] transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
        >
          <Search size={18} strokeWidth={1.9} />
        </button>

        {pinnedItems.length > 0 && (
          <ul className="space-y-1 mt-1 pt-1 border-t border-[var(--color-border-light)]">
            {pinnedItems.map((item) => renderItem(item, "pinned"))}
          </ul>
        )}
        {collapsedExtras.length > 0 && (
          <ul className="space-y-1 mt-1 pt-1 border-t border-[var(--color-border-light)]">
            {collapsedExtras.map((item) => renderItem(item, "active"))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 pt-3">
        <SearchInput
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onSearch={() => {
            if (searchResults?.[0]) {
              onNavigate(searchResults[0])
              setQuery("")
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              setQuery("")
              event.target.blur()
            }
          }}
          placeholder="Quick jump..."
          size="sm"
          aria-label="Quick jump to a tab"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-4 pb-3">
        {searchResults ? (
          <>
            <SectionLabel icon={Search}>Results</SectionLabel>
            <ul className="space-y-1">{searchResults.map((item) => renderItem(item, "search"))}</ul>
            {searchResults.length === 0 && (
              <div className="mt-1 px-4 py-3 rounded-xl text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)]">
                No tabs match "{query.trim()}"
              </div>
            )}
          </>
        ) : (
          <>
            {pinnedItems.length > 0 && (
              <>
                <SectionLabel icon={Pin}>Pinned</SectionLabel>
                <ul className="space-y-1">{pinnedItems.map((item) => renderItem(item, "pinned"))}</ul>
              </>
            )}

            {recentItems.length > 0 && (
              <>
                <SectionLabel icon={History}>Recent</SectionLabel>
                <ul className="space-y-1">{recentItems.map((item) => renderItem(item, "recent"))}</ul>
              </>
            )}

            <div className={pinnedItems.length > 0 || recentItems.length > 0 ? "mt-3 pt-2 border-t border-[var(--color-border-light)]" : "pt-2"}>
              {categoryGroups.map((category) => {
                const isExpanded = expandedCategories.has(category.id)
                const isActiveGroup = category.id === activeCategory
                const accent = `var(${category.colorVar})`
                const tint = (percent) => `color-mix(in srgb, ${accent} ${percent}%, transparent)`
                return (
                  <div
                    key={category.id}
                    className="mb-1 rounded-xl transition-colors duration-200"
                    style={isExpanded ? { backgroundColor: tint(11) } : undefined}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      aria-expanded={isExpanded}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition duration-200 active:scale-[0.99] outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40"
                      style={isExpanded ? undefined : { backgroundColor: "transparent" }}
                      onMouseEnter={(event) => {
                        if (!isExpanded) event.currentTarget.style.backgroundColor = tint(10)
                      }}
                      onMouseLeave={(event) => {
                        if (!isExpanded) event.currentTarget.style.backgroundColor = "transparent"
                      }}
                    >
                      <ChevronRight
                        size={14}
                        strokeWidth={2}
                        className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}
                        style={{ color: isExpanded ? accent : "var(--color-text-muted)" }}
                      />
                      <category.icon size={16} strokeWidth={2} className="shrink-0" style={{ color: accent }} />
                      <span
                        className={`flex-1 min-w-0 truncate text-sm ${isActiveGroup ? "font-semibold" : "font-medium"}`}
                        style={{ color: accent }}
                      >
                        {category.name}
                      </span>
                      <span
                        className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums shrink-0"
                        style={{ backgroundColor: tint(14), color: accent }}
                      >
                        {category.items.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <ul className="space-y-1 ml-[1.45rem] pl-1.5 pb-2 border-l" style={{ borderColor: tint(40) }}>
                        {category.items.map((item) => renderItem(item, category.id, accent))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default WorkspaceNav
