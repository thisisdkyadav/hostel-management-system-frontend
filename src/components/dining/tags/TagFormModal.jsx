import { useRef, useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Field, FileInput, Grid, HStack, Input, Label, Modal, Switch, Textarea, ToggleButtonGroup, useToast, VStack } from "hzero"
import { FileUp } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { diningTagsApi } from "@/service"
import { getErrorMessage } from "../caterer/catererHelpers"
import { AUDIENCE_ALL, AUDIENCE_CUSTOM, MAX_NAME_LENGTH, buildPayload, emptyForm, formFromTag, parseRollText, validateForm } from "./tagHelpers"
import "./Tags.css"

const DEFAULT_OPTIONS = [
  { value: "none", label: "None" },
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
]

const AUDIENCE_OPTIONS = [
  { value: AUDIENCE_ALL, label: "All active students" },
  { value: AUDIENCE_CUSTOM, label: "Custom list" },
]

const FORM_ID = "dining-tag-form"

const TagFormBody = ({ tag, onClose, onSaved }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const isEdit = Boolean(tag)
  const [form, setForm] = useState(() => (tag ? formFromTag(tag) : emptyForm()))
  const [error, setError] = useState("")
  const fileRef = useRef(null)

  const set = (patch) => setForm((previous) => ({ ...previous, ...patch }))
  const rollCount = parseRollText(form.rollText).length

  const save = useMutation({
    mutationFn: (payload) => (isEdit ? diningTagsApi.updateTag(tag.id, payload) : diningTagsApi.createTag(payload)),
    onSuccess: async (saved) => {
      toast.success(isEdit ? "Tag updated" : "Tag created")
      await queryClient.invalidateQueries({ queryKey: queryKeys.diningTags.all })
      onSaved?.(saved)
      onClose()
    },
    onError: (err) => setError(getErrorMessage(err, "Unable to save the tag.")),
  })

  const submit = (event) => {
    event.preventDefault()
    const problem = validateForm(form)
    if (problem) return setError(problem)
    setError("")
    save.mutate(buildPayload(form))
  }

  const loadRollFile = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    try {
      const text = await file.text()
      // Accept a plain list or a CSV whose first column holds the roll number.
      const firstColumn = text
        .split(/\r?\n/)
        .map((line) => line.split(",")[0])
        .filter((cell) => cell && !/^roll/i.test(cell.trim()))
      const merged = parseRollText([form.rollText, ...firstColumn].join("\n"))
      set({ rollText: merged.join("\n") })
    } catch {
      setError("Unable to read that file.")
    }
  }

  const footer = (
    <HStack justify="end" gap="small">
      <Button type="button" variant="secondary" onClick={onClose} disabled={save.isPending}>
        Cancel
      </Button>
      <Button type="submit" form={FORM_ID} loading={save.isPending}>
        {isEdit ? "Save changes" : "Create tag"}
      </Button>
    </HStack>
  )

  return (
    <Modal isOpen onClose={save.isPending ? undefined : onClose} title={isEdit ? "Edit tag" : "New tag"} width={680} footer={footer}>
      <form id={FORM_ID} onSubmit={submit} noValidate>
        <VStack gap="large">
          {error && <Alert type="error" icon>{error}</Alert>}

          <Field label="Name" htmlFor="tg-name" required help={`${form.name.trim().length}/${MAX_NAME_LENGTH}`}>
            <Input id="tg-name" value={form.name} maxLength={MAX_NAME_LENGTH + 20} onChange={(event) => set({ name: event.target.value })} placeholder="Jain food" />
          </Field>
          <Field label="Question" htmlFor="tg-question" help="What students are asked, if you collect answers with a form.">
            <Input id="tg-question" value={form.question} onChange={(event) => set({ question: event.target.value })} placeholder="Do you need Jain food?" />
          </Field>
          <Field label="Description" htmlFor="tg-description">
            <Textarea id="tg-description" rows={2} value={form.description} onChange={(event) => set({ description: event.target.value })} resize="none" />
          </Field>

          <Grid min={200} gap={4}>
            <Field label="Start date" htmlFor="tg-start" required>
              <Input id="tg-start" type="date" value={form.startDate} onChange={(event) => set({ startDate: event.target.value })} />
            </Field>
            <Field label="End date" htmlFor="tg-end" required>
              <Input id="tg-end" type="date" value={form.endDate} onChange={(event) => set({ endDate: event.target.value })} />
            </Field>
          </Grid>

          <div className="tg-field">
            <Label>Default answer</Label>
            <ToggleButtonGroup options={DEFAULT_OPTIONS} value={form.defaultValue} onChange={(value) => set({ defaultValue: value })} size="small" shape="rounded" hideLabelsOnMobile={false} />
            <p className="tg-hint">Applies to students who have not answered. None means no answer counts until they give one.</p>
          </div>

          <div className="tg-section">
            <Switch
              checked={form.formEnabled}
              onChange={(event) => set({ formEnabled: event.target.checked })}
              label="Collect answers with a form"
            />
            <p className="tg-hint">Eligible students see the question on their dining page while the form is open.</p>

            {form.formEnabled && (
              <VStack gap="large">
                <Grid min={220} gap={4}>
                  <Field label="Opens at" htmlFor="tg-opens" required>
                    <Input id="tg-opens" type="datetime-local" value={form.opensAt} onChange={(event) => set({ opensAt: event.target.value })} />
                  </Field>
                  <Field label="Closes at" htmlFor="tg-closes" required>
                    <Input id="tg-closes" type="datetime-local" value={form.closesAt} onChange={(event) => set({ closesAt: event.target.value })} />
                  </Field>
                </Grid>

                <div className="tg-field">
                  <Label required>Audience</Label>
                  <ToggleButtonGroup options={AUDIENCE_OPTIONS} value={form.audience} onChange={(value) => set({ audience: value })} size="small" shape="rounded" hideLabelsOnMobile={false} />
                </div>

                {form.audience === AUDIENCE_CUSTOM && (
                  <div className="tg-field">
                    <Field label="Roll numbers" htmlFor="tg-rolls" help="Separate with commas, spaces or new lines.">
                      <Textarea id="tg-rolls" rows={4} value={form.rollText} onChange={(event) => set({ rollText: event.target.value })} resize="vertical" placeholder="210101001, 210101002" />
                    </Field>
                    <div className="tg-field__row">
                      <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()}>
                        <FileUp size={16} /> Add from CSV
                      </Button>
                      <FileInput ref={fileRef} accept=".csv,text/csv,text/plain" onChange={loadRollFile} hidden />
                      <span className="tg-muted">
                        {rollCount} roll number{rollCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                )}
              </VStack>
            )}
          </div>
        </VStack>
      </form>
    </Modal>
  )
}

/** Create or edit a standalone tag. Mount-keyed so each open starts from the tag's own values. */
const TagFormModal = ({ isOpen, tag, onClose, onSaved }) => {
  if (!isOpen) return null
  return <TagFormBody key={tag?.id || "new"} tag={tag} onClose={onClose} onSaved={onSaved} />
}

export default TagFormModal
