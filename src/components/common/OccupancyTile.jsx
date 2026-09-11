import { Fragment } from "react"
import "./OccupancyTile.css"

const PIP_CAP = 8
const RAIL_ROWS = 6
const SPLIT_LEFT = 3
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

const Pip = ({ on, variant }) => (
  <svg
    className="occ-tile__pip"
    data-on={variant === "inactive" ? undefined : on ? "true" : "false"}
    data-variant={variant || undefined}
    viewBox="0 0 10 10"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
    focusable="false"
  >
    <circle cx="5" cy="5" r="4.5" />
  </svg>
)

const PipRow = ({ used, total, variant }) => (
  <span className="occ-tile__pips" aria-hidden="true">
    {Array.from({ length: Math.max(0, total) }, (_, i) => (
      <Pip key={i} on={i < used} variant={variant} />
    ))}
  </span>
)

const Face = ({ face, tabIndex }) => (
  <span className="occ-tile__face" title={face.name} aria-label={face.name || "Student"} tabIndex={tabIndex}>
    {face.src ? <img src={face.src} alt="" /> : <span className="occ-tile__face-mark">{initialsOf(face.name)}</span>}
  </span>
)

/**
 * Square occupancy tile. Generic on purpose: any labelled space with a
 * used/total count can render through this. Pass `groups` for a left rail of
 * pip rows (one cluster per row, six slots) with the label and count on the right.
 * `layout="split-bottom"` centers the label and splits room pips across the
 * bottom (first three left, the rest right).
 * Room tiles are a fixed plate: number, up to three portraits, and a
 * vertical bed-pip rail. `wrapHead` / `wrapFace` let a parent attach hover
 * peeks without nesting interactive content in a button.
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
  layout = "rail",
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
  const splitBottom = layout === "split-bottom" && showGroups
  const Tag = showGroups || !split ? "button" : "div"
  const classes = [
    "occ-tile",
    `occ-tile--${size}`,
    showGroups ? "occ-tile--grouped" : "occ-tile--room",
    splitBottom ? "occ-tile--split-bottom" : "",
    split ? "occ-tile--split" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  const renderGroup = (group, index) => (
    <span key={group?.id || `slot-${index}`} className="occ-tile__group">
      {group ? (
        <PipRow
          used={group.used || 0}
          total={group.total || 0}
          variant={group.inactive ? "inactive" : undefined}
        />
      ) : null}
    </span>
  )

  const faceRow = (
    <span className="occ-tile__faces">
      {portraits.map((face, index) => {
        const key = face.id || `${face.name}-${index}`
        const node = <Face face={face} tabIndex={wrapFace ? 0 : undefined} />
        return <Fragment key={key}>{wrapFace ? wrapFace(face, node) : node}</Fragment>
      })}
    </span>
  )

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
        splitBottom ? (
          <>
            <span className="occ-tile__meta">
              <span className="occ-tile__label">{label}</span>
              <span className="occ-tile__count">{count}</span>
            </span>
            <span className="occ-tile__deck" aria-hidden="true">
              <span className="occ-tile__deck-col">
                {cluster.slice(0, SPLIT_LEFT).map((group, index) => renderGroup(group, index))}
              </span>
              <span className="occ-tile__deck-rule" />
              <span className="occ-tile__deck-col occ-tile__deck-col--end">
                {cluster.slice(SPLIT_LEFT, RAIL_ROWS).map((group, index) => renderGroup(group, index + SPLIT_LEFT))}
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="occ-tile__rail" aria-hidden="true">
              {Array.from({ length: RAIL_ROWS }, (_, i) => renderGroup(cluster[i], i))}
            </span>
            <span className="occ-tile__meta">
              <span className="occ-tile__label">{label}</span>
              <span className="occ-tile__count">{count}</span>
            </span>
          </>
        )
      ) : (
        <>
          {wrapHead
            ? wrapHead(<span className="occ-tile__room-hit" tabIndex={0} aria-label={aria} />)
            : null}
          <span className="occ-tile__label">{label}</span>
          {faceRow}
          {total <= PIP_CAP ? (
            <PipRow used={used} total={total} variant={resolved === "inactive" ? "inactive" : undefined} />
          ) : (
            <span className="occ-tile__count">{count}</span>
          )}
        </>
      )}
    </Tag>
  )
}

export default OccupancyTile
