import { createElement } from "react"
import {
  Badge,
  Checkbox,
  EmptyState,
  Grid,
  Heading,
  HStack,
  Input,
  Progress,
  Surface,
  Tag,
  Text,
  VStack,
} from "hzero"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import {
  Building2,
  CalendarDays,
  Compass,
  MapPin,
  Mic2,
  Sparkles,
  Target,
  Users,
} from "lucide-react"
import {
  calculateTotalExpectedIncomeFromDetails,
  getProposalDetailsCompleteness,
  REGISTRATION_CATEGORIES,
} from "@/components/gymkhana/events-page/shared"
import { formatINR } from "@/utils/formatters"

const FUNDS_MIX = [
  { key: "registrationFee", label: "Registration", color: "var(--color-primary)" },
  { key: "gymkhanaFund", label: "Gymkhana", color: "var(--color-success)" },
  { key: "instituteSupport", label: "Institute", color: "var(--color-info)" },
  { key: "sponsorshipGrant", label: "Sponsorship", color: "var(--color-warning)" },
]

const APPROVAL_ITEMS = [
  { key: "conductProgrammeAsProposed", label: "Conduct as proposed" },
  { key: "chargingRegistrationFees", label: "Charge registration fees" },
  { key: "utilisationOfCollectedFees", label: "Use collected fees" },
  { key: "additionalInstitutionalSupport", label: "Institutional support" },
]

const kickerStyle = {
  fontSize: "var(--font-size-2xs)",
  fontWeight: "var(--font-weight-semibold)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
}

const placeholder = (value, fallback = "Still unwritten") =>
  String(value || "").trim() || fallback

