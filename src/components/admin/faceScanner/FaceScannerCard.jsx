import React, { useState } from "react"
import { Badge, Button, Card, CardBody, CardFooter, CardHeader, Grid, Heading, HStack, Surface, Text, useConfirm, useToast, VStack } from "hzero"
import { faceScannerApi } from "../../../service"
import { ArrowLeft, ArrowRight, Building2, Camera, Key, Pencil, Power, Trash2 } from "lucide-react"

const FaceScannerCard = ({ scanner, onUpdate, onDelete }) => {
    const { toast } = useToast()
    const confirm = useConfirm()
    const [showCredentials, setShowCredentials] = useState(false)
    const [newCredentials, setNewCredentials] = useState(null)
    const [loading, setLoading] = useState(false)

    const getDirectionStyle = (direction) => {
        if (direction === "in") {
            return {
                base: "bg-[var(--color-success-bg)] text-[var(--color-success-text)] group-hover:bg-[var(--color-success)] group-hover:text-[var(--color-on-accent)]",
                icon: <ArrowRight size="1em" />,
                label: "Entry",
            }
        }
        return {
            base: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)] group-hover:bg-[var(--color-warning)] group-hover:text-[var(--color-on-accent)]",
            icon: <ArrowLeft size="1em" />,
            label: "Exit",
        }
    }

    const directionStyle = getDirectionStyle(scanner.direction)

    const handleRegeneratePassword = async () => {
        if (!(await confirm({ message: "Are you sure you want to regenerate the password? The old password will stop working.", isDestructive: true }))) {
            return
        }

        setLoading(true)
        try {
            const response = await faceScannerApi.regeneratePassword(scanner._id)
            if (response?.success) {
                setNewCredentials(response.data.credentials)
                setShowCredentials(true)
            } else {
                toast.error("Failed to regenerate password.")
            }
        } catch (error) {
            console.error("Error regenerating password:", error)
            toast.error("Failed to regenerate password.")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleActive = async () => {
        setLoading(true)
        try {
            await faceScannerApi.updateScanner(scanner._id, { isActive: !scanner.isActive })
            onUpdate()
        } catch (error) {
            console.error("Error updating scanner:", error)
            toast.error("Failed to update scanner.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!(await confirm({ message: `Are you sure you want to delete "${scanner.name}"?`, isDestructive: true }))) {
            return
        }

        setLoading(true)
        try {
            await faceScannerApi.deleteScanner(scanner._id)
            onDelete()
        } catch (error) {
            console.error("Error deleting scanner:", error)
            toast.error("Failed to delete scanner.")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard!")
    }

    return (
        <Card className="group">
            {/* Header with Icon and Title */}
            <CardHeader>
                <HStack gap={4} align="center">
                    <div
                        className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${directionStyle.base}`}
                    >
                        <Camera size="1em" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Heading as="h3" size="xl" weight="bold" color="secondary">
                            {scanner.name}
                        </Heading>
                        <Text size="sm" color="muted">
                            {scanner.type === "hostel-gate" ? "Hostel Gate" : "Dining Meal"}
                        </Text>
                    </div>
                    <Badge variant={scanner.isActive ? "success" : "danger"}>
                        {scanner.isActive ? "Active" : "Inactive"}
                    </Badge>
                </HStack>
            </CardHeader>

            {/* Info Section */}
            <CardBody style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                <HStack align="center" gap={2} size="sm" color="tertiary">
                    {directionStyle.icon}
                    <span>Direction: {directionStyle.label}</span>
                </HStack>

                {scanner.type === "hostel-gate" ? (
                    <HStack align="center" gap={2} size="sm" color="tertiary">
                        <Building2 color="var(--color-text-muted)" />
                        <span>Hostel: {scanner.hostelId?.name || "Not Assigned"}</span>
                    </HStack>
                ) : (
                    <HStack align="center" gap={2} size="sm" color="tertiary">
                        <Building2 color="var(--color-text-muted)" />
                        <span>Caterer: {scanner.catererId?.name || "Not Assigned"}</span>
                    </HStack>
                )}

                <HStack align="center" gap={2} size="sm" color="muted">
                    <span>Username: {scanner.username}</span>
                </HStack>

                {scanner.lastActiveAt && (
                    <Text as="div" size="xs" color="muted">
                        Last active: {new Date(scanner.lastActiveAt).toLocaleString()}
                    </Text>
                )}
            </CardBody>

            {/* Credentials Display */}
            {showCredentials && newCredentials && (
                <Surface bg="brand" padding={4} radius="lg" border="var(--border-1) solid var(--color-primary-light)" style={{ marginBottom: "var(--spacing-4)" }}>
                    <Text size="sm" weight="medium" color="var(--color-primary-dark)" style={{ marginBottom: "var(--spacing-2)" }}>
                        New Credentials (save now!)
                    </Text>
                    <VStack gap={2}>
                        <HStack gap="none" align="center" justify="between">
                            <Text as="span" size="sm" color="tertiary">Password:</Text>
                            <Button variant="secondary" size="sm" onClick={() => copyToClipboard(newCredentials.password)}>
                                Copy Password
                            </Button>
                        </HStack>
                    </VStack>
                </Surface>
            )}

            {/* Action Buttons */}
            <CardFooter style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: 0 }}>
                <Grid cols={2} gap={2}>
                    <Button onClick={handleRegeneratePassword} variant="secondary" size="md" fullWidth disabled={loading}>
                        <Key size="1em" />
                        New Password
                    </Button>
                    <Button onClick={handleToggleActive} variant="secondary" size="md" fullWidth disabled={loading}>
                        <Power size="1em" />
                        {scanner.isActive ? "Deactivate" : "Activate"}
                    </Button>
                </Grid>
                <Button onClick={handleDelete} variant="danger" size="md" fullWidth disabled={loading}>
                    <Trash2 size="1em" />
                    Delete Scanner
                </Button>
            </CardFooter>
        </Card>
    )
}

export default FaceScannerCard
