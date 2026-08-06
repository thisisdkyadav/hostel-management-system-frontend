import React, { useState } from "react"
import { FaCheck, FaPlus, FaTrash } from "react-icons/fa"
import { Button, Input } from "czero/react"
import CsvUploader from "@/components/common/CsvUploader"
import ToggleButtonGroup from "@/components/common/ToggleButtonGroup"
import { MAX_BULK_RECORDS } from "@/constants/systemLimits"
import { Alert, Field, Grid, HStack, Heading, Surface, VStack } from "@/components/ui"
import { FieldList, TabSection } from "./BulkUploadTab"
import PreviewTable from "./PreviewTable"

/**
 * Day scholar status, by CSV or by hand.
 *
 * Like FamilyMembersTab this was defined inside the parent's render, so its
 * rows were wiped on every parent update. Module scope keeps them.
 *
 * Almost everything here is conditional on `mode`: removing a day scholar
 * needs a roll number and nothing else, adding one needs the landlord's
 * details too.
 */

const EMPTY_STUDENT = { rollNumber: "", address: "", ownerName: "", ownerPhone: "", ownerEmail: "" }

const MODE_OPTIONS = [
  { value: "add", label: "Add/Update Day Scholar" },
  { value: "remove", label: "Remove Day Scholar" },
]

const ADD_FIELDS = [
  { key: "ownerName", label: "Owner Name", type: "text" },
  { key: "ownerPhone", label: "Owner Phone", type: "tel" },
  { key: "ownerEmail", label: "Owner Email", type: "email" },
  { key: "address", label: "Address", type: "text", wide: true },
]

const DayScholarTab = ({ mode, onModeChange, dayScholarData, error, status, onDataParsed, onSaveManual, onError, onSaved }) => {
  const [students, setStudents] = useState([EMPTY_STUDENT])

  const adding = mode === "add"

  const updateStudent = (index, field, value) =>
    setStudents((current) => current.map((student, i) => (i === index ? { ...student, [field]: value } : student)))

  const saveManual = () => {
    const valid = students.filter((s) => s.rollNumber)
    if (!valid.length) {
      onError("Please add at least one student with a Roll Number")
      return
    }
    if (adding && valid.some((s) => !s.address || !s.ownerName || !s.ownerPhone || !s.ownerEmail)) {
      onError("All fields are required for day scholar students")
      return
    }
    onSaveManual(valid)
    onError("")
    onSaved(valid.length)
  }

  const columns = [
    { key: "rollNumber", label: "Roll Number" },
    ...(adding
      ? [
          { key: "address", label: "Address", render: (s) => s.address || "-" },
          { key: "ownerName", label: "Owner Name", render: (s) => s.ownerName || "-" },
          { key: "ownerPhone", label: "Owner Phone", render: (s) => s.ownerPhone || "-" },
        ]
      : []),
  ]

  return (
    <VStack gap={6}>
      <HStack justify="between" align="center" gap={4} wrap>
        <Heading as="h3" size="lg" weight="medium" color="secondary">
          Update Day Scholar Status
        </Heading>
        <ToggleButtonGroup
          options={MODE_OPTIONS}
          value={mode}
          onChange={onModeChange}
          shape="rounded"
          size="sm"
          variant="muted"
          hideLabelsOnMobile={false}
        />
      </HStack>

      <VStack gap={4}>
        <TabSection title="Option 1: Upload CSV">
          <CsvUploader
            onDataParsed={onDataParsed}
            requiredFields={["rollNumber"]}
            templateFileName={adding ? "day_scholar_add_template.csv" : "day_scholar_remove_template.csv"}
            templateHeaders={adding ? ["rollNumber", "address", "ownerName", "ownerPhone", "ownerEmail"] : ["rollNumber"]}
            maxRecords={MAX_BULK_RECORDS}
            instructionText={
              <FieldList
                fields={[
                  ["rollNumber", "String (Required)"],
                  ...(adding
                    ? [
                        ["address", "String (Required)"],
                        ["ownerName", "String (Required)"],
                        ["ownerPhone", "String (Required)"],
                        ["ownerEmail", "String (Required)"],
                      ]
                    : []),
                ]}
              />
            }
          />
          {dayScholarData.length > 0 && (
            <Surface bg="success" padding={4} radius="lg" color="success-text" weight="medium" style={{ marginTop: "var(--spacing-4)" }}>
              {status}
            </Surface>
          )}
        </TabSection>

        <div>
          <Heading as="h4" size="base" weight="medium" color="body" style={{ marginBottom: "var(--spacing-4)" }}>
            Option 2: Add Students Manually
          </Heading>

          <VStack gap={4}>
            {students.map((student, index) => (
              <Surface key={index} bg="secondary" padding={4} radius="lg" border>
                <HStack justify="between" gap={2} style={{ marginBottom: "var(--spacing-3)" }}>
                  <Heading as="h5" weight="medium" color="body">
                    Student {index + 1}
                  </Heading>
                  {students.length > 1 && (
                    <Button
                      onClick={() => setStudents((current) => current.filter((_, i) => i !== index))}
                      variant="ghost"
                      size="sm"
                      aria-label="Remove student"
                    >
                      <FaTrash />
                    </Button>
                  )}
                </HStack>

                <Grid cols={{ base: 1, sm: 2 }} gap={4}>
                  <Field label="Roll Number" required>
                    <Input type="text" value={student.rollNumber} onChange={(e) => updateStudent(index, "rollNumber", e.target.value)} required />
                  </Field>
                  {adding &&
                    ADD_FIELDS.map((field) => (
                      <Field key={field.key} label={field.label} required className={field.wide ? "sm:col-span-2" : undefined}>
                        <Input
                          type={field.type}
                          value={student[field.key]}
                          onChange={(e) => updateStudent(index, field.key, e.target.value)}
                          required
                        />
                      </Field>
                    ))}
                </Grid>
              </Surface>
            ))}

            <HStack gap={4}>
              <Button onClick={() => setStudents((current) => [...current, EMPTY_STUDENT])} variant="outline" size="md">
                <FaPlus />
                Add Another Student
              </Button>
              <Button onClick={saveManual} variant="primary" size="md">
                <FaCheck />
                Save Students
              </Button>
            </HStack>
          </VStack>
        </div>

        <PreviewTable columns={columns} rows={dayScholarData} limit={5} />

        {error && <Alert type="error">{error}</Alert>}
      </VStack>
    </VStack>
  )
}

export default DayScholarTab
