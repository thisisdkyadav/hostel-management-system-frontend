import { Button, Surface } from "hzero"
import { REVIEW_SECTION_META, formatScoreTypeLabel } from "../scoring"
import { getPointBadgeStyle } from "../styles"
import { resolvePrimaryProof } from "../documents"
import { ProofActionButton } from "./ProofActionButton"
import { PorDetailCard } from "./PorDetailCard"
import { FileText, MoreHorizontal } from "lucide-react"

export const ItemsReviewTable = ({ title, items = [], onViewPor, onViewPdf, onOpenMore }) => {
  if (!items.length) return null

  const meta = REVIEW_SECTION_META[title] || { icon: FileText, accent: "var(--color-primary)" }
  const Icon = meta.icon
  const accentColor = meta.accent

  return (
    <PorDetailCard icon={Icon} title={title} accentColor={accentColor} bodyStyle={{ padding: 0, gap: 0 }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead>
            <tr style={{ backgroundColor: "var(--color-bg-secondary)", borderBottom: "1px solid var(--color-border-primary)" }}>
              {["Title", "Type", "Points", "Proof", ""].map((heading) => (
                <th
                  key={heading || "more"}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    fontSize: "var(--font-size-xs)",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    fontWeight: "var(--font-weight-semibold)",
                    letterSpacing: "0.05em",
                    ...(heading === "Proof" ? { width: 140, minWidth: 140 } : {}),
                    ...(heading === "" ? { width: 96, minWidth: 96, textAlign: "right" } : {}),
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${title}-${index}`} className="por-review-table-row" style={{ borderBottom: index < items.length - 1 ? "1px solid var(--color-border-light)" : "none" }}>
                <Surface as="td" padding="12px 16px" color="primary" size="sm" weight="medium">{item.title}</Surface>
                <Surface as="td" padding="12px 16px" color="body" size="sm">{formatScoreTypeLabel(item.scoreType)}</Surface>
                <td style={{ padding: "12px 16px" }}>
                  <span style={getPointBadgeStyle(item.calculatedPoints || 0)}>
                    +{item.calculatedPoints || 0}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", width: 140, minWidth: 140 }}>
                  <ProofActionButton proof={resolvePrimaryProof(item.proofs)} onViewPor={onViewPor} onViewPdf={onViewPdf} />
                </td>
                <Surface as="td" padding="12px 16px" align="right">
                  <Button
                    size="sm"
                    onClick={() =>
                      onOpenMore?.({
                        sectionTitle: title,
                        sectionKey: meta.sectionKey,
                        options: meta.options || [],
                        item,
                        itemIndex: index,
                      })
                    }
                  >
                    <MoreHorizontal size={14} /> More
                  </Button>
                </Surface>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PorDetailCard>
  )
}

