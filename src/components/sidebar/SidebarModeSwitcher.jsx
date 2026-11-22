import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { SIDEBAR_MODE_OPTIONS, SIDEBAR_MODE_RAIL } from "./sidebarModes"
import { NewTag } from "./NewBadge"

/**
 * Compact mode pill in the sidebar header. Shows the current mode (V1–V5)
 * and opens a small menu describing each layout.
 */
const SidebarModeSwitcher = ({ mode, onChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const containerRef = useRef(null)

  const currentOption = SIDEBAR_MODE_OPTIONS.find((option) => option.id === mode) || SIDEBAR_MODE_OPTIONS[0]
  const showNewBadge = mode === SIDEBAR_MODE_RAIL

  useEffect(() => {
    if (!isMenuOpen) return

    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <div className="relative z-50" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        title={showNewBadge ? "Sidebar layout — new themes available" : "Sidebar layout"}
        aria-label={showNewBadge ? `Sidebar layout: ${currentOption.name} (new themes available)` : `Sidebar layout: ${currentOption.name}`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className={`sidebar-mode-button
          h-8 px-2 rounded-lg flex items-center gap-1 text-[10px] font-bold tracking-wider
          transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          ${isMenuOpen
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : showNewBadge
              ? "sidebar-new-tag relative isolate overflow-hidden bg-[var(--color-success)] text-white hover:opacity-90"
              : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"}
        `}
      >
        {showNewBadge ? "NEW" : currentOption.label}
        <ChevronDown size={12} strokeWidth={2.5} className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-60 max-h-[calc(100vh-72px)] overflow-y-auto p-1.5 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] z-50 animate-fadeIn"
          style={{ boxShadow: "var(--shadow-dropdown)" }}
        >
          {SIDEBAR_MODE_OPTIONS.filter((option) => !option.lab && (!option.hidden || option.id === mode)).map((option) => {
            const isActiveOption = option.id === mode
            return (
              <button
                key={option.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActiveOption}
                onClick={() => {
                  onChange(option.id)
                  setIsMenuOpen(false)
                }}
                title={option.description}
                className={`
                  w-full px-2.5 py-1.5 rounded-lg flex items-center gap-2.5 text-left transition-colors duration-200
                  outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
                  ${isActiveOption ? "bg-[var(--color-primary)]/8" : "hover:bg-[var(--color-bg-hover)]"}
                `}
              >
                <span
                  className={`
                    h-5 min-w-7 px-1 rounded-md text-[9px] font-bold tracking-wider flex items-center justify-center shrink-0
                    ${isActiveOption ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"}
                  `}
                >
                  {option.label}
                </span>
                <span className={`flex-1 min-w-0 truncate text-sm font-medium ${isActiveOption ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}>
                  {option.name}
                </span>
                {option.isNew && <NewTag />}
                {isActiveOption && <Check size={15} strokeWidth={2.5} className="text-[var(--color-primary)] shrink-0" />}
              </button>
            )
          })}
          <div className="mt-1 border-t border-[var(--color-border-light)] px-2.5 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
            Lab · just for fun
          </div>
          <div className="grid grid-cols-2 gap-0.5">
            {SIDEBAR_MODE_OPTIONS.filter((option) => option.lab).map((option) => {
              const isActiveOption = option.id === mode
              return (
                <button
                  key={option.id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActiveOption}
                  title={option.description}
                  onClick={() => {
                    onChange(option.id)
                    setIsMenuOpen(false)
                  }}
                  className={`
                    px-2 py-1.5 rounded-lg flex items-center gap-1.5 text-left text-xs transition-colors duration-200
                    outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
                    ${isActiveOption ? "bg-[var(--color-primary)]/8 text-[var(--color-primary)] font-medium" : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)]"}
                  `}
                >
                  <span className={`h-5 min-w-7 px-1 rounded text-xs font-semibold tracking-wider flex items-center justify-center shrink-0 ${isActiveOption ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"}`}>
                    {option.label}
                  </span>
                  <span className="truncate">{option.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SidebarModeSwitcher
