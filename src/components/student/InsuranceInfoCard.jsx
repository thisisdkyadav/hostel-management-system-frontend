import { useState } from "react"
import { CalendarDays, FileText, Hash, ShieldPlus } from "lucide-react"
import { formatDateTime } from "../../utils/dateUtils"
import { Button, Card, Heading, HStack, Surface, Text, VStack } from "hzero"
import PdfViewerModal from "../common/pdf/PdfViewerModal"

const getValidity = (endDate) => {
  if (!endDate) return null

  const end = new Date(endDate)
  if (Number.isNaN(end.getTime())) return null

  return end.getTime() >= Date.now()
    ? { label: "Active", bg: "var(--color-success-bg)", color: "var(--color-success-text)" }
    : { label: "Expired", bg: "var(--color-danger-bg)", color: "var(--color-danger-text)" }
}

const InsuranceInfoCard = ({ insurance }) => {
  const [showPdf, setShowPdf] = useState(false)

  if (!insurance) return null

  const provider = insurance.provider
  const periodLabel =
    provider?.startDate && provider?.endDate ? `${formatDateTime(provider.startDate).date} - ${formatDateTime(provider.endDate).date}` : null
  const validity = getValidity(provider?.endDate)

  return (
    <Card padding="p-4" className="w-full">
      <HStack gap="var(--gap-sm)" align="center" justify="between">
        <HStack gap="var(--gap-sm)" align="center">
          <ShieldPlus size={20} color="var(--color-primary)" />
          <Heading as="h3" color="tertiary" weight="medium" size="lg">Insurance</Heading>
        </HStack>
        {validity && (
          <Surface as="span" bg={validity.bg} padding={`var(--spacing-0-5) var(--spacing-2)`} radius="full" color={validity.color} size="xs" style={{ whiteSpace: 'nowrap' }}>{validity.label}</Surface>
        )}
      </HStack>

      {provider?.name && (
        <Text size="xl" weight="medium" color="brand" style={{ marginTop: 'var(--spacing-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{provider.name}</Text>
      )}

      <VStack gap="var(--spacing-1-5)" style={{ marginTop: 'var(--spacing-2)' }}>
        {insurance.insuranceNumber && (
          <HStack align="center" gap="none" size="xs" color="tertiary">
            <Hash size={14} style={{ marginRight: 'var(--spacing-1-5)', flexShrink: 0 }} color="var(--color-text-muted)" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{insurance.insuranceNumber}</span>
          </HStack>
        )}
        {periodLabel && (
          <HStack align="center" gap="none" size="xs" color="tertiary">
            <CalendarDays size={14} style={{ marginRight: 'var(--spacing-1-5)', flexShrink: 0 }} color="var(--color-text-muted)" />
            <span>{periodLabel}</span>
          </HStack>
        )}
        {insurance.documentRef && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowPdf(true)}
            style={{ marginTop: "var(--spacing-2)", alignSelf: "flex-start" }}
          >
            <FileText size={14} /> View insurance PDF
          </Button>
        )}
      </VStack>
      <PdfViewerModal
        isOpen={showPdf}
        onClose={() => setShowPdf(false)}
        documentUrl={insurance.documentRef}
        title="Insurance Document"
        subtitle={insurance.documentName || "Student insurance PDF"}
        downloadFileName={insurance.documentName || "insurance.pdf"}
        fileTypeHint="pdf"
      />
    </Card>
  )
}

export default InsuranceInfoCard
