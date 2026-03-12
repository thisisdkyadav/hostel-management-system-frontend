import { createElement } from "react"
import { Input } from "czero/react"
import { Alert } from "@/components/ui/feedback"
import { Label, Select, Textarea } from "@/components/ui/form"

export const footerTabStyles = {
  tabsBar: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--color-bg-tertiary)",
    borderTop: "var(--border-1) solid var(--color-border-primary)",
    padding: 0,
    flexShrink: 0,
    minHeight: "42px",
    overflowX: "auto",
    overflowY: "hidden",
  },
  tabsList: {
    display: "flex",
    alignItems: "stretch",
    height: "100%",
    gap: 0,
  },
  tab: {
    display: "flex",
    alignItems: "center",
    padding: "0 var(--spacing-4)",
    minHeight: "42px",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-muted)",
    backgroundColor: "transparent",
    border: "none",
    borderRight: "var(--border-1) solid var(--color-border-primary)",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "var(--transition-colors)",
    minWidth: "100px",
    justifyContent: "center",
    gap: "var(--spacing-2)",
  },
  tabActive: {
    backgroundColor: "var(--color-bg-primary)",
    color: "var(--color-primary)",
    borderBottom: "var(--border-2) solid var(--color-primary)",
    fontWeight: "var(--font-weight-semibold)",
  },
  addTab: {
    backgroundColor: "var(--color-primary-bg)",
    color: "var(--color-primary)",
  },
}

export const formLabelStyles = {
  display: "block",
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-muted)",
  marginBottom: "var(--spacing-1)",
  textTransform: "uppercase",
  letterSpacing: "0.3px",
}

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
  paddingTop: "var(--spacing-2)",
  marginBottom: "var(--spacing-2)",
}

export const sectionLabelStyle = {
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
}

const sectionDividerStyle = {
  flex: 1,
  height: 1,
  backgroundColor: "var(--color-border-primary)",
}

export const infoBoxStyle = {
  padding: "var(--spacing-3)",
  borderRadius: "var(--radius-card-sm)",
  backgroundColor: "var(--color-bg-secondary)",
}

const panelStyle = {
  padding: "var(--spacing-4)",
  borderRadius: "var(--radius-card-sm)",
  border: "var(--border-1) solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-primary)",
}

const panelHeaderStyle = {
  fontSize: "var(--font-size-sm)",
  fontWeight: "var(--font-weight-semibold)",
  color: "var(--color-text-primary)",
  marginBottom: "var(--spacing-3)",
  paddingBottom: "var(--spacing-2)",
  borderBottom: "var(--border-1) solid var(--color-border-primary)",
  display: "flex",
  alignItems: "center",
  gap: "var(--spacing-2)",
}

const panelAccentStyle = {
  ...panelStyle,
  backgroundColor: "var(--color-bg-secondary)",
  border: "none",
}

export const eventDetailMetaChipStyles = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  fontSize: "var(--font-size-xs)",
  fontWeight: "var(--font-weight-medium)",
  color: "var(--color-text-muted)",
  padding: "2px 8px",
  borderRadius: "var(--radius-badge)",
  border: "var(--border-1) solid var(--color-border-primary)",
  backgroundColor: "var(--color-bg-secondary)",
}

export const Panel = ({ title, icon: Icon, accent = false, children }) => (
  <div style={accent ? panelAccentStyle : panelStyle}>
    {title && (
      <div style={panelHeaderStyle}>
        {Icon && <Icon size={16} style={{ color: "var(--color-primary)" }} />}
        <span>{title}</span>
      </div>
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
      {children}
    </div>
  </div>
)

export const FormField = ({ label, htmlFor, required = false, children }) => (
  <div>
    <Label htmlFor={htmlFor} required={required} size="sm" style={formLabelStyles}>
      {label}
    </Label>
    {children}
  </div>
)

export const SectionHeader = ({ children }) => (
  <div style={sectionHeaderStyle}>
    <span style={sectionLabelStyle}>{children}</span>
    <div style={sectionDividerStyle} />
  </div>
)

export const EventDetailSectionCard = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  children,
  headerAction = null,
}) => (
  <div
    style={{
      background: "var(--color-bg-primary)",
      borderRadius: "var(--radius-card-sm)",
      border: "var(--border-1) solid var(--color-border-primary)",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--spacing-2)",
        padding: "var(--spacing-2) var(--spacing-3)",
        borderBottom: "var(--border-1) solid var(--color-border-primary)",
        backgroundColor: "var(--color-bg-secondary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: "var(--radius-sm)",
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            color: accentColor,
          }}
        >
          {createElement(Icon, { size: 12 })}
        </span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-text-heading)",
            textTransform: "uppercase",
            letterSpacing: "0.3px",
          }}
        >
          {title}
        </span>
      </div>
      {headerAction}
    </div>
    <div style={{ padding: "var(--spacing-3)" }}>{children}</div>
  </div>
)

