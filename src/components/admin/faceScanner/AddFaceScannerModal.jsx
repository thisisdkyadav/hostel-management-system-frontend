import React, { useEffect, useState } from "react"
import { Alert, Button, Field, HStack, Input, Label, Modal, Select, Text, useToast, VStack } from "hzero"
import { faceScannerApi, adminApi } from "../../../service"

const AddFaceScannerModal = ({ show, onClose, onAdd, scanner = null }) => {
    const { toast } = useToast()
    const [formData, setFormData] = useState(() => ({
        name: scanner?.name || "",
        provider: scanner ? scanner.provider || "" : "time-watch",
        deviceName: scanner?.deviceName || "",
        username: "",
        password: "",
        type: scanner?.type || "hostel-gate",
        direction: scanner?.direction || "in",
        hostelId: scanner?.hostelId?._id || scanner?.hostelId || "",
        catererId: scanner?.catererId?._id || scanner?.catererId || "",
    }))
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
            toast.error("Please select a caterer for the dining meal scanner.")
            return
        }
        setLoading(true)

        try {
            const { username, password, provider, deviceName, ...settings } = formData
            const payload = {
                ...settings,
                ...(provider ? { provider } : {}),
                ...(provider === "zkteco" ? { deviceName: deviceName.trim() } : {}),
            }
            if (provider === "zkteco" && (username || password)) {
                if (!username.trim() || !password) {
                    toast.error("Enter both username and password to use existing credentials.")
                    return
                }
                payload.username = username.trim()
                payload.password = password
            }
            const response = scanner
                ? await faceScannerApi.updateScanner(scanner._id, payload)
                : await faceScannerApi.createScanner(payload)
            if (response?.success) {
                onAdd()
                if (scanner) {
                    toast.success("Scanner settings saved.")
                    onClose()
                } else {
                    setCredentials(response.data.credentials)
                }
            } else {
                toast.error(response?.message || "Failed to save scanner. Please try again.")
            }
        } catch (error) {
            console.error("Error saving scanner:", error)
            toast.error(error?.response?.data?.message || error?.message || "Failed to save scanner. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onClose()
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
        toast.success("Copied to clipboard!")
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

    const providerOptions = [
        ...(scanner && !scanner.provider ? [{ value: "", label: "Legacy (current behavior)" }] : []),
        { value: "time-watch", label: "Time Watch" },
        { value: "zkteco", label: "ZKTeco" },
    ]

    const directionOptions = [
        { value: "in", label: "Entry (Check In)" },
        { value: "out", label: "Exit (Check Out)" },
    ]

    return (
        <Modal isOpen={show} title={credentials ? "Scanner Created" : scanner ? "Scanner Settings" : "Add Face Scanner"} onClose={handleClose} width={500}>
            {credentials ? (
                <VStack gap="large">
                    <Alert type="success">
                        <Text weight="medium" style={{ marginBottom: "var(--spacing-2)" }}>
                            Scanner created successfully!
                        </Text>
                        <Text size="sm">
                            Save these credentials now. The password will not be shown again.
                        </Text>
                    </Alert>

                    {formData.provider === "zkteco" && (
                        <Text size="sm">Device name: {formData.deviceName.trim()}. Configure this exact name as the terminal alias and use the credentials below for Basic authentication.</Text>
                    )}

                    <Field label="Username">
                        <HStack gap="small">
                            <Input type="text" value={credentials.username} readOnly />
                            <Button variant="secondary" size="md" onClick={() => copyToClipboard(credentials.username)}>
                                Copy
                            </Button>
                        </HStack>
                    </Field>

                    <Field label="Password">
                        <HStack gap="small">
                            <Input type="text" value={credentials.password} readOnly />
                            <Button variant="secondary" size="md" onClick={() => copyToClipboard(credentials.password)}>
                                Copy
                            </Button>
                        </HStack>
                    </Field>

                    <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                        <Button variant="primary" size="md" onClick={handleClose}>
                            Done
                        </Button>
                    </HStack>
                </VStack>
            ) : (
                <form onSubmit={handleSubmit}>
                    <VStack gap="large">
                        <Field label="Provider" htmlFor="provider" required>
                            <Select name="provider" id="provider" value={formData.provider} onChange={handleChange} options={providerOptions} required={!scanner} />
                        </Field>

                        <Field label="Scanner Name" htmlFor="name" required>
                            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Dining Hall Breakfast Scanner" required />
                        </Field>

                        {formData.provider === "zkteco" && (
                            <>
                                <Field label="Device Name (TERMINAL_ALIAS)" htmlFor="deviceName" required>
                                    <Input name="deviceName" id="deviceName" value={formData.deviceName} onChange={handleChange} placeholder="e.g., m1" required />
                                    <Text size="sm" color="muted">Must match the terminal alias exactly. Each ZKTeco device needs a unique name.</Text>
                                </Field>
                                <Text size="sm" color="muted">
                                    {scanner ? `Current username: ${scanner.username}. Leave both fields blank to keep the credentials.` : "Leave both credential fields blank to generate credentials, or enter an existing username and password shared by your devices."}
                                </Text>
                                <Field label="Username (Optional)" htmlFor="username">
                                    <Input name="username" id="username" value={formData.username} onChange={handleChange} autoComplete="off" />
                                </Field>
                                <Field label="Password (Optional)" htmlFor="password">
                                    <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} autoComplete="new-password" />
                                </Field>
                            </>
                        )}

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
                            <Field label="Hostel (Optional)" htmlFor="hostelId">
                                <Select name="hostelId" id="hostelId" value={formData.hostelId} onChange={handleChange} options={hostelOptions} />
                            </Field>
                        ) : (
                            <Field label="Caterer" htmlFor="catererId" required>
                                <Select name="catererId" id="catererId" value={formData.catererId} onChange={handleChange} options={catererOptions} required />
                            </Field>
                        )}

                        <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-5)", marginTop: "var(--spacing-2)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                            <Button type="button" onClick={handleClose} variant="secondary" size="md">
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" size="md" disabled={loading}>
                                {loading ? "Saving..." : scanner ? "Save Settings" : "Create Scanner"}
                            </Button>
                        </HStack>
                    </VStack>
                </form>
            )}
        </Modal>
    )
}

export default AddFaceScannerModal
