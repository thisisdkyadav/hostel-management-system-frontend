import React, { useEffect, useState } from "react"
import { Alert, Button, Field, HStack, Input, Label, Modal, Select, Switch, Text, useToast, VStack } from "hzero"
import { faceScannerApi, adminApi } from "../../../service"
import CredentialsFields from "./CredentialsFields"
import { accountIdOf, errorMessage } from "./scannerHelpers"

/**
 * Add / edit a scanner.
 *  - ZKTeco scanners live inside an account: pass `account` (preselected) and `accounts` (move targets).
 *    They carry no credentials of their own.
 *  - Otherwise this is the Time Watch / legacy flow, where credentials are generated and shown once.
 */
const AddFaceScannerModal = ({ show, onClose, onAdd, scanner = null, account = null, accounts = [] }) => {
    const { toast } = useToast()
    const isZk = scanner ? scanner.provider === "zkteco" : Boolean(account)
    const [formData, setFormData] = useState(() => ({
        name: scanner?.name || "",
        provider: scanner ? scanner.provider || "" : account ? "zkteco" : "time-watch",
        deviceName: scanner?.deviceName || "",
        accountId: accountIdOf(scanner?.accountId) || scanner?.accountId || accountIdOf(account),
        isActive: scanner ? scanner.isActive !== false : true,
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
            const { provider, deviceName, accountId, isActive, ...settings } = formData
            const payload = {
                ...settings,
                ...(provider ? { provider } : {}),
                ...(isZk ? { deviceName: deviceName.trim(), accountId, isActive } : {}),
            }
            const response = scanner
                ? await faceScannerApi.updateScanner(scanner._id, payload)
                : await faceScannerApi.createScanner(payload)
            if (response?.success) {
                onAdd()
                if (scanner || isZk) {
                    toast.success(scanner ? "Scanner settings saved." : "Scanner added.")
                    onClose()
                } else {
                    setCredentials(response.data.credentials)
                }
            } else {
                toast.error(response?.message || "Failed to save scanner. Please try again.")
            }
        } catch (error) {
            console.error("Error saving scanner:", error)
            toast.error(errorMessage(error, "Failed to save scanner. Please try again."))
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onClose()
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
    ]

    const accountList = account && !accounts.some((a) => accountIdOf(a) === accountIdOf(account)) ? [account, ...accounts] : accounts
    const accountOptions = accountList.map((a) => ({ value: accountIdOf(a), label: a.name }))

    const directionOptions = [
        { value: "in", label: "Entry (Check In)" },
        { value: "out", label: "Exit (Check Out)" },
    ]

    return (
        <Modal isOpen={show} title={credentials ? "Scanner Created" : scanner ? "Scanner Settings" : isZk ? "Add ZKTeco Scanner" : "Add Face Scanner"} onClose={handleClose} width={500}>
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

                    <CredentialsFields credentials={credentials} />

                    <HStack gap="small" justify="end" style={{ paddingTop: "var(--spacing-4)", borderTop: "var(--border-1) solid var(--color-border-light)" }}>
                        <Button variant="primary" size="md" onClick={handleClose}>
                            Done
                        </Button>
                    </HStack>
                </VStack>
            ) : (
                <form onSubmit={handleSubmit}>
                    <VStack gap="large">
                        {!isZk && (
                            <Field label="Provider" htmlFor="provider" required>
                                <Select name="provider" id="provider" value={formData.provider} onChange={handleChange} options={providerOptions} required={!scanner} />
                            </Field>
                        )}

                        <Field label="Scanner Name" htmlFor="name" required>
                            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} placeholder="e.g., Dining Hall Breakfast Scanner" required />
                        </Field>

                        {isZk && (
                            <>
                                <Field
                                    label="Device Name (TERMINAL_ALIAS)"
                                    htmlFor="deviceName"
                                    required
                                    help="Must match the device's terminal alias exactly. Unique within this account."
                                >
                                    <Input name="deviceName" id="deviceName" value={formData.deviceName} onChange={handleChange} placeholder="e.g., m1" required />
                                </Field>
                                <Field
                                    label="Account"
                                    htmlFor="accountId"
                                    required
                                    help={scanner ? "Moving a scanner to another account means its device must use that account's login." : "The device authenticates with this account's username and password."}
                                >
                                    <Select name="accountId" id="accountId" value={formData.accountId} onChange={handleChange} options={accountOptions} required />
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

                        {isZk && (
                            <Switch checked={formData.isActive} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))} label="Active" description="An inactive scanner's punches are rejected." />
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
