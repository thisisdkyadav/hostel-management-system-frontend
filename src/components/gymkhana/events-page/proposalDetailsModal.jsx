import { createElement, useEffect, useMemo, useRef, useState } from "react"
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  FileText,
  IndianRupee,
  Target,
  Users,
} from "lucide-react"
import {
  Alert,
  Button,
  Checkbox,
  DetailSection,
  Field,
  Grid,
  HStack,
  Input,
  Modal,
  Progress,
  Select,
  Table,
  Tabs,
  Text,
  Textarea,
  VStack,
} from "hzero"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { ProposalDossier } from "@/components/gymkhana/events-page/proposalDossier"
import {
  getProposalDetailsCompleteness,
  PROPOSAL_DETAIL_CHAPTERS,
} from "@/components/gymkhana/events-page/shared"

const CHAPTER_ICONS = {
  identity: CalendarDays,
  story: FileText,
  people: Users,
  schedule: Clock,
  funds: IndianRupee,
  mandate: ClipboardCheck,
}

const ChapterIntro = ({ chapter }) => {
  const Icon = CHAPTER_ICONS[chapter.id] || FileText
  return (
    <HStack gap={3} align="start">
      <SurfaceIcon icon={Icon} />
      <VStack gap={1} style={{ minWidth: 0 }}>
        <Text
          as="div"
          size="2xs"
          weight="semibold"
          color="brand"
          style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          {chapter.label}
        </Text>
        <Text as="div" size="lg" weight="semibold" color="heading">
          {chapter.headline}
        </Text>
        <Text as="div" size="sm" color="muted" leading={1.55}>
          {chapter.prompt}
        </Text>
      </VStack>
    </HStack>
  )
}

