import { useState } from "react"
import { Modal } from "hzero"
import { localTodayKey } from "../caterer/catererHelpers"
import MenuToolbar from "../menu/MenuToolbar"
import WeekBoard from "../menu/WeekBoard"
import { weekStartOf } from "../menu/menuHelpers"
import { useStudentMenuWeek } from "./useStudentMenu"
import "../menu/Menu.css"

/** The whole week's menu as the read-only board, with past and future weeks one click away. */
const FullWeekModal = ({ initialWeekStart, onClose }) => {
  const [weekStart, setWeekStart] = useState(initialWeekStart)
  const query = useStudentMenuWeek(weekStart)
  const today = query.data?.today || localTodayKey()
  const caterer = query.data?.days?.find((day) => day.caterer)?.caterer

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Menu for the week"
      description={
        caterer?.name ? `${caterer.name}. Past weeks are kept, so you can look back.` : "Past weeks are kept, so you can look back."
      }
      width={1180}
    >
      <div className="sm-week">
        <MenuToolbar weekStart={weekStart} onWeek={(key) => setWeekStart(weekStartOf(key))} today={today} view="board" views={[]} />
        {query.isError && !query.data ? (
          <p className="sd-card__empty">Couldn&apos;t load the menu right now.</p>
        ) : !query.data ? (
          <p className="sd-card__empty">Loading the menu...</p>
        ) : (
          <div className="dm-stage" data-stale={query.isPlaceholderData || undefined}>
            <WeekBoard days={query.data.days || []} weekStart={weekStart} today={today} />
          </div>
        )}
      </div>
    </Modal>
  )
}

export default FullWeekModal
