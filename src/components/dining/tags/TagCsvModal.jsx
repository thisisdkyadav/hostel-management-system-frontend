import { useMemo, useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, FileInput, HStack, Modal, StatusBadge, Textarea, useToast, VStack } from "hzero"
import { FileUp } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningTagsApi } from "@/service"
import { getErrorMessage } from "../caterer/catererHelpers"
import { MAX_BULK_ENTRIES, parseTagCsv } from "./tagHelpers"
import "./Tags.css"

const PREVIEW_ROWS = 8

const CsvBody = ({ tag, onClose }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [text, setText] = useState("")
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const parsed = useMemo(() => parseTagCsv(text), [text])
  const tooMany = parsed.entries.length > MAX_BULK_ENTRIES
  const yesCount = parsed.entries.filter((entry) => entry.value).length

  const submit = useMutation({
    mutationFn: () => diningTagsApi.bulkSetValues(tag.id, parsed.entries),
    onSuccess: async (res) => {
      setResult(res || { updated: 0, skipped: [] })
      toast.success(`Updated ${res?.updated ?? 0} students`)
      await queryClient.invalidateQueries({ queryKey: queryKeys.diningTags.all })
    },
    onError: (err) => setError(getErrorMessage(err, "Unable to upload the answers.")),
  })

  const loadFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      setText(await file.text())
      setFileName(file.name)
      setError("")
      setResult(null)
    } catch {
      setError("Unable to read that file.")
    }
  }

  const footer = result ? (
    <Button onClick={onClose}>Done</Button>
  ) : (
    <HStack justify="end" gap="small">
      <Button variant="secondary" onClick={onClose} disabled={submit.isPending}>
        Cancel
      </Button>
      <Button
        onClick={() => {
          setError("")
          submit.mutate()
        }}
        loading={submit.isPending}
        disabled={!parsed.entries.length || tooMany}
      >
        {parsed.entries.length ? `Upload ${parsed.entries.length} answers` : "Upload"}
      </Button>
    </HStack>
  )

  return (
    <Modal isOpen onClose={submit.isPending ? undefined : onClose} title={`Upload answers for ${tag.name}`} width={640} footer={footer}>
      <VStack gap="large">
        {error && <Alert type="error" icon>{error}</Alert>}

        {result ? (
          <VStack gap="medium">
            <Alert type={result.skipped?.length ? "warning" : "success"} icon>
              Updated {result.updated} student{result.updated === 1 ? "" : "s"}
              {result.skipped?.length ? `, skipped ${result.skipped.length}.` : "."}
            </Alert>
            {result.skipped?.length > 0 && (
              <ul className="tg-lines" aria-label="Skipped rows">
                {result.skipped.map((item, index) => (
                  <li key={`${item.rollNumber}-${index}`}>
                    <b>{item.rollNumber}</b>
                    <span className="tg-muted">{item.reason}</span>
                  </li>
                ))}
              </ul>
            )}
          </VStack>
        ) : (
          <>
            <p className="tg-hint">
              One student per line as <b>rollNumber,value</b> where value is yes, no, true, false, 1 or 0. A header row is optional. A list of
              roll numbers on their own means yes.
            </p>
            <div className="tg-field__row">
              <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                <FileUp size={16} /> Choose CSV file
              </Button>
              <FileInput ref={fileRef} accept=".csv,text/csv,text/plain" onChange={loadFile} hidden />
              {fileName && <span className="tg-muted">{fileName}</span>}
            </div>
            <Textarea
              rows={6}
              value={text}
              onChange={(event) => {
                setText(event.target.value)
                setFileName("")
              }}
              placeholder={"rollNumber,value\n210101001,yes\n210101002,no"}
              resize="vertical"
              aria-label="Pasted CSV"
            />

            {text.trim() && (
              <div className="tg-preview">
                <div className="tg-preview__head">
                  <StatusBadge tone="success" showDot={false}>{yesCount} yes</StatusBadge>
                  <StatusBadge tone="danger" showDot={false}>{parsed.entries.length - yesCount} no</StatusBadge>
                  {parsed.invalid.length > 0 && <StatusBadge tone="warning" showDot={false}>{parsed.invalid.length} invalid</StatusBadge>}
                  {parsed.duplicates > 0 && <span className="tg-muted">{parsed.duplicates} repeated, last one used</span>}
                </div>
                {tooMany && <Alert type="error" icon>At most {MAX_BULK_ENTRIES} entries per upload.</Alert>}
                {parsed.entries.length > 0 && (
                  <ul className="tg-lines" aria-label="Preview">
                    {parsed.entries.slice(0, PREVIEW_ROWS).map((entry) => (
                      <li key={entry.rollNumber}>
                        <b>{entry.rollNumber}</b>
                        <StatusBadge tone={entry.value ? "success" : "danger"} showDot={false}>{entry.value ? "Yes" : "No"}</StatusBadge>
                      </li>
                    ))}
                    {parsed.entries.length > PREVIEW_ROWS && <li className="tg-muted">and {parsed.entries.length - PREVIEW_ROWS} more</li>}
                  </ul>
                )}
                {parsed.invalid.length > 0 && (
                  <ul className="tg-lines" data-tone="invalid" aria-label="Invalid lines">
                    {parsed.invalid.slice(0, PREVIEW_ROWS).map((item) => (
                      <li key={item.line}>
                        <b>Line {item.line}</b>
                        <span className="tg-muted">{item.text}</span>
                        <span>{item.reason}</span>
                      </li>
                    ))}
                    {parsed.invalid.length > PREVIEW_ROWS && <li className="tg-muted">and {parsed.invalid.length - PREVIEW_ROWS} more</li>}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
      </VStack>
    </Modal>
  )
}

/** Upload `rollNumber,value` answers for one tag: parse, preview and invalid lines first, then submit. */
const TagCsvModal = ({ isOpen, tag, onClose }) => {
  if (!isOpen || !tag) return null
  return <CsvBody key={tag.id} tag={tag} onClose={onClose} />
}

export default TagCsvModal
