import { useEffect, useState } from "react"
import { Button } from "czero/react"
import CsvUploader from "@/components/common/CsvUploader"
import CertificateViewerModal from "@/components/common/students/CertificateViewerModal"
import { useToast } from "@/components/ui/feedback"
import { electionsApi, uploadApi } from "@/service"

const isPdfDocument = (url = "") => /\.pdf(\?.*)?$/i.test(String(url))

const resolveUploadedUrl = (uploadResponse) => {
  if (typeof uploadResponse === "string") return uploadResponse
  if (uploadResponse?.url) return uploadResponse.url
  if (uploadResponse?.data?.url) return uploadResponse.data.url
  return ""
}

export const StatusPill = ({
  tone = "default",
  icon = null,
  children,
  pillBaseStyle,
  statusToneStyles,
}) => (
  <span style={{ ...pillBaseStyle, ...(statusToneStyles[tone] || statusToneStyles.default) }}>
    {icon}
    {children}
  </span>
)

export const HeaderSelect = ({
  value,
  onChange,
  options,
  placeholder,
  headerSelectStyle,
  formatElectionOptionLabel,
}) => (
  <div style={{ minWidth: "320px" }}>
    <select style={headerSelectStyle} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {formatElectionOptionLabel(option)}
        </option>
      ))}
    </select>
  </div>
)

export const MetaList = ({ items = [], mutedTextStyle }) => (
  <div style={{ display: "grid", gap: "10px" }}>
    {items.map((item) => (
      <div
        key={item.label}
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--spacing-3)",
        }}
      >
        <span style={mutedTextStyle}>{item.label}</span>
        <span
          style={{
            color: "var(--color-text-body)",
            fontWeight: "var(--font-weight-medium)",
            textAlign: "right",
          }}
        >
          {item.value || "—"}
        </span>
      </div>
    ))}
  </div>
)

export const ScopeEditor = ({
  title,
  scope = {},
  onChange,
  batchOptions = [],
  groupOptions = [],
  error,
  flatPanelStyle,
  labelStyle,
  mutedTextStyle,
  pillBaseStyle,
  errorTextStyle,
  nominationTemplateHeaders,
}) => {
  const [studentCount, setStudentCount] = useState(0)
  const [countLoading, setCountLoading] = useState(false)

  useEffect(() => {
    let isActive = true
    const hasSelection =
      (Array.isArray(scope?.batches) ? scope.batches.length : 0) > 0 ||
      (Array.isArray(scope?.groups) ? scope.groups.length : 0) > 0 ||
      (Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers.length : 0) > 0

    if (!hasSelection) {
      setStudentCount(0)
      setCountLoading(false)
      return () => {
        isActive = false
      }
    }

    setCountLoading(true)
    electionsApi
      .getScopeCount({
        batches: Array.isArray(scope?.batches) ? scope.batches : [],
        groups: Array.isArray(scope?.groups) ? scope.groups : [],
        extraRollNumbers: Array.isArray(scope?.extraRollNumbers) ? scope.extraRollNumbers : [],
      })
      .then((response) => {
        if (!isActive) return
        setStudentCount(Number(response?.data?.count || 0))
      })
      .catch(() => {
        if (!isActive) return
        setStudentCount(0)
      })
      .finally(() => {
        if (!isActive) return
        setCountLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [scope?.batches, scope?.groups, scope?.extraRollNumbers])

  const toggleBatch = (batch) => {
    const currentBatches = Array.isArray(scope?.batches) ? scope.batches : []
    const exists = currentBatches.includes(batch)
    onChange({
      batches: exists ? [] : [batch],
      groups: [],
      extraRollNumbers: [],
    })
  }

  const toggleGroup = (groupName) => {
    const currentGroups = Array.isArray(scope?.groups) ? scope.groups : []
    const exists = currentGroups.includes(groupName)
    const nextGroups = exists
      ? currentGroups.filter((item) => item !== groupName)
      : [...currentGroups, groupName]

    onChange({
      batches: [],
      groups: nextGroups,
      extraRollNumbers: [],
    })
  }

  return (
    <div style={flatPanelStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--spacing-3)",
          marginBottom: "var(--spacing-3)",
        }}
      >
        <div>
          <div style={{ ...labelStyle, marginBottom: "4px" }}>{title}</div>
          <div style={mutedTextStyle}>
            {countLoading ? "Counting students..." : `${studentCount} student(s) selected`}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "var(--spacing-3)" }}>
        <div style={labelStyle}>Batches</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {batchOptions.map((batch) => {
            const isSelected = (scope.batches || []).includes(batch)
            return (
              <button
                key={batch}
                type="button"
                onClick={() => toggleBatch(batch)}
                style={{
                  ...pillBaseStyle,
                  border: "1px solid",
                  borderColor: isSelected ? "var(--color-primary)" : "var(--color-border-primary)",
                  backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                  color: isSelected ? "var(--color-primary)" : "var(--color-text-body)",
                  cursor: "pointer",
                }}
              >
                {batch}
              </button>
            )
          })}
          {batchOptions.length === 0 ? <span style={mutedTextStyle}>No configured batches available.</span> : null}
        </div>
      </div>

      <div style={{ marginBottom: "var(--spacing-3)" }}>
        <div style={labelStyle}>Groups</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {groupOptions.map((groupName) => {
            const isSelected = (scope.groups || []).includes(groupName)
            return (
              <button
                key={groupName}
                type="button"
                onClick={() => toggleGroup(groupName)}
                style={{
                  ...pillBaseStyle,
                  border: "1px solid",
                  borderColor: isSelected ? "var(--color-primary)" : "var(--color-border-primary)",
                  backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                  color: isSelected ? "var(--color-primary)" : "var(--color-text-body)",
                  cursor: "pointer",
                }}
              >
                {groupName}
              </button>
            )
          })}
          {groupOptions.length === 0 ? <span style={mutedTextStyle}>No configured groups available.</span> : null}
        </div>
      </div>

      <div>
        <div style={labelStyle}>Additional students via CSV</div>
        <CsvUploader
          requiredFields={nominationTemplateHeaders}
          templateHeaders={nominationTemplateHeaders}
          templateFileName={`${title.toLowerCase().replace(/\s+/g, "_")}_students.csv`}
          instructionText="Upload a CSV with a single `rollNumber` column."
          onDataParsed={(rows) => {
            const nextRollNumbers = rows
              .map((row) => String(row.rollNumber || "").trim().toUpperCase())
              .filter(Boolean)

            onChange({
              batches: [],
              groups: [],
              extraRollNumbers: [...new Set(nextRollNumbers)],
            })
          }}
        />
        {(scope.extraRollNumbers || []).length > 0 ? (
          <div style={{ marginTop: "var(--spacing-3)", ...mutedTextStyle }}>
            {(scope.extraRollNumbers || []).length} CSV student(s) loaded
          </div>
        ) : null}
        {error ? <div style={errorTextStyle}>{error}</div> : null}
      </div>
    </div>
  )
}