const splitLines = (value) =>
  String(value || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

const ObjectiveRow = ({ index, text, compact = false }) => (
  <HStack gap={3} align="start">
    <Surface
      bg="brand"
      radius="full"
      style={{
        width: "var(--spacing-8)",
        height: "var(--spacing-8)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Text as="span" size="xs" weight="bold" color="primary">
        {index}
      </Text>
    </Surface>
    <Text
      as="div"
      size={compact ? "sm" : "md"}
      color={text ? "body" : "muted"}
      italic={!text}
      leading={1.55}
      style={{ paddingTop: "var(--spacing-1)" }}
    >
      {placeholder(text, "An objective waiting for a sentence")}
    </Text>
  </HStack>
)

const StoryCard = ({ kicker, body, tone = "primary" }) => (
  <Surface bg="secondary" padding={4} radius="card-sm" accent={tone}>
    <Text as="div" color="muted" style={kickerStyle}>
      {kicker}
    </Text>
    <Text
      as="div"
      size="sm"
      color={body ? "body" : "muted"}
      italic={!body}
      leading={1.65}
      style={{ marginTop: "var(--spacing-2)" }}
    >
      {placeholder(body, "This page is still blank")}
    </Text>
  </Surface>
)

const FactChip = ({ icon, label, value }) => (
  <Surface bg="secondary" padding={3} radius="card-sm">
    <HStack gap={2} align="center">
      {icon
        ? createElement(icon, {
            size: 14,
            style: { color: "var(--color-primary)", flexShrink: 0 },
            "aria-hidden": true,
          })
        : null}
      <Text as="span" color="muted" style={kickerStyle}>
        {label}
      </Text>
    </HStack>
    <Text
      as="div"
      size="sm"
      weight="semibold"
      color={value ? "heading" : "muted"}
      italic={!value}
      style={{ marginTop: "var(--spacing-1-5)" }}
    >
      {placeholder(value, "—")}
    </Text>
  </Surface>
)

const FundsMixBar = ({ details }) => {
  const sources = FUNDS_MIX.map((source) => ({
    ...source,
    amount: Number(details?.sourceOfFunds?.[source.key] || 0),
  }))
  const total = sources.reduce((sum, source) => sum + source.amount, 0)

  if (total <= 0) {
    return (
      <Text as="div" size="sm" color="muted" italic>
        The funding mix has not been sketched yet.
      </Text>
    )
  }

  return (
    <VStack gap={3}>
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "var(--spacing-3)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
          backgroundColor: "var(--color-bg-muted)",
        }}
      >
        {sources
          .filter((source) => source.amount > 0)
          .map((source) => (
            <div
              key={source.key}
              title={`${source.label}: ${formatINR(source.amount)}`}
              style={{
                width: `${(source.amount / total) * 100}%`,
                backgroundColor: source.color,
                height: "100%",
              }}
            />
          ))}
      </div>
      <Grid cols={{ base: 2, md: 4 }} gap={2}>
        {sources.map((source) => (
          <HStack key={source.key} gap={2} align="center">
            <span
              style={{
                width: "var(--spacing-2)",
                height: "var(--spacing-2)",
                borderRadius: "var(--radius-full)",
                backgroundColor: source.color,
                flexShrink: 0,
              }}
            />
            <VStack gap="none">
              <Text as="span" size="2xs" color="muted">
                {source.label}
              </Text>
              <Text as="span" size="xs" weight="semibold" color="heading">
                {formatINR(source.amount)}
              </Text>
            </VStack>
          </HStack>
        ))}
      </Grid>
    </VStack>
  )
}

export const ProposalDossier = ({
  details,
  variant = "full",
  action = null,
  completeness: completenessProp = null,
}) => {
  const completeness = completenessProp || getProposalDetailsCompleteness(details)
  const compact = variant === "compact"
  const programme = details?.programmeDetails || {}
  const unit = details?.organisingUnit || {}
  const story = details?.backgroundAndRationale || {}
  const objectives = [details?.objectives?.objective1, details?.objectives?.objective2, details?.objectives?.objective3]
  const guests = splitLines(details?.guestsDetails?.guestsNamesDesignationAffiliations)
  const income = calculateTotalExpectedIncomeFromDetails(details)
  const title = String(details?.programmeTitle || "").trim()
  const hasSpark = completeness.requiredFilled > 0 || Boolean(title)

  if (!hasSpark) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Every campus moment starts as a proposal"
        message="Name the programme, tell us why it matters, and this page will come alive — not as a form dump, as a case someone would actually read."
        action={action}
      />
    )
  }

  return (
    <VStack gap={compact ? 3 : 5}>
      <Surface
        bg="brand"
        padding={compact ? 4 : 5}
        radius="card"
        border="var(--border-1) solid var(--color-primary)"
      >
        <HStack gap={3} align="start" justify="between" wrap>
          <VStack gap={2} style={{ minWidth: 0, flex: 1 }}>
            <HStack gap={2} align="center">
              <Sparkles size={14} style={{ color: "var(--color-primary)" }} />
              <Text as="span" color="brand" style={kickerStyle}>
                Gymkhana · Programme proposal
              </Text>
            </HStack>
            <Heading
              as="h2"
              size={compact ? "xl" : "3xl"}
              color={title ? "heading" : "muted"}
              style={{ fontStyle: title ? "normal" : "italic" }}
            >
              {title || "Give this programme a name"}
            </Heading>
            <HStack gap={2} wrap>
              <Badge variant="primary" soft>
                {programme.programmeType || "Type unset"}
              </Badge>
              <Badge variant="info" soft>
                {programme.mode || "Mode unset"}
              </Badge>
              <Badge variant="outline">{unit.unitType || "Host unset"}</Badge>
            </HStack>
          </VStack>
          <VStack gap={1} align="end" style={{ minWidth: "var(--spacing-16)" }}>
            <Text as="span" size="xs" color="muted">
              Proposal
            </Text>
            <Text as="span" size="2xl" weight="bold" color="primary">
              {completeness.percent}%
            </Text>
            <Progress
              value={completeness.percent}
              size="sm"
              color={completeness.complete ? "success" : "primary"}
              aria-label="Proposal completeness"
            />
            <Text as="span" size="2xs" color={completeness.complete ? "success" : "muted"}>
              {completeness.complete
                ? "Ready to stand"
                : `${completeness.requiredFilled} of ${completeness.requiredTotal} required`}
            </Text>
          </VStack>
        </HStack>
      </Surface>

      <Grid cols={{ base: 2, md: 4 }} gap={2}>
        <FactChip icon={CalendarDays} label="When" value={programme.datesAndDuration} />
        <FactChip icon={MapPin} label="Where" value={programme.venue} />
        <FactChip
          icon={Users}
          label="Gathering"
          value={
            programme.expectedParticipants
              ? `${programme.expectedParticipants} expected`
              : ""
          }
        />
        <FactChip
          icon={Building2}
          label="Hosted by"
          value={unit.coordinatorNames || unit.unitType}
        />
      </Grid>

      {!compact && (unit.contactEmail || unit.contactMobile) ? (
        <HStack gap={3} wrap>
          {unit.contactMobile ? (
            <Text as="span" size="xs" color="muted">
              {unit.contactMobile}
            </Text>
          ) : null}
          {unit.contactEmail ? (
            <Text as="span" size="xs" color="muted">
              {unit.contactEmail}
            </Text>
          ) : null}
        </HStack>
      ) : null}

      <Grid cols={compact ? 1 : { base: 1, md: 3 }} gap={3}>
        <StoryCard kicker="Why now" body={story.contextRelevance} tone="primary" />
        {!compact ? (
          <StoryCard kicker="What changes" body={story.expectedImpact} tone="success" />
        ) : null}
        {!compact ? (
          <StoryCard kicker="Why the institute" body={story.alignmentWithObjectives} tone="info" />
        ) : null}
      </Grid>

      {(objectives.some(Boolean) || !compact) && (
        <Surface bg="secondary" padding={4} radius="card-sm">
          <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-3)" }}>
            <Target size={16} style={{ color: "var(--color-primary)" }} />
            <Text as="span" color="muted" style={kickerStyle}>
              What we set out to do
            </Text>
          </HStack>
          <VStack gap={3}>
            {(compact ? objectives.filter(Boolean).slice(0, 3) : objectives).map((text, index) =>
              compact && !text ? null : (
                <ObjectiveRow key={`objective-${index}`} index={index + 1} text={text} compact={compact} />
              )
            )}
            {compact && !objectives.some(Boolean) ? (
              <Text as="div" size="sm" color="muted" italic>
                Objectives will land here once they are written.
              </Text>
            ) : null}
          </VStack>
        </Surface>
      )}

      {(details?.programmeSchedule?.brief || !compact) && (
        <Surface bg="var(--color-bg-page)" padding={4} radius="card-sm">
          <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-2)" }}>
            <Compass size={16} style={{ color: "var(--color-primary)" }} />
            <Text as="span" color="muted" style={kickerStyle}>
              How the days unfold
            </Text>
          </HStack>
          <Text
            as="div"
            size="sm"
            color={details?.programmeSchedule?.brief ? "body" : "muted"}
            italic={!details?.programmeSchedule?.brief}
            leading={1.7}
            style={{ whiteSpace: "pre-wrap" }}
          >
            {placeholder(details?.programmeSchedule?.brief, "The schedule is still a sketch.")}
          </Text>
        </Surface>
      )}

      {(guests.length > 0 || Number(details?.guestsDetails?.tentativeNumberOfSpeakersGuests) > 0) && (
        <Surface bg="secondary" padding={4} radius="card-sm">
          <HStack gap={2} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
            <HStack gap={2} align="center">
              <Mic2 size={16} style={{ color: "var(--color-primary)" }} />
              <Text as="span" color="muted" style={kickerStyle}>
                Voices in the room
              </Text>
            </HStack>
            {details?.guestsDetails?.tentativeNumberOfSpeakersGuests ? (
              <Badge variant="info" soft>
                {details.guestsDetails.tentativeNumberOfSpeakersGuests} speakers / guests
              </Badge>
            ) : null}
          </HStack>
          {guests.length > 0 ? (
            <VStack gap={2}>
              {(compact ? guests.slice(0, 4) : guests).map((guest, index) => (
                <Surface key={`${index}-${guest}`} bg="brand" padding={2} radius="md">
                  <Text as="div" size="sm" color="body">
                    {guest}
                  </Text>
                </Surface>
              ))}
              {compact && guests.length > 4 ? (
                <Text as="span" size="xs" color="muted">
                  +{guests.length - 4} more in the full proposal
                </Text>
              ) : null}
            </VStack>
          ) : (
            <Text as="div" size="sm" color="muted" italic>
              Names will appear here once they are listed.
            </Text>
          )}
        </Surface>
      )}

      {!compact && (
        <Grid cols={{ base: 1, md: 3 }} gap={3}>
          {[
            {
              label: "Institute",
              value: details?.targetParticipants?.instituteFacultyStaffStudents,
            },
            { label: "Guests", value: details?.targetParticipants?.guestsInvitees },
            {
              label: "From outside",
              value: details?.targetParticipants?.externalVisitorsParticipants,
            },
          ].map((audience) => (
            <Surface key={audience.label} bg="secondary" padding={3} radius="card-sm">
              <Text as="div" color="muted" style={kickerStyle}>
                {audience.label}
              </Text>
              <Text
                as="div"
                size="sm"
                color={audience.value ? "body" : "muted"}
                italic={!audience.value}
                style={{ marginTop: "var(--spacing-2)" }}
              >
                {placeholder(audience.value, "Not specified")}
              </Text>
            </Surface>
          ))}
        </Grid>
      )}

      <Surface bg="secondary" padding={4} radius="card-sm">
        <HStack gap={2} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
          <Text as="span" color="muted" style={kickerStyle}>
            How it is funded
          </Text>
          <Text as="span" size="sm" weight="bold" color="heading">
            {formatINR(income)} in
          </Text>
        </HStack>
        <FundsMixBar details={details} />
      </Surface>

      {!compact && (
        <VStack gap={3}>
          <HStack gap={2} wrap>
            {APPROVAL_ITEMS.filter((item) => details?.approvalRequested?.[item.key]).map((item) => (
              <Tag key={item.key} color="primary">
                {item.label}
              </Tag>
            ))}
            {APPROVAL_ITEMS.every((item) => !details?.approvalRequested?.[item.key]) ? (
              <Text as="span" size="sm" color="muted" italic>
                No mandate selected yet.
              </Text>
            ) : null}
          </HStack>
          {details?.approvalRequested?.additionalInstitutionalSupport &&
          details?.approvalRequested?.additionalInstitutionalSupportDetails ? (
            <Text as="div" size="sm" color="body">
              {details.approvalRequested.additionalInstitutionalSupportDetails}
            </Text>
          ) : null}
          <Grid cols={{ base: 1, md: 2 }} gap={2}>
            {REGISTRATION_CATEGORIES.filter((category) => {
              const row = details?.registrationDetails?.[category.key] || {}
              return Number(row.registrationFee || 0) > 0 || Number(row.accommodationCharges || 0) > 0
            }).map((category) => {
              const row = details.registrationDetails[category.key]
              return (
                <Surface key={category.key} bg="var(--color-bg-page)" padding={3} radius="md">
                  <Text as="div" size="xs" weight="semibold" color="heading">
                    {category.label}
                  </Text>
                  <Text as="div" size="xs" color="muted">
                    Fee {formatINR(row.registrationFee)}
                    {Number(row.accommodationCharges || 0) > 0
                      ? ` · Stay ${formatINR(row.accommodationCharges)}`
                      : ""}
                  </Text>
                </Surface>
              )
            })}
          </Grid>
        </VStack>
      )}

      {action ? (
        <HStack justify="end">{action}</HStack>
      ) : null}
    </VStack>
  )
}