export const EventDetailInfoRow = ({ label, value, valueColor }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--spacing-2)",
      padding: "var(--spacing-1) 0",
    }}
  >
    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
      {label}
    </span>
    <span
      style={{
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-medium)",
        color: valueColor || "var(--color-text-body)",
        textAlign: "right",
      }}
    >
      {value}
    </span>
  </div>
)

export const DateOverlapSummary = ({
  eventForm,
  isDateRangeOrdered,
  overlapCheckInProgressForCurrentDates,
  dateOverlapInfo,
  overlapCheckKey,
  retryDateOverlapCheck,
  overlapCheckCompletedForCurrentDates,
  formatDateRange,
}) => (
  <>
    {eventForm.startDate && eventForm.endDate && !isDateRangeOrdered && (
      <Alert type="error">End date cannot be before start date.</Alert>
    )}
    {overlapCheckInProgressForCurrentDates && (
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-info)" }}>
        Checking overlap...
      </span>
    )}
    {dateOverlapInfo.status === "error" && overlapCheckKey && (
      <Alert type="error">
        {dateOverlapInfo.errorMessage}{" "}
        <button
          type="button"
          onClick={retryDateOverlapCheck}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-danger)",
            cursor: "pointer",
            textDecoration: "underline",
            padding: 0,
          }}
        >
          Retry
        </button>
      </Alert>
    )}
    {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
      <Alert type="warning">
        Overlaps with {dateOverlapInfo.overlaps.length} event(s).
      </Alert>
    )}
    {overlapCheckCompletedForCurrentDates && !dateOverlapInfo.hasOverlap && (
      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-success)" }}>
        ✓ No overlaps
      </span>
    )}
    {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
      <div
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-text-muted)",
          padding: "var(--spacing-2)",
          borderRadius: "var(--radius-card-sm)",
          backgroundColor: "var(--color-bg-secondary)",
        }}
      >
        {dateOverlapInfo.overlaps.slice(0, 3).map((overlap, index) => {
          const conflicting = overlap.eventB || overlap.eventA
          return (
            <span
              key={`${conflicting?.eventId || conflicting?.title}-${index}`}
              style={{ marginRight: "var(--spacing-2)" }}
            >
              • {conflicting?.title || "Event"} (
              {formatDateRange(conflicting?.startDate, conflicting?.endDate)})
            </span>
          )
        })}
      </div>
    )}
  </>
)

