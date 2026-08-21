import { Button, Grid, HStack, Panel, Select, Text, VStack } from "hzero"
import { buildMetaChipStyle, fieldLabelStyle, inputStyle, textareaStyle } from "../styles"
import { createEmptyItem } from "../form"
import { SupportingProofField } from "./SupportingProofField"
import { Plus } from "lucide-react"
import { sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const MinimalScoredItemsEditor = ({
  step,
  title,
  items,
  onChange,
  options,
  verifiedPors = [],
  disabled = false,
  uploadLabel = "Supporting document",
  titleLabel = "Title",
  titlePlaceholder = "",
  descriptionLabel = "Description",
  descriptionPlaceholder = "",
  embedded = false,
}) => {
  const rows = Array.isArray(items) ? items : []

  const updateItem = (index, field, value) => {
    onChange(rows.map((item, itemIndex) => (itemIndex === index ? { ...item, [field]: value } : item)))
  }

  const updateItemFields = (index, nextFields) => {
    onChange(
      rows.map((item, itemIndex) => (itemIndex === index ? { ...item, ...nextFields } : item))
    )
  }

  const addItem = () => {
    onChange([...(rows || []), createEmptyItem(options?.[0]?.value || "")])
  }

  const removeItem = (index) => {
    onChange(rows.filter((_, itemIndex) => itemIndex !== index))
  }

  const content = (
    <>
      <VStack gap={3}>
        {!rows.length ? (
          <Text as="div" color="muted" size="sm" style={{ fontStyle: "italic", padding: "var(--spacing-2) 0" }}>
            No entries added yet.
          </Text>
        ) : null}
 
        {rows.map((item, index) => (
          <Grid cols={1} gap={3} style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-card-sm)", border: "1px solid var(--color-border-primary)", backgroundColor: "var(--color-bg-secondary)" }} key={`${title}-${index}`}>
            <HStack gap={3} align="center" justify="between" wrap>
              <HStack gap={2} align="center" wrap>
                <span style={sectionLabelStyle}>Item {index + 1}</span>
                {item.scoreType ? (
                  <span style={buildMetaChipStyle()}>
                    {options.find((option) => option.value === item.scoreType)?.label || item.scoreType}
                  </span>
                ) : null}
              </HStack>
              {!disabled ? (
                <Button size="sm" variant="ghost" onClick={() => removeItem(index)}>
                  Remove
                </Button>
              ) : null}
            </HStack>
 
            <Grid cols={1} gap={3}>
              <div>
                <label style={fieldLabelStyle}>Marking category</label>
                <Select
                  name={`scoreType-${index}`}
                  value={item.scoreType}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "scoreType", event.target.value)}
                  options={options}
                  placeholder="Select marking category"
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>{titleLabel}</label>
                <input
                  value={item.title}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "title", event.target.value)}
                  style={inputStyle}
                  placeholder={titlePlaceholder}
                />
              </div>
              <div>
                <label style={fieldLabelStyle}>{descriptionLabel}</label>
                <textarea
                  value={item.notes}
                  disabled={disabled}
                  onChange={(event) => updateItem(index, "notes", event.target.value)}
                  style={textareaStyle}
                  placeholder={descriptionPlaceholder}
                />
              </div>
              <div>
                <SupportingProofField
                  label={uploadLabel}
                  proofSourceType={item.proofSourceType}
                  proofUrl={item.proofUrl}
                  proofPorId={item.proofPorId}
                  onChange={(proofState) => updateItemFields(index, proofState)}
                  verifiedPors={verifiedPors}
                  disabled={disabled}
                  uploadedText="Supporting PDF uploaded"
                  viewerTitle={`${title} supporting document`}
                />
              </div>
            </Grid>
          </Grid>
        ))}
      </VStack>
    </>
  )
 
  if (embedded) {
    return (
      <Grid cols={1} gap={3}>
        <HStack gap={3} align="start" justify="between" wrap>
          <div>
            <div style={sectionLabelStyle}>{title}</div>
          </div>
          {!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
        </HStack>
        {content}
      </Grid>
    )
  }
 
  return (
    <Panel
      title={`${step}. ${title}`}
      actions={!disabled ? <Button size="sm" variant="secondary" onClick={addItem}><Plus size={14} /> Add item</Button> : null}
    >
      {content}
    </Panel>
  )
}
 
export const SingleSelectionAchievementEditor = ({
  heading,
  value,
  options,
  titleValue,
  notesValue,
  proofUrl,
  proofSourceType = "upload",
  proofPorId = "",
  onValueChange,
  onTitleChange,
  onNotesChange,
  onProofChange,
  verifiedPors = [],
  disabled = false,
  titleLabel = "Title",
  titlePlaceholder = "",
  descriptionLabel = "Description",
  descriptionPlaceholder = "",
}) => (
  <Grid cols={1} gap={3}>
    <Grid cols={1} gap={3}>
      <div>
        <label style={fieldLabelStyle}>{heading} category</label>
        <Select
          name={`${heading}-category`}
          value={value}
          disabled={disabled}
          onChange={(event) => onValueChange(event.target.value)}
          options={options}
          placeholder={`Select ${heading} category`}
        />
      </div>

      {value !== "none" ? (
        <>
          <div>
            <label style={fieldLabelStyle}>{titleLabel}</label>
            <input
              value={titleValue}
              disabled={disabled}
              onChange={(event) => onTitleChange(event.target.value)}
              style={inputStyle}
              placeholder={titlePlaceholder}
            />
          </div>
          <div>
            <label style={fieldLabelStyle}>{descriptionLabel}</label>
            <textarea
              value={notesValue}
              disabled={disabled}
              onChange={(event) => onNotesChange(event.target.value)}
              style={textareaStyle}
              placeholder={descriptionPlaceholder}
            />
          </div>
          <div>
            <SupportingProofField
              label="Supporting document"
              proofSourceType={proofSourceType}
              proofUrl={proofUrl}
              proofPorId={proofPorId}
              onChange={onProofChange}
              verifiedPors={verifiedPors}
              disabled={disabled}
              uploadedText="Supporting PDF uploaded"
              viewerTitle={`${heading} supporting document`}
            />
          </div>
        </>
      ) : (
        <Text as="div" size="sm" color="muted" leading={1.6}>
          Leave this as `No entry` if it does not apply to you.
        </Text>
      )}
    </Grid>
  </Grid>
)

