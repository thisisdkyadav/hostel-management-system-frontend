import { useRef, useState } from "react"
import { Alert, Button, HStack, VStack } from "hzero"
import { Save } from "lucide-react"
import PdfUploadField from "@/components/common/pdf/PdfUploadField"
import { uploadApi } from "@/service"

const uploadTemplate = (file) => {
  const formData = new FormData()
  formData.append("file", file)
  return uploadApi.uploadDiningRebateFormTemplate(formData)
}

/**
 * Dining settings: the blank long-term rebate form students must download,
 * fill and upload when they request a long-term rebate.
 */
const DiningRebateSettingsForm = ({ config, onUpdate, isLoading }) => {
  // Initialised from `config`; the parent remounts this form (via `key`) when the saved ref changes.
  const [ref, setRef] = useState(config?.longTermFormRef || "")
  const [name, setName] = useState(config?.longTermFormName || "")
  // The upload callback only sees the File; remember its name until onChange fires with the ref.
  const uploadedNameRef = useRef("")

  const savedRef = config?.longTermFormRef || ""
  const dirty = Boolean(config) && ref !== savedRef
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

  return (
    <VStack gap={5}>
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
          disabled={isLoading || !dirty}
          loading={isLoading}
          onClick={() => onUpdate({ longTermFormRef: ref, longTermFormName: ref ? name : "" })}
        >
          <Save size="1em" /> Save Changes
        </Button>
      </HStack>
    </VStack>
  )
}

export default DiningRebateSettingsForm
