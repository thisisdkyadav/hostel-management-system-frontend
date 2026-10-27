import { useState } from "react"
import { Alert, Button, Field, HStack, Input, Modal, Switch, Text, useToast, VStack } from "hzero"
import { faceScannerApi } from "../../../service"
import CredentialsFields from "./CredentialsFields"
import { accountIdOf, errorMessage } from "./scannerHelpers"

const footerStyle = { paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-2)", borderTop: "var(--border-1) solid var(--color-border-light)" }

/**
 * The one-time credentials view. Rendered inside ScannerAccountModal after a create,
 * and on its own (AccountCredentialsModal) after a password regeneration.
 */
const CredentialsView = ({ credentials, deviceNames = [], heading, onDone }) => (
    <VStack gap="large">
        <Alert type="success">
            <Text weight="medium" style={{ marginBottom: "var(--spacing-2)" }}>
                {heading}
            </Text>
            <Text size="sm">Save these credentials now. The password will not be shown again.</Text>
        </Alert>

        <CredentialsFields credentials={credentials} />

        <Alert type="warning">
            <Text size="sm">
                Every device in this account must be updated with these credentials, otherwise it will be rejected.
                {deviceNames.length > 0 && " Devices to update:"}
            </Text>
            {deviceNames.length > 0 && (
                <Text size="sm" weight="medium" style={{ marginTop: "var(--spacing-1)", fontFamily: "var(--font-family-mono, monospace)" }}>
                    {deviceNames.join(", ")}
                </Text>
            )}
        </Alert>

        <HStack gap="small" justify="end" style={footerStyle}>
            <Button variant="primary" size="md" onClick={onDone}>
                Done
            </Button>
        </HStack>
    </VStack>
)

export const AccountCredentialsModal = ({ account, credentials, onClose }) => (
    <Modal isOpen title="New Password Generated" onClose={onClose} width={500}>
        <CredentialsView
            credentials={credentials}
            deviceNames={(account?.scanners || []).map((scanner) => scanner.deviceName).filter(Boolean)}
            heading={`Password for "${account?.name}" regenerated`}
            onDone={onClose}
        />
    </Modal>
)

/** Create (no `account`) or edit a ZKTeco account. */
const ScannerAccountModal = ({ account = null, onClose, onSaved }) => {
    const { toast } = useToast()
    const isEdit = Boolean(account)
    const [name, setName] = useState(account?.name || "")
    const [isActive, setIsActive] = useState(account ? account.isActive !== false : true)
    const [changeCredentials, setChangeCredentials] = useState(false)
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [created, setCreated] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const trimmedUsername = username.trim()
        const wantsCredentials = isEdit ? changeCredentials : Boolean(trimmedUsername || password)
        if (wantsCredentials && (!trimmedUsername || !password)) {
            toast.error(isEdit ? "Enter both a new username and password." : "Enter both username and password, or leave both blank to generate them.")
            return
        }

        const payload = { name: name.trim() }
        if (isEdit) payload.isActive = isActive
        if (wantsCredentials) {
            payload.username = trimmedUsername
            payload.password = password
        }

        setLoading(true)
        try {
            const response = isEdit
                ? await faceScannerApi.updateAccount(accountIdOf(account), payload)
                : await faceScannerApi.createAccount(payload)
            if (!response?.success) {
                toast.error(response?.message || "Failed to save account. Please try again.")
                return
            }
            onSaved()
            if (isEdit) {
                toast.success(wantsCredentials ? "Account saved. Update the credentials on every device in it." : "Account saved.")
                onClose()
            } else {
                setCreated(response.data.credentials)
            }
        } catch (error) {
            console.error("Error saving account:", error)
            toast.error(errorMessage(error, "Failed to save account. Please try again."))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal isOpen title={created ? "Account Created" : isEdit ? "Edit Account" : "New ZKTeco Account"} onClose={onClose} width={500}>
            {created ? (
                <CredentialsView credentials={created} heading="Account created successfully!" onDone={onClose} />
            ) : (
                <form onSubmit={handleSubmit}>
                    <VStack gap="large">
                        <Field label="Account Name" htmlFor="accountName" required>
                            <Input type="text" id="accountName" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Main dining hall" required />
                        </Field>

                        {isEdit && (
                            <Switch
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                label="Active"
                                description="An inactive account rejects every device in it."
                            />
                        )}

                        {isEdit ? (
                            <>
                                <Switch
                                    checked={changeCredentials}
                                    onChange={(e) => setChangeCredentials(e.target.checked)}
                                    label="Change credentials"
                                    description={`Current username: ${account.username}. Devices must be updated afterwards.`}
                                />
                                {changeCredentials && (
                                    <>
                                        <Field label="New Username" htmlFor="accountUsername" required>
                                            <Input id="accountUsername" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" required />
                                        </Field>
                                        <Field label="New Password" htmlFor="accountPassword" required>
                                            <Input type="password" id="accountPassword" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                                        </Field>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Text size="sm" color="muted">
                                    Leave both credential fields blank to generate them.
                                </Text>
                                <Field label="Username (Optional)" htmlFor="accountUsername" help="Leave blank to generate.">
                                    <Input id="accountUsername" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" />
                                </Field>
                                <Field label="Password (Optional)" htmlFor="accountPassword" help="Leave blank to generate.">
                                    <Input type="password" id="accountPassword" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                                </Field>
                            </>
                        )}

                        <HStack gap="small" justify="end" style={footerStyle}>
                            <Button type="button" onClick={onClose} variant="secondary" size="md">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="md" disabled={loading}>
                                {loading ? "Saving..." : isEdit ? "Save Account" : "Create Account"}
                            </Button>
                        </HStack>
                    </VStack>
                </form>
            )}
        </Modal>
    )
}

export default ScannerAccountModal
