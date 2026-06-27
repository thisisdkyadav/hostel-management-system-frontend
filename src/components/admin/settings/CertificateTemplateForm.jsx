import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Input } from "czero/react"
import { compressImage, extractTemplateVariables } from "pdf-certificate-kit"
import { useToast } from "@/components/ui/feedback"
import { Upload, Trash2, X, GripVertical } from "lucide-react"
import {
  Label,
  Textarea,
  Select,
  Checkbox,
  Switch,
  FileInput,
  Spinner,
  SearchInput,
} from "@/components/ui"
import { signatureApi, uploadApi } from "@/service"
import { resolveUploadedFileRef } from "@/service/modules/upload.api"
import { getMediaUrl } from "@/utils/mediaUtils"

const SUPPORTED_VARIABLES = [
  "name",
  "rollNumber",
  "email",
  "department",
  "degree",
  "batch",
  "club",
  "category",
  "position",
  "tenure",
  "status",
  "date",
]

const FONT_OPTIONS = [
  { value: "Times", label: "Times (serif)" },
  { value: "Helvetica", label: "Helvetica (sans-serif)" },
  { value: "Courier", label: "Courier (monospace)" },
]

const ORIENTATION_OPTIONS = [
  { value: "landscape", label: "Landscape" },
  { value: "portrait", label: "Portrait" },
]

const DEFAULT_THEME = {
  orientation: "landscape",
  fontFamily: "Times",
  accentColor: "#1360AB",
  textColor: "#1f2937",
  border: true,
}

/**
 * Admin editor for the POR certificate template: logo, eyebrow/title/body (with
 * {{variables}}), theme, and the ordered list of signatories (only users who
 * already have a usable signature, sourced from the signature directory).
 */
