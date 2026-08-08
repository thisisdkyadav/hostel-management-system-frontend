import { useState } from "react"
import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileCheck,
  FileText,
  Files,
  Gavel,
  Mail,
  Paperclip,
  ShieldAlert,
  Users,
  XCircle,
} from "lucide-react"
import {
  Badge,
  Button,
  CompactStudentTag,
  DetailSection,
  EmptyState,
  HStack,
  InfoRow,
  Table,
  Text,
  VStack,
} from "hzero"
import EmailDetailModal from "./EmailDetailModal"

const formatStatusLabel = (value = "") =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase())

/** One vocabulary for both Badge and DetailSection — the names line up. */
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

/** A component reference — DetailSection sizes and tints it itself. */
const getStatusIcon = (status = "") => {
  switch (status) {
    case "action_taken":
    case "finalized_with_action":
      return CheckCircle
    case "rejected":
    case "final_rejected":
      return XCircle
    default:
      return AlertCircle
  }
}

const formatDate = (value) => {
  if (!value) return "N/A"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "N/A"
  return parsed.toLocaleDateString()
}

const SectionToggle = ({ expanded, onToggle, label }) => (
  <Button
    size="sm"
    variant="ghost"
    onClick={onToggle}
    aria-expanded={expanded}
    aria-label={expanded ? `Hide ${label}` : `Show ${label}`}
    icon={expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
  />
)

/**
 * CaseSummaryView - Complete case summary for closed cases
 */
const CaseSummaryView = ({
  caseData,
  onViewPdf,
  onDownloadBundle,
  isDownloadingBundle = false,
}) => {
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
  const disciplinaryActions = finalDecision.studentDisciplinaryActions || []

  const caseStatus = finalDecision.status || caseData.caseStatus
  const StatusIcon = getStatusIcon(caseStatus)
  const studentCount = accusingStudents.length + accusedStudents.length
  const documentCount =
    statements.length +
    evidenceDocuments.length +
    extraDocuments.length +
    (caseData.committeeMeetingMinutes?.pdfUrl ? 1 : 0)

  return (
    <VStack gap={3}>
      <DetailSection
        title={`Case #${caseData.id?.slice(-6)}`}
        icon={StatusIcon}
        tone={getStatusVariant(caseStatus)}
        actions={
          <>
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
            {typeof onDownloadBundle === "function" && (
              <Button
                size="sm"
                variant="primary"
                loading={isDownloadingBundle}
                onClick={onDownloadBundle}
              >
                <Download size={14} />
                Download bundle
              </Button>
            )}
          </>
        }
      >
        <InfoRow
          label="Status"
          value={
            <Badge variant={getStatusVariant(caseStatus)} size="small">
              {formatStatusLabel(caseStatus)}
            </Badge>
          }
        />
        <InfoRow label="Started by" value={caseData.startedBy?.name || "Unknown"} />
        <InfoRow
          label="Started on"
          value={new Date(caseData.createdAt).toLocaleDateString()}
        />
      </DetailSection>

      {finalDecision.decisionDescription && (
        <DetailSection
          title="Final decision"
          icon={Gavel}
          tone={finalDecision.status === "action_taken" ? "success" : "danger"}
        >
          <Text as="p" size="sm" color="body" leading={1.5}>
            {finalDecision.decisionDescription}
          </Text>
        </DetailSection>
      )}

      <DetailSection
        plain
        title={`Involved students (${studentCount})`}
        icon={Users}
        actions={
          <SectionToggle
            expanded={expandedSections.students}
            onToggle={() => toggleSection("students")}
            label="involved students"
          />
        }
      >
        {expandedSections.students &&
          (studentCount === 0 ? (
            <EmptyState
              variant="inline"
              icon={Users}
              message="No students are linked to this case."
            />
          ) : (
            <>
              {accusedStudents.length > 0 && (
                <DetailSection title={`Accused (${accusedStudents.length})`} tone="danger">
                  <HStack gap={2} wrap>
                    {accusedStudents.map((student) => (
                      <CompactStudentTag
                        key={student.id}
                        name={student.name}
                        email={student.email}
                        role="accused"
                      />
                    ))}
                  </HStack>
                </DetailSection>
              )}
              {accusingStudents.length > 0 && (
                <DetailSection title={`Accusing (${accusingStudents.length})`} tone="warning">
                  <HStack gap={2} wrap>
                    {accusingStudents.map((student) => (
                      <CompactStudentTag
                        key={student.id}
                        name={student.name}
                        email={student.email}
                        role="accusing"
                      />
                    ))}
                  </HStack>
                </DetailSection>
              )}
            </>
          ))}
      </DetailSection>

      <DetailSection
        plain
        title={`Documents (${documentCount})`}
        icon={FileText}
        actions={
          <SectionToggle
            expanded={expandedSections.documents}
            onToggle={() => toggleSection("documents")}
            label="documents"
          />
        }
      >
        {expandedSections.documents &&
          (documentCount === 0 ? (
            <EmptyState
              variant="inline"
              icon={FileText}
              message="No documents were filed on this case."
            />
          ) : (
            <>
              {statements.length > 0 && (
                <DetailSection title="Statements" icon={FileText}>
                  <HStack gap={2} wrap>
                    {statements.map((statement, index) => (
                      <Button
                        key={statement.id || index}
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onViewPdf(
                            statement.statementPdfUrl,
                            `${statement.student?.name || "Student"} - Statement`,
                            statement.statementPdfName
                          )
                        }
                      >
                        <FileText size={14} />
                        {statement.student?.name || "Student"}
                      </Button>
                    ))}
                  </HStack>
                </DetailSection>
              )}

              {evidenceDocuments.length > 0 && (
                <DetailSection title="Evidence" icon={Paperclip}>
                  <HStack gap={2} wrap>
                    {evidenceDocuments.map((doc, index) => (
                      <Button
                        key={doc.id || index}
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onViewPdf(doc.pdfUrl, "Evidence Document", doc.pdfName)
                        }
                      >
                        <FileText size={14} />
                        {doc.pdfName || `Evidence ${index + 1}`}
                      </Button>
                    ))}
                  </HStack>
                </DetailSection>
              )}

              {extraDocuments.length > 0 && (
                <DetailSection title="Extra documents" icon={Files}>
                  <HStack gap={2} wrap>
                    {extraDocuments.map((doc, index) => (
                      <Button
                        key={doc.id || index}
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          onViewPdf(doc.pdfUrl, "Extra Document", doc.pdfName)
                        }
                      >
                        <FileText size={14} />
                        {doc.pdfName || `Document ${index + 1}`}
                      </Button>
                    ))}
                  </HStack>
                </DetailSection>
              )}

              {caseData.committeeMeetingMinutes?.pdfUrl && (
                <DetailSection title="Committee minutes" icon={FileCheck} tone="primary">
                  <HStack gap={2} wrap>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        onViewPdf(
                          caseData.committeeMeetingMinutes.pdfUrl,
                          "Committee Minutes",
                          caseData.committeeMeetingMinutes.pdfName
                        )
                      }
                    >
                      <FileText size={14} />
                      {caseData.committeeMeetingMinutes.pdfName || "Committee Minutes"}
                    </Button>
                  </HStack>
                </DetailSection>
              )}
            </>
          ))}
      </DetailSection>

      {emailLogs.length > 0 && (
        <DetailSection
          plain
          title={`Emails sent (${emailLogs.length})`}
          icon={Mail}
          actions={
            <SectionToggle
              expanded={expandedSections.emails}
              onToggle={() => toggleSection("emails")}
              label="emails sent"
            />
          }
        >
          {expandedSections.emails && (
            <Table bordered dense>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Subject</Table.Head>
                  <Table.Head>Sent</Table.Head>
                  <Table.Head align="right">Details</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {emailLogs.map((log, index) => (
                  <Table.Row key={log.id || index}>
                    <Table.Cell>{log.subject || "(No subject)"}</Table.Cell>
                    <Table.Cell>{new Date(log.sentAt).toLocaleString()}</Table.Cell>
                    <Table.Cell align="right">
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
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </DetailSection>
      )}

      {disciplinaryActions.length > 0 && (
        <DetailSection
          plain
          title={`Disciplinary actions (${disciplinaryActions.length})`}
          icon={ShieldAlert}
          actions={
            <SectionToggle
              expanded={expandedSections.actions}
              onToggle={() => toggleSection("actions")}
              label="disciplinary actions"
            />
          }
        >
          {expandedSections.actions &&
            disciplinaryActions.map((action, index) => (
              <DetailSection
                key={action.actionId || index}
                title={action.student?.name || "Student"}
              >
                <InfoRow
                  label="Created"
                  value={formatDate(action.createdDate || action.date)}
                />
                <InfoRow
                  label="Starts"
                  value={formatDate(action.punishmentStartDate || action.date)}
                />
                <InfoRow
                  label="Ends"
                  value={formatDate(
                    action.punishmentEndDate || action.punishmentStartDate || action.date
                  )}
                />
                <InfoRow label="Reason" value={action.reason || "N/A"} />
                <InfoRow label="Action" value={action.actionTaken || "N/A"} />
                {action.remarks && <InfoRow label="Remarks" value={action.remarks} />}
              </DetailSection>
            ))}
        </DetailSection>
      )}

      <EmailDetailModal
        isOpen={emailDetailModal.open}
        onClose={() => setEmailDetailModal({ open: false, emailLog: null })}
        emailLog={emailDetailModal.emailLog}
      />
    </VStack>
  )
}

export default CaseSummaryView
