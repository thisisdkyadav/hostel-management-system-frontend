import { capacityToneColor } from "./diningPeriodHelpers"
import { Text } from "@/components/ui"

/**
 * Token-driven capacity utilisation bar.
 * Shows how many of `total` seats are filled (`allocated`), with a colour that
 * shifts from primary → warning → danger as it approaches full.
 */
const CapacityBar = ({ allocated = 0, total = 0, size = "md", showLabel = true, label }) => {
  const safeTotal = Math.max(0, Number(total) || 0)
  const safeAllocated = Math.max(0, Number(allocated) || 0)
  const percent = safeTotal > 0 ? Math.min(100, Math.round((safeAllocated / safeTotal) * 100)) : 0
  const fillColor = capacityToneColor(safeTotal > 0 ? (safeAllocated / safeTotal) * 100 : 0)
  const trackHeight = size === "sm" ? "6px" : "8px"

  return (
    <div style={{ width: "100%" }}>
      {showLabel && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "var(--spacing-1-5)",
          }}
        >
          <Text as="span" size="xs" color="muted" weight="medium">
            {label || "Capacity"}
          </Text>
          <Text as="span" size="xs" color="secondary" weight="semibold">
            {safeAllocated}/{safeTotal}
            {safeTotal > 0 ? ` · ${percent}%` : ""}
          </Text>
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: trackHeight,
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--color-bg-hover)",
          overflow: "hidden",
        }}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label || "Capacity"} ${percent}% full`}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            backgroundColor: fillColor,
            borderRadius: "var(--radius-full)",
            transition: "width var(--transition-slow), background-color var(--transition-base)",
          }}
        />
      </div>
    </div>
  )
}

export default CapacityBar
