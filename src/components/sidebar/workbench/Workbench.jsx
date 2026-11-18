import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ArrowRight, ChevronDown, CornerDownLeft, LogOut, Moon, Pin, PinOff, Plus, Search, Sun, User, X } from "lucide-react"
import { getMediaUrl } from "../../../utils/mediaUtils"
import { ADMIN_NAV_CATEGORY_HOME, ADMIN_NAV_CATEGORY_HOSTELS, isNavItemNew } from "../../../constants/navigationConfig"
import SidebarModeSwitcher from "../SidebarModeSwitcher"
import { scoreNavName } from "../navSearch"
import useWorkbenchTabs from "./useWorkbenchTabs"
import "./workbench.css"

/**
 * V7 "Workbench": no sidebar. The admin works like a browser / code editor.
 *
 * Row 1 — menu bar: categories open a full panel of their pages; Search (Ctrl+K)
 *         jumps anywhere; theme, layout version and the account menu on the right.
 * Row 2 — tab strip: pinned pages as icon tabs (never close), then a tab per open
 *         page. Tabs remember the sub-page you were on, can be dragged to reorder,
 *         middle-clicked or ×'d to close, and right-clicked for more.
 * The page below gets the full width of the screen.
 */

const categoryOf = (item) => item.adminCategory || ADMIN_NAV_CATEGORY_HOSTELS
const formatCount = (count) => (count > 99 ? "99+" : String(count))
const isTypingTarget = (target) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

const titleFromPath = (path) => {
  const last = String(path || "").split("/").filter(Boolean).pop() || "Page"
  return last.replace(/[-_]+/g, " ").replace(/^\w/, (char) => char.toUpperCase())
}

