import React, { useState } from "react"
import { Select, VStack, HStack, Label, Alert } from "@/components/ui"
import { Button, Modal, Input } from "czero/react"
import { faceScannerApi, adminApi } from "../../../service"
import { useEffect } from "react"

const AddFaceScannerModal = ({ show, onClose, onAdd }) => {
    const [formData, setFormData] = useState({
        name: "",
        type: "hostel-gate",
        direction: "in",
        hostelId: "",
        catererId: "",
    })
    const [hostels, setHostels] = useState([])
    const [caterers, setCaterers] = useState([])
    const [loading, setLoading] = useState(false)
    const [credentials, setCredentials] = useState(null)

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [hostelResponse, catererResponse] = await Promise.all([
                    adminApi.getAllHostels(),
                    adminApi.getAllCaterers(""),
                ])
                setHostels(hostelResponse || [])
                const catererList = Array.isArray(catererResponse)
                    ? catererResponse
                    : Array.isArray(catererResponse?.data)
                      ? catererResponse.data
                      : []
                setCaterers(catererList)
            } catch (error) {
                console.error("Error fetching scanner options:", error)
            }
        }
        if (show) {
            fetchOptions()
            setCredentials(null)
        }
    }, [show])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "type" && value === "hostel-gate" ? { catererId: "" } : {}),
            ...(name === "type" && value === "dining-meal" ? { hostelId: "", direction: "in" } : {}),
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (formData.type === "dining-meal" && !formData.catererId) {
            alert("Please select a caterer for the dining meal scanner.")
            return
        }
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
            catererId: "",
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

    const catererOptions = [
        { value: "", label: "Select Caterer" },
        ...caterers.map((caterer) => ({ value: caterer.id || caterer._id, label: caterer.name })),
    ]

    const typeOptions = [
        { value: "hostel-gate", label: "Hostel Gate" },
        { value: "dining-meal", label: "Dining Meal" },
    ]

    const directionOptions = [
        { value: "in", label: "Entry (Check In)" },
        { value: "out", label: "Exit (Check Out)" },
    ]

    return (
        <Modal isOpen={show} title={credentials ? "Scanner Created" : "Add Face Scanner"} onClose={handleClose} width={500}>
            {credentials ? (
                <VStack gap="large">
                    <Alert type="success">
                        <p style={{ fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-2)" }}>
                            Scanner created successfully!
                        </p>
                        <p style={{ fontSize: "var(--font-size-sm)" }}>
                            Save these credentials now. The password will not be shown again.
                        </p>
                    </Alert>

                    <div>
                        <Label>Username</Label>
                        <HStack gap="small">
                            <Input type="text" value={credentials.username} readOnly />
                            <Button variant="secondary" size="md" onClick={() => copyToClipboard(credentials.username)}>
                                Copy
                            </Button>
                        </HStack>
                    </div>

                    <div>
                        <Label>Password</Label>
                        <HStack gap="small">
                            <Input type="text" value={credentials.password} readOnly />
                            <Button variant="secondary" size="md" onClick={() => copyToClipboard(credentials.password)}>
                                Copy
                            </Button>
                        </HStack>
                    </div>

                    <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                        <Button variant="primary" size="md" onClick={handleClose}>
                            Done
                        </Button>
                    </HStack>
                </VStack>
            ) : (
                <form onSubmit={handleSubmit}>
                    <VStack gap="large">
                        <div>
                            <Label htmlFor="name" required>Scanner Name</Label>
                            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Dining Hall Breakfast Scanner" required />
                        </div>

                        <HStack gap="medium">
                            <div style={{ flex: 1 }}>
                                <Label htmlFor="type" required>Type</Label>
                                <Select name="type" id="type" value={formData.type} onChange={handleChange} options={typeOptions} required />
                            </div>

                            <div style={{ flex: 1 }}>
                                <Label htmlFor="direction" required>Direction</Label>
                                <Select name="direction" id="direction" value={formData.direction} onChange={handleChange} options={directionOptions} required />
                            </div>
                        </HStack>

                        {formData.type === "hostel-gate" ? (
                            <div>
                                <Label htmlFor="hostelId">Hostel (Optional)</Label>
                                <Select name="hostelId" id="hostelId" value={formData.hostelId} onChange={handleChange} options={hostelOptions} />
                            </div>
                        ) : (
                            <div>
                                <Label htmlFor="catererId" required>Caterer</Label>
                                <Select name="catererId" id="catererId" value={formData.catererId} onChange={handleChange} options={catererOptions} required />
                            </div>
                        )}

                        <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-2)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                            <Button type="button" onClick={handleClose} variant="secondary" size="md">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="md" disabled={loading}>
                                {loading ? "Creating..." : "Create Scanner"}
                            </Button>
                        </HStack>
                    </VStack>
                </form>
            )}
        </Modal>
    )
}

export default AddFaceScannerModal
