const occupancyTone = (used, total) => {
  if (!total || used <= 0) return "empty"
  if (used >= total) return "full"
  return "partial"
}

const typeLabel = (type) => (type === "room-only" ? "Rooms" : "Units")

const HostelExplorerTile = ({ hostel, selected, onSelect }) => {
  const used = Number(hostel.activeRoomsOccupancy) || 0
  const total = Number(hostel.activeRoomsCapacity) || 0
  const rate = Number(hostel.occupancyRate) || 0
  const tone = occupancyTone(used, total)
  const gender = hostel.gender || "Other"

  return (
    <button
      type="button"
      className="hostel-explorer-tile"
      data-gender={gender}
      data-tone={tone}
      aria-pressed={selected}
      aria-label={`${hostel.name}, ${gender}, ${rate}% occupied, ${used} of ${total}`}
      style={{ "--hostel-occ": `${Math.max(0, Math.min(100, rate))}%` }}
      onPointerEnter={() => onSelect(hostel)}
      onFocus={() => onSelect(hostel)}
      onClick={() => onSelect(hostel)}
    >
      <span className="hostel-explorer-tile__name">{hostel.name}</span>
      <span className="hostel-explorer-tile__meta">
        {gender} · {typeLabel(hostel.type)}
      </span>
      <span className="hostel-explorer-tile__occ">
        <span className="hostel-explorer-tile__bar" aria-hidden="true">
          <span className="hostel-explorer-tile__bar-fill" />
        </span>
        <span className="hostel-explorer-tile__count">
          {rate}% · {used}/{total}
        </span>
      </span>
    </button>
  )
}

export default HostelExplorerTile
