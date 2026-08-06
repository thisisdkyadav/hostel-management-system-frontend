/**
 * The labelled card and row the POR detail views are built from.
 */

export const PorDetailCard = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  children,
  headerAction = null,
}) => (
  <div className="por-detail-card">
    <div className="por-detail-card-header">
      <div className="por-detail-card-header-left">
        <span
          className="por-detail-card-icon-wrapper"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: accentColor,
          }}
        >
          {Icon && <Icon size={14} />}
        </span>
        <h4 className="por-detail-card-title">{title}</h4>
      </div>
      {headerAction}
    </div>
    <div className="por-detail-card-body">{children}</div>
  </div>
)

export const PorDetailInfoRow = ({ label, value }) => (
  <div className="por-detail-info-row">
    <span className="por-detail-info-label">{label}</span>
    <span className="por-detail-info-value">{value}</span>
  </div>
)
