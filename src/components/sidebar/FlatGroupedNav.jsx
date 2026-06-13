import { useMemo, useState } from "react"
import { Pin } from "lucide-react"
import { SearchInput } from "@/components/ui"
import { ADMIN_NAV_CATEGORIES, ADMIN_NAV_CATEGORY_HOME, ADMIN_NAV_CATEGORY_HOSTELS } from "../../constants/navigationConfig"
import SidebarNavItem from "./SidebarNavItem"

const matchesQuery = (item, query) => item.name.toLowerCase().includes(query)

/**
 * V1 "All tabs" layout: every admin tab in one scrollable list with sticky
 * category headers, a Pinned group on top, and a quick text filter.
 */
const FlatGroupedNav = ({ items, pinnedPaths, activeName, onNavigate, onTogglePin }) => {
  const [filterQuery, setFilterQuery] = useState("")
  const normalizedQuery = filterQuery.trim().toLowerCase()

  const groups = useMemo(() => {
    const pinnedSet = new Set(pinnedPaths)
    const pinnedItems = items.filter((item) => item.path && pinnedSet.has(item.path))

    const categoryGroups = ADMIN_NAV_CATEGORIES
      .filter((category) => category.id !== ADMIN_NAV_CATEGORY_HOME)
      .map((category) => ({
        id: category.id,
        name: category.name,
        colorVar: category.colorVar,
        items: items.filter((item) => (item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) === category.id),
      }))

    return [
      { id: "pinned", name: "Pinned", colorVar: "--color-primary", icon: Pin, items: pinnedItems },
      ...categoryGroups,
    ].filter((group) => group.items.length > 0)
  }, [items, pinnedPaths])

  const visibleGroups = useMemo(() => {
    if (!normalizedQuery) return groups
    return groups
      .map((group) => ({ ...group, items: group.items.filter((item) => matchesQuery(item, normalizedQuery)) }))
      .filter((group) => group.items.length > 0)
  }, [groups, normalizedQuery])

  const firstMatch = normalizedQuery ? visibleGroups[0]?.items[0] : null

  const activeItem = items.find((item) => item.name === activeName)
  const activeCategoryId = activeItem ? (activeItem.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS) : null

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 pt-3">
        <SearchInput
          value={filterQuery}
          onChange={(event) => setFilterQuery(event.target.value)}
          onSearch={() => {
            if (firstMatch) {
              onNavigate(firstMatch)
              setFilterQuery("")
            }
          }}
          placeholder="Filter tabs..."
          size="sm"
          aria-label="Filter sidebar tabs"
        />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scrollbar px-4 pb-3">
        {visibleGroups.map((group) => {
          const isActiveGroup = group.id === activeCategoryId
          const accent = `var(${group.colorVar})`
          return (
          <div key={group.id}>
            <div className="sticky top-0 z-10 -mx-1 px-1 pt-3 pb-1.5 bg-[var(--color-bg-primary)]">
              <div className="flex items-center gap-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {group.icon ? (
                  <group.icon size={10} strokeWidth={2.5} style={{ color: accent }} />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
                )}
                <span style={isActiveGroup ? { color: accent } : undefined}>{group.name}</span>
                <span className="flex-1" />
                <span className="tabular-nums text-[var(--color-text-placeholder)] font-medium">{group.items.length}</span>
              </div>
            </div>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <SidebarNavItem
                  key={`${group.id}-${item.name}`}
                  item={item}
                  isActive={activeName === item.name}
                  showPinControl={!!item.path}
                  isPinned={!!item.path && pinnedPaths.includes(item.path)}
                  onNavigate={onNavigate}
                  onTogglePin={onTogglePin}
                />
              ))}
            </ul>
          </div>
          )
        })}

        {normalizedQuery && visibleGroups.length === 0 && (
          <div className="mt-3 px-4 py-3 rounded-xl text-xs text-[var(--color-text-muted)] bg-[var(--color-bg-tertiary)] border border-[var(--color-border-light)]">
            No tabs match "{filterQuery.trim()}"
          </div>
        )}
      </div>
    </div>
  )
}

export default FlatGroupedNav
