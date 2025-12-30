import React, { useState } from "react"
import Modal from "../../common/Modal"
import Button from "../../common/Button"
import Input from "../../common/ui/Input"
import Select from "../../common/ui/Select"
import { faceScannerApi, adminApi } from "../../../service"
import { useEffect } from "react"

const AddFaceScannerModal = ({ show, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "hostel-gate",
        direction: "in",
        hostelId: "",
    })
    const [hostels, setHostels] = useState([])
    const [loading, setLoading] = useState(false)
    const [credentials, setCredentials] = useState(null)

    useEffect(() => {
        const fetchHostels = async () => {
            try {
                const response = await adminApi.getAllHostels()
                setHostels(response || [])
            } catch (error) {
                console.error("Error fetching hostels:", error)
            }
        }
        if (show) {
            fetchHostels()
            setCredentials(null)
        }
    }, [show])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await faceScannerApi.createScanner(formData)
            if (response?.success) {
                setCredentials(response.data.credentials)
                onAdd()
            } else {
                alert("Failed to create scanner. Please try again.")
            }
        } catch (error) {
            console.error("Error creating scanner:", error)
            alert("Failed to create scanner. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: "",
            type: "hostel-gate",
            direction: "in",
            hostelId: "",
        })
        setCredentials(null)
        onClose()
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        alert("Copied to clipboard!")
    }

    if (!show) return null

    const hostelOptions = [
        { value: "", label: "Select Hostel (Optional)" },
        ...hostels.map((h) => ({ value: h.id, label: h.name })),
    ]

    const typeOptions = [{ value: "hostel-gate", label: "Hostel Gate" }]

    const directionOptions = [
        { value: "in", label: "Entry (Check In)" },
        { value: "out", label: "Exit (Check Out)" },
    ]

    return (
        <Modal title={credentials ? "Scanner Created" : "Add Face Scanner"} onClose={handleClose} width={500}>
            {credentials ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
                    <div
                        style={{
                            backgroundColor: "var(--color-success-bg)",
                            padding: "var(--spacing-4)",
                            borderRadius: "var(--radius-lg)",
                            border: "var(--border-1) solid var(--color-success)",
                        }}
                    >
                        <p style={{ color: "var(--color-success-dark)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                            Scanner created successfully!
                        </p>
                        <p style={{ color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)" }}>
                            Save these credentials now. The password will not be shown again.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                        <div>
                            <label style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-2)" }}>
                                Username
                            </label>
                            <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                                <Input type="text" value={credentials.username} readOnly />
                                <Button variant="secondary" size="medium" onClick={() => copyToClipboard(credentials.username)}>
                                    Copy
                                </Button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)", marginBottom: "var(--spacing-2)" }}>
                                Password
                            </label>
                            <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                                <Input type="text" value={credentials.password} readOnly />
                                <Button variant="secondary" size="medium" onClick={() => copyToClipboard(credentials.password)}>
                                    Copy
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                        <Button variant="primary" size="medium" onClick={handleClose}>
                            Done
                        </Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                        <div>
                            <label style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                                Scanner Name
                            </label>
                            <Input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g., Boys Hostel Entry Scanner" required />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)" }}>
                            <div>
                                <label style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                                    Type
                                </label>
                                <Select name="type" value={formData.type} onChange={handleChange} options={typeOptions} required />
                            </div>

                            <div>
                                <label style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                                    Direction
                                </label>
                                <Select name="direction" value={formData.direction} onChange={handleChange} options={directionOptions} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: "block", color: "var(--color-text-tertiary)", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                                Hostel (Optional)
                            </label>
                            <Select name="hostelId" value={formData.hostelId} onChange={handleChange} options={hostelOptions} />
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-end", paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-2)", borderTop: "var(--border-1) solid var(--color-border-light)", gap: "var(--spacing-3)" }}>
                        <Button type="button" onClick={handleClose} variant="secondary" size="medium">
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" size="medium" disabled={loading}>
                            {loading ? "Creating..." : "Create Scanner"}
                        </Button>
                    </div>
                </form>
            )}
        </Modal>
    )
}

export default AddFaceScannerModal
