import { Button, Input, Modal } from "czero/react"
import { Checkbox, Select, Textarea } from "@/components/ui/form"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  Clock,
  DollarSign,
  FileText,
  Target,
  Users,
} from "lucide-react"
import {
  FormField,
  Panel,
} from "@/components/gymkhana/events-page/sharedPrimitives"

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
}) => (
  <Modal
    isOpen={isOpen}
    title="Proposal Details Format"
    width={1200}
    closeButtonVariant="button"
    onClose={onClose}
    footer={
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-2)" }}>
        <Button size="sm" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      <div
        style={{
          padding: "var(--spacing-4)",
          borderRadius: "var(--radius-card-sm)",
          backgroundColor: "var(--color-primary-bg)",
          border: "var(--border-1) solid var(--color-primary)",
        }}
      >
        <FormField label="Programme Title" htmlFor="gymkhana-proposal-programme-title" required>
          <Input
            id="gymkhana-proposal-programme-title"
            value={proposalForm.proposalDetails.programmeTitle}
            onChange={(event) =>
              handleProposalDetailsChange(["programmeTitle"], event.target.value)
            }
            placeholder="Enter the full title of the programme"
            disabled={!canEditProposalForm}
          />
        </FormField>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <Panel title="Programme Details" icon={CalendarDays}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
              <FormField label="Programme Type" htmlFor="gymkhana-proposal-programme-type" required>
                <Select
                  id="gymkhana-proposal-programme-type"
                  options={programmeTypeOptions}
                  value={proposalForm.proposalDetails.programmeDetails.programmeType}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["programmeDetails", "programmeType"],
                      event.target.value
                    )
                  }
                  disabled={!canEditProposalForm}
                />
              </FormField>
              <FormField label="Programme Mode" htmlFor="gymkhana-proposal-programme-mode" required>
                <Select
                  id="gymkhana-proposal-programme-mode"
                  options={programmeModeOptions}
                  value={proposalForm.proposalDetails.programmeDetails.mode}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["programmeDetails", "mode"],
                      event.target.value
                    )
                  }
                  disabled={!canEditProposalForm}
                />
              </FormField>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "var(--spacing-2)",
              }}
            >
              <FormField label="Dates & Duration" htmlFor="gymkhana-proposal-dates-duration" required>
                <Input
                  id="gymkhana-proposal-dates-duration"
                  value={proposalForm.proposalDetails.programmeDetails.datesAndDuration}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["programmeDetails", "datesAndDuration"],
                      event.target.value
                    )
                  }
                  placeholder="e.g., 3-5 March, 3 days"
                  disabled={!canEditProposalForm}
                />
              </FormField>
              <FormField label="Venue" htmlFor="gymkhana-proposal-venue" required>
                <Input
                  id="gymkhana-proposal-venue"
                  value={proposalForm.proposalDetails.programmeDetails.venue}
                  onChange={(event) =>
                    handleProposalDetailsChange(["programmeDetails", "venue"], event.target.value)
                  }
                  placeholder="Venue"
                  disabled={!canEditProposalForm}
                />
              </FormField>
              <FormField
                label="Expected Participants"
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
                  placeholder="Count"
                  disabled={!canEditProposalForm}
                />
              </FormField>
            </div>
          </Panel>

          <Panel title="Background & Rationale" icon={FileText} accent>
            <FormField label="Context and Relevance" htmlFor="gymkhana-proposal-context-relevance" required>
              <Textarea
                id="gymkhana-proposal-context-relevance"
                value={proposalForm.proposalDetails.backgroundAndRationale.contextRelevance}
                onChange={(event) =>
                  handleProposalDetailsChange(
                    ["backgroundAndRationale", "contextRelevance"],
                    event.target.value
                  )
                }
                rows={2}
                placeholder="Describe the background context and relevance of this programme"
                disabled={!canEditProposalForm}
              />
            </FormField>
            <FormField label="Expected Impact" htmlFor="gymkhana-proposal-expected-impact" required>
              <Textarea
                id="gymkhana-proposal-expected-impact"
                value={proposalForm.proposalDetails.backgroundAndRationale.expectedImpact}
                onChange={(event) =>
                  handleProposalDetailsChange(
                    ["backgroundAndRationale", "expectedImpact"],
                    event.target.value
                  )
                }
                rows={2}
                placeholder="Expected institutional/societal impact"
                disabled={!canEditProposalForm}
              />
            </FormField>
            <FormField
              label="Alignment with Objectives"
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
                rows={2}
                placeholder="How does this align with institute objectives?"
                disabled={!canEditProposalForm}
              />
            </FormField>
          </Panel>

          <Panel title="Programme Objectives" icon={Target}>
            <FormField label="Primary Objective" htmlFor="gymkhana-proposal-objective-1" required>
              <Input
                id="gymkhana-proposal-objective-1"
                value={proposalForm.proposalDetails.objectives.objective1}
                onChange={(event) =>
                  handleProposalDetailsChange(["objectives", "objective1"], event.target.value)
                }
                placeholder="Main objective of the programme"
                disabled={!canEditProposalForm}
              />
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
              <FormField label="Secondary Objective" htmlFor="gymkhana-proposal-objective-2">
                <Input
                  id="gymkhana-proposal-objective-2"
                  value={proposalForm.proposalDetails.objectives.objective2}
                  onChange={(event) =>
                    handleProposalDetailsChange(["objectives", "objective2"], event.target.value)
                  }
                  placeholder="Optional"
                  disabled={!canEditProposalForm}
                />
              </FormField>
              <FormField label="Tertiary Objective" htmlFor="gymkhana-proposal-objective-3">
                <Input
                  id="gymkhana-proposal-objective-3"
                  value={proposalForm.proposalDetails.objectives.objective3}
                  onChange={(event) =>
                    handleProposalDetailsChange(["objectives", "objective3"], event.target.value)
                  }
                  placeholder="Optional"
                  disabled={!canEditProposalForm}
                />
              </FormField>
            </div>
          </Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <Panel title="Organising Unit" icon={Building2} accent>
            <FormField label="Unit Type" htmlFor="gymkhana-proposal-organising-unit-type" required>
              <Select
                id="gymkhana-proposal-organising-unit-type"
                options={organisingUnitOptions}
                value={proposalForm.proposalDetails.organisingUnit.unitType}
                onChange={(event) =>
                  handleProposalDetailsChange(["organisingUnit", "unitType"], event.target.value)
                }
                disabled={!canEditProposalForm}
              />
            </FormField>
            <FormField label="Coordinator Name(s)" htmlFor="gymkhana-proposal-coordinator-names" required>
              <Input
                id="gymkhana-proposal-coordinator-names"
                value={proposalForm.proposalDetails.organisingUnit.coordinatorNames}
                onChange={(event) =>
                  handleProposalDetailsChange(
                    ["organisingUnit", "coordinatorNames"],
                    event.target.value
                  )
                }
                placeholder="Names of coordinators"
                disabled={!canEditProposalForm}
              />
            </FormField>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
              <FormField label="Contact Mobile" htmlFor="gymkhana-proposal-contact-mobile" required>
                <Input
                  id="gymkhana-proposal-contact-mobile"
                  value={proposalForm.proposalDetails.organisingUnit.contactMobile}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["organisingUnit", "contactMobile"],
                      event.target.value
                    )
                  }
                  placeholder="Mobile"
                  disabled={!canEditProposalForm}
                />
              </FormField>
              <FormField label="Contact Email" htmlFor="gymkhana-proposal-contact-email" required>
                <Input
                  id="gymkhana-proposal-contact-email"
                  type="email"
                  value={proposalForm.proposalDetails.organisingUnit.contactEmail}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["organisingUnit", "contactEmail"],
                      event.target.value
                    )
                  }
                  placeholder="Email"
                  disabled={!canEditProposalForm}
                />
              </FormField>
            </div>
          </Panel>

          <Panel title="Target Participants" icon={Users}>
            <FormField
              label="Institute Faculty / Staff / Students"
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
                rows={2}
                placeholder="Faculty, staff, students from the institute"
                disabled={!canEditProposalForm}
              />
            </FormField>
            <FormField label="Guests / Invitees" htmlFor="gymkhana-target-participants-guests">
              <Textarea
                id="gymkhana-target-participants-guests"
                value={proposalForm.proposalDetails.targetParticipants.guestsInvitees}
                onChange={(event) =>
                  handleProposalDetailsChange(
                    ["targetParticipants", "guestsInvitees"],
                    event.target.value
                  )
                }
                rows={2}
                placeholder="Invited guests"
                disabled={!canEditProposalForm}
              />
            </FormField>
            <FormField
              label="External Visitors / Participants"
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
                placeholder="External participants"
                disabled={!canEditProposalForm}
              />
            </FormField>
          </Panel>

          <Panel title="Guest & Speaker Details" icon={Users} accent>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
              <FormField label="No. of Speakers/Guests" htmlFor="gymkhana-tentative-speakers-guests">
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
              </FormField>
              <FormField label="Registration Fee Source" htmlFor="gymkhana-source-funds-registration-fee">
                <Input
                  id="gymkhana-source-funds-registration-fee"
                  type="number"
                  min={0}
                  value={proposalForm.proposalDetails.sourceOfFunds.registrationFee}
                  onChange={(event) =>
                    handleProposalDetailsChange(
                      ["sourceOfFunds", "registrationFee"],
                      event.target.value
                    )
                  }
                  placeholder="₹"
                  disabled={!canEditProposalForm}
                />
              </FormField>
            </div>
            <FormField label="Guest Names, Designations & Affiliations" htmlFor="gymkhana-guests-details-names">
              <Textarea
                id="gymkhana-guests-details-names"
                value={proposalForm.proposalDetails.guestsDetails.guestsNamesDesignationAffiliations}
                onChange={(event) =>
                  handleProposalDetailsChange(
                    ["guestsDetails", "guestsNamesDesignationAffiliations"],
                    event.target.value
                  )
                }
                rows={3}
                placeholder="List guests with their designation and affiliation"
                disabled={!canEditProposalForm}
              />
            </FormField>
          </Panel>
        </div>
      </div>

      <Panel title="Programme Schedule" icon={Clock}>
        <FormField label="Brief Schedule" htmlFor="gymkhana-programme-schedule-brief" required>
          <Textarea
            id="gymkhana-programme-schedule-brief"
            value={proposalForm.proposalDetails.programmeSchedule.brief}
            onChange={(event) =>
              handleProposalDetailsChange(["programmeSchedule", "brief"], event.target.value)
            }
            rows={3}
            placeholder="Brief overview of the programme schedule"
            disabled={!canEditProposalForm}
          />
        </FormField>
        <PdfUploadField
          label="Detailed Schedule (PDF)"
          value={proposalForm.proposalDetails.programmeSchedule.detailedScheduleAnnexureUrl}
          onChange={(value) =>
            handleProposalDetailsChange(["programmeSchedule", "detailedScheduleAnnexureUrl"], value)
          }
          onUpload={uploadScheduleAnnexureDocument}
          disabled={!canEditProposalForm}
          viewerTitle="Detailed Schedule Annexure"
        />
      </Panel>

      <Panel title="Source of Funds" icon={DollarSign} accent>
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--spacing-2)" }}
        >
          <FormField label="Registration Fee" htmlFor="gymkhana-source-funds-registration-fee-main">
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
          </FormField>
          <FormField label="Gymkhana Fund" htmlFor="gymkhana-source-funds-gymkhana">
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
          </FormField>
          <FormField label="Institute Support" htmlFor="gymkhana-source-funds-institute-support">
            <Input
              id="gymkhana-source-funds-institute-support"
              type="number"
              min={0}
              value={proposalForm.proposalDetails.sourceOfFunds.instituteSupport}
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["sourceOfFunds", "instituteSupport"],
                  event.target.value
                )
              }
              placeholder="₹"
              disabled={!canEditProposalForm}
            />
          </FormField>
          <FormField label="Sponsorship / Grant" htmlFor="gymkhana-source-funds-sponsorship">
            <Input
              id="gymkhana-source-funds-sponsorship"
              type="number"
              min={0}
              value={proposalForm.proposalDetails.sourceOfFunds.sponsorshipGrant}
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["sourceOfFunds", "sponsorshipGrant"],
                  event.target.value
                )
              }
              placeholder="₹"
              disabled={!canEditProposalForm}
            />
          </FormField>
        </div>
      </Panel>

      <Panel title="Registration Details by Category" icon={ClipboardCheck}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
            gap: "var(--spacing-2)",
            padding: "var(--spacing-2)",
            backgroundColor: "var(--color-bg-tertiary)",
            borderRadius: "var(--radius-card-sm)",
            marginBottom: "var(--spacing-2)",
          }}
        >
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
            }}
          >
            Category
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
            }}
          >
            Registration Fee
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
            }}
          >
            Accommodation
          </span>
          <span
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
            }}
          >
            Remarks
          </span>
        </div>
        {registrationCategories.map((category) => (
          <div
            key={category.key}
            style={{
              display: "grid",
              gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr",
              gap: "var(--spacing-2)",
              alignItems: "center",
              padding: "var(--spacing-2)",
              borderRadius: "var(--radius-card-sm)",
              backgroundColor: "var(--color-bg-secondary)",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "var(--color-text-primary)",
              }}
            >
              {category.label}
            </span>
            <Input
              id={`gymkhana-registration-fee-${category.key}`}
              type="number"
              min={0}
              value={proposalForm.proposalDetails.registrationDetails[category.key].registrationFee}
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
            <Input
              id={`gymkhana-registration-accommodation-${category.key}`}
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
            <Input
              id={`gymkhana-registration-remarks-${category.key}`}
              value={proposalForm.proposalDetails.registrationDetails[category.key].remarks}
              onChange={(event) =>
                handleProposalRegistrationDetailChange(
                  category.key,
                  "remarks",
                  event.target.value
                )
              }
              placeholder="Optional remarks"
              disabled={!canEditProposalForm}
            />
          </div>
        ))}
      </Panel>

      <Panel title="Approval Requested" icon={ClipboardCheck} accent>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)" }}>
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
            checked={
              proposalForm.proposalDetails.approvalRequested.utilisationOfCollectedFees
            }
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
            checked={
              proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport
            }
            onChange={(event) =>
              handleProposalDetailsChange(
                ["approvalRequested", "additionalInstitutionalSupport"],
                event.target.checked
              )
            }
            label="Additional institutional support"
            disabled={!canEditProposalForm}
          />
        </div>
        {proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport && (
          <FormField label="Additional Support Details" htmlFor="gymkhana-additional-support-details">
            <Textarea
              id="gymkhana-additional-support-details"
              value={
                proposalForm.proposalDetails.approvalRequested
                  .additionalInstitutionalSupportDetails
              }
              onChange={(event) =>
                handleProposalDetailsChange(
                  ["approvalRequested", "additionalInstitutionalSupportDetails"],
                  event.target.value
                )
              }
              rows={2}
              placeholder="Describe the additional institutional support required"
              disabled={!canEditProposalForm}
            />
          </FormField>
        )}
      </Panel>
    </div>
  </Modal>
)
