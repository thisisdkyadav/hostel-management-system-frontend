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
import { Button, Checkbox, DetailSection, Field, Grid, HStack, Input, Modal, Select, Table, Textarea, VStack } from "hzero"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"

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
    title="Proposal details format"
    width={1200}
    closeButtonVariant="button"
    onClose={onClose}
    footer={
      <HStack gap={2} justify="end">
        <Button size="sm" variant="secondary" onClick={onClose}>
          Close
        </Button>
      </HStack>
    }
  >
    <VStack gap={4}>
      <DetailSection tone="primary">
        <Field label="Programme title" htmlFor="gymkhana-proposal-programme-title" required>
          <Input
            id="gymkhana-proposal-programme-title"
            value={proposalForm.proposalDetails.programmeTitle}
            onChange={(event) =>
              handleProposalDetailsChange(["programmeTitle"], event.target.value)
            }
            placeholder="Enter the full title of the programme"
            disabled={!canEditProposalForm}
          />
        </Field>
      </DetailSection>

      <Grid cols={2} gap={4}>
        <VStack gap={4}>
          <DetailSection title="Programme details" icon={CalendarDays}>
            <Grid cols={2} gap={2}>
              <Field label="Programme type" htmlFor="gymkhana-proposal-programme-type" required>
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
              </Field>
              <Field label="Programme mode" htmlFor="gymkhana-proposal-programme-mode" required>
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
                  placeholder="e.g., 3-5 March, 3 days"
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
                  placeholder="Venue"
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
                  placeholder="Count"
                  disabled={!canEditProposalForm}
                />
              </Field>
            </Grid>
          </DetailSection>

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
                rows={2}
                placeholder="Describe the background context and relevance of this programme"
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
                rows={2}
                placeholder="Expected institutional/societal impact"
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
                rows={2}
                placeholder="How does this align with institute objectives?"
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
                placeholder="Main objective of the programme"
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
                  placeholder="Optional"
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

        <VStack gap={4}>
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
                  handleProposalDetailsChange(
                    ["organisingUnit", "coordinatorNames"],
                    event.target.value
                  )
                }
                placeholder="Names of coordinators"
                disabled={!canEditProposalForm}
              />
            </Field>
            <Grid cols={2} gap={2}>
              <Field label="Contact mobile" htmlFor="gymkhana-proposal-contact-mobile" required>
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
              </Field>
              <Field label="Contact email" htmlFor="gymkhana-proposal-contact-email" required>
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
              </Field>
            </Grid>
          </DetailSection>

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
                rows={2}
                placeholder="Faculty, staff, students from the institute"
                disabled={!canEditProposalForm}
              />
            </Field>
            <Field label="Guests / invitees" htmlFor="gymkhana-target-participants-guests">
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
                placeholder="External participants"
                disabled={!canEditProposalForm}
              />
            </Field>
          </DetailSection>

          <DetailSection title="Guest and speaker details" icon={Users}>
            <Grid cols={2} gap={2}>
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
              <Field label="Registration fee source" htmlFor="gymkhana-source-funds-registration-fee">
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
              </Field>
            </Grid>
            <Field label="Guest names, designations and affiliations" htmlFor="gymkhana-guests-details-names">
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
            </Field>
          </DetailSection>
        </VStack>
      </Grid>

      <DetailSection title="Programme schedule" icon={Clock}>
        <Field label="Brief schedule" htmlFor="gymkhana-programme-schedule-brief" required>
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
                handleProposalDetailsChange(
                  ["sourceOfFunds", "instituteSupport"],
                  event.target.value
                )
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
                handleProposalDetailsChange(
                  ["sourceOfFunds", "sponsorshipGrant"],
                  event.target.value
                )
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
                      handleProposalRegistrationDetailChange(
                        category.key,
                        "remarks",
                        event.target.value
                      )
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
        </Grid>
        {proposalForm.proposalDetails.approvalRequested.additionalInstitutionalSupport && (
          <Field label="Additional support details" htmlFor="gymkhana-additional-support-details">
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
          </Field>
        )}
      </DetailSection>
    </VStack>
  </Modal>
)
