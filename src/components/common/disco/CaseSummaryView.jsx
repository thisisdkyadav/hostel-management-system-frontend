import { useState } from "react"
import { Button } from "czero/react"
import {
  Eye,
  FileText,
  Users,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Badge } from "@/components/ui"
import CompactStudentTag from "@/components/ui/data-display/CompactStudentTag"
import EmailDetailModal from "./EmailDetailModal"

const formatStatusLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())

const getStatusVariant = (status = "") => {
  switch (status) {
    case "action_taken":
    case "finalized_with_action":
      return "success"
    case "rejected":
    case "final_rejected":
      return "danger"
    case "under_process":
      return "info"
    default:
      return "warning"
  }
}

const getStatusIcon = (status = "") => {
  switch (status) {
    case "action_taken":
    case "finalized_with_action":
      return <CheckCircle size={16} style={{ color: "var(--color-success)" }} />
    case "rejected":
    case "final_rejected":
      return <XCircle size={16} style={{ color: "var(--color-danger)" }} />
    default:
      return <AlertCircle size={16} style={{ color: "var(--color-warning)" }} />
  }
}

/**
 * CaseSummaryView - Complete case summary for closed cases
 */
const CaseSummaryView = ({ caseData, onViewPdf }) => {
  const [expandedSections, setExpandedSections] = useState({
    students: true,
    documents: true,
    emails: false,
    actions: true,
  })
  const [emailDetailModal, setEmailDetailModal] = useState({
    open: false,
    emailLog: null,
  })

  if (!caseData) return null

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const accusingStudents = caseData.selectedStudents?.accusing || []
  const accusedStudents = caseData.selectedStudents?.accused || []
  const statements = caseData.statements || []
  const evidenceDocuments = caseData.evidenceDocuments || []
  const extraDocuments = caseData.extraDocuments || []
  const emailLogs = caseData.emailLogs || []
  const finalDecision = caseData.finalDecision || {}
  const disciplinaryActions = caseData.studentDisciplinaryActions || []

  const sectionStyle = {
    backgroundColor: "var(--color-bg-primary)",
    border: "1px solid var(--color-border-primary)",
    borderRadius: "var(--radius-card-sm)",
    overflow: "hidden",
  }

  const sectionHeaderStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "var(--spacing-3)",
    backgroundColor: "var(--color-bg-secondary)",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.15s ease",
  }

  const sectionTitleStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-semibold)",
    color: "var(--color-text-primary)",
  }

  const sectionContentStyle = {
    padding: "var(--spacing-3)",
    borderTop: "1px solid var(--color-border-light)",
  }

  const infoRowStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    padding: "var(--spacing-2) 0",
    borderBottom: "1px solid var(--color-border-light)",
  }

  const infoLabelStyle = {
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-medium)",
    color: "var(--color-text-muted)",
    minWidth: 100,
    flexShrink: 0,
  }

  const infoValueStyle = {
    fontSize: "var(--font-size-sm)",
    color: "var(--color-text-primary)",
    flex: 1,
  }

  const documentChipStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "4px 8px",
    backgroundColor: "var(--color-bg-tertiary)",
    borderRadius: "var(--radius-badge)",
    fontSize: "var(--font-size-xs)",
    color: "var(--color-primary)",
    cursor: "pointer",
    border: "1px solid var(--color-border-primary)",
    transition: "all 0.15s ease",
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
      {/* Case Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--spacing-3)",
          backgroundColor: "var(--color-bg-secondary)",
          borderRadius: "var(--radius-card-sm)",
          border: "1px solid var(--color-border-primary)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {getStatusIcon(finalDecision.status || caseData.caseStatus)}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "var(--font-size-base)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "var(--color-text-primary)",
                }}
              >
                Case #{caseData.id?.slice(-6)}
              </span>
              <Badge variant={getStatusVariant(finalDecision.status || caseData.caseStatus)}>
                {formatStatusLabel(finalDecision.status || caseData.caseStatus)}
              </Badge>
            </div>
            <span
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
              }}
            >
              Started by {caseData.startedBy?.name || "Unknown"} • {new Date(caseData.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            onViewPdf(
              caseData.complaintPdfUrl,
              "Complaint PDF",
              caseData.complaintPdfName || "complaint.pdf"
            )
          }
        >
          <Eye size={14} />
          Complaint
        </Button>
      </div>

      {/* Final Decision */}
      {finalDecision.decisionDescription && (
        <div
          style={{
            padding: "var(--spacing-3)",
            backgroundColor:
              finalDecision.status === "action_taken"
                ? "var(--color-success-bg-light)"
                : "var(--color-danger-bg-light)",
            borderRadius: "var(--radius-card-sm)",
            border: `1px solid ${
              finalDecision.status === "action_taken"
                ? "var(--color-success-bg)"
                : "var(--color-danger-bg)"
            }`,
          }}
        >
          <div
            style={{
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-text-muted)",
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Final Decision
          </div>
          <div
            style={{
              fontSize: "var(--font-size-sm)",
              color: "var(--color-text-body)",
              lineHeight: 1.5,
            }}
          >
            {finalDecision.decisionDescription}
          </div>
        </div>
      )}

      {/* Students Section */}
      <div style={sectionStyle}>
        <div
          style={sectionHeaderStyle}
          onClick={() => toggleSection("students")}
        >
          <div style={sectionTitleStyle}>
            <Users size={16} />
            Involved Students ({accusingStudents.length + accusedStudents.length})
          </div>
          {expandedSections.students ? (
            <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
          )}
        </div>
        {expandedSections.students && (
          <div style={sectionContentStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {accusedStudents.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-danger)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Accused ({accusedStudents.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {accusedStudents.map((student) => (
                      <CompactStudentTag
                        key={student.id}
                        name={student.name}
                        email={student.email}
                        role="accused"
                      />
                    ))}
                  </div>
                </div>
              )}
              {accusingStudents.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-warning)",
                      marginBottom: 6,
                      textTransform: "uppercase",
                    }}
                  >
                    Accusing ({accusingStudents.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {accusingStudents.map((student) => (
                      <CompactStudentTag
                        key={student.id}
                        name={student.name}
                        email={student.email}
                        role="accusing"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents Section */}
      <div style={sectionStyle}>
        <div
          style={sectionHeaderStyle}
          onClick={() => toggleSection("documents")}
        >
          <div style={sectionTitleStyle}>
            <FileText size={16} />
            Documents ({statements.length + evidenceDocuments.length + extraDocuments.length + (caseData.committeeMeetingMinutes?.pdfUrl ? 1 : 0)})
          </div>
          {expandedSections.documents ? (
            <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
          ) : (
            <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
          )}
        </div>
        {expandedSections.documents && (
          <div style={sectionContentStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Statements */}
              {statements.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    Statements
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {statements.map((statement, index) => (
                      <button
                        key={statement.id || index}
                        type="button"
                        style={documentChipStyle}
                        onClick={() =>
                          onViewPdf(
                            statement.statementPdfUrl,
                            `${statement.student?.name || "Student"} - Statement`,
                            statement.statementPdfName
                          )
                        }
                      >
                        <FileText size={12} />
                        {statement.student?.name || "Student"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence */}
              {evidenceDocuments.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    Evidence
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {evidenceDocuments.map((doc, index) => (
                      <button
                        key={doc.id || index}
                        type="button"
                        style={documentChipStyle}
                        onClick={() =>
                          onViewPdf(doc.pdfUrl, "Evidence Document", doc.pdfName)
                        }
                      >
                        <FileText size={12} />
                        {doc.pdfName || `Evidence ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Documents */}
              {extraDocuments.length > 0 && (
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    Extra Documents
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {extraDocuments.map((doc, index) => (
                      <button
                        key={doc.id || index}
                        type="button"
                        style={documentChipStyle}
                        onClick={() =>
                          onViewPdf(doc.pdfUrl, "Extra Document", doc.pdfName)
                        }
                      >
                        <FileText size={12} />
                        {doc.pdfName || `Document ${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Committee Minutes */}
              {caseData.committeeMeetingMinutes?.pdfUrl && (
                <div>
                  <div
                    style={{
                      fontSize: "var(--font-size-xs)",
                      fontWeight: "var(--font-weight-semibold)",
                      color: "var(--color-text-muted)",
                      marginBottom: 6,
                    }}
                  >
                    Committee Minutes
                  </div>
                  <button
                    type="button"
                    style={{
                      ...documentChipStyle,
                      backgroundColor: "var(--color-primary-bg)",
                    }}
                    onClick={() =>
                      onViewPdf(
                        caseData.committeeMeetingMinutes.pdfUrl,
                        "Committee Minutes",
                        caseData.committeeMeetingMinutes.pdfName
                      )
                    }
                  >
                    <FileText size={12} />
                    {caseData.committeeMeetingMinutes.pdfName || "Committee Minutes"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Emails Section */}
      {emailLogs.length > 0 && (
        <div style={sectionStyle}>
          <div
            style={sectionHeaderStyle}
            onClick={() => toggleSection("emails")}
          >
            <div style={sectionTitleStyle}>
              <Mail size={16} />
              Emails Sent ({emailLogs.length})
            </div>
            {expandedSections.emails ? (
              <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
            ) : (
              <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
            )}
          </div>
          {expandedSections.emails && (
            <div style={sectionContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {emailLogs.map((log, index) => (
                  <div
                    key={log.id || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "var(--spacing-2)",
                      backgroundColor: "var(--color-bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Mail size={14} style={{ color: "var(--color-text-muted)" }} />
                      <div>
                        <div
                          style={{
                            fontSize: "var(--font-size-sm)",
                            fontWeight: "var(--font-weight-medium)",
                            color: "var(--color-text-primary)",
                          }}
                        >
                          {log.subject || "(No subject)"}
                        </div>
                        <div
                          style={{
                            fontSize: "var(--font-size-xs)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {new Date(log.sentAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setEmailDetailModal({ open: true, emailLog: log })
                      }
                    >
                      <Eye size={14} />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Disciplinary Actions */}
      {disciplinaryActions.length > 0 && (
        <div style={sectionStyle}>
          <div
            style={sectionHeaderStyle}
            onClick={() => toggleSection("actions")}
          >
            <div style={sectionTitleStyle}>
              <AlertCircle size={16} />
              Disciplinary Actions ({disciplinaryActions.length})
            </div>
            {expandedSections.actions ? (
              <ChevronUp size={16} style={{ color: "var(--color-text-muted)" }} />
            ) : (
              <ChevronDown size={16} style={{ color: "var(--color-text-muted)" }} />
            )}
          </div>
          {expandedSections.actions && (
            <div style={sectionContentStyle}>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {disciplinaryActions.map((action, index) => (
                  <div
                    key={action.actionId || index}
                    style={{
                      padding: "var(--spacing-3)",
                      backgroundColor: "var(--color-bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--color-border-light)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--font-size-sm)",
                          fontWeight: "var(--font-weight-semibold)",
                          color: "var(--color-text-primary)",
                        }}
                      >
                        {action.student?.name || "Student"}
                      </span>
                      {action.actionDate && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                            fontSize: "var(--font-size-xs)",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          <Calendar size={12} />
                          {new Date(action.actionDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div style={infoRowStyle}>
                      <span style={infoLabelStyle}>Reason:</span>
                      <span style={infoValueStyle}>{action.reason || "N/A"}</span>
                    </div>
                    <div style={{ ...infoRowStyle, borderBottom: "none" }}>
                      <span style={infoLabelStyle}>Action:</span>
                      <span style={infoValueStyle}>
                        {action.actionTaken || "N/A"}
                      </span>
                    </div>
                    {action.remarks && (
                      <div style={{ ...infoRowStyle, borderBottom: "none" }}>
                        <span style={infoLabelStyle}>Remarks:</span>
                        <span style={infoValueStyle}>{action.remarks}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Email Detail Modal */}
      <EmailDetailModal
        isOpen={emailDetailModal.open}
        onClose={() => setEmailDetailModal({ open: false, emailLog: null })}
        emailLog={emailDetailModal.emailLog}
      />
    </div>
  )
}

export default CaseSummaryView
