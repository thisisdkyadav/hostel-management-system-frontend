import { Button, Field, HStack, Input, useToast } from "hzero"
import { Copy } from "lucide-react"

/** Read-only username/password pair with copy buttons — shown once after creating or resetting credentials. */
const CredentialsFields = ({ credentials }) => {
    const { toast } = useToast()

    const copy = (text) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard!")
    }

    return (
        <>
            <Field label="Username">
                <HStack gap="small">
                    <Input type="text" value={credentials.username} readOnly />
                    <Button variant="secondary" size="md" onClick={() => copy(credentials.username)}>
                        <Copy size="1em" /> Copy
                    </Button>
                </HStack>
            </Field>
            <Field label="Password">
                <HStack gap="small">
                    <Input type="text" value={credentials.password} readOnly />
                    <Button variant="secondary" size="md" onClick={() => copy(credentials.password)}>
                        <Copy size="1em" /> Copy
                    </Button>
                </HStack>
            </Field>
        </>
    )
}

export default CredentialsFields
