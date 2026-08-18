import "./OccupancyTile.css"

const PIP_CAP = 8
const GROUP_CAP = 6

const resolveTone = ({ used, total, status, disabled, tone }) => {
  if (tone) return tone
  if (disabled || (status && status !== "Active")) return "inactive"
  if (!total || used <= 0) return "empty"
  if (used >= total) return "full"
  return "partial"
}

const PipRow = ({ used, total }) => (
  <span className="occ-tile__pips" aria-hidden="true">
    {Array.from({ length: Math.max(0, total) }, (_, i) => (
      <span key={i} className="occ-tile__pip" data-on={i < used ? "true" : "false"} />
    ))}
  </span>
)

/**
 * Square occupancy tile. Generic on purpose: any labelled space with a
 * used/total count can render through this. Pass `groups` to split the pips
 * into labelled clusters (rooms in a unit, seats in a bay, and so on).
 */
const OccupancyTile = ({
  label,
  used = 0,
  total = 0,
  status,
  tone,
  groups,
  size = "md",
  disabled = false,
  expanded = false,
  className = "",
  ...rest
}) => {
  const resolved = resolveTone({ used, total, status, disabled, tone })
  const cluster = Array.isArray(groups) ? groups.filter((group) => group && group.total > 0) : []
  const showGroups = cluster.length > 0 && cluster.length <= GROUP_CAP
  const showPips = !showGroups && resolved !== "inactive" && total > 0 && total <= PIP_CAP
  const count =
    resolved === "inactive"
      ? status && status !== "Active" && status !== "Inactive"
        ? status
        : "Off"
      : `${used}/${total}`

  const aria = showGroups
    ? `${label}, ${cluster.map((group, index) => `group ${index + 1} ${group.used || 0} of ${group.total}`).join(", ")}`
    : `${label}, ${resolved === "inactive" ? count : `${used} of ${total}`}`

  return (
    <button
      type="button"
      className={["occ-tile", `occ-tile--${size}`, showGroups ? "occ-tile--grouped" : "", className]
        .filter(Boolean)
        .join(" ")}
      data-tone={resolved}
      disabled={disabled}
      aria-expanded={expanded || undefined}
      aria-label={aria}
      {...rest}
    >
      <span className="occ-tile__label">{label}</span>
      {showGroups ? (
        <span className="occ-tile__groups">
          {cluster.map((group, index) => (
            <span key={group.id || index} className="occ-tile__group">
              <PipRow used={group.used || 0} total={group.total || 0} />
            </span>
          ))}
        </span>
      ) : showPips ? (
        <PipRow used={used} total={total} />
      ) : (
        <span className="occ-tile__count">{count}</span>
      )}
    </button>
  )
}

export default OccupancyTile