const SurfaceIcon = ({ icon }) => (
  <div
    style={{
      width: "var(--spacing-10)",
      height: "var(--spacing-10)",
      borderRadius: "var(--radius-lg)",
      backgroundColor: "var(--color-primary-bg)",
      color: "var(--color-primary)",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    {icon ? createElement(icon, { size: 18, "aria-hidden": true }) : null}
  </div>
)

const IdentityChapter = ({
  proposalForm,
  canEditProposalForm,
  handleProposalDetailsChange,
  programmeTypeOptions,
  programmeModeOptions,
  organisingUnitOptions,
}) => (
  <VStack gap={4}>
    <DetailSection tone="primary">
      <Field label="Programme title" htmlFor="gymkhana-proposal-programme-title" required>
        <Input
          id="gymkhana-proposal-programme-title"
          value={proposalForm.proposalDetails.programmeTitle}
          onChange={(event) => handleProposalDetailsChange(["programmeTitle"], event.target.value)}
          placeholder="A name people will actually say out loud"
          disabled={!canEditProposalForm}
        />
      </Field>
    </DetailSection>

    <DetailSection title="Programme details" icon={CalendarDays}>
      <Grid cols={2} gap={2}>
        <Field label="Programme type" htmlFor="gymkhana-proposal-programme-type" required>
          <Select
            id="gymkhana-proposal-programme-type"
            options={programmeTypeOptions}
            value={proposalForm.proposalDetails.programmeDetails.programmeType}
            onChange={(event) =>
              handleProposalDetailsChange(["programmeDetails", "programmeType"], event.target.value)
            }
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Programme mode" htmlFor="gymkhana-proposal-programme-mode" required>
          <Select
            id="gymkhana-proposal-programme-mode"
            options={programmeModeOptions}
            value={proposalForm.proposalDetails.programmeDetails.mode}
            onChange={(event) =>
              handleProposalDetailsChange(["programmeDetails", "mode"], event.target.value)
            }
            disabled={!canEditProposalForm}
          />
        </Field>
      </Grid>
      <Grid cols={3} gap={2}>
        <Field label="Dates and duration" htmlFor="gymkhana-proposal-dates-duration" required>
          <Input
            id="gymkhana-proposal-dates-duration"
            value={proposalForm.proposalDetails.programmeDetails.datesAndDuration}
            onChange={(event) =>
              handleProposalDetailsChange(
                ["programmeDetails", "datesAndDuration"],
                event.target.value
              )
            }
            placeholder="e.g., 3–5 March, three days"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Venue" htmlFor="gymkhana-proposal-venue" required>
          <Input
            id="gymkhana-proposal-venue"
            value={proposalForm.proposalDetails.programmeDetails.venue}
            onChange={(event) =>
              handleProposalDetailsChange(["programmeDetails", "venue"], event.target.value)
            }
            placeholder="Where the room is"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field
          label="Expected participants"
          htmlFor="gymkhana-proposal-expected-participants"
          required
        >
          <Input
            id="gymkhana-proposal-expected-participants"
            type="number"
            min={0}
            value={proposalForm.proposalDetails.programmeDetails.expectedParticipants}
            onChange={(event) =>
              handleProposalDetailsChange(
                ["programmeDetails", "expectedParticipants"],
                event.target.value
              )
            }
            placeholder="How many people"
            disabled={!canEditProposalForm}
          />
        </Field>
      </Grid>
    </DetailSection>

    <DetailSection title="Organising unit" icon={Building2}>
      <Field label="Unit type" htmlFor="gymkhana-proposal-organising-unit-type" required>
        <Select
          id="gymkhana-proposal-organising-unit-type"
          options={organisingUnitOptions}
          value={proposalForm.proposalDetails.organisingUnit.unitType}
          onChange={(event) =>
            handleProposalDetailsChange(["organisingUnit", "unitType"], event.target.value)
          }
          disabled={!canEditProposalForm}
        />
      </Field>
      <Field label="Coordinator name(s)" htmlFor="gymkhana-proposal-coordinator-names" required>
        <Input
          id="gymkhana-proposal-coordinator-names"
          value={proposalForm.proposalDetails.organisingUnit.coordinatorNames}
          onChange={(event) =>
            handleProposalDetailsChange(["organisingUnit", "coordinatorNames"], event.target.value)
          }
          placeholder="Who carries this"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Grid cols={2} gap={2}>
        <Field label="Contact mobile" htmlFor="gymkhana-proposal-contact-mobile" required>
          <Input
            id="gymkhana-proposal-contact-mobile"
            value={proposalForm.proposalDetails.organisingUnit.contactMobile}
            onChange={(event) =>
              handleProposalDetailsChange(["organisingUnit", "contactMobile"], event.target.value)
            }
            placeholder="Mobile"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Contact email" htmlFor="gymkhana-proposal-contact-email" required>
          <Input
            id="gymkhana-proposal-contact-email"
            type="email"
            value={proposalForm.proposalDetails.organisingUnit.contactEmail}
            onChange={(event) =>
              handleProposalDetailsChange(["organisingUnit", "contactEmail"], event.target.value)
            }
            placeholder="Email"
            disabled={!canEditProposalForm}
          />
        </Field>
      </Grid>
    </DetailSection>
  </VStack>
)

const StoryChapter = ({ proposalForm, canEditProposalForm, handleProposalDetailsChange }) => (
  <VStack gap={4}>
    <DetailSection title="Background and rationale" icon={FileText}>
      <Field label="Context and relevance" htmlFor="gymkhana-proposal-context-relevance" required>
        <Textarea
          id="gymkhana-proposal-context-relevance"
          value={proposalForm.proposalDetails.backgroundAndRationale.contextRelevance}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["backgroundAndRationale", "contextRelevance"],
              event.target.value
            )
          }
          rows={4}
          placeholder="Why this gathering belongs on this campus, this year"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Field label="Expected impact" htmlFor="gymkhana-proposal-expected-impact" required>
        <Textarea
          id="gymkhana-proposal-expected-impact"
          value={proposalForm.proposalDetails.backgroundAndRationale.expectedImpact}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["backgroundAndRationale", "expectedImpact"],
              event.target.value
            )
          }
          rows={3}
          placeholder="What is different after the last session ends"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Field
        label="Alignment with objectives"
        htmlFor="gymkhana-proposal-alignment-objectives"
        required
      >
        <Textarea
          id="gymkhana-proposal-alignment-objectives"
          value={proposalForm.proposalDetails.backgroundAndRationale.alignmentWithObjectives}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["backgroundAndRationale", "alignmentWithObjectives"],
              event.target.value
            )
          }
          rows={3}
          placeholder="How this serves institute objectives — not a slogan, a link"
          disabled={!canEditProposalForm}
        />
      </Field>
    </DetailSection>

    <DetailSection title="Programme objectives" icon={Target}>
      <Field label="Primary objective" htmlFor="gymkhana-proposal-objective-1" required>
        <Input
          id="gymkhana-proposal-objective-1"
          value={proposalForm.proposalDetails.objectives.objective1}
          onChange={(event) =>
            handleProposalDetailsChange(["objectives", "objective1"], event.target.value)
          }
          placeholder="The one sentence this programme is for"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Grid cols={2} gap={2}>
        <Field label="Secondary objective" htmlFor="gymkhana-proposal-objective-2">
          <Input
            id="gymkhana-proposal-objective-2"
            value={proposalForm.proposalDetails.objectives.objective2}
            onChange={(event) =>
              handleProposalDetailsChange(["objectives", "objective2"], event.target.value)
            }
            placeholder="Optional — but often the real one"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Tertiary objective" htmlFor="gymkhana-proposal-objective-3">
          <Input
            id="gymkhana-proposal-objective-3"
            value={proposalForm.proposalDetails.objectives.objective3}
            onChange={(event) =>
              handleProposalDetailsChange(["objectives", "objective3"], event.target.value)
            }
            placeholder="Optional"
            disabled={!canEditProposalForm}
          />
        </Field>
      </Grid>
    </DetailSection>
  </VStack>
)

