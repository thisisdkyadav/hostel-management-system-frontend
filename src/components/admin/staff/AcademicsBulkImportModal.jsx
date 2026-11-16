import { useRef, useState } from "react"
import Papa from "papaparse"
import { Download, Upload } from "lucide-react"
import { Alert, Badge, Button, HStack, Modal, Table, Text, VStack, useToast } from "hzero"
import { adminApi } from "../../../service"

/**
 * Bulk-add Academics (faculty / department office) logins from a CSV.
 *
 * The server checks every row before creating anything, so a file with a
 * problem creates nobody; the problems are listed by CSV line so the sheet can
 * be fixed and uploaded again as a whole.
 */

const COLUMNS = ["name", "email", "category", "subRole", "password"]
const REQUIRED = ["name", "email"]
const MAX_ROWS = 500
// Header is line 1, so data row i is on line i + 2.
const line = (index) => index + 2

const downloadTemplate = () => {
  const csv = Papa.unparse({
    fields: COLUMNS,
    data: [
      ["Dr. Example Professor", "professor@iiti.ac.in", "Personal", "", ""],
      ["Physics Department Office", "physics.office@iiti.ac.in", "Office", "", ""],
      ["Dr. Example HOD", "hod.physics@iiti.ac.in", "Personal", "HOD", ""],
    ],
  })
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }))
  const a = document.createElement("a")
  a.href = url
  a.download = "academics-logins-template.csv"
  a.click()
  URL.revokeObjectURL(url)
}

const AcademicsBulkImportModal = ({ onClose, onSaved }) => {
  const { toast } = useToast()
  const [fileName, setFileName] = useState("")
  const [rows, setRows] = useState([])
  const [error, setError] = useState("")
  const [problems, setProblems] = useState([])
  const [busy, setBusy] = useState(false)
  const fileRef = useRef(null)

  const reset = () => {
    setRows([])
    setProblems([])
    setError("")
  }

  const parse = (file) => {
    if (!file) return
    reset()
    setFileName(file.name)
    if (file.size > 1024 * 1024) return setError("The CSV must be under 1 MB.")
    Papa.parse(file, {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        if (result.errors.length) return setError(`Could not read the CSV: ${result.errors[0].message}`)
        const fields = result.meta.fields || []
        const missing = REQUIRED.filter((c) => !fields.includes(c))
        if (missing.length) return setError(`Missing columns: ${missing.join(", ")}. Download the template to see the format.`)
        if (!result.data.length) return setError("The CSV has no rows.")
        if (result.data.length > MAX_ROWS) return setError(`Upload at most ${MAX_ROWS} rows at a time.`)
        setRows(result.data.map((r) => Object.fromEntries(COLUMNS.map((c) => [c, String(r[c] ?? "").trim()]))))
      },
      error: (e) => setError(`Could not read the CSV: ${e.message}`),
    })
  }

  const submit = async () => {
    setBusy(true)
    setError("")
    setProblems([])
    try {
      const users = rows.map((r) => ({ name: r.name, email: r.email, academicCategory: r.category, subRole: r.subRole, password: r.password }))
      const res = await adminApi.addAcademicsBulk(users)
      if (res.failed?.length) {
        setProblems(res.failed)
        setError(res.message)
      } else {
        toast.success(res.message)
        onClose()
      }
      onSaved()
    } catch (e) {
      if (e.errors?.length) {
        setProblems(e.errors)
        setError(`${e.errors.length} problem${e.errors.length === 1 ? "" : "s"} found. Nothing was created. Fix the CSV and upload it again.`)
      } else {
        setError(e.message || "The upload failed.")
      }
    } finally {
      setBusy(false)
    }
  }

  const problemLines = new Set(problems.map((p) => p.index))

  const footer = (
    <HStack justify="end" gap={3}>
      <Button variant="secondary" onClick={onClose} disabled={busy}>Cancel</Button>
      <Button variant="primary" onClick={submit} loading={busy} disabled={busy || rows.length === 0}>
        Create {rows.length || ""} login{rows.length === 1 ? "" : "s"}
      </Button>
    </HStack>
  )

  return (
    <Modal isOpen title="Import Academics logins (CSV)" onClose={onClose} width={820} footer={footer}>
      <VStack gap="large">
        <VStack gap={2}>
          <Text size="sm">
            One row per login. <strong>name</strong> and <strong>email</strong> are required.
            <strong> category</strong> is <em>Personal</em> (a faculty member's own login, the default) or <em>Office</em> (a department office login).
            <strong> subRole</strong> is blank or <em>HOD</em>. <strong>password</strong> is optional; leave it blank for users who sign in with their institute account.
          </Text>
          <HStack gap={3}>
            <Button variant="secondary" size="sm" onClick={downloadTemplate}><Download size={16} /> Download template</Button>
            <Button variant="primary" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload size={16} /> {fileName ? "Choose another CSV" : "Choose CSV"}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              aria-label="Academics logins CSV"
              style={{ display: "none" }}
              onChange={(e) => {
                parse(e.target.files[0])
                e.target.value = ""
              }}
            />
            {fileName && <Text size="sm" color="muted">{fileName}{rows.length ? ` · ${rows.length} row${rows.length === 1 ? "" : "s"}` : ""}</Text>}
          </HStack>
        </VStack>

        {error && (
          <Alert type="error">
            <VStack gap={1}>
              <span>{error}</span>
              {problems.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: "1.2em", listStyle: "disc" }}>
                  {problems.slice(0, 50).map((p, i) => (
                    <li key={i}>Line {line(p.index)}{p.email ? ` (${p.email})` : ""}: {p.message}</li>
                  ))}
                  {problems.length > 50 && <li>…and {problems.length - 50} more</li>}
                </ul>
              )}
            </VStack>
          </Alert>
        )}

        {rows.length > 0 && (
          <div style={{ maxHeight: "22rem", overflowY: "auto" }}>
            <Table bordered striped>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Line</Table.Head>
                  <Table.Head>Name</Table.Head>
                  <Table.Head>Email</Table.Head>
                  <Table.Head>Category</Table.Head>
                  <Table.Head>Sub role</Table.Head>
                  <Table.Head>Password</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {rows.map((r, i) => (
                  <Table.Row key={i}>
                    <Table.Cell>
                      {problemLines.has(i) ? <Badge variant="danger" size="small">{line(i)}</Badge> : line(i)}
                    </Table.Cell>
                    <Table.Cell>{r.name || "—"}</Table.Cell>
                    <Table.Cell>{r.email || "—"}</Table.Cell>
                    <Table.Cell>{r.category || "Personal"}</Table.Cell>
                    <Table.Cell>{r.subRole || "—"}</Table.Cell>
                    <Table.Cell>{r.password ? "••••••" : "—"}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </VStack>
    </Modal>
  )
}

export default AcademicsBulkImportModal
