import { DetailSection, InfoRow, Input, Text as HzText } from "hzero"
import { Alert } from "@/components/ui/feedback"
import { Label, Select, Textarea } from "@/components/ui/form"
import { Grid, HStack, Surface, Text, VStack } from "@/components/ui"

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

/**
 * A titled box of rows. `accent` used to mean "tinted rather than bordered";
 * DetailSection's panel is tinted either way, so the flag now only chooses how
 * strongly — which is the distinction the callers were reaching for.
 */
export const Panel = ({ title, icon: Icon, accent = false, children }) => (
  <DetailSection title={title} icon={Icon} tone={accent ? "primary" : "neutral"}>
    {children}
  </DetailSection>
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

/**
 * The accent arrives as a CSS colour because this predates hzero owning the
 * palette. Mapped to a tone rather than passed through: a section that can be
 * any colour is a section with no colour vocabulary.
 */
const TONE_FOR_ACCENT = {
  "var(--color-primary)": "primary",
  "var(--color-info)": "info",
  "var(--color-success)": "success",
  "var(--color-warning)": "warning",
  "var(--color-danger)": "danger",
  "var(--color-text-secondary)": "neutral",
}

export const EventDetailSectionCard = ({
  icon: Icon,
  title,
  accentColor = "var(--color-primary)",
  children,
  headerAction = null,
}) => (
  <DetailSection
    icon={Icon}
    title={title}
    tone={TONE_FOR_ACCENT[accentColor] || "neutral"}
    actions={headerAction}
  >
    {children}
  </DetailSection>
)

/**
 * hzero's InfoRow takes no styling props on purpose, so a caller that wants a
 * coloured value colours the value rather than the row.
 */
export const EventDetailInfoRow = ({ label, value, valueColor }) => (
  <InfoRow label={label} value={valueColor ? <HzText as="span" color={valueColor}>{value}</HzText> : value} />
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
      <Text as="span" size="xs" color="info">
        Checking overlap...
      </Text>
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
      <Text as="span" size="xs" color="success">
        ✓ No overlaps
      </Text>
    )}
    {overlapCheckCompletedForCurrentDates && dateOverlapInfo.hasOverlap && (
      <Surface bg="secondary" padding={2} radius="card-sm" color="muted" size="xs">
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
      </Surface>
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
  <VStack gap={3}>
    {showAmendmentReason && (
      <Surface as="span" bg="warning" padding="var(--spacing-1) var(--spacing-2)" radius="card-sm" color="warning" size="xs" style={{ display: "inline-block" }}>
        Calendar locked. Amendment will be reviewed by Admin.
      </Surface>
    )}
    <Grid cols="2fr 1fr" gap={3}>
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
    </Grid>
    <Grid cols={3} gap={3}>
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
    </Grid>
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
  </VStack>
)
