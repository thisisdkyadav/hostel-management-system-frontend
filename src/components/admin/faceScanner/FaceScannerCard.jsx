import React, { useState } from "react"
import { FaCamera, FaEdit, FaTrash, FaKey, FaArrowRight, FaArrowLeft, FaBuilding, FaPowerOff } from "react-icons/fa"
import { Badge, Card, CardBody, CardFooter, CardHeader, Grid, Heading, HStack, Surface, Text, VStack } from "@/components/ui"
import { Button } from "czero/react"
import { faceScannerApi } from "../../../service"

const FaceScannerCard = ({ scanner, onUpdate, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [showCredentials, setShowCredentials] = useState(false)
    const [newCredentials, setNewCredentials] = useState(null)
    const [loading, setLoading] = useState(false)

    const getDirectionStyle = (direction) => {
        if (direction === "in") {
            return {
                base: "bg-[var(--color-success-bg)] text-[var(--color-success-text)]",
                hover: "bg-[var(--color-success)] text-white",
                icon: <FaArrowRight />,
                label: "Entry",
            }
        }
        return {
            base: "bg-[var(--color-warning-bg)] text-[var(--color-warning-text)]",
            hover: "bg-[var(--color-warning)] text-white",
            icon: <FaArrowLeft />,
            label: "Exit",
        }
    }

    const directionStyle = getDirectionStyle(scanner.direction)

    const handleRegeneratePassword = async () => {
        if (!confirm("Are you sure you want to regenerate the password? The old password will stop working.")) {
            return
        }

        setLoading(true)
        try {
            const response = await faceScannerApi.regeneratePassword(scanner._id)
            if (response?.success) {
                setNewCredentials(response.data.credentials)
                setShowCredentials(true)
            } else {
                alert("Failed to regenerate password.")
            }
        } catch (error) {
            console.error("Error regenerating password:", error)
            alert("Failed to regenerate password.")
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
            alert("Failed to update scanner.")
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${scanner.name}"?`)) {
            return
        }

        setLoading(true)
        try {
            await faceScannerApi.deleteScanner(scanner._id)
            onDelete()
        } catch (error) {
            console.error("Error deleting scanner:", error)
            alert("Failed to delete scanner.")
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert("Copied to clipboard!")
    }

    return (
        <Card className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            {/* Header with Icon and Title */}
            <CardHeader>
                <HStack gap={4} align="center">
                    <div
                        className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${isHovered ? directionStyle.hover : directionStyle.base}`}
                    >
                        <FaCamera />
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
                        <FaBuilding color="var(--color-text-muted)" />
                        <span>Hostel: {scanner.hostelId?.name || "Not Assigned"}</span>
                    </HStack>
                ) : (
                    <HStack align="center" gap={2} size="sm" color="tertiary">
                        <FaBuilding color="var(--color-text-muted)" />
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
                        <FaKey />
                        New Password
                    </Button>
                    <Button onClick={handleToggleActive} variant="secondary" size="md" fullWidth disabled={loading}>
                        <FaPowerOff />
                        {scanner.isActive ? "Deactivate" : "Activate"}
                    </Button>
                </Grid>
                <Button onClick={handleDelete} variant="danger" size="md" fullWidth disabled={loading}>
                    <FaTrash />
                    Delete Scanner
                </Button>
            </CardFooter>
        </Card>
    )
}

export default FaceScannerCard
