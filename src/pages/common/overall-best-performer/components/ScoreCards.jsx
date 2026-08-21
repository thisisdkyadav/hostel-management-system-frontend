import { InfoRow, Panel, Text } from "hzero"
import { SECTION_MAX_POINTS } from "../scoring"

export const SummaryMetric = ({ icon: Icon, label, value }) => {
  const getMetricSettings = (lbl) => {
    const l = String(lbl).toLowerCase()
    if (l.includes("current") || l.includes("calculated")) {
      return {
        bg: "linear-gradient(135deg, var(--color-primary-bg) 0%, rgba(91, 159, 232, 0.04) 100%)",
        border: "var(--color-primary-bg)",
        text: "var(--color-primary)"
      }
    }
    if (l.includes("final")) {
      return {
        bg: "linear-gradient(135deg, rgba(34, 197, 94, 0.08) 0%, rgba(34, 197, 94, 0.02) 100%)",
        border: "rgba(34, 197, 94, 0.15)",
        text: "var(--color-success)"
      }
    }
    return {
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)",
      border: "rgba(245, 158, 11, 0.15)",
      text: "var(--color-warning)"
    }
  }

  const activeTone = getMetricSettings(label)

  return (
    <div style={{
      background: activeTone.bg,
      border: `1px solid ${activeTone.border}`,
      borderRadius: "var(--radius-card-sm)",
      padding: "var(--spacing-4)",
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-3)",
      boxShadow: "var(--shadow-sm)",
      transition: "all var(--transition-normal) ease",
    }} className="summary-metric-hover">
      <div style={{
        width: 44,
        height: 44,
        borderRadius: "var(--radius-md)",
        backgroundColor: `color-mix(in srgb, ${activeTone.text} 12%, transparent)`,
        color: activeTone.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0
      }}>
        {Icon && <Icon size={20} />}
      </div>
      <div>
        <Text as="div" size="xs" color="muted" weight="semibold" style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label}
        </Text>
        <Text as="div" size="xl" weight="bold" color="primary" style={{ marginTop: "2px" }}>
          {value}
        </Text>
      </div>
    </div>
  )
}

export const ScoreBreakdownCard = ({ breakdown }) => {
  const rows = [
    ["Coursework", breakdown?.coursework || 0, SECTION_MAX_POINTS.coursework],
    ["Project / Thesis", breakdown?.projectThesis || 0, SECTION_MAX_POINTS.projectThesis],
    ["Position of Responsibility", breakdown?.responsibilities || 0, SECTION_MAX_POINTS.responsibilities],
    ["Awards & Extracurricular", breakdown?.awards || 0, SECTION_MAX_POINTS.awards],
    ["Cultural", breakdown?.cultural || 0, SECTION_MAX_POINTS.cultural],
    ["Science & Technology", breakdown?.scienceTechnology || 0, SECTION_MAX_POINTS.scienceTechnology],
    ["Games & Sports", breakdown?.gamesSports || 0, SECTION_MAX_POINTS.gamesSports],
    ["Co-curricular", breakdown?.coCurricular || 0, SECTION_MAX_POINTS.coCurricular],
  ]

  return (
    <Panel title="Score Breakdown">
      <Panel.Body>
        {rows.map(([label, value, max]) => {
          const pct = Math.min(100, Math.max(0, (value / max) * 100))
          return (
            <div key={label} className="por-scorecard-row">
              <div className="por-scorecard-header">
                <span className="por-scorecard-label">{label}</span>
                <span className="por-scorecard-value-container">
                  {value} <span className="por-scorecard-max">/ {max}</span>
                </span>
              </div>
              <div className="por-scorecard-progress-bg">
                <div
                  className="por-scorecard-progress-bar"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 100 ? "var(--color-success)" : "var(--color-primary)",
                  }}
                />
              </div>
            </div>
          )
        })}
        <InfoRow label="Total Score" value={breakdown?.total || 0} style={{ marginTop: "var(--spacing-4)" }} />
      </Panel.Body>
    </Panel>
  )
}

