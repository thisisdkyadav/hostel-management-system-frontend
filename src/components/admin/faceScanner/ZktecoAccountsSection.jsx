import { useState } from "react"
import { Badge, Button, DataTable, EmptyState, Heading, HStack, IconButton, Skeleton, Surface, Text, Tooltip, useConfirm, useToast, VStack } from "hzero"
import { ArrowLeft, ArrowRight, Copy, KeyRound, Pencil, Plus, Trash2, UserRound } from "lucide-react"
import { faceScannerApi } from "../../../service"
import AddFaceScannerModal from "./AddFaceScannerModal"
import ScannerAccountModal, { AccountCredentialsModal } from "./ScannerAccountModal"
import { accountIdOf, errorMessage, exactDateTime, relativeTime, scannerCountOf } from "./scannerHelpers"

const mono = { fontFamily: "var(--font-family-mono, monospace)" }

const scannerTarget = (scanner) =>
    scanner.type === "hostel-gate"
        ? `Hostel Gate → ${scanner.hostelId?.name || "Not assigned"}`
        : `Dining Meal → ${scanner.catererId?.name || "Not assigned"}`

const AccountPanel = ({ account, accounts, onChanged }) => {
    const { toast } = useToast()
    const confirm = useConfirm()
    const [busy, setBusy] = useState(false)
    const [showEdit, setShowEdit] = useState(false)
    const [scannerModal, setScannerModal] = useState(null) // { scanner? }
    const [newCredentials, setNewCredentials] = useState(null)

    const scanners = account.scanners || []
    const scannerCount = scannerCountOf(account)

    const copyUsername = () => {
        navigator.clipboard.writeText(account.username)
        toast.success("Copied to clipboard!")
    }

    const handleNewPassword = async () => {
        const message = `Generate a new password for "${account.name}"? The old password stops working and every device in this account must be updated.`
        if (!(await confirm({ message, isDestructive: true }))) return
        setBusy(true)
        try {
            const response = await faceScannerApi.regenerateAccountPassword(accountIdOf(account))
            if (response?.success) {
                setNewCredentials(response.data.credentials)
            } else {
                toast.error(response?.message || "Failed to generate a new password.")
            }
        } catch (error) {
            console.error("Error regenerating account password:", error)
            toast.error(errorMessage(error, "Failed to generate a new password."))
        } finally {
            setBusy(false)
        }
    }

    const handleDeleteAccount = async () => {
        if (!(await confirm({ message: `Delete the account "${account.name}"? This cannot be undone.`, isDestructive: true }))) return
        setBusy(true)
        try {
            await faceScannerApi.deleteAccount(accountIdOf(account))
            toast.success("Account deleted.")
            onChanged()
        } catch (error) {
            console.error("Error deleting account:", error)
            toast.error(errorMessage(error, "Failed to delete account."))
        } finally {
            setBusy(false)
        }
    }

    const handleDeleteScanner = async (scanner) => {
        if (!(await confirm({ message: `Are you sure you want to delete "${scanner.name}"?`, isDestructive: true }))) return
        try {
            await faceScannerApi.deleteScanner(scanner._id)
            onChanged()
        } catch (error) {
            console.error("Error deleting scanner:", error)
            toast.error(errorMessage(error, "Failed to delete scanner."))
        }
    }

    const columns = [
        { key: "name", header: "Name", render: (row) => <Text weight="medium" color="secondary">{row.name}</Text> },
        { key: "deviceName", header: "Device name", render: (row) => <span style={mono}>{row.deviceName}</span> },
        { key: "type", header: "Type", render: (row) => <Text size="sm" color="tertiary">{scannerTarget(row)}</Text> },
        {
            key: "direction",
            header: "Direction",
            render: (row) => (
                <HStack gap={1} align="center">
                    {row.direction === "in" ? <ArrowRight size="1em" /> : <ArrowLeft size="1em" />}
                    <Text as="span" size="sm">{row.direction === "in" ? "Entry" : "Exit"}</Text>
                </HStack>
            ),
        },
        {
            key: "isActive",
            header: "Status",
            render: (row) => <Badge variant={row.isActive ? "success" : "danger"}>{row.isActive ? "Active" : "Inactive"}</Badge>,
        },
        {
            key: "lastActiveAt",
            header: "Last active",
            render: (row) => (
                <Text size="sm" color="muted" title={exactDateTime(row.lastActiveAt)}>
                    {relativeTime(row.lastActiveAt)}
                </Text>
            ),
        },
        {
            key: "actions",
            header: "",
            align: "right",
            render: (row) => (
                <HStack gap={1} justify="end">
                    <IconButton icon={<Pencil size={16} />} variant="ghost" size="small" ariaLabel={`Edit ${row.name}`} onClick={() => setScannerModal({ scanner: row })} />
                    <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel={`Delete ${row.name}`} onClick={() => handleDeleteScanner(row)} />
                </HStack>
            ),
        },
    ]

    return (
        <Surface bg="primary" radius="xl" shadow="sm" border="var(--border-1) solid var(--color-border-light)">
            {/* Header */}
            <HStack gap={4} align="center" justify="between" wrap style={{ padding: "var(--spacing-4)", borderBottom: "var(--border-1) solid var(--color-border-light)" }}>
                <VStack gap={1}>
                    <HStack gap={3} align="center" wrap>
                        <Heading as="h3" size="lg" weight="bold" color="secondary">{account.name}</Heading>
                        <Badge variant={account.isActive ? "success" : "danger"}>{account.isActive ? "Active" : "Inactive"}</Badge>
                    </HStack>
                    <HStack gap={2} align="center" wrap>
                        <UserRound size={14} color="var(--color-text-muted)" />
                        <span style={{ ...mono, fontSize: "var(--font-size-sm)", color: "var(--color-text-tertiary)" }}>{account.username}</span>
                        <IconButton icon={<Copy size={14} />} variant="ghost" size="small" ariaLabel="Copy username" onClick={copyUsername} />
                        <Text as="span" size="sm" color="muted">
                            · {scannerCount} {scannerCount === 1 ? "scanner" : "scanners"} · Last active {relativeTime(account.lastActiveAt).toLowerCase()}
                        </Text>
                    </HStack>
                </VStack>

                <HStack gap={2} wrap>
                    <Button variant="secondary" size="sm" onClick={() => setShowEdit(true)} disabled={busy}>
                        <Pencil size="1em" /> Edit
                    </Button>
                    <Button variant="secondary" size="sm" onClick={handleNewPassword} disabled={busy}>
                        <KeyRound size="1em" /> New password
                    </Button>
                    <Tooltip content={scannerCount > 0 ? "Move or delete its scanners first" : "Delete this account"} placement="top">
                        <span style={{ display: "inline-flex" }}>
                            <Button variant="danger" size="sm" onClick={handleDeleteAccount} disabled={busy || scannerCount > 0}>
                                <Trash2 size="1em" /> Delete
                            </Button>
                        </span>
                    </Tooltip>
                </HStack>
            </HStack>

            {/* Scanners */}
            <div style={{ padding: "var(--spacing-4)" }}>
                {scanners.length === 0 ? (
                    <Text size="sm" color="muted" style={{ marginBottom: "var(--spacing-3)" }}>
                        No scanners yet — add one to start receiving punches.
                    </Text>
                ) : (
                    <div style={{ marginBottom: "var(--spacing-3)" }}>
                        <DataTable data={scanners} columns={columns} getRowId={(row) => row._id} />
                    </div>
                )}
                <Button variant="secondary" size="sm" onClick={() => setScannerModal({})}>
                    <Plus size="1em" /> Add scanner
                </Button>
            </div>

            {showEdit && <ScannerAccountModal account={account} onClose={() => setShowEdit(false)} onSaved={onChanged} />}
            {scannerModal && (
                <AddFaceScannerModal
                    show
                    scanner={scannerModal.scanner || null}
                    account={account}
                    accounts={accounts}
                    onClose={() => setScannerModal(null)}
                    onAdd={onChanged}
                />
            )}
            {newCredentials && <AccountCredentialsModal account={account} credentials={newCredentials} onClose={() => setNewCredentials(null)} />}
        </Surface>
    )
}

