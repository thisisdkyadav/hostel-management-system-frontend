import { useRef, useState } from "react"
import { Alert, Button, FileInput, HStack, Progress, Surface, Switch, Table, Text, VStack } from "hzero"
import { Download, Upload } from "lucide-react"
import { studentApi } from "@/service"
import { escapeCsvValue } from "@/utils/csvExport"
import { buildProfilePhotoItems, uploadProfilePhotoBatches } from "@/utils/studentProfilePhotos"

const PAGE_SIZE = 50
const LABELS = { ready: "Ready", invalid: "Invalid", updated: "Updated", skipped: "Skipped", error: "Failed" }

const ProfilePicturesTab = ({ onBusyChange, onComplete }) => {
  const fileInputRef = useRef(null)
  const busyRef = useRef(false)
  const stopRef = useRef(false)
  const [items, setItems] = useState([])
  const [override, setOverride] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [stopping, setStopping] = useState(false)
  const [page, setPage] = useState(0)

  const counts = items.reduce((result, item) => {
    result[item.status] += 1
    return result
  }, { ready: 0, invalid: 0, updated: 0, skipped: 0, error: 0 })
  const completed = items.length - counts.ready
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE))

  const applyFiles = (files) => {
    if (busyRef.current) return
    setItems(buildProfilePhotoItems(files))
    setPage(0)
  }

  const runUpload = async (retry = false) => {
    if (busyRef.current) return
    const source = retry
      ? items.map((item) => item.status === "error" ? { ...item, status: "ready", message: "" } : item)
      : items
    if (!source.some((item) => item.status === "ready")) return

    busyRef.current = true
    stopRef.current = false
    setStopping(false)
    setItems(source)
    setIsUploading(true)
    onBusyChange(true)
    let updated = 0
    try {
      await uploadProfilePhotoBatches({
        items: source,
        upload: (file) => studentApi.uploadProfilePhoto(file, override),
        shouldStop: () => stopRef.current,
        onBatch: (results) => {
          updated += results.filter((item) => item.status === "updated").length
          const byId = new Map(results.map((item) => [item.id, item]))
          setItems((previous) => previous.map((item) => byId.get(item.id) || item))
        },
      })
    } finally {
      busyRef.current = false
      setIsUploading(false)
      setStopping(false)
      onBusyChange(false)
      if (updated > 0) onComplete?.()
    }
  }

  const exportResults = () => {
    const rows = [["fileName", "rollNumber", "status", "message"], ...items.map((item) => [
      item.fileName, item.rollNumber, LABELS[item.status], item.message,
    ])]
    const blob = new Blob([rows.map((row) => row.map(escapeCsvValue).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "student_profile_picture_results.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <VStack gap={4} align="stretch">
      <Text size="sm" color="muted">
        Select JPEG/JPG profile pictures named with each student’s roll number, for example 230001024.jpg.
        Existing pictures are skipped by default. Each picture can be up to 500KB.
      </Text>
      <Switch
        checked={override}
        onChange={(event) => setOverride(event.target.checked)}
        disabled={isUploading}
        label="Override existing profile pictures"
        description={override ? "Matching students’ existing pictures will be replaced." : "Only students without a profile picture will be updated."}
      />
      <Surface
        as="button"
        type="button"
        bg="secondary"
        padding={8}
        radius="xl"
        disabled={isUploading}
        className="w-full text-center border-2 border-dashed border-[var(--color-border-input)] hover:bg-[var(--color-bg-tertiary)] [font:inherit] disabled:opacity-60"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); applyFiles(event.dataTransfer.files) }}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload style={{ margin: "0 auto", height: "var(--icon-3xl)", width: "var(--icon-3xl)" }} color="var(--color-text-muted)" />
        <Text size="sm" color="muted" style={{ marginTop: "var(--spacing-2)" }}>
          Drop pictures here, or click to select multiple files
        </Text>
      </Surface>
      <FileInput
        ref={fileInputRef}
        accept="image/jpeg,.jpg,.jpeg"
        multiple
        hidden
        disabled={isUploading}
        onChange={(event) => { applyFiles(event.target.files); event.target.value = "" }}
      />

      {items.length > 0 && (
        <>
          <Text size="sm" role="status" aria-live="polite">
            {items.length} selected · {counts.ready} ready · {counts.updated} updated · {counts.skipped} skipped · {counts.error} failed · {counts.invalid} invalid
          </Text>
          <Progress
            value={completed}
            max={items.length}
            showLabel
            label={isUploading
              ? (stopping ? "Stopping after current uploads…" : `${completed} of ${items.length} processed`)
              : `${completed} of ${items.length} processed`}
            animate={isUploading}
          />
          {isUploading && <Text size="sm" color="muted">Keep this window open while pictures upload.</Text>}
          <Surface style={{ overflowX: "auto" }}>
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head scope="col">File name</Table.Head>
                  <Table.Head scope="col">Roll number</Table.Head>
                  <Table.Head scope="col">Status</Table.Head>
                  <Table.Head scope="col">Details</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {items.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE).map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.fileName}</Table.Cell>
                    <Table.Cell>{item.rollNumber || "—"}</Table.Cell>
                    <Table.Cell>{LABELS[item.status]}</Table.Cell>
                    <Table.Cell>{item.message}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Surface>
          <HStack gap={3} justify="between" wrap>
            <Text size="sm" color="muted">Page {page + 1} of {pages} · Up to 50 files per page</Text>
            <HStack gap={2}>
              <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Previous</Button>
              <Button variant="secondary" size="sm" disabled={page + 1 >= pages} onClick={() => setPage((value) => value + 1)}>Next</Button>
            </HStack>
          </HStack>
          {!isUploading && counts.ready === 0 && (
            <Alert type={counts.error || counts.invalid ? "warning" : "success"} title="Profile picture upload complete">
              {counts.updated} updated, {counts.skipped} skipped, {counts.error} failed, {counts.invalid} invalid.
              {counts.error > 0 && " Retry failed uploads below."}
            </Alert>
          )}
        </>
      )}

      <HStack gap={3} wrap justify="end">
        {items.length > 0 && <Button variant="secondary" disabled={isUploading} onClick={exportResults}><Download size="1em" /> Export Results</Button>}
        {!isUploading && counts.error > 0 && <Button variant="secondary" onClick={() => runUpload(true)}>Retry Failed</Button>}
        {isUploading ? (
          <Button variant="secondary" disabled={stopping} onClick={() => { stopRef.current = true; setStopping(true) }}>Stop After Current Uploads</Button>
        ) : (
          <Button variant="primary" disabled={counts.ready === 0} onClick={() => runUpload()}>
            <Upload size="1em" /> Upload {counts.ready} Pictures
          </Button>
        )}
      </HStack>
    </VStack>
  )
}

export default ProfilePicturesTab
