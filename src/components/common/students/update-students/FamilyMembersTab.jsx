import React, { useState } from "react"
import { FaCheck, FaPlus, FaTrash } from "react-icons/fa"
import { Button, Input } from "hzero"
import CsvUploader from "@/components/common/CsvUploader"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { Alert, Checkbox, Field, Grid, HStack, Heading, Surface, VStack } from "@/components/ui"
import { FieldList, TabSection } from "./BulkUploadTab"
import PreviewTable from "./PreviewTable"

/**
 * Family members, by CSV or by hand.
 *
 * This lived inside UpdateStudentsModal's render, which meant React saw a new
 * component type on every parent render and remounted it — so the rows someone
 * was typing were wiped whenever the parent's state moved, and this modal's
 * parent moves on every socket progress event. At module scope the state
 * survives, which is the whole reason for the move.
 */

const EMPTY_MEMBER = { rollNumber: "", name: "", relationship: "", phone: "", email: "", address: "" }

const TEMPLATE_HEADERS = ["rollNumber", "name", "relationship", "phone", "email", "address"]
const COLUMNS = [
  { key: "rollNumber", label: "Roll Number" },
  { key: "name", label: "Name" },
  { key: "relationship", label: "Relationship", render: (m) => m.relationship || "-" },
  { key: "phone", label: "Phone", render: (m) => m.phone || "-" },
]
const INSTRUCTIONS = (
  <FieldList
    fields={[
      ["rollNumber", "String (Required)"],
      ["name", "String (Required)"],
      ["relationship", "String (Parent, Sibling, Guardian, etc.)"],
      ["phone", "Number"],
      ["email", "Email"],
      ["address", "String"],
    ]}
  />
)

const FamilyMembersTab = ({ familyData, error, replaceExisting, onReplaceExistingChange, onDataParsed, onSaveManual, onError }) => {
  const [members, setMembers] = useState([EMPTY_MEMBER])

  const updateMember = (index, field, value) =>
    // A copy of the row too, not just the array: mutating the row in place
    // shares the object with the previous state and defeats any comparison
    // React or a memo does on it.
    setMembers((current) => current.map((member, i) => (i === index ? { ...member, [field]: value } : member)))

  const saveManual = () => {
    const valid = members.filter((m) => m.rollNumber && m.name)
    if (!valid.length) {
      onError("Please add at least one valid family member with Roll Number and Name")
      return
    }
    onSaveManual(valid)
  }

  return (
    <VStack gap={6}>
      <HStack justify="between" align="center" gap={4} wrap>
        <Heading as="h3" size="lg" weight="medium" color="secondary">
          Update Family Members
        </Heading>
        <Checkbox
          id="deleteExisting"
          checked={replaceExisting}
          onChange={(e) => onReplaceExistingChange(e.target.checked)}
          label="Replace existing family members"
        />
      </HStack>

      <VStack gap={4}>
        <TabSection title="Option 1: Upload CSV">
          <CsvUploader
            onDataParsed={onDataParsed}
            requiredFields={["rollNumber", "name"]}
            templateFileName="family_update_template.csv"
            templateHeaders={TEMPLATE_HEADERS}
            maxRecords={MAX_BULK_RECORDS}
            instructionText={INSTRUCTIONS}
          />
          {familyData.length > 0 && (
            <Surface bg="success" padding={4} radius="lg" color="success-text" weight="medium" style={{ marginTop: "var(--spacing-4)" }}>
              {familyData.length} family members ready to update
            </Surface>
          )}
        </TabSection>

        <div>
          <Heading as="h4" size="base" weight="medium" color="body" style={{ marginBottom: "var(--spacing-4)" }}>
            Option 2: Add Family Members Manually
          </Heading>

          <VStack gap={4}>
            {members.map((member, index) => (
              <Surface key={index} bg="secondary" padding={4} radius="lg" border>
                <HStack justify="between" gap={2} style={{ marginBottom: "var(--spacing-3)" }}>
                  <Heading as="h5" weight="medium" color="body">
                    Family Member {index + 1}
                  </Heading>
                  {members.length > 1 && (
                    <Button
                      onClick={() => setMembers((current) => current.filter((_, i) => i !== index))}
                      variant="ghost"
                      size="sm"
                      aria-label="Remove family member"
                    >
                      <FaTrash />
                    </Button>
                  )}
                </HStack>

                <Grid cols={{ base: 1, sm: 2 }} gap={4}>
                  <Field label="Roll Number" required>
                    <Input type="text" value={member.rollNumber} onChange={(e) => updateMember(index, "rollNumber", e.target.value)} required />
                  </Field>
                  <Field label="Name" required>
                    <Input type="text" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} required />
                  </Field>
                  <Field label="Relationship">
                    <Input type="text" value={member.relationship} onChange={(e) => updateMember(index, "relationship", e.target.value)} />
                  </Field>
                  <Field label="Phone">
                    <Input type="tel" value={member.phone} onChange={(e) => updateMember(index, "phone", e.target.value)} />
                  </Field>
                  <Field label="Email" className="sm:col-span-2">
                    <Input type="email" value={member.email} onChange={(e) => updateMember(index, "email", e.target.value)} />
                  </Field>
                  <Field label="Address" className="sm:col-span-2">
                    <Input type="text" value={member.address} onChange={(e) => updateMember(index, "address", e.target.value)} />
                  </Field>
                </Grid>
              </Surface>
            ))}

            <HStack gap={4}>
              <Button onClick={() => setMembers((current) => [...current, EMPTY_MEMBER])} variant="outline" size="md">
                <FaPlus />
                Add Another Family Member
              </Button>
              <Button onClick={saveManual} variant="primary" size="md">
                <FaCheck />
                Save Family Members
              </Button>
            </HStack>

            {familyData.length > 0 && members.some((m) => m.rollNumber && m.name) && (
              <Surface bg="success" padding={4} radius="lg" color="success-text" weight="medium" style={{ marginTop: "var(--spacing-4)" }}>
                Family members ready to update
              </Surface>
            )}
          </VStack>
        </div>

        <PreviewTable columns={COLUMNS} rows={familyData} limit={5} />

        {error && <Alert type="error">{error}</Alert>}
      </VStack>
    </VStack>
  )
}

export default FamilyMembersTab
