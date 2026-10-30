import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "hzero"
import WeekPicker from "./WeekPicker"
import { VIEWS, addDays, weekStartOf } from "./menuHelpers"

/** Kitchen chips (Admin / Office), week navigator with a calendar popover, and the view switch. */
const MenuToolbar = ({ kitchens, catererId, onKitchen, weekStart, onWeek, today, view, onView, views = VIEWS, showWeek = true }) => {
  const thisWeek = weekStartOf(today)
  return (
    <div className="dm-toolbar">
      {kitchens && kitchens.length > 0 && (
        <div className="dm-kitchens" role="group" aria-label="Kitchen">
          {kitchens.map((kitchen) => (
            <button
              key={kitchen.id}
              type="button"
              className="dm-kitchen"
              aria-pressed={kitchen.id === catererId}
              onClick={() => onKitchen(kitchen.id)}
            >
              {kitchen.name}
              {!kitchen.isActive && <em>inactive</em>}
            </button>
          ))}
        </div>
      )}
      <div className="dm-toolbar__row">
        {showWeek ? (
          <div className="dm-weeknav">
            <button type="button" className="dm-iconbtn" onClick={() => onWeek(addDays(weekStart, -7))} aria-label="Previous week">
              <ChevronLeft size={18} />
            </button>
            <WeekPicker weekStart={weekStart} today={today} onPick={onWeek} />
            <button type="button" className="dm-iconbtn" onClick={() => onWeek(addDays(weekStart, 7))} aria-label="Next week">
              <ChevronRight size={18} />
            </button>
            <Button type="button" variant="secondary" size="sm" disabled={weekStart === thisWeek} onClick={() => onWeek(thisWeek)}>
              This week
            </Button>
          </div>
        ) : (
          <span className="dm-toolbar__spacer" />
        )}
        {views.length > 1 && (
          <div className="dm-switch" role="tablist" aria-label="View">
            {views.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={view === item.id}
                data-active={view === item.id || undefined}
                onClick={() => onView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MenuToolbar
