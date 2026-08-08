import { useState } from "react"
import { Camera, Save, Trash2 } from "lucide-react"
import {
  Alert, Avatar, Button, Checkbox, EmptyState, Field, HStack, Input, Modal,
  Select, VStack, useConfirm, useToast,
} from "hzero"
import ImageUploadModal from "../../common/ImageUploadModal"
import { getMediaUrl } from "../../../utils/mediaUtils"

/**
 * One create/edit form for every staff directory.
 *
 * There were eight of these — four "add", four "edit" — and between them they
 * used seven kinds of field. The kinds live here; which of them a screen wants
 * lives in the config. What that removes is not only the duplication but the
 * drift: the old forms announced success with window.alert (seven of them did,
 * one used a toast) and worded the delete confirmation four different ways.
 *
 * A field descriptor is { name, label, type, required, icon, placeholder,
 * options, help, empty }. `options` is an array or a function of ctx, for the
 * lists that are fetched rather than declared.
 */

const initialValues = (fields, staff, config) => {
  const source = staff ? (config.toValues ? config.toValues(staff) : staff) : {}
  return Object.fromEntries(
    fields.map((field) => {
      const current = source[field.name]
      if (field.type === "checkboxes") return [field.name, Array.isArray(current) ? current : []]
      return [field.name, current ?? ""]
    })
  )
}

const resolveOptions = (field, ctx) =>
  (typeof field.options === "function" ? field.options(ctx) : field.options) || []

/**
 * The photo, its current state, and the way to change it. The old version
 * mutated e.target.style on hover to tint the camera button; a button is a
 * button.
 */
const ProfileImageField = ({ value, name, userId, onChange }) => {
  const [picking, setPicking] = useState(false)

  return (
    <>
      <HStack gap="medium" align="center">
        <Avatar size="xxlarge" src={value ? getMediaUrl(value) : undefined} name={name} />
        <Button type="button" variant="secondary" size="sm" onClick={() => setPicking(true)}>
          <Camera /> {value ? "Change photo" : "Add photo"}
        </Button>
      </HStack>
      {picking && (
        <ImageUploadModal
          userId={userId}
          isOpen
          onClose={() => setPicking(false)}
          onImageUpload={(url) => onChange(url)}
        />
      )}
    </>
  )
}

const StaffFormModal = ({ config, mode, staff, ctx, onClose, onSaved }) => {
  const confirm = useConfirm()
  const { toast } = useToast()
  const fields = config.fields[mode] || []

  const [values, setValues] = useState(() => initialValues(fields, staff, config))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const noun = config.title.toLowerCase()
  const set = (name, value) => setValues((prev) => ({ ...prev, [name]: value }))

  const toggleInList = (name, value, checked) =>
    setValues((prev) => {
      const list = Array.isArray(prev[name]) ? prev[name] : []
      return { ...prev, [name]: checked ? [...new Set([...list, value])] : list.filter((v) => v !== value) }
    })

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    try {
      // An empty password means "leave it alone", not "clear it".
      const payload = Object.fromEntries(
        Object.entries(values).filter(([key, value]) => !(key === "password" && !value))
      )
      const response = mode === "create"
        ? await config.api.create(payload)
        : await config.api.update(staff.id ?? staff._id, payload)

      if (!response) {
        setError(`Could not ${mode === "create" ? "add" : "update"} this ${noun}. Try again.`)
        return
      }

      toast.success(mode === "create" ? `${config.title} added.` : "Changes saved.")
      onSaved()
      onClose()
    } catch (err) {
      console.error(`Failed to ${mode} ${config.key}:`, err)
      setError(`Could not ${mode === "create" ? "add" : "update"} this ${noun}. Try again.`)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    const ok = await confirm({
      title: `Delete this ${noun}?`,
      message: `${staff.name}'s account will be removed. This cannot be undone.`,
      isDestructive: true,
    })
    if (!ok) return

    setBusy(true)
    setError(null)
    try {
      const response = await config.api.remove(staff.id ?? staff._id)
      if (!response) {
        setError(`Could not delete this ${noun}. Try again.`)
        return
      }
      toast.success(`${config.title} deleted.`)
      onSaved()
      onClose()
    } catch (err) {
      console.error(`Failed to delete ${config.key}:`, err)
      setError(`Could not delete this ${noun}. Try again.`)
    } finally {
      setBusy(false)
    }
  }

  const renderField = (field) => {
    if (field.type === "image") {
      return (
        <ProfileImageField
          value={values[field.name]}
          name={values.name || staff?.name || ""}
          userId={staff?.id ?? staff?._id}
          onChange={(url) => set(field.name, url)}
        />
      )
    }

    if (field.type === "checkboxes") {
      const options = resolveOptions(field, ctx)
      if (options.length === 0) {
        return <EmptyState variant="inline" message={field.empty || "Nothing to choose from yet."} />
      }
      const selected = values[field.name] || []
      return (
        <VStack gap="small" className="max-h-[15rem] overflow-y-auto rounded-[var(--radius-lg)] border border-[var(--color-border-primary)] p-[var(--spacing-3)]">
          {options.map((option) => (
            <Checkbox
              key={option.value}
              label={option.label}
              checked={selected.includes(option.value)}
              onChange={(e) => toggleInList(field.name, option.value, e.target.checked)}
            />
          ))}
        </VStack>
      )
    }

    const shared = {
      name: field.name,
      id: field.name,
      value: values[field.name] ?? "",
      onChange: (e) => set(field.name, e.target.value),
      required: field.required,
      placeholder: field.placeholder,
      icon: field.icon ? <field.icon /> : undefined,
    }

    if (field.type === "select") {
      const options = resolveOptions(field, ctx)
      return (
        <Select
          {...shared}
          options={field.placeholder ? [{ value: "", label: field.placeholder }, ...options] : options}
        />
      )
    }

    return <Input type={field.type} {...shared} />
  }

  return (
    <Modal isOpen title={mode === "create" ? `Add ${noun}` : `Edit ${noun}`} onClose={onClose} width={500}>
      <form onSubmit={submit}>
        <VStack gap="large">
          {error && <Alert type="error">{error}</Alert>}

          {fields.map((field) => (
            <Field key={field.name} label={field.label} htmlFor={field.name} required={field.required} help={field.help}>
              {renderField(field)}
            </Field>
          ))}

          <HStack
            gap="small"
            justify={mode === "edit" ? "between" : "end"}
            style={{ paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}
          >
            {mode === "edit" ? (
              <Button type="button" onClick={remove} variant="danger" size="md" disabled={busy}>
                <Trash2 /> Delete
              </Button>
            ) : (
              <Button type="button" onClick={onClose} variant="secondary" size="md">Cancel</Button>
            )}
            <Button type="submit" variant="primary" size="md" loading={busy} disabled={busy}>
              <Save /> {mode === "create" ? `Add ${noun}` : "Save changes"}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default StaffFormModal
