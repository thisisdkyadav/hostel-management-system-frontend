import { Button, HStack, Surface, Text, VStack } from "hzero"
import { Eye } from "lucide-react"
import { formatProofLocation } from "../proofDocuments"

export const PdfDiagnosticsPanel = ({ report, documents, onViewPdf }) => {
  if (!report) return null
  const issues = report.issues || []

  return (
    <Surface padding="16px" style={{ border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-md)" }}>
      <VStack gap={3}>
        <Text as="div" weight="semibold">
          PDF checks: {report.checkedDocumentCount} of {report.documentCount} attachments checked
        </Text>
        {issues.length ? (
          <Text as="div" size="sm" color="secondary">
            {report.includedDocumentCount || 0} of {report.documentCount} included ({report.renderedDocumentCount || 0} as printed copies); {report.skippedDocumentCount || 0} skipped{report.operation === "check-all" ? " if exported" : ""}.
            {" "}The affected application fields are listed below.
          </Text>
        ) : report.status === "success" ? (
          <Text as="div" size="sm" color="secondary">All attachments passed the PDF checks.</Text>
        ) : null}
        {issues.map((issue) => {
          const document = documents[issue.documentNumber - 1]
          const locations = issue.locations?.length ? issue.locations.map(formatProofLocation) : [issue.displayLocation]
          return (
            <HStack key={issue.documentNumber} gap={3} align="start" justify="between" wrap>
              <VStack gap={1} style={{ flex: 1, minWidth: 240 }}>
                <Text as="div" size="sm" weight="semibold">PDF #{issue.documentNumber} — {issue.outcome === "recovered" ? "Recovered as printed copy" : report.operation === "check-all" ? "Will be skipped" : "Skipped"}</Text>
                {locations.map((location, index) => (
                  <Text key={index} as="div" size="sm">{location}</Text>
                ))}
                <Text as="div" size="sm" color="secondary">{issue.message}</Text>
              </VStack>
              {document?.url ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onViewPdf({ url: document.url, title: issue.displayLocation })}
                >
                  <Eye size={14} /> Open this PDF
                </Button>
              ) : null}
            </HStack>
          )
        })}
        {report.checkedDocumentCount < report.documentCount ? (
          <Text as="div" size="sm" color="secondary">Use Check all PDFs to inspect the remaining attachments.</Text>
        ) : null}
      </VStack>
    </Surface>
  )
}
