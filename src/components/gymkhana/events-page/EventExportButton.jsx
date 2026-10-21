import { useMutation } from "@tanstack/react-query"
import { Alert, Button, VStack } from "hzero"
import { Download } from "lucide-react"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { downloadEventDossier } from "@/components/gymkhana/events-page/eventExport"

/** Always exports saved server data, including sections the reviewer has not opened. */
export default function EventExportButton({ eventId, mega = false }) {
  const download = useMutation({
    mutationFn: async () => {
      const response = await gymkhanaEventsApi.exportEvent(eventId, mega)
      await downloadEventDossier(response.data)
    },
  })
  if (!eventId) return null
  return (
    <VStack gap={2}>
      <Button variant="secondary" size="sm" loading={download.isPending} disabled={download.isPending} onClick={() => download.mutate()}>
        <Download size={14} /> {download.isPending ? "Preparing event PDF…" : "Download complete event PDF"}
      </Button>
      {download.isError && <Alert type="error">{download.error?.message || "Could not export this event. Please try again."}</Alert>}
    </VStack>
  )
}