const LedgerTile = ({ kicker, value, hint, tone = "secondary", children }) => (
  <Surface bg={tone} padding={4} radius="card-sm">
    <Text as="div" color="muted" style={kickerStyle}>
      {kicker}
    </Text>
    {children || (
      <Text as="div" size="xl" weight="bold" color="heading" style={{ marginTop: "var(--spacing-1-5)" }}>
        {value}
      </Text>
    )}
    {hint ? (
      <Text as="div" size="xs" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
        {hint}
      </Text>
    ) : null}
  </Surface>
)

export const ProposalLedger = ({
  income,
  expenditure,
  onExpenditureChange,
  registrationFee,
  accommodationRequired,
  onAccommodationChange,
  deflection = 0,
  estimatedBudget,
  editable = false,
  idPrefix = "proposal",
}) => (
  <VStack gap={3}>
    <Grid cols={{ base: 1, md: 3 }} gap={3}>
      <LedgerTile
        kicker="Coming in"
        value={formatINR(income)}
        hint="Pulled from the proposal's funding mix"
        tone="success"
      />
      <LedgerTile
        kicker="Going out"
        hint={editable ? "What this programme will actually cost" : "Locked while you are reading"}
        tone="brand"
      >
        <div style={{ marginTop: "var(--spacing-2)" }}>
          <Input
            id={`${idPrefix}-total-expenditure`}
            type="number"
            min={0}
            value={expenditure}
            onChange={(event) => onExpenditureChange?.(event.target.value)}
            placeholder="₹"
            disabled={!editable}
            aria-label="Total expenditure"
          />
        </div>
      </LedgerTile>
      <LedgerTile
        kicker="Against the calendar"
        value={formatINR(deflection)}
        hint={`Event budget ${formatINR(estimatedBudget)}`}
        tone={Number(deflection) > 0 ? "danger" : "secondary"}
      />
    </Grid>
    <HStack gap={4} align="center" justify="between" wrap>
      <Text as="span" size="sm" color="muted">
        Registration in the mix:{" "}
        <Text as="strong" color="heading">
          {formatINR(registrationFee)}
        </Text>
      </Text>
      <Checkbox
        checked={Boolean(accommodationRequired)}
        onChange={(event) => onAccommodationChange?.(event.target.checked)}
        label="Rooms needed for guests"
        disabled={!editable}
      />
    </HStack>
  </VStack>
)

