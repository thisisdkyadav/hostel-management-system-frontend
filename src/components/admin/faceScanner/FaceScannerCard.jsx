import React, { useState } from "react"
import { FaCamera, FaEdit, FaTrash, FaKey, FaArrowRight, FaArrowLeft, FaBuilding, FaPowerOff } from "react-icons/fa"
import Card from "../../common/Card"
import Button from "../../common/Button"
import { faceScannerApi } from "../../../service"

const FaceScannerCard = ({ scanner, onUpdate, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [showCredentials, setShowCredentials] = useState(false)
    const [newCredentials, setNewCredentials] = useState(null)
    const [loading, setLoading] = useState(false)

    const getDirectionStyle = (direction) => {
        if (direction === "in") {
            return {
                base: "bg-[var(--color-success-bg)] text-[var(--color-success-dark)]",
                hover: "bg-[var(--color-success)] text-white",
                icon: <FaArrowRight />,
                label: "Entry",
            }
        }
        return {
            base: "bg-[var(--color-warning-bg)] text-[var(--color-warning-dark)]",
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
            <Card.Header>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
                    <div
                        className={`w-[50px] h-[50px] rounded-[14px] flex items-center justify-center text-xl transition-all duration-300 ${isHovered ? directionStyle.hover : directionStyle.base}`}
                    >
                        <FaCamera />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "var(--font-size-xl)", fontWeight: "var(--font-weight-bold)", color: "var(--color-text-secondary)" }}>
                            {scanner.name}
                        </h3>
                        <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                            {scanner.type === "hostel-gate" ? "Hostel Gate" : scanner.type}
                        </p>
                    </div>
                    <div
                        style={{
                            padding: "var(--spacing-1) var(--spacing-3)",
                            borderRadius: "var(--radius-full)",
                            fontSize: "var(--font-size-xs)",
                            fontWeight: "var(--font-weight-medium)",
                            backgroundColor: scanner.isActive ? "var(--color-success-bg)" : "var(--color-error-bg)",
                            color: scanner.isActive ? "var(--color-success-dark)" : "var(--color-error-dark)",
                        }}
                    >
                        {scanner.isActive ? "Active" : "Inactive"}
                    </div>
                </div>
            </Card.Header>

            {/* Info Section */}
            <Card.Body style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                    {directionStyle.icon}
                    <span>Direction: {directionStyle.label}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>
                    <FaBuilding style={{ color: "var(--color-text-muted)" }} />
                    <span>Hostel: {scanner.hostelId?.name || "Not Assigned"}</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    <span>Username: {scanner.username}</span>
                </div>

                {scanner.lastActiveAt && (
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        Last active: {new Date(scanner.lastActiveAt).toLocaleString()}
                    </div>
                )}
            </Card.Body>

            {/* Credentials Display */}
            {showCredentials && newCredentials && (
                <div
                    style={{
                        backgroundColor: "var(--color-primary-bg)",
                        padding: "var(--spacing-4)",
                        borderRadius: "var(--radius-lg)",
                        marginBottom: "var(--spacing-4)",
                        border: "var(--border-1) solid var(--color-primary-light)",
                    }}
                >
                    <p style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-primary-dark)", marginBottom: "var(--spacing-2)" }}>
                        New Credentials (save now!)
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>Password:</span>
                            <Button variant="secondary" size="small" onClick={() => copyToClipboard(newCredentials.password)}>
                                Copy Password
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <Card.Footer style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", marginTop: 0 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-2)" }}>
                    <Button onClick={handleRegeneratePassword} variant="secondary" size="medium" icon={<FaKey />} fullWidth disabled={loading}>
                        New Password
                    </Button>
                    <Button onClick={handleToggleActive} variant="secondary" size="medium" icon={<FaPowerOff />} fullWidth disabled={loading}>
                        {scanner.isActive ? "Deactivate" : "Activate"}
                    </Button>
                </div>
                <Button onClick={handleDelete} variant="danger" size="medium" icon={<FaTrash />} fullWidth disabled={loading}>
                    Delete Scanner
                </Button>
            </Card.Footer>
        </Card>
    )
}

export default FaceScannerCard