const CertificateTemplateForm = ({ template, onUpdate, isLoading }) => {
  const { toast } = useToast()
  const [eyebrow, setEyebrow] = useState(template?.eyebrow || "")
  const [title, setTitle] = useState(template?.title || "")
  const [body, setBody] = useState(template?.body || "")
  const [logoRef, setLogoRef] = useState(template?.logoRef || null)
  const [logoPreview, setLogoPreview] = useState("")
  const [theme, setTheme] = useState({ ...DEFAULT_THEME, ...(template?.theme || {}) })
  const [signatories, setSignatories] = useState(
    Array.isArray(template?.signatories) ? template.signatories.map(String) : []
  )

  const [directory, setDirectory] = useState([])
  const [directoryLoading, setDirectoryLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const logoInputRef = useRef(null)

  useEffect(() => {
    let active = true
    signatureApi
      .listDirectory()
      .then((data) => {
        if (active) setDirectory(Array.isArray(data?.signatories) ? data.signatories : [])
      })
      .catch((error) => {
        console.error("Failed to load signatory directory:", error)
        toast.error("Failed to load the list of users with signatures")
      })
      .finally(() => {
        if (active) setDirectoryLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const directoryById = useMemo(() => {
    const map = new Map()
    directory.forEach((entry) => map.set(String(entry.userId), entry))
    return map
  }, [directory])

  const usedVariables = useMemo(() => {
    const used = new Set([
      ...extractTemplateVariables(title),
      ...extractTemplateVariables(eyebrow),
      ...extractTemplateVariables(body),
    ])
    return used
  }, [title, eyebrow, body])

  const filteredDirectory = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return directory
    return directory.filter((entry) =>
      `${entry.name} ${entry.role} ${entry.subRole} ${entry.position}`.toLowerCase().includes(term)
    )
  }, [directory, search])

  const logoSrc = logoPreview || (logoRef ? getMediaUrl(logoRef) : "")

  const toggleSignatory = (userId) => {
    const id = String(userId)
    setSignatories((prev) => (prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]))
  }

  const moveSignatory = (index, direction) => {
    setSignatories((prev) => {
      const next = [...prev]
      const target = index + direction
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const handleLogoSelect = async (event) => {
    const file = event?.target?.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    try {
      const compressed = await compressImage(file, { maxDimension: 512, mimeType: "image/png" })
      setLogoPreview(compressed.dataUrl)
      const formData = new FormData()
      formData.append("image", compressed.blob, "certificate-logo.png")
      const response = await uploadApi.uploadCertificate(formData)
      const fileRef = resolveUploadedFileRef(response)
      if (!fileRef) throw new Error("Upload did not return a file reference")
      setLogoRef(fileRef)
      toast.success("Logo uploaded")
    } catch (error) {
      console.error("Logo upload failed:", error)
      setLogoPreview("")
      toast.error(error?.message || "Failed to upload logo")
    } finally {
      setUploadingLogo(false)
      if (logoInputRef.current) logoInputRef.current.value = ""
    }
  }

  const handleSave = () => {
    if (!body.trim()) {
      toast.error("Certificate body text is required")
      return
    }
    onUpdate({
      eyebrow: eyebrow.trim(),
      title: title.trim(),
      body,
      logoRef: logoRef || null,
      theme: {
        orientation: theme.orientation === "portrait" ? "portrait" : "landscape",
        fontFamily: FONT_OPTIONS.some((option) => option.value === theme.fontFamily) ? theme.fontFamily : "Times",
        accentColor: theme.accentColor || DEFAULT_THEME.accentColor,
        textColor: theme.textColor || DEFAULT_THEME.textColor,
        border: theme.border !== false,
      },
      signatories,
    })
  }

  const insertVariable = (variable) => {
    setBody((prev) => `${prev}${prev && !prev.endsWith(" ") ? " " : ""}{{${variable}}}`)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
      {/* Branding */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
          Header & logo
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)", flexWrap: "wrap" }}>
          <div
            style={{
              width: 120,
              height: 80,
              border: "1px dashed var(--color-border-input)",
              borderRadius: "var(--radius-lg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--color-bg-secondary)",
              overflow: "hidden",
            }}
          >
            {logoSrc ? (
              <img src={logoSrc} alt="Logo preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            ) : (
              <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>No logo</span>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
            <FileInput ref={logoInputRef} accept="image/png,image/jpeg,image/webp" hidden onChange={handleLogoSelect} />
            <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
              <Button variant="outline" size="sm" loading={uploadingLogo} onClick={() => logoInputRef.current?.click()}>
                <Upload size={15} /> {logoRef ? "Replace logo" : "Upload logo"}
              </Button>
              {logoRef ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setLogoRef(null)
                    setLogoPreview("")
                  }}
                >
                  <Trash2 size={15} /> Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "var(--spacing-4)" }}>
          <div>
            <Label htmlFor="cert-eyebrow">Eyebrow (small top line)</Label>
            <Input id="cert-eyebrow" value={eyebrow} onChange={(event) => setEyebrow(event.target.value)} placeholder="e.g. Indian Institute of Technology Indore" />
          </div>
          <div>
            <Label htmlFor="cert-title">Title</Label>
            <Input id="cert-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Certificate of Appointment" />
          </div>
        </div>
      </section>

      {/* Body */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
        <Label htmlFor="cert-body" required>
          Body text
        </Label>
        <Textarea id="cert-body" value={body} onChange={(event) => setBody(event.target.value)} rows={5} placeholder="This is to certify that {{name}}..." />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-1-5)", alignItems: "center" }}>
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Insert variable:</span>
          {SUPPORTED_VARIABLES.map((variable) => (
            <button
              key={variable}
              type="button"
              onClick={() => insertVariable(variable)}
              style={{
                fontSize: "var(--font-size-xs)",
                padding: "2px 8px",
                borderRadius: "var(--radius-badge)",
                border: "1px solid var(--color-border-primary)",
                background: usedVariables.has(variable) ? "var(--color-primary-bg)" : "var(--color-bg-secondary)",
                color: usedVariables.has(variable) ? "var(--color-primary)" : "var(--color-text-body)",
                cursor: "pointer",
              }}
            >
              {`{{${variable}}}`}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
          Appearance
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "var(--spacing-4)", alignItems: "end" }}>
          <div>
            <Label htmlFor="cert-orientation">Orientation</Label>
            <Select
              id="cert-orientation"
              value={theme.orientation}
              onChange={(event) => setTheme((prev) => ({ ...prev, orientation: event.target.value }))}
              options={ORIENTATION_OPTIONS}
            />
          </div>
          <div>
            <Label htmlFor="cert-font">Font</Label>
            <Select
              id="cert-font"
              value={theme.fontFamily}
              onChange={(event) => setTheme((prev) => ({ ...prev, fontFamily: event.target.value }))}
              options={FONT_OPTIONS}
            />
          </div>
          <div>
            <Label htmlFor="cert-accent">Accent color</Label>
            <input
              id="cert-accent"
              type="color"
              value={theme.accentColor}
              onChange={(event) => setTheme((prev) => ({ ...prev, accentColor: event.target.value }))}
              style={{ width: "100%", height: 40, border: "1px solid var(--color-border-input)", borderRadius: "var(--radius-input)", background: "var(--color-bg-primary)", cursor: "pointer" }}
            />
          </div>
          <div>
            <Switch
              checked={theme.border !== false}
              onChange={(event) => setTheme((prev) => ({ ...prev, border: event?.target ? event.target.checked : event }))}
              label="Decorative border"
            />
          </div>
        </div>
      </section>

      {/* Signatories */}
      <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
        <div>
          <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
            Signatories
          </h3>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Only users who have set a signature in their profile appear here. The order below is the order
            shown on the certificate (1 → right, 2 → left & right, more → evenly spaced).
          </p>
        </div>

        {/* Selected, ordered */}
        {signatories.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
            {signatories.map((id, index) => {
              const entry = directoryById.get(id)
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-2)",
                    padding: "var(--spacing-2) var(--spacing-3)",
                    border: "1px solid var(--color-border-primary)",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--color-bg-secondary)",
                  }}
                >
                  <GripVertical size={14} style={{ color: "var(--color-text-muted)" }} />
                  <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-muted)", width: 20 }}>
                    {index + 1}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-heading)", fontWeight: "var(--font-weight-medium)" }}>
                      {entry?.name || "Unknown user"}
                    </div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {entry ? entry.position || entry.subRole || entry.role : "No longer has a signature"}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => moveSignatory(index, -1)} disabled={index === 0} ariaLabel="Move up">
                    ↑
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => moveSignatory(index, 1)} disabled={index === signatories.length - 1} ariaLabel="Move down">
                    ↓
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleSignatory(id)} ariaLabel="Remove">
                    <X size={15} />
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>No signatories selected yet.</p>
        )}

        {/* Picker */}
        <div style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-3)" }}>
          <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users with signatures" size="sm" />
          <div style={{ marginTop: "var(--spacing-2)", maxHeight: 240, overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
            {directoryLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-4)" }}>
                <Spinner size="small" />
              </div>
            ) : filteredDirectory.length === 0 ? (
              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)", padding: "var(--spacing-3)", textAlign: "center" }}>
                No users with a signature found.
              </p>
            ) : (
              filteredDirectory.map((entry) => (
                <label
                  key={entry.userId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--spacing-2)",
                    padding: "var(--spacing-1-5) var(--spacing-2)",
                    borderRadius: "var(--radius-md)",
                    cursor: "pointer",
                  }}
                >
                  <Checkbox
                    checked={signatories.includes(String(entry.userId))}
                    onChange={() => toggleSignatory(entry.userId)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-heading)" }}>{entry.name}</div>
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      {[entry.position, entry.subRole || entry.role].filter(Boolean).join(" · ")}
                      {entry.type === "text" ? " · text signature" : ""}
                    </div>
                  </div>
                </label>
              ))
            )}
          </div>
        </div>
      </section>

      <div>
        <Button onClick={handleSave} loading={isLoading}>
          Save certificate template
        </Button>
      </div>
    </div>
  )
}

export default CertificateTemplateForm
