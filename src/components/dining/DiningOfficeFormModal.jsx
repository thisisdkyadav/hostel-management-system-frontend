import { useState } from "react"
import { Button, Modal, Input } from "czero/react"
import { Alert, Label, VStack } from "@/components/ui"
import { getErrorMessage } from "./diningBillingHelpers"

export const DINING_OFFICE_CATEGORIES = ["Dining Warden", "Dining Hall Supervisor"]

/**
 * Create / edit a Dining Office login (role Dining, sub-role Office).
 * On create, password is required; on edit, password is omitted (managed via
 * the admin Update Password flow). Conditional-mounted with a `key` so the
 * useState initializer seeds edit values without a reset effect.
 */
const DiningOfficeFormModal = ({ isOpen, mode = "create", initialData = {}, onClose, onSubmit }) => {
  const isEdit = mode === "edit"
  const [name, setName] = useState(() => initialData.name || "")
  const [email, setEmail] = useState(() => initialData.email || "")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState(() => initialData.phone || "")
  const [category, setCategory] = useState(() => initialData.category || DINING_OFFICE_CATEGORIES[0])
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!name.trim()) return setError("Name is required.")
    if (!isEdit && !email.trim()) return setError("Email is required.")
    if (!isEdit && !password.trim()) return setError("Password is required.")
    if (!DINING_OFFICE_CATEGORIES.includes(category)) return setError("Please choose a category.")

    const payload = isEdit
      ? { name: name.trim(), phone: phone.trim(), category }
      : { name: name.trim(), email: email.trim(), password, phone: phone.trim(), category }

    setIsSubmitting(true)
    try {
      await onSubmit(payload)
      onClose()
    } catch (submitError) {
      setError(getErrorMessage(submitError, "Unable to save dining office login. Please try again."))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Dining Office Login" : "New Dining Office Login"}
      width={560}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="dining-office-form" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Login"}
          </Button>
        </>
      }
    >
      <form id="dining-office-form" onSubmit={handleSubmit}>
        <VStack gap="large">
          {error && <Alert type="error" icon>{error}</Alert>}

          <div>
            <Label htmlFor="office-name" required>Name</Label>
            <Input id="office-name" value={name} onChange={(e) => { setName(e.target.value); if (error) setError("") }} placeholder="e.g. R. Mehta" required />
          </div>

          <div>
            <Label htmlFor="office-email" required>Email</Label>
            <Input
              id="office-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="login@example.com"
              disabled={isEdit}
              required={!isEdit}
            />
            {isEdit && <p style={{ margin: "var(--spacing-1) 0 0", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>Email cannot be changed after creation.</p>}
          </div>

          {!isEdit && (
            <div>
              <Label htmlFor="office-password" required>Password</Label>
              <Input id="office-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Set an initial password" required />
            </div>
          )}

          <div>
            <Label htmlFor="office-category" required>Category</Label>
            <select
              id="office-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: "100%",
                padding: "var(--spacing-2) var(--spacing-3)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border-primary)",
                backgroundColor: "var(--color-bg-primary)",
                color: "var(--color-text-secondary)",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {DINING_OFFICE_CATEGORIES.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="office-phone">Phone (optional)</Label>
            <Input id="office-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Contact number" />
          </div>
        </VStack>
      </form>
    </Modal>
  )
}

export default DiningOfficeFormModal
