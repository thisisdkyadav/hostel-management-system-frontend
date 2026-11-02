import { useMutation } from "@tanstack/react-query"
import { Alert, Button, VStack } from "hzero"
import { Download } from "lucide-react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { downloadEventDossier } from "@/components/gymkhana/events-page/eventExport"

/** Exports the saved event record: event details, the proposal and its approval history, then the proposal's PDFs. */
export default function EventExportButton({ eventId, mega = false }) {
  const download = useMutation({
    mutationFn: async () => {
      const response = await gymkhanaEventsApi.exportEvent(eventId, mega)
      await downloadEventDossier(response)
    },
  })
  if (!eventId) return null
  return (
    <VStack gap={2} align="end" style={{ width: "fit-content", maxWidth: "100%", marginInlineStart: "auto" }}>
      <Button variant="secondary" size="sm" loading={download.isPending} disabled={download.isPending} onClick={() => download.mutate()}>
        <Download size={14} /> {download.isPending ? "Preparing event record…" : "Download event record (PDF)"}
      </Button>
      {download.isError && <Alert type="error">{download.error?.message || "Could not export this event. Please try again."}</Alert>}
    </VStack>
  )
}