const ZktecoAccountsSection = ({ accounts, loading, onChanged }) => {
    const [showCreate, setShowCreate] = useState(false)

    return (
        <section>
            <HStack gap={4} align="center" justify="between" wrap>
                <VStack gap={1}>
                    <Heading as="h2" size="xl" weight="bold" color="secondary">ZKTeco accounts</Heading>
                    <Text size="sm" color="muted">
                        Devices in an account share one username and password; each device is identified by its device name (TERMINAL_ALIAS).
                    </Text>
                </VStack>
                <Button variant="primary" onClick={() => setShowCreate(true)}>
                    <Plus size={18} /> New account
                </Button>
            </HStack>

            <VStack gap={4} style={{ marginTop: "var(--spacing-4)" }}>
                {loading && accounts.length === 0 ? (
                    <Skeleton variant="rounded" height={160} />
                ) : accounts.length === 0 ? (
                    <EmptyState
                        icon={UserRound}
                        title="No ZKTeco accounts"
                        message="Create an account, then add the devices that will use its login."
                        buttonText="New account"
                        buttonAction={() => setShowCreate(true)}
                    />
                ) : (
                    accounts.map((account) => <AccountPanel key={accountIdOf(account)} account={account} accounts={accounts} onChanged={onChanged} />)
                )}
            </VStack>

            {showCreate && <ScannerAccountModal onClose={() => setShowCreate(false)} onSaved={onChanged} />}
        </section>
    )
}

export default ZktecoAccountsSection