export const ProposalPapers = ({
  proposalUrl,
  onProposalUrl,
  onUploadProposal,
  guestUrl,
  onGuestUrl,
  onUploadGuest,
  disabled = false,
}) => (
  <Grid cols={{ base: 1, md: 2 }} gap={3}>
    <Surface bg="secondary" padding={4} radius="card-sm">
      <Text as="div" color="muted" style={{ ...kickerStyle, marginBottom: "var(--spacing-3)" }}>
        The paper the institute keeps
      </Text>
      <PdfUploadField
        label="Proposal PDF"
        value={proposalUrl}
        onChange={onProposalUrl}
        onUpload={onUploadProposal}
        disabled={disabled}
        uploadedText="Signed proposal attached"
        viewerTitle="Proposal Document"
        viewerSubtitle="The paper that travels with the proposal"
        downloadFileName="proposal-document.pdf"
      />
    </Surface>
    <Surface bg="secondary" padding={4} radius="card-sm">
      <Text as="div" color="muted" style={{ ...kickerStyle, marginBottom: "var(--spacing-3)" }}>
        The guest we invited
      </Text>
      <PdfUploadField
        label="Chief Guest PDF"
        value={guestUrl}
        onChange={onGuestUrl}
        onUpload={onUploadGuest}
        disabled={disabled}
        uploadedText="Guest paper attached"
        viewerTitle="Chief Guest Document"
        viewerSubtitle="Invitation, bio, or confirmation"
        downloadFileName="chief-guest-document.pdf"
      />
    </Surface>
  </Grid>
)
