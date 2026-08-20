import { Fragment } from "react"
import "./OccupancyTile.css"

const PIP_CAP = 8
const RAIL_ROWS = 6
const FACE_CAP = 3

const resolveTone = ({ used, total, status, disabled, tone }) => {
  if (tone) return tone
  if (disabled || (status && status !== "Active")) return "inactive"
  if (!total || used <= 0) return "empty"
  if (used >= total) return "full"
  return "partial"
}

const initialsOf = (name) =>
  String(name || "")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?"

const PipRow = ({ used, total, variant }) => (
  <span className="occ-tile__pips" aria-hidden="true">
    {Array.from({ length: Math.max(0, total) }, (_, i) => (
      <svg
        key={i}
        className="occ-tile__pip"
        data-on={variant === "inactive" ? undefined : i < used ? "true" : "false"}
        data-variant={variant || undefined}
        viewBox="0 0 10 10"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="5" cy="5" r="4.5" />
      </svg>
    ))}
  </span>
)

/**
 * Square occupancy tile. Generic on purpose: any labelled space with a
 * used/total count can render through this. Pass `groups` for a left rail of
 * pip rows (one cluster per row, six slots) with the label and count on the right.
 * Room tiles keep pips top-left and the label top-right; pass `faces` for
 * occupant portraits along the bottom. `wrapHead` / `wrapFace` let a parent
 * attach hover peeks without nesting interactive content in a button.
 */
const OccupancyTile = ({
  label,
  used = 0,
  total = 0,
  status,
  tone,
  groups,
  faces,
  wrapHead,
  wrapFace,
  size = "md",
  disabled = false,
  expanded = false,
  className = "",
  ...rest
}) => {
  const resolved = resolveTone({ used, total, status, disabled, tone })
  const cluster = Array.isArray(groups) ? groups.filter((group) => group && group.total > 0) : []
  const portraits = Array.isArray(faces)
    ? faces.filter((face) => face && (face.name || face.src)).slice(0, FACE_CAP)
    : []
  const showGroups = cluster.length > 0
  const showPips = !showGroups && total > 0 && total <= PIP_CAP
  const count =
    resolved === "inactive"
      ? status && status !== "Active" && status !== "Inactive"
        ? status
        : "Off"
      : `${used}/${total}`

  const names = portraits.map((face) => face.name).filter(Boolean).join(", ")
  const aria = showGroups
    ? `${label}, ${used} of ${total}, ${cluster
        .slice(0, RAIL_ROWS)
        .map((group, index) => `room ${index + 1} ${group.used || 0} of ${group.total}`)
        .join(", ")}`
    : `${label}, ${resolved === "inactive" ? count : `${used} of ${total}`}${names ? `, ${names}` : ""}`
  const split = Boolean(wrapHead || wrapFace)
  const Tag = showGroups || !split ? "button" : "div"
  const classes = [
    "occ-tile",
    `occ-tile--${size}`,
    showGroups ? "occ-tile--grouped" : "occ-tile--room",
    portraits.length ? "occ-tile--faces" : "",
    split ? "occ-tile--split" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const faceRow =
    portraits.length > 0 ? (
      <span className="occ-tile__faces">
        {portraits.map((face, index) => {
          const key = face.id || `${face.name}-${index}`
          const node = (
            <span
              className="occ-tile__face"
              title={face.name}
              aria-label={face.name || "Student"}
              tabIndex={wrapFace ? 0 : undefined}
            >
              {face.src ? (
                <img src={face.src} alt="" />
              ) : (
                <span className="occ-tile__face-mark">{initialsOf(face.name)}</span>
              )}
            </span>
          )
          return (
            <Fragment key={key}>{wrapFace ? wrapFace(face, node) : node}</Fragment>
          )
        })}
      </span>
    ) : null

  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      className={classes}
      data-tone={resolved}
      disabled={Tag === "button" ? disabled : undefined}
      aria-expanded={Tag === "button" ? expanded || undefined : undefined}
      aria-label={split ? undefined : aria}
      {...rest}
    >
      {showGroups ? (
        <>
          <span className="occ-tile__rail" aria-hidden="true">
            {Array.from({ length: RAIL_ROWS }, (_, i) => {
              const group = cluster[i]
              return (
                <span key={group?.id || `slot-${i}`} className="occ-tile__group">
                  {group ? (
                    <PipRow
                      used={group.used || 0}
                      total={group.total || 0}
                      variant={group.inactive ? "inactive" : undefined}
                    />
                  ) : null}
                </span>
              )
            })}
          </span>
          <span className="occ-tile__meta">
            <span className="occ-tile__label">{label}</span>
            <span className="occ-tile__count">{count}</span>
          </span>
        </>
      ) : (
        <>
          {wrapHead
            ? wrapHead(<span className="occ-tile__room-hit" tabIndex={0} aria-label={aria} />)
            : null}
          <span className="occ-tile__head">
            {showPips ? (
              <PipRow used={used} total={total} variant={resolved === "inactive" ? "inactive" : undefined} />
            ) : (
              <span className="occ-tile__count">{count}</span>
            )}
            <span className="occ-tile__label">{label}</span>
          </span>
          {faceRow}
        </>
      )}
    </Tag>
  )
}

export default OccupancyTile