export const EventFormFields = ({
  eventForm,
  handleEventFormChange,
  categoryOptions,
  isDateRangeOrdered,
  overlapCheckInProgressForCurrentDates,
  dateOverlapInfo,
  overlapCheckKey,
  retryDateOverlapCheck,
  overlapCheckCompletedForCurrentDates,
  formatDateRange,
  showAmendmentReason = false,
  amendmentReason = "",
  setAmendmentReason = null,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
    {showAmendmentReason && (
      <span
        style={{
          fontSize: "var(--font-size-xs)",
          color: "var(--color-warning)",
          padding: "var(--spacing-1) var(--spacing-2)",
          backgroundColor: "var(--color-warning-bg)",
          borderRadius: "var(--radius-card-sm)",
          display: "inline-block",
        }}
      >
        Calendar locked. Amendment will be reviewed by Admin.
      </span>
    )}
    <div style={{ display: "grid", gap: "var(--spacing-3)", gridTemplateColumns: "2fr 1fr" }}>
      <div>
        <label
          style={formLabelStyles}
          htmlFor={showAmendmentReason ? "amendmentEventTitle" : "eventTitle"}
        >
          Title
        </label>
        <Input
          id={showAmendmentReason ? "amendmentEventTitle" : "eventTitle"}
          name="title"
          placeholder="Event title"
          value={eventForm.title}
          onChange={(event) => handleEventFormChange("title", event.target.value)}
          required
        />
      </div>
      <div>
        <label
          style={formLabelStyles}
          htmlFor={showAmendmentReason ? "amendmentEventCategory" : "eventCategory"}
        >
          Category
        </label>
        <Select
          id={showAmendmentReason ? "amendmentEventCategory" : "eventCategory"}
          name="category"
          value={eventForm.category}
          onChange={(event) => handleEventFormChange("category", event.target.value)}
          options={categoryOptions}
        />
      </div>
    </div>
    <div
      style={{
        display: "grid",
        gap: "var(--spacing-3)",
        gridTemplateColumns: "repeat(3, 1fr)",
      }}
    >
      <div>
        <label
          style={formLabelStyles}
          htmlFor={showAmendmentReason ? "amendmentStartDate" : "eventStartDate"}
        >
          Start
        </label>
        <Input
          id={showAmendmentReason ? "amendmentStartDate" : "eventStartDate"}
          name="startDate"
          type="date"
          value={eventForm.startDate}
          onChange={(event) => handleEventFormChange("startDate", event.target.value)}
          required
        />
      </div>
      <div>
        <label
          style={formLabelStyles}
          htmlFor={showAmendmentReason ? "amendmentEndDate" : "eventEndDate"}
        >
          End
        </label>
        <Input
          id={showAmendmentReason ? "amendmentEndDate" : "eventEndDate"}
          name="endDate"
          type="date"
          value={eventForm.endDate}
          onChange={(event) => handleEventFormChange("endDate", event.target.value)}
          required
        />
      </div>
      <div>
        <label
          style={formLabelStyles}
          htmlFor={showAmendmentReason ? "amendmentEstimatedBudget" : "eventEstimatedBudget"}
        >
          Budget (₹)
        </label>
        <Input
          id={showAmendmentReason ? "amendmentEstimatedBudget" : "eventEstimatedBudget"}
          name="estimatedBudget"
          type="number"
          placeholder="₹"
          value={eventForm.estimatedBudget}
          onChange={(event) => handleEventFormChange("estimatedBudget", event.target.value)}
        />
      </div>
    </div>
    <DateOverlapSummary
      eventForm={eventForm}
      isDateRangeOrdered={isDateRangeOrdered}
      overlapCheckInProgressForCurrentDates={overlapCheckInProgressForCurrentDates}
      dateOverlapInfo={dateOverlapInfo}
      overlapCheckKey={overlapCheckKey}
      retryDateOverlapCheck={retryDateOverlapCheck}
      overlapCheckCompletedForCurrentDates={overlapCheckCompletedForCurrentDates}
      formatDateRange={formatDateRange}
    />
    <div>
      <label
        style={formLabelStyles}
        htmlFor={showAmendmentReason ? "amendmentDescription" : "eventDescription"}
      >
        Description
      </label>
      <Textarea
        id={showAmendmentReason ? "amendmentDescription" : "eventDescription"}
        name="description"
        placeholder="Event description"
        value={eventForm.description}
        onChange={(event) => handleEventFormChange("description", event.target.value)}
        rows={2}
      />
    </div>
    {showAmendmentReason && setAmendmentReason && (
      <div>
        <label style={formLabelStyles} htmlFor="amendmentReason">
          Reason for Amendment *
        </label>
        <Textarea
          id="amendmentReason"
          name="reason"
          placeholder="Min 10 characters"
          value={amendmentReason}
          onChange={(event) => setAmendmentReason(event.target.value)}
          rows={2}
          required
        />
      </div>
    )}
  </div>
)
