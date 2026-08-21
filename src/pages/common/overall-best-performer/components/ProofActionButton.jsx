import { Button, Text } from "hzero"
import { Eye } from "lucide-react"

export const ProofActionButton = ({ proof, onViewPor, onViewPdf }) => {
  if (!proof) {
    return <Text as="span" color="muted">—</Text>
  }

  if (proof.sourceType === "por") {
    if (!proof.linkedPor) {
      return <Text as="span" color="muted">Verified POR linked</Text>
    }

    return (
      <Button size="sm" variant="secondary" onClick={() => onViewPor?.(proof.linkedPor || null)}>
        <Eye size={14} /> View POR
      </Button>
    )
  }

  if (proof.url) {
    return (
      <Button
        size="sm"
        variant="secondary"
        onClick={() =>
          onViewPdf?.({
            url: proof.url,
            title: proof.label || "Supporting Document",
          })
        }
      >
        <Eye size={14} /> View PDF
      </Button>
    )
  }

  return <Text as="span" color="muted">—</Text>
}

