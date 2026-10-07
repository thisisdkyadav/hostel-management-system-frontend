import { useState } from "react"
import Papa from "papaparse"
import {
  Alert,
  Button,
  Checkbox,
  DatePicker,
  Field,
  Grid,
  HStack,
  IconButton,
  Input,
  Modal,
  Select,
  StepIndicator,
  Surface,
  Text,
  Textarea,
  VStack,
} from "hzero"
import { Download, Plus, Trash2, Upload, Users } from "lucide-react"
import { h4Api } from "@/service/modules/intern-accommodation.api"
import { useAuth } from "@/contexts/AuthProvider"
import { date } from "./h4.format"

const blank = () => ({
  name: "",
  gender: "",
  category: "intern",
  email: "",
  mobile: "",
  institute: "",
  instituteAddress: "",
  course: "",
  department: "",
  payerType: "intern",
  stay: { fromDate: "", toDate: "", checkInTime: "11:00", checkOutTime: "11:00", purpose: "" },
})
const fromRequest = (r) => ({
  ...blank(),
  name: r.applicantName,
  email: r.applicantEmail,
  mobile: r.applicantPhone,
  gender: r.h4.gender || r.guests[0]?.gender || "",
  category: r.h4.category,
  institute: r.h4.institute,
  instituteAddress: r.h4.instituteAddress,
  course: r.h4.course,
  department: r.h4.department,
  payerType: r.h4.payer.type,
  stay: { ...r.stay, fromDate: r.stay.fromDate?.slice(0, 10) || "", toDate: r.stay.toDate?.slice(0, 10) || "" },
})
const genderOptions = ["Male", "Female", "Other"].map((value) => ({ value, label: value }))
const payerOptions = [
  { value: "intern", label: "Student / intern" },
  { value: "faculty", label: "Recommending faculty" },
]
const CSV_HEADERS = [
  "name",
  "gender",
  "category",
  "email",
  "mobile",
  "institute",
  "instituteAddress",
  "course",
  "department",
  "payerType",
  "fromDate",
  "toDate",
  "purpose",
]
const template = () => {
  const csv = Papa.unparse({
    fields: CSV_HEADERS,
    data: [["", "Male", "intern", "", "", "", "", "", "", "intern", "", "", ""]],
  })
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "h4-students-template.csv"
  a.click()
  URL.revokeObjectURL(url)
}
const steps = [
  { id: "0", label: "Batch & faculty" },
  { id: "1", label: "Students" },
  { id: "2", label: "Review" },
]
export default function H4BatchForm({ options, existing, onClose, onSaved }) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const [label, setLabel] = useState(existing?.h4.batchLabel || "")
  const [facultyUserId, setFaculty] = useState(existing?.h4.facultyUserId || "")
  const [students, setStudents] = useState(existing ? [fromRequest(existing)] : [blank()])
  const [active, setActive] = useState(0)
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const selectedFaculty = options.faculty?.find((f) => String(f._id) === facultyUserId)
  const ownFaculty = user.role === "Academics" && facultyUserId === String(user._id || user.id)
  const student = students[active]
  const update = (key, value) => setStudents((rows) => rows.map((s, i) => (i === active ? { ...s, [key]: value } : s)))
  const stay = (key, value) => update("stay", { ...student.stay, [key]: value })
  const importCsv = (file) => {
    if (!file) return
    setError("")
    if (file.size > 1024 * 1024) {
      setError("CSV must be under 1 MB")
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        if (result.errors.length) {
          setError(`CSV: ${result.errors[0].message}`)
          return
        }
        if (!result.data.length || result.data.length > 100) {
          setError("Import 1–100 students")
          return
        }
        const missing = CSV_HEADERS.filter((h) => !result.meta.fields.includes(h))
        if (missing.length) {
          setError(`Missing columns: ${missing.join(", ")}`)
          return
        }
        setStudents(
          result.data.map((row) => {
            const s = blank()
            for (const k of CSV_HEADERS.filter((k) => !["fromDate", "toDate", "purpose"].includes(k)))
              s[k] = String(row[k] || "").trim()
            s.stay = {
              ...s.stay,
              fromDate: row.fromDate?.trim(),
              toDate: row.toDate?.trim(),
              purpose: row.purpose?.trim(),
            }
            return s
          }),
        )
        setActive(0)
      },
      error: (e) => setError(e.message),
    })
  }
  const submit = async (draft = false, recommend = false) => {
    setBusy(true)
    setError("")
    try {
      if (!draft && !confirmed) throw new Error("Confirm the student details and payer before submitting")
      const body = { label, facultyUserId, students, draft, recommend }
      const result = existing
        ? await h4Api.edit(existing._id, { ...body, student: students[0], revision: existing.h4.revision })
        : await h4Api.create(body)
      onSaved(result.data)
    } catch (e) {
      setError(e.message)
    } finally {
      setBusy(false)
    }
  }
  const next = () => {
    setError("")
    if (!label.trim() || !facultyUserId) {
      setError("Enter a batch title and select faculty")
      return
    }
    if (step === 1) {
      const invalid = students.findIndex(
        (s) =>
          !s.name.trim() ||
          !s.gender ||
          !s.email ||
          !s.mobile ||
          !s.institute ||
          !s.instituteAddress ||
          !s.course ||
          !s.department ||
          !s.stay.fromDate ||
          !s.stay.toDate ||
          !s.stay.purpose,
      )
      if (invalid >= 0) {
        setActive(invalid)
        setError(`Complete student ${invalid + 1} before reviewing`)
        return
      }
    }
    setStep(step + 1)
  }
  return (
    <Modal
      isOpen
      onClose={busy ? undefined : onClose}
      title={existing ? "Update H4 request" : "New H4 accommodation batch"}
      width={880}
      footer={
        <HStack justify="between" wrap gap={2}>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <HStack gap={2}>
            {step > 0 && (
              <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={busy}>
                Back
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => submit(true)}
              loading={busy}
              disabled={busy || !label || !facultyUserId}
            >
              Save draft
            </Button>
            {step < 2 ? (
              <Button onClick={next}>Continue</Button>
            ) : (
              <>
                <Button onClick={() => submit()} loading={busy} disabled={!confirmed || busy}>
                  Submit{students.length > 1 ? ` ${students.length} students` : " request"}
                </Button>
                {ownFaculty && (
                  <Button onClick={() => submit(false, true)} disabled={!confirmed || busy}>
                    Submit & recommend
                  </Button>
                )}
              </>
            )}
          </HStack>
        </HStack>
      }
    >
      <VStack gap={4}>
        <StepIndicator steps={steps} currentStep={String(step)} />
        {error && <Alert type="error">{error}</Alert>}
        {step === 0 && (
          <VStack gap={4}>
            <Field label="Batch title" required>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                maxLength={120}
                placeholder="Summer research interns · Physics"
                disabled={!!existing}
              />
            </Field>
            <Field label="Recommending faculty" required>
              <Select
                value={facultyUserId}
                placeholder="Select an Academics user"
                options={(options.faculty || []).map((f) => ({
                  value: String(f._id),
                  label: `${f.name} · ${f.email}`,
                }))}
                onChange={(e) => setFaculty(e.target.value)}
              />
            </Field>
            <Surface bg="secondary" padding={3} radius="md">
              <Text size="sm">Faculty → Office → Chief Warden → Payment → Room</Text>
            </Surface>
          </VStack>
        )}
        {step === 1 && (
          <VStack gap={4}>
            {!existing && (
              <HStack gap={2} wrap>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setStudents((rows) => [
                      ...rows,
                      {
                        ...blank(),
                        stay: { ...student.stay },
                        institute: student.institute,
                        instituteAddress: student.instituteAddress,
                        course: student.course,
                        department: student.department,
                        payerType: student.payerType,
                      },
                    ])
                    setActive(students.length)
                  }}
                  disabled={students.length >= 100}
                >
                  <Plus size={16} /> Add student
                </Button>
                <Button variant="ghost" size="sm" onClick={template}>
                  <Download size={16} /> CSV template
                </Button>
                <label>
                  <HStack gap={2}>
                    <Upload size={16} />
                    <Text size="sm">Import CSV</Text>
                    <input
                      aria-label="Import students CSV"
                      type="file"
                      accept=".csv,text/csv"
                      onChange={(e) => importCsv(e.target.files[0])}
                    />
                  </HStack>
                </label>
              </HStack>
            )}
            <HStack gap={2} wrap>
              {students.map((s, i) => (
                <Button key={i} size="sm" variant={active === i ? "primary" : "secondary"} onClick={() => setActive(i)}>
                  {i + 1}. {s.name || "Student"}
                </Button>
              ))}
            </HStack>
            <HStack justify="between">
              <Text weight="semibold">
                Student {active + 1} of {students.length}
              </Text>
              {students.length > 1 && (
                <IconButton
                  aria-label="Remove student"
                  variant="ghost"
                  onClick={() => {
                    setStudents((rows) => rows.filter((_, i) => i !== active))
                    setActive(Math.max(0, active - 1))
                  }}
                >
                  <Trash2 size={16} />
                </IconButton>
              )}
            </HStack>
            <Grid cols={2} gap={3}>
              <Field label="Full name" required>
                <Input value={student.name} onChange={(e) => update("name", e.target.value)} maxLength={120} />
              </Field>
              <Field label="Category" required>
                <Select
                  value={student.category}
                  options={[
                    { value: "intern", label: "Intern" },
                    { value: "unregistered-student", label: "Unregistered student" },
                  ]}
                  onChange={(e) => update("category", e.target.value)}
                />
              </Field>
              <Field label="Gender" required>
                <Select
                  value={student.gender}
                  options={genderOptions}
                  placeholder="Select gender"
                  onChange={(e) => update("gender", e.target.value)}
                />
              </Field>
              <Field label="Student email" required>
                <Input
                  type="email"
                  value={student.email}
                  onChange={(e) => update("email", e.target.value)}
                  maxLength={254}
                />
              </Field>
              <Field label="Mobile" required>
                <Input
                  type="tel"
                  value={student.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  maxLength={20}
                />
              </Field>
              <Field label="Accommodation payer" required>
                <Select
                  value={student.payerType}
                  options={payerOptions}
                  onChange={(e) => update("payerType", e.target.value)}
                />
              </Field>
              <Field label="Institute / organisation" required>
                <Input value={student.institute} onChange={(e) => update("institute", e.target.value)} />
              </Field>
              <Field label="Institute address" required>
                <Input value={student.instituteAddress} onChange={(e) => update("instituteAddress", e.target.value)} />
              </Field>
              <Field label="Course" required>
                <Input value={student.course} onChange={(e) => update("course", e.target.value)} />
              </Field>
              <Field label="Department" required>
                <Input value={student.department} onChange={(e) => update("department", e.target.value)} />
              </Field>
              <Field label="Arrival date" required>
                <DatePicker value={student.stay.fromDate} onChange={(e) => stay("fromDate", e.target.value)} />
              </Field>
              <Field label="Departure date" required>
                <DatePicker
                  value={student.stay.toDate}
                  min={student.stay.fromDate}
                  onChange={(e) => stay("toDate", e.target.value)}
                />
              </Field>
              <Field label="Arrival time">
                <Input
                  type="time"
                  value={student.stay.checkInTime}
                  onChange={(e) => stay("checkInTime", e.target.value)}
                />
              </Field>
              <Field label="Departure time">
                <Input
                  type="time"
                  value={student.stay.checkOutTime}
                  onChange={(e) => stay("checkOutTime", e.target.value)}
                />
              </Field>
            </Grid>
            <Field label="Purpose" required>
              <Textarea rows={2} value={student.stay.purpose} onChange={(e) => stay("purpose", e.target.value)} />
            </Field>
          </VStack>
        )}
        {step === 2 && (
          <VStack gap={3}>
            <Text weight="semibold">
              <Users size={16} /> {label} · {students.length} student{students.length > 1 ? "s" : ""}
            </Text>
            <Text size="sm" color="muted">
              Faculty: {selectedFaculty?.name} · {selectedFaculty?.email}
            </Text>
            {students.map((s, i) => (
              <Surface key={i} bg="secondary" padding={3} radius="md">
                <HStack justify="between" wrap>
                  <VStack gap={1}>
                    <Text weight="semibold">{s.name}</Text>
                    <Text size="xs" color="muted">
                      {s.email} · {s.institute}
                    </Text>
                  </VStack>
                  <VStack gap={1}>
                    <Text size="sm">
                      {date(s.stay.fromDate)} – {date(s.stay.toDate)}
                    </Text>
                    <Text size="xs">Payer: {s.payerType === "faculty" ? selectedFaculty?.name : s.name}</Text>
                  </VStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActive(i)
                      setStep(1)
                    }}
                  >
                    Edit
                  </Button>
                </HStack>
              </Surface>
            ))}
            <Checkbox
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              label="Details and payer verified"
            />
          </VStack>
        )}
      </VStack>
    </Modal>
  )
}
