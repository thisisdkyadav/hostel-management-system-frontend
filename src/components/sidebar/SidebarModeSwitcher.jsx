import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { SIDEBAR_MODE_OPTIONS } from "./sidebarModes"

/**
 * Compact mode pill in the sidebar header. Shows the current mode (V1/V2/V3)
 * and opens a small menu describing all three layouts.
 */
const SidebarModeSwitcher = ({ mode, onChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const containerRef = useRef(null)

  const currentOption = SIDEBAR_MODE_OPTIONS.find((option) => option.id === mode) || SIDEBAR_MODE_OPTIONS[0]

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
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        title="Sidebar layout"
        aria-label={`Sidebar layout: ${currentOption.name}`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        className={`
          h-8 px-2 rounded-lg flex items-center gap-1 text-[10px] font-bold tracking-wider
          transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
          ${isMenuOpen
            ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
            : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-secondary)]"}
        `}
      >
        {currentOption.label}
        <ChevronDown size={12} strokeWidth={2.5} className={`transition-transform duration-200 ${isMenuOpen ? "rotate-180" : ""}`} />
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-52 p-1.5 rounded-xl border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] z-50 animate-fadeIn"
          style={{ boxShadow: "var(--shadow-dropdown)" }}
        >
          {SIDEBAR_MODE_OPTIONS.map((option) => {
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
                className={`
                  w-full px-2.5 py-2 rounded-lg flex items-start gap-2.5 text-left transition-colors duration-200
                  outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40
                  ${isActiveOption ? "bg-[var(--color-primary)]/8" : "hover:bg-[var(--color-bg-hover)]"}
                `}
              >
                <span
                  className={`
                    mt-0.5 h-5 min-w-7 px-1 rounded-md text-[9px] font-bold tracking-wider flex items-center justify-center shrink-0
                    ${isActiveOption ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]"}
                  `}
                >
                  {option.label}
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-sm font-medium ${isActiveOption ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}>
                    {option.name}
                  </span>
                  <span className="block text-xs text-[var(--color-text-muted)] leading-snug">{option.description}</span>
                </span>
                {isActiveOption && <Check size={15} strokeWidth={2.5} className="mt-1 text-[var(--color-primary)] shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default SidebarModeSwitcher