export const HostelPicker = ({
  selectedHostels = [],
  hostels = [],
  onChange,
  pillBaseStyle,
  mutedTextStyle,
}) => {
  const toggleHostel = (hostelName) => {
    const exists = selectedHostels.includes(hostelName)
    onChange(exists ? selectedHostels.filter((item) => item !== hostelName) : [...selectedHostels, hostelName])
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
      {hostels.map((hostel) => {
        const hostelName = hostel.name
        const isSelected = selectedHostels.includes(hostelName)
        return (
          <button
            key={hostel.id}
            type="button"
            onClick={() => toggleHostel(hostelName)}
            style={{
              ...pillBaseStyle,
              border: "1px solid",
              borderColor: isSelected ? "var(--color-primary)" : "var(--color-border-primary)",
              backgroundColor: isSelected ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
              color: isSelected ? "var(--color-primary)" : "var(--color-text-body)",
              cursor: "pointer",
            }}
          >
            {hostelName}
          </button>
        )
      })}
      {hostels.length === 0 ? <span style={mutedTextStyle}>No hostels available.</span> : null}
    </div>
  )
}

export const DocumentUploadField = ({
  label,
  value,
  onChange,
  disabled = false,
  required = false,
  flatPanelStyle,
  labelStyle,
  mutedTextStyle,
}) => {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [viewerOpen, setViewerOpen] = useState(false)

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name)

    if (!isPdf) {
      toast.error("Only PDF files are allowed")
      event.target.value = ""
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document size must be 5MB or smaller")
      event.target.value = ""
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("file", file)
      const uploadResponse = await uploadApi.uploadElectionNominationDocument(formData)
      const uploadedUrl = resolveUploadedUrl(uploadResponse)

      if (!uploadedUrl) {
        throw new Error("Upload response did not include a document URL")
      }

      onChange(uploadedUrl)
      toast.success(`${label} uploaded`)
    } catch (error) {
      toast.error(error.message || `Failed to upload ${label}`)
    } finally {
      setUploading(false)
      event.target.value = ""
    }
  }

  return (
    <>
      <div style={flatPanelStyle}>
        <label style={labelStyle}>
          {label}
          {required ? " *" : ""}
        </label>
        {value ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}>
              {isPdfDocument(value) ? "PDF uploaded" : "Document uploaded"}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Button size="sm" variant="secondary" onClick={() => setViewerOpen(true)}>
                View
              </Button>
              {!disabled ? (
                <label style={{ margin: 0 }}>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "36px",
                      padding: "0 var(--spacing-3)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-primary)",
                      backgroundColor: "var(--color-bg-primary)",
                      color: "var(--color-text-body)",
                      cursor: uploading ? "wait" : "pointer",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    {uploading ? "Uploading..." : "Replace"}
                  </span>
                </label>
              ) : null}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
              <div style={mutedTextStyle}>PDF only, max 5MB</div>
            <label style={{ margin: 0 }}>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
                disabled={disabled || uploading}
              />
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "36px",
                  padding: "0 var(--spacing-3)",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "var(--button-primary-bg)",
                  color: "var(--color-white)",
                  cursor: disabled || uploading ? "not-allowed" : "pointer",
                  fontSize: "var(--font-size-sm)",
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                {uploading ? "Uploading..." : `Upload ${label}`}
              </span>
            </label>
          </div>
        )}
      </div>

      <CertificateViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        certificateUrl={value}
      />
    </>
  )
}