const PeopleChapter = ({ proposalForm, canEditProposalForm, handleProposalDetailsChange }) => (
  <VStack gap={4}>
    <DetailSection title="Target participants" icon={Users}>
      <Field
        label="Institute faculty / staff / students"
        htmlFor="gymkhana-target-participants-institute"
      >
        <Textarea
          id="gymkhana-target-participants-institute"
          value={proposalForm.proposalDetails.targetParticipants.instituteFacultyStaffStudents}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["targetParticipants", "instituteFacultyStaffStudents"],
              event.target.value
            )
          }
          rows={3}
          placeholder="Who from inside the gates"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Field label="Guests / invitees" htmlFor="gymkhana-target-participants-guests">
        <Textarea
          id="gymkhana-target-participants-guests"
          value={proposalForm.proposalDetails.targetParticipants.guestsInvitees}
          onChange={(event) =>
            handleProposalDetailsChange(["targetParticipants", "guestsInvitees"], event.target.value)
          }
          rows={2}
          placeholder="Who is invited in"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Field
        label="External visitors / participants"
        htmlFor="gymkhana-target-participants-external"
      >
        <Textarea
          id="gymkhana-target-participants-external"
          value={proposalForm.proposalDetails.targetParticipants.externalVisitorsParticipants}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["targetParticipants", "externalVisitorsParticipants"],
              event.target.value
            )
          }
          rows={2}
          placeholder="Who travels in from outside"
          disabled={!canEditProposalForm}
        />
      </Field>
    </DetailSection>

    <DetailSection title="Guest and speaker details" icon={Users}>
      <Field label="No. of speakers or guests" htmlFor="gymkhana-tentative-speakers-guests">
        <Input
          id="gymkhana-tentative-speakers-guests"
          type="number"
          min={0}
          value={proposalForm.proposalDetails.guestsDetails.tentativeNumberOfSpeakersGuests}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["guestsDetails", "tentativeNumberOfSpeakersGuests"],
              event.target.value
            )
          }
          placeholder="Count"
          disabled={!canEditProposalForm}
        />
      </Field>
      <Field
        label="Guest names, designations and affiliations"
        htmlFor="gymkhana-guests-details-names"
        help="One person per line. The proposal will list them as voices in the room."
      >
        <Textarea
          id="gymkhana-guests-details-names"
          value={proposalForm.proposalDetails.guestsDetails.guestsNamesDesignationAffiliations}
          onChange={(event) =>
            handleProposalDetailsChange(
              ["guestsDetails", "guestsNamesDesignationAffiliations"],
              event.target.value
            )
          }
          rows={6}
          placeholder={"Prof. A. Sharma, IIT Madras\nMs. R. Iyer, Independent artist"}
          disabled={!canEditProposalForm}
        />
      </Field>
    </DetailSection>
  </VStack>
)

const ScheduleChapter = ({
  proposalForm,
  canEditProposalForm,
  handleProposalDetailsChange,
  uploadScheduleAnnexureDocument,
}) => (
  <DetailSection title="Programme schedule" icon={Clock}>
    <Field label="Schedule overview" htmlFor="gymkhana-programme-schedule-brief" required>
      <Textarea
        id="gymkhana-programme-schedule-brief"
        value={proposalForm.proposalDetails.programmeSchedule.brief}
        onChange={(event) =>
          handleProposalDetailsChange(["programmeSchedule", "brief"], event.target.value)
        }
        rows={8}
        placeholder={"Day 1 — inauguration, keynote, studios\nDay 2 — contests, performances, close"}
        disabled={!canEditProposalForm}
      />
    </Field>
    <PdfUploadField
      label="Detailed schedule (PDF)"
      value={proposalForm.proposalDetails.programmeSchedule.detailedScheduleAnnexureUrl}
      onChange={(value) =>
        handleProposalDetailsChange(["programmeSchedule", "detailedScheduleAnnexureUrl"], value)
      }
      onUpload={uploadScheduleAnnexureDocument}
      disabled={!canEditProposalForm}
      viewerTitle="Detailed Schedule Annexure"
    />
  </DetailSection>
)

