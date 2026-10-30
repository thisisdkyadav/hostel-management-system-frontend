import { useRef, useState } from "react"
import { Alert, Button, Field, Grid, HStack, Input, Label, VStack } from "hzero"
import { Save } from "lucide-react"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { uploadApi } from "@/service"
import { DEFAULT_REBATE_SETTINGS, normalizeRebateSettings } from "@/components/dining/diningPeriodHelpers"

const RULE_KEYS = ["shortTermMaxTotalDays", "shortTermMaxContinuousDays", "shortTermMinApplicationDays", "shortTermMinAdvanceDays"]

/** Same checks the server applies to the `diningRebate` rule numbers. Returns an error string or "". */
const validateRebateRules = (rules) => {
  for (const key of RULE_KEYS) {
    if (String(rules[key] ?? "").trim() === "" || !Number.isInteger(Number(rules[key]))) return "All rebate rules must be whole numbers."
  }
  const total = Number(rules.shortTermMaxTotalDays)
  const continuous = Number(rules.shortTermMaxContinuousDays)
  const minDays = Number(rules.shortTermMinApplicationDays)
  const advance = Number(rules.shortTermMinAdvanceDays)
  if (total < 0) return "Max short-term days per dining period cannot be negative."
  if (continuous < 1) return "Max continuous short-term days must be at least 1."
  if (minDays < 1) return "Minimum days per request must be at least 1."
  if (minDays > continuous) return "Minimum days per request cannot exceed the max continuous short-term days."
  if (advance < 0) return "Advance notice days cannot be negative."
  return ""
}

const digitsOnly = (value) => String(value || "").replace(/[^\d]/g, "")

const uploadTemplate = (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return uploadApi.uploadDiningRebateFormTemplate(formData)
}

/**
 * Dining settings: the global rebate rules (short-term limits) and the blank
 * long-term rebate form students must download, fill and upload when they
 * request a long-term rebate. Both are saved together in one config value.
 */
const DiningRebateSettingsForm = ({ config, onUpdate, isLoading }) => {
  // Initialised from `config`; the parent remounts this form (via `key`) when the saved ref changes.
  const [ref, setRef] = useState(config?.longTermFormRef || "")
  const [name, setName] = useState(config?.longTermFormName || "")
  const [rules, setRules] = useState(() => normalizeRebateSettings({ ...DEFAULT_REBATE_SETTINGS, ...(config || {}) }))
  // The upload callback only sees the File; remember its name until onChange fires with the ref.
  const uploadedNameRef = useRef("")

  const savedRef = config?.longTermFormRef || ""
  const savedRules = normalizeRebateSettings({ ...DEFAULT_REBATE_SETTINGS, ...(config || {}) })
  const rulesDirty = RULE_KEYS.some((key) => String(rules[key]) !== String(savedRules[key]))
  const rulesError = validateRebateRules(rules)
  const dirty = Boolean(config) && (ref !== savedRef || rulesDirty)
  const removing = dirty && !ref && Boolean(savedRef)

  const handleUpload = async (file) => {
    const result = await uploadTemplate(file)
    uploadedNameRef.current = file.name
    return result
  }

  const handleChange = (nextRef) => {
    setRef(nextRef || "")
    setName(nextRef ? uploadedNameRef.current || "Long-term rebate form.pdf" : "")
  }

  const handleRuleChange = (key, value) => setRules((prev) => ({ ...prev, [key]: digitsOnly(value) }))

  const handleSave = () =>
    onUpdate({
      ...Object.fromEntries(RULE_KEYS.map((key) => [key, Number(rules[key])])),
      longTermFormRef: ref,
      longTermFormName: ref ? name : "",
    })

  return (
    <VStack gap={5}>
      <VStack gap="small">
        <Label>Rebate rules</Label>
        <Alert type="info" icon>
          These rules apply to every student, whichever dining period or caterer the days fall in. A request is short-term (approved straight away)
          when its continuous days are within the limit below; anything longer is long-term and needs approval. The per-period total is counted
          separately for each dining period a rebate touches. For example, with 10 per period and 7 continuous, a 28 Jan–2 Feb rebate is 6 continuous
          days, so it is short-term; it uses 4 of January&apos;s short-term days and 2 of February&apos;s.
        </Alert>
        <Grid min={200} gap={4}>
          <Field
            label="Max short-term days per dining period"
            htmlFor="rebate-total-days"
            required
            help="Total short-term days a student can use within ONE dining period. Counted per period, not per request."
          >
            <Input id="rebate-total-days" type="number" min="0" value={rules.shortTermMaxTotalDays} disabled={isLoading}
              onChange={(e) => handleRuleChange("shortTermMaxTotalDays", e.target.value)} />
          </Field>
          <Field
            label="Max continuous short-term days"
            htmlFor="rebate-continuous-days"
            required
            help="Longest run of days approved automatically, even across periods. Longer requests are long-term."
          >
            <Input id="rebate-continuous-days" type="number" min="1" value={rules.shortTermMaxContinuousDays} disabled={isLoading}
              onChange={(e) => handleRuleChange("shortTermMaxContinuousDays", e.target.value)} />
          </Field>
          <Field
            label="Min days per request"
            htmlFor="rebate-min-days"
            required
            help="Fewest days a single request may cover. Cannot exceed the max continuous days."
          >
            <Input id="rebate-min-days" type="number" min="1" value={rules.shortTermMinApplicationDays} disabled={isLoading}
              onChange={(e) => handleRuleChange("shortTermMinApplicationDays", e.target.value)} />
          </Field>
          <Field
            label="Advance notice days"
            htmlFor="rebate-advance-days"
            required
            help="How many days before the first rebate day a student must apply."
          >
            <Input id="rebate-advance-days" type="number" min="0" value={rules.shortTermMinAdvanceDays} disabled={isLoading}
              onChange={(e) => handleRuleChange("shortTermMinAdvanceDays", e.target.value)} />
          </Field>
        </Grid>
        {rulesError && (
          <Alert type="error" icon>
            {rulesError}
          </Alert>
        )}
      </VStack>

      <Alert variant="info" title="Long-term rebate form">
        When a student asks for a long-term rebate, they must download this form, fill it in and upload it with the request. The dining office
        and admins can open it before approving. Short-term rebates never need a form.
      </Alert>

      <PdfUploadField
        label="Long-term rebate form"
        value={ref}
        onChange={handleChange}
        onUpload={handleUpload}
        maxSizeMb={10}
        uploadedText={name ? `${name} uploaded` : "Form uploaded"}
        viewerTitle="Long-term rebate form"
        viewerSubtitle="Blank form students download, fill and upload"
        downloadFileName={name || "long-term-rebate-form.pdf"}
        disabled={isLoading}
      />

      {removing && (
        <Alert type="warning" icon>
          With no form saved, long-term rebates will no longer require students to upload a form.
        </Alert>
      )}
      {!ref && !removing && (
        <Alert type="info" icon>
          No form is set, so long-term rebates are requested without a form.
        </Alert>
      )}

      <HStack justify="end" gap={3}>
        <Button
          variant="primary"
          disabled={isLoading || !dirty || Boolean(rulesError)}
          loading={isLoading}
          onClick={handleSave}
        >
          <Save size="1em" /> Save Changes
        </Button>
      </HStack>
    </VStack>
  )
}

export default DiningRebateSettingsForm