/** Close a floating thing on outside press or Escape. */
const useDismiss = (open, onClose, refs) => {
  useEffect(() => {
    if (!open) return
    const onPointer = (event) => {
      if (refs.some((ref) => ref.current?.contains(event.target))) return
      onClose()
    }
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [onClose, open, refs])
}

const ItemBadges = ({ item }) => {
  const tag = item.badge && typeof item.badge === "object" ? item.badge : null
  const count = typeof item.badge === "number" ? item.badge : 0
  return (
    <>
      {tag && (
        <span className="wb-live" data-pulse={tag.pulse || undefined}>
          {tag.label}
        </span>
      )}
      {count > 0 && <span className="wb-count">{formatCount(count)}</span>}
      {isNavItemNew(item) && <span className="wb-new">New</span>}
    </>
  )
}

/* ---------- Category panel ---------- */
const CategoryPanel = ({ category, items, isPinned, pinLocked, onOpen, onTogglePin, activeKey, panelRef }) => {
  const dashboard = items.find((item) => item.name === "Dashboard")
  const pages = items.filter((item) => item !== dashboard)
  const Icon = category.icon
  return (
    <div className="wb-panel" ref={panelRef} data-cat={category.id} role="menu" aria-label={`${category.name} pages`}>
      <div className="wb-panel__head">
        <span className="wb-panel__icon" aria-hidden="true">
          <Icon size={18} />
        </span>
        <div className="wb-panel__titles">
          <span className="wb-panel__title">{category.name}</span>
          <span className="wb-panel__sub">{pages.length} pages</span>
        </div>
        {dashboard && (
          <button type="button" className="wb-panel__dash" onClick={() => onOpen(dashboard)}>
            Open dashboard <ArrowRight size={14} />
          </button>
        )}
      </div>
      <ul className="wb-panel__grid">
        {pages.length === 0 && <li className="wb-panel__empty">Nothing pinned yet. Pin pages from any category to keep them as tabs.</li>}
        {pages.map((item) => {
          const ItemIcon = item.icon
          const pinned = isPinned(item)
          const locked = pinLocked(item)
          return (
            <li key={item.path} className="wb-entry" data-active={activeKey === item.path || undefined}>
              <button type="button" role="menuitem" className="wb-entry__go" onClick={() => onOpen(item)}>
                <span className="wb-entry__icon" aria-hidden="true">
                  {ItemIcon && <ItemIcon size={16} />}
                </span>
                <span className="wb-entry__name">{item.name}</span>
                <ItemBadges item={item} />
              </button>
              {!locked && (
                <button
                  type="button"
                  className="wb-entry__pin"
                  data-pinned={pinned || undefined}
                  onClick={() => onTogglePin(item)}
                  title={pinned ? "Unpin" : "Pin as a tab"}
                  aria-label={`${pinned ? "Unpin" : "Pin"} ${item.name}`}
                >
                  <Pin size={14} fill={pinned ? "currentColor" : "none"} />
                </button>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------- Command bar (Ctrl+K) ---------- */
const CommandBar = ({ items, categories, isPinned, onOpen, onClose }) => {
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const pool = items.filter((item) => item.path)
    if (!q) return [...pool.filter((item) => isPinned(item)), ...pool.filter((item) => !isPinned(item))].slice(0, 10)
    return pool
      .map((item) => {
        const label = item.name === "Dashboard" ? `${categoryById[categoryOf(item)]?.name} dashboard` : item.name
        return { item, score: Math.max(scoreNavName(label, q), scoreNavName(categoryById[categoryOf(item)]?.name, q) / 4) }
      })
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((entry) => entry.item)
  }, [categoryById, isPinned, items, query])

  useEffect(() => inputRef.current?.focus(), [])
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" })
  }, [cursor])

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
      onOpen(results[cursor])
    }
  }

  return createPortal(
    <div className="wb-cmd" role="dialog" aria-modal="true" aria-label="Go to page" onKeyDown={onKeyDown}>
      <div className="wb-cmd__backdrop" onClick={onClose} />
      <div className="wb-cmd__box">
        <div className="wb-cmd__field">
          <Search size={18} aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setCursor(0)
            }}
            placeholder="Go to a page…"
            aria-label="Search pages"
            aria-controls="wb-cmd-list"
            aria-activedescendant={results[cursor] ? `wb-cmd-${cursor}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <kbd>Esc</kbd>
        </div>
        <p className="wb-cmd__section">{query.trim() ? "Pages" : "Pinned and suggested"}</p>
        <ul className="wb-cmd__list" id="wb-cmd-list" role="listbox" ref={listRef}>
          {results.length === 0 && <li className="wb-cmd__none">No page matches “{query.trim()}”.</li>}
          {results.map((item, index) => {
            const category = categoryById[categoryOf(item)]
            const Icon = item.icon
            return (
              <li
                key={item.path}
                id={`wb-cmd-${index}`}
                role="option"
                aria-selected={index === cursor}
                className="wb-cmd__row"
                data-cat={category?.id}
                onMouseMove={() => setCursor(index)}
                onClick={() => onOpen(item)}
              >
                <span className="wb-cmd__icon" aria-hidden="true">
                  {Icon && <Icon size={16} />}
                </span>
                <span className="wb-cmd__name">{item.name === "Dashboard" ? `${category?.name} dashboard` : item.name}</span>
                {isPinned(item) && <Pin size={12} className="wb-cmd__pin" aria-label="Pinned" />}
                <span className="wb-cmd__cat">{category?.name}</span>
                <CornerDownLeft size={14} className="wb-cmd__enter" aria-hidden="true" />
              </li>
            )
          })}
        </ul>
        <div className="wb-cmd__foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to move
          </span>
          <span>
            <kbd>Enter</kbd> to open
          </span>
          <span>
            <kbd>Alt</kbd> + <kbd>1–9</kbd> switch tabs
          </span>
        </div>
      </div>
    </div>,
    document.body
  )
}

/* ---------- Workbench ---------- */
const Workbench = ({
  user,
  categories,
  navItems,
  pinnedPaths,
  isPinned,
  pinLocked,
  onTogglePin,
  categoryCounts,
  newCategoryIds,
  currentCategory,
  pathname,
  currentUrl,
  navigate,
  isDark,
  onToggleTheme,
  profileItem,
  logoutItem,
  onNavigate,
  sidebarMode,
  onModeChange,
}) => {
  const [openCategory, setOpenCategory] = useState(null)
  const [commandOpen, setCommandOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [tabMenu, setTabMenu] = useState(null)
  const [dragKey, setDragKey] = useState(null)
  const menuBarRef = useRef(null)
  const panelRef = useRef(null)
  const accountRef = useRef(null)
  const tabMenuRef = useRef(null)
  const stripRef = useRef(null)

  const itemByPath = useMemo(() => new Map(navItems.filter((item) => item.path).map((item) => [item.path, item])), [navItems])

  // Which tab a URL belongs to: its nav item (sub-pages included), or the path itself.
  const keyForPath = useCallback(
    (path) => {
      const exact = itemByPath.get(path)
      if (exact) return exact.path
      const owner = navItems.find((item) => item.path && item.pathPattern && new RegExp(item.pathPattern).test(path))
      if (owner) return owner.path
      return path && path !== "/" ? path : null
    },
    [itemByPath, navItems]
  )

  const homeItem = navItems.find((item) => item.alwaysPinned)
  const pinnedKeys = useMemo(() => pinnedPaths.filter((path) => itemByPath.has(path)), [itemByPath, pinnedPaths])
  const { tabs, activeKey, open, close, closeOthers, move } = useWorkbenchTabs({
    userId: user?._id,
    pinnedKeys,
    keyForPath,
    currentUrl,
    pathname,
    navigate,
    homeUrl: homeItem?.path || "/admin",
  })

  const labelFor = useCallback(
    (key) => {
      const item = itemByPath.get(key)
      if (!item) return key === profileItem?.path ? "Profile" : titleFromPath(key)
      if (item.name === "Dashboard") return item.pinnedName || "Home"
      return item.name
    },
    [itemByPath, profileItem?.path]
  )
  const iconFor = (key) => itemByPath.get(key)?.icon || (key === profileItem?.path ? User : null)

  const goToItem = useCallback(
    (item) => {
      setOpenCategory(null)
      setCommandOpen(false)
      if (!item?.path) return onNavigate(item)
      open(item.path)
    },
    [onNavigate, open]
  )

  const closeFloating = useCallback(() => setOpenCategory(null), [])
  useDismiss(Boolean(openCategory), closeFloating, useMemo(() => [menuBarRef, panelRef], []))
  const closeAccount = useCallback(() => setAccountOpen(false), [])
  useDismiss(accountOpen, closeAccount, useMemo(() => [accountRef], []))
  const closeTabMenu = useCallback(() => setTabMenu(null), [])
  useDismiss(Boolean(tabMenu), closeTabMenu, useMemo(() => [tabMenuRef], []))

  // Keys: Ctrl/Cmd+K or "/" search; Alt+1…9 jump to the Nth tab (pinned first).
  const allTabKeys = useMemo(() => [...pinnedKeys, ...tabs], [pinnedKeys, tabs])
  useEffect(() => {
    const onKeyDown = (event) => {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === "k") {
        event.preventDefault()
        setOpenCategory(null)
        setCommandOpen((value) => !value)
      } else if (key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey && !isTypingTarget(event.target)) {
        event.preventDefault()
        setCommandOpen(true)
      } else if (event.altKey && !event.ctrlKey && !event.metaKey && /^Digit[1-9]$/.test(event.code)) {
        const target = allTabKeys[Number(event.code.slice(5)) - 1]
        if (target) {
          event.preventDefault()
          open(target)
        }
      }
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [allTabKeys, open])

  // Keep the active tab in view.
  useEffect(() => {
    stripRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [activeKey, tabs.length])

  const itemsFor = (categoryId) =>
    categoryId === ADMIN_NAV_CATEGORY_HOME
      ? navItems.filter((item) => item.path && (item.alwaysPinned || pinnedPaths.includes(item.path)))
      : navItems.filter((item) => item.path && categoryOf(item) === categoryId)

  const menuCategories = categories.filter((category) => category.id !== ADMIN_NAV_CATEGORY_HOME)
  const openPanelCategory = categories.find((category) => category.id === openCategory)

  const onMenuKeyDown = (event, index) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const buttons = menuBarRef.current?.querySelectorAll(".wb-menu__btn")
    if (!buttons?.length) return
    const next = (index + (event.key === "ArrowRight" ? 1 : -1) + buttons.length) % buttons.length
    buttons[next].focus()
    if (openCategory) setOpenCategory(menuCategories[next]?.id || null)
  }

  const renderTab = (key, { pinned }) => {
    const Icon = iconFor(key)
    const label = labelFor(key)
    const active = key === activeKey
    const item = itemByPath.get(key)
    const count = typeof item?.badge === "number" ? item.badge : 0
    return (
      <div
        key={key}
        className="wb-tab"
        data-pinned={pinned || undefined}
        data-active={active ? "true" : undefined}
        data-cat={item ? categoryOf(item) : undefined}
        data-dragging={dragKey === key || undefined}
        draggable={!pinned}
        onDragStart={(event) => {
          setDragKey(key)
          event.dataTransfer.effectAllowed = "move"
        }}
        onDragEnd={() => setDragKey(null)}
        onDragOver={(event) => {
          if (!dragKey || pinned || dragKey === key) return
          event.preventDefault()
          move(dragKey, key)
        }}
        onAuxClick={(event) => {
          if (event.button === 1 && !pinned) {
            event.preventDefault()
            close(key)
          }
        }}
        onContextMenu={(event) => {
          event.preventDefault()
          setTabMenu({ key, x: event.clientX, y: event.clientY, pinned })
        }}
        data-label={pinned ? label : undefined}
      >
        <button type="button" className="wb-tab__go" onClick={() => open(key)} aria-current={active ? "page" : undefined} aria-label={label}>
          {Icon ? <Icon size={15} aria-hidden="true" /> : <span className="wb-tab__dot" aria-hidden="true" />}
          {!pinned && <span className="wb-tab__label">{label}</span>}
          {count > 0 && <span className="wb-tab__count">{formatCount(count)}</span>}
        </button>
        {!pinned && (
          <button type="button" className="wb-tab__close" onClick={() => close(key)} aria-label={`Close ${label}`} title="Close (middle-click)">
            <X size={13} />
          </button>
        )}
      </div>
    )
  }

  const menuItem = tabMenu ? itemByPath.get(tabMenu.key) : null

  return (
    <header className="wb" data-cat={currentCategory}>
      <div className="wb-bar">
        <button type="button" className="wb-brand" onClick={() => homeItem && goToItem(homeItem)} title="Home">
          <span className="wb-brand__mark" aria-hidden="true">
            S
          </span>
          <span className="wb-brand__name">SMS</span>
        </button>

        <nav className="wb-menu" ref={menuBarRef} aria-label="Categories">
          {menuCategories.map((category, index) => {
            const Icon = category.icon
            const count = categoryCounts?.[category.id] || 0
            const isOpen = openCategory === category.id
            return (
              <button
                key={category.id}
                type="button"
                className="wb-menu__btn"
                data-cat={category.id}
                data-current={currentCategory === category.id || undefined}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                onClick={() => setOpenCategory(isOpen ? null : category.id)}
                onPointerEnter={() => openCategory && !isOpen && setOpenCategory(category.id)}
                onKeyDown={(event) => onMenuKeyDown(event, index)}
              >
                <Icon size={16} aria-hidden="true" />
                <span>{category.name}</span>
                {count > 0 && <span className="wb-count">{formatCount(count)}</span>}
                {newCategoryIds?.has(category.id) && !count && <span className="wb-newdot" aria-label="New pages" />}
                <ChevronDown size={14} className="wb-menu__chev" aria-hidden="true" />
              </button>
            )
          })}
        </nav>

        <button type="button" className="wb-search" onClick={() => setCommandOpen(true)}>
          <Search size={15} aria-hidden="true" />
          <span>Go to a page…</span>
          <kbd>Ctrl K</kbd>
        </button>

        <div className="wb-tools">
          <div className="wb-mode">
            <SidebarModeSwitcher mode={sidebarMode} onChange={onModeChange} />
          </div>
          <button
            type="button"
            className="wb-iconbtn"
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <div className="wb-account" ref={accountRef}>
            <button type="button" className="wb-avatar" onClick={() => setAccountOpen((value) => !value)} aria-haspopup="menu" aria-expanded={accountOpen} aria-label="Account">
              {user?.profileImage ? <img src={getMediaUrl(user.profileImage)} alt="" /> : <span>{user?.name?.charAt(0)?.toUpperCase() || "?"}</span>}
            </button>
            {accountOpen && (
              <div className="wb-pop wb-pop--account" role="menu">
                <div className="wb-pop__who">
                  <strong>{user?.name}</strong>
                  <span>{user?.email}</span>
                </div>
                {profileItem && (
                  <button type="button" role="menuitem" onClick={() => (setAccountOpen(false), onNavigate(profileItem))}>
                    <User size={15} /> Profile
                  </button>
                )}
                {logoutItem && (
                  <button type="button" role="menuitem" className="wb-pop__danger" onClick={() => (setAccountOpen(false), onNavigate(logoutItem))}>
                    <LogOut size={15} /> Log out
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="wb-strip" ref={stripRef} role="tablist" aria-label="Open pages">
        {pinnedKeys.length > 0 && <div className="wb-strip__pinned">{pinnedKeys.map((key) => renderTab(key, { pinned: true }))}</div>}
        <div className="wb-strip__tabs">{tabs.map((key) => renderTab(key, { pinned: false }))}</div>
        <button type="button" className="wb-strip__add" onClick={() => setCommandOpen(true)} title="Open a page (Ctrl+K)" aria-label="Open a page">
          <Plus size={15} />
        </button>
      </div>

      {openPanelCategory && (
        <CategoryPanel
          category={openPanelCategory}
          items={itemsFor(openPanelCategory.id)}
          isPinned={isPinned}
          pinLocked={pinLocked}
          onOpen={goToItem}
          onTogglePin={onTogglePin}
          activeKey={activeKey}
          panelRef={panelRef}
        />
      )}

      {tabMenu && (
        <div className="wb-pop wb-pop--tab" ref={tabMenuRef} role="menu" style={{ left: tabMenu.x, top: tabMenu.y }}>
          {menuItem && !pinLocked(menuItem) && (
            <button type="button" role="menuitem" onClick={() => (setTabMenu(null), onTogglePin(menuItem))}>
              {tabMenu.pinned ? <PinOff size={15} /> : <Pin size={15} />} {tabMenu.pinned ? "Unpin tab" : "Pin tab"}
            </button>
          )}
          {!tabMenu.pinned && (
            <>
              <button type="button" role="menuitem" onClick={() => (setTabMenu(null), close(tabMenu.key))}>
                <X size={15} /> Close tab
              </button>
              <button type="button" role="menuitem" onClick={() => (setTabMenu(null), closeOthers(tabMenu.key))}>
                <X size={15} /> Close other tabs
              </button>
            </>
          )}
          {tabMenu.pinned && pinLocked(menuItem || {}) && <p className="wb-pop__note">Home is always pinned.</p>}
        </div>
      )}

      {commandOpen && <CommandBar items={navItems} categories={categories} isPinned={isPinned} onOpen={goToItem} onClose={() => setCommandOpen(false)} />}
    </header>
  )
}

export default Workbench