const FundsChapter = ({
  proposalForm,
  canEditProposalForm,
  handleProposalDetailsChange,
  handleProposalRegistrationDetailChange,
  registrationCategories,
}) => (
  <VStack gap={4}>
    <DetailSection title="Source of funds" icon={IndianRupee}>
      <Grid cols={4} gap={2}>
        <Field label="Registration fee" htmlFor="gymkhana-source-funds-registration-fee-main">
          <Input
            id="gymkhana-source-funds-registration-fee-main"
            type="number"
            min={0}
            value={proposalForm.proposalDetails.sourceOfFunds.registrationFee}
            onChange={(event) =>
              handleProposalDetailsChange(["sourceOfFunds", "registrationFee"], event.target.value)
            }
            placeholder="₹"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Gymkhana fund" htmlFor="gymkhana-source-funds-gymkhana">
          <Input
            id="gymkhana-source-funds-gymkhana"
            type="number"
            min={0}
            value={proposalForm.proposalDetails.sourceOfFunds.gymkhanaFund}
            onChange={(event) =>
              handleProposalDetailsChange(["sourceOfFunds", "gymkhanaFund"], event.target.value)
            }
            placeholder="₹"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Institute support" htmlFor="gymkhana-source-funds-institute-support">
          <Input
            id="gymkhana-source-funds-institute-support"
            type="number"
            min={0}
            value={proposalForm.proposalDetails.sourceOfFunds.instituteSupport}
            onChange={(event) =>
              handleProposalDetailsChange(["sourceOfFunds", "instituteSupport"], event.target.value)
            }
            placeholder="₹"
            disabled={!canEditProposalForm}
          />
        </Field>
        <Field label="Sponsorship / grant" htmlFor="gymkhana-source-funds-sponsorship">
          <Input
            id="gymkhana-source-funds-sponsorship"
            type="number"
            min={0}
            value={proposalForm.proposalDetails.sourceOfFunds.sponsorshipGrant}
            onChange={(event) =>
              handleProposalDetailsChange(["sourceOfFunds", "sponsorshipGrant"], event.target.value)
            }
            placeholder="₹"
            disabled={!canEditProposalForm}
          />
        </Field>
      </Grid>
    </DetailSection>

    <DetailSection title="Registration details by category" icon={ClipboardCheck} plain>
      <Table bordered>
        <Table.Header>
          <Table.Row>
            <Table.Head>Category</Table.Head>
            <Table.Head>Registration fee</Table.Head>
            <Table.Head>Accommodation</Table.Head>
            <Table.Head>Remarks</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {registrationCategories.map((category) => (
            <Table.Row key={category.key}>
              <Table.Cell>{category.label}</Table.Cell>
              <Table.Cell>
                <Input
                  id={`gymkhana-registration-fee-${category.key}`}
                  aria-label={`Registration fee for ${category.label}`}
                  type="number"
                  min={0}
                  value={
                    proposalForm.proposalDetails.registrationDetails[category.key].registrationFee
                  }
                  onChange={(event) =>
                    handleProposalRegistrationDetailChange(
                      category.key,
                      "registrationFee",
                      event.target.value
                    )
                  }
                  placeholder="₹"
                  disabled={!canEditProposalForm}
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  id={`gymkhana-registration-accommodation-${category.key}`}
                  aria-label={`Accommodation charges for ${category.label}`}
                  type="number"
                  min={0}
                  value={
                    proposalForm.proposalDetails.registrationDetails[category.key]
                      .accommodationCharges
                  }
                  onChange={(event) =>
                    handleProposalRegistrationDetailChange(
                      category.key,
                      "accommodationCharges",
                      event.target.value
                    )
                  }
                  placeholder="₹"
                  disabled={!canEditProposalForm}
                />
              </Table.Cell>
              <Table.Cell>
                <Input
                  id={`gymkhana-registration-remarks-${category.key}`}
                  aria-label={`Remarks for ${category.label}`}
                  value={proposalForm.proposalDetails.registrationDetails[category.key].remarks}
                  onChange={(event) =>
                    handleProposalRegistrationDetailChange(category.key, "remarks", event.target.value)
                  }
                  placeholder="Optional remarks"
                  disabled={!canEditProposalForm}
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </DetailSection>
  </VStack>
)

const MandateChapter = ({ proposalForm, canEditProposalForm, handleProposalDetailsChange }) => (
  <DetailSection title="Approval requested" icon={ClipboardCheck}>
    <Grid cols={2} gap={3}>
      <Checkbox
        checked={proposalForm.proposalDetails.approvalRequested.conductProgrammeAsProposed}
        onChange={(event) =>
          handleProposalDetailsChange(
            ["approvalRequested", "conductProgrammeAsProposed"],
            event.target.checked
          )
        }
        label="Conduct of the programme as proposed"
        disabled={!canEditProposalForm}
      />
      <Checkbox
        checked={proposalForm.proposalDetails.approvalRequested.chargingRegistrationFees}
        onChange={(event) =>
          handleProposalDetailsChange(
            ["approvalRequested", "chargingRegistrationFees"],
            event.target.checked
          )
        }
        label="Charging registration fees for guests/external participants"
        disabled={!canEditProposalForm}
      />
      <Checkbox
        checked={proposalForm.proposalDetails.approvalRequested.utilisationOfCollectedFees}
        onChange={(event) =>
          handleProposalDetailsChange(
            ["approvalRequested", "utilisationOfCollectedFees"],
            event.target.checked
          )
        }
        label="Utilisation of collected fees for programme expenditure"
        disabled={!canEditProposalForm}
      />
      <Checkbox
        checked={proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport}
        onChange={(event) =>
          handleProposalDetailsChange(
            ["approvalRequested", "additionalInstitutionalSupport"],
            event.target.checked
          )
        }
        label="Additional institutional support"
        disabled={!canEditProposalForm}
      />
    </Grid>
    {proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport && (
      <Field label="Additional support details" htmlFor="gymkhana-additional-support-details">
        <Textarea
          id="gymkhana-additional-support-details"
          value={
            proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupportDetails
          }
          onChange={(event) =>
            handleProposalDetailsChange(
              ["approvalRequested", "additionalInstitutionalSupportDetails"],
              event.target.value
            )
          }
          rows={3}
          placeholder="What the institute would need to stand behind"
          disabled={!canEditProposalForm}
        />
      </Field>
    )}
  </DetailSection>
)

const renderChapter = (chapterId, props) => {
  switch (chapterId) {
    case "identity":
      return <IdentityChapter {...props} />
    case "story":
      return <StoryChapter {...props} />
    case "people":
      return <PeopleChapter {...props} />
    case "schedule":
      return <ScheduleChapter {...props} />
    case "funds":
      return <FundsChapter {...props} />
    case "mandate":
      return <MandateChapter {...props} />
    default:
      return <IdentityChapter {...props} />
  }
}

export const GymkhanaProposalDetailsModal = ({
  isOpen,
  onClose,
  proposalForm,
  canEditProposalForm,
  handleProposalDetailsChange,
  uploadScheduleAnnexureDocument,
  handleProposalRegistrationDetailChange,
  programmeTypeOptions,
  programmeModeOptions,
  organisingUnitOptions,
  registrationCategories,
}) => {
  const [chapterId, setChapterId] = useState("identity")
  const wasOpenRef = useRef(false)
  const completeness = useMemo(
    () => getProposalDetailsCompleteness(proposalForm.proposalDetails),
    [proposalForm.proposalDetails]
  )
  const chapterIndex = Math.max(
    0,
    PROPOSAL_DETAIL_CHAPTERS.findIndex((chapter) => chapter.id === chapterId)
  )
  const currentChapter = PROPOSAL_DETAIL_CHAPTERS[chapterIndex] || PROPOSAL_DETAIL_CHAPTERS[0]
  const currentStatus = completeness.chapters[chapterIndex]
  const isFirst = chapterIndex === 0
  const isLast = chapterIndex === PROPOSAL_DETAIL_CHAPTERS.length - 1
  const missingElsewhere = completeness.chapters
    .filter((chapter) => chapter.id !== currentChapter.id && chapter.missing.length > 0)
    .map((chapter) => chapter.label)

  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const firstOpen = completeness.chapters.find((chapter) => !chapter.complete)
      setChapterId(firstOpen?.id || "identity")
    }
    wasOpenRef.current = isOpen
  }, [isOpen, completeness])

  const goTo = (id) => setChapterId(id)
  const goRelative = (delta) => {
    const next = PROPOSAL_DETAIL_CHAPTERS[chapterIndex + delta]
    if (next) setChapterId(next.id)
  }

  const chapterProps = {
    proposalForm,
    canEditProposalForm,
    handleProposalDetailsChange,
    uploadScheduleAnnexureDocument,
    handleProposalRegistrationDetailChange,
    programmeTypeOptions,
    programmeModeOptions,
    organisingUnitOptions,
    registrationCategories,
  }

  const chapterTabs = completeness.chapters.map((chapter) => ({
    value: chapter.id,
    label: chapter.label,
    count:
      chapter.requiredTotal > 0 && !chapter.complete
        ? chapter.requiredTotal - chapter.requiredFilled
        : undefined,
  }))

  return (
    <Modal
      isOpen={isOpen}
      title={canEditProposalForm ? "Shape the programme" : "Proposal"}
      description={
        canEditProposalForm
          ? "Write it as a case, not a checklist. The proposal on the right is what a reviewer will feel."
          : "The proposal as a reviewer should meet it — a programme, not a spreadsheet."
      }
      width={1240}
      fullHeight
      closeButtonVariant="button"
      onClose={onClose}
      headerExtra={
        canEditProposalForm ? (
          <VStack gap={3}>
            <HStack gap={3} align="center" justify="between" wrap>
              <Text as="span" size="xs" color="muted">
                {completeness.complete
                  ? "The proposal is complete. Read it once more, then stand behind it."
                  : `${completeness.requiredFilled} of ${completeness.requiredTotal} required lines are in place.`}
              </Text>
              <Text
                as="span"
                size="xs"
                weight="semibold"
                color={completeness.complete ? "success" : "brand"}
              >
                {completeness.percent}%
              </Text>
            </HStack>
            <Progress
              value={completeness.percent}
              size="sm"
              color={completeness.complete ? "success" : "primary"}
              aria-label="Proposal completeness"
            />
            <Tabs
              variant="pills"
              tabs={chapterTabs}
              activeTab={currentChapter.id}
              setActiveTab={goTo}
            />
          </VStack>
        ) : null
      }
      footer={
        canEditProposalForm ? (
          <HStack gap={2} align="center" justify="between" wrap style={{ width: "100%" }}>
            <Button size="sm" variant="ghost" onClick={() => goRelative(-1)} disabled={isFirst}>
              Back
            </Button>
            <HStack gap={2} wrap>
              <Button size="sm" variant="secondary" onClick={onClose}>
                {completeness.complete ? "Looks good" : "Close for now"}
              </Button>
              {isLast ? (
                <Button size="sm" onClick={onClose}>
                  {completeness.complete ? "Finish proposal" : "Return to proposal"}
                </Button>
              ) : (
                <Button size="sm" onClick={() => goRelative(1)}>
                  Continue
                </Button>
              )}
            </HStack>
          </HStack>
        ) : (
          <HStack gap={2} justify="end">
            <Button size="sm" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </HStack>
        )
      }
    >
      {canEditProposalForm ? (
        <div
          className="grid grid-cols-1 xl:grid-cols-5"
          style={{ gap: "var(--spacing-5)", alignItems: "start" }}
        >
          <VStack gap={4} className="xl:col-span-3">
            <ChapterIntro chapter={currentChapter} />
            {currentStatus?.missing?.length > 0 && (
              <Alert type="info" title="Still needed on this page">
                {currentStatus.missing.join(" · ")}
              </Alert>
            )}
            {renderChapter(currentChapter.id, chapterProps)}
            {isLast && missingElsewhere.length > 0 && (
              <Alert type="warning" title="Other chapters still open">
                {missingElsewhere.join(", ")}. You can jump back from the steps above.
              </Alert>
            )}
          </VStack>
          <div className="xl:col-span-2">
            <VStack gap={2}>
              <Text
                as="div"
                size="2xs"
                weight="semibold"
                color="muted"
                style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}
              >
                Live preview
              </Text>
              <ProposalDossier
                details={proposalForm.proposalDetails}
                variant="compact"
                completeness={completeness}
              />
            </VStack>
          </div>
        </div>
      ) : (
        <ProposalDossier
          details={proposalForm.proposalDetails}
          variant="full"
          completeness={completeness}
        />
      )}
    </Modal>
  )
}
