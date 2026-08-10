import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Button,
  Card,
  EmptyState,
  ErrorState,
  IconButton,
  LoadingState,
  StatCards,
  StatusBadge,
  Text,
  useConfirm,
  useToast,
} from "hzero"
import { ArrowLeft, ArrowDownCircle, ArrowUpCircle, Coins, Wallet, Plus, Pencil, Trash2, FileText } from "lucide-react"
import PageHeader from "../../components/common/PageHeader"
import { useAuth } from "../../contexts/AuthProvider.jsx"
import { expenditureApi } from "../../service"
import CreateExpenditureModal from "../../components/expenditure/CreateExpenditureModal"
import EntryModal from "../../components/expenditure/EntryModal"
import AttachmentList from "../../components/expenditure/AttachmentList"
import { uploadAttachments } from "../../components/expenditure/uploadAttachments"
import {
  isManagerRole,
  OCCURRENCE_STATUS,
  formatINR,
  formatDate,
  ATTACHMENT_ACCEPT,
} from "../../components/expenditure/expenditureConstants"

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "var(--spacing-6) 0 var(--spacing-3)",
}

const rowStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "var(--spacing-3)",
}

const ExpenditureOccurrencePage = ({ basePath = "/admin/expenditure" }) => {
  const { occurrenceId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const { toast } = useToast()
  const { user } = useAuth()
  const canManage = isManagerRole(user?.role)

  const [occurrence, setOccurrence] = useState(null)
  const [totals, setTotals] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [entry, setEntry] = useState(null) // { type, initial, submit }
  const [uploadingDocs, setUploadingDocs] = useState(false)
  const docInputRef = useRef(null)

  const applyResult = (data) => {
    if (data?.occurrence) setOccurrence(data.occurrence)
    if (data?.totals) setTotals(data.totals)
  }

  const fetchDetail = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await expenditureApi.get(occurrenceId)
      applyResult(data)
    } catch (err) {
      setError(err?.message || "Failed to load occurrence.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [occurrenceId])

  const guardedRun = async (fn, failMessage) => {
    try {
      applyResult(await fn())
    } catch (err) {
      toast.error(err?.message || failMessage)
    }
  }

  // ---- occurrence ----
  const handleDeleteOccurrence = async () => {
    if (!(await confirm({ title: "Delete occurrence?", message: "This permanently removes the occurrence and all its expenses, bills, payments, and documents.", isDestructive: true, confirmText: "Delete" }))) return
    try {
      await expenditureApi.remove(occurrenceId)
      toast.success("Occurrence deleted")
      navigate(basePath)
    } catch (err) {
      toast.error(err?.message || "Failed to delete occurrence.")
    }
  }

  // ---- expenses ----
  const addExpense = () => setEntry({ type: "expense", initial: null, submit: (p) => expenditureApi.addExpense(occurrenceId, p) })
  const editExpense = (exp) => setEntry({ type: "expense", initial: exp, submit: (p) => expenditureApi.updateExpense(occurrenceId, exp._id, p) })
  const deleteExpense = async (exp) => {
    if (!(await confirm({ title: "Delete expense?", message: `"${exp.title}" and its bills will be removed.`, isDestructive: true, confirmText: "Delete" }))) return
    guardedRun(() => expenditureApi.removeExpense(occurrenceId, exp._id), "Failed to delete expense.")
  }

  // ---- bills ----
  const addBill = (exp) => setEntry({ type: "bill", initial: null, submit: (p) => expenditureApi.addBill(occurrenceId, exp._id, p) })
  const editBill = (exp, bill) => setEntry({ type: "bill", initial: bill, submit: (p) => expenditureApi.updateBill(occurrenceId, exp._id, bill._id, p) })
  const deleteBill = async (exp, bill) => {
    if (!(await confirm({ title: "Delete bill?", isDestructive: true, confirmText: "Delete" }))) return
    guardedRun(() => expenditureApi.removeBill(occurrenceId, exp._id, bill._id), "Failed to delete bill.")
  }

  // ---- payments ----
  const addPayment = () => setEntry({ type: "payment", initial: null, submit: (p) => expenditureApi.addPayment(occurrenceId, p) })
  const editPayment = (pay) => setEntry({ type: "payment", initial: pay, submit: (p) => expenditureApi.updatePayment(occurrenceId, pay._id, p) })
  const deletePayment = async (pay) => {
    if (!(await confirm({ title: "Delete payment?", isDestructive: true, confirmText: "Delete" }))) return
    guardedRun(() => expenditureApi.removePayment(occurrenceId, pay._id), "Failed to delete payment.")
  }

  // ---- documents ----
  const handleDocFiles = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return
    setUploadingDocs(true)
    try {
      const uploaded = await uploadAttachments(files)
      applyResult(await expenditureApi.addDocuments(occurrenceId, uploaded))
      toast.success("Documents added")
    } catch (err) {
      toast.error(err?.message || "Failed to add documents.")
    } finally {
      setUploadingDocs(false)
      if (docInputRef.current) docInputRef.current.value = ""
    }
  }
  const removeDocument = async (doc) => {
    if (!(await confirm({ title: "Remove document?", isDestructive: true, confirmText: "Remove" }))) return
    guardedRun(() => expenditureApi.removeDocument(occurrenceId, doc._id), "Failed to remove document.")
  }

  if (loading) return <LoadingState message="Loading occurrence…" />
  if (error) return <ErrorState message={error} onRetry={fetchDetail} />
  if (!occurrence) return <EmptyState title="Occurrence not found" />

  const expenses = occurrence.expenses || []
  const payments = occurrence.payments || []
  const documents = occurrence.documents || []
  const t = totals || {}
  const remainingNegative = Number(t.remainingBudget) < 0

  return (
    <div>
      <PageHeader title={occurrence.title} subtitle={occurrence.description || "Expenditure occurrence"}>
        <Button variant="ghost" onClick={() => navigate(basePath)}>
          <ArrowLeft size={16} /> Back
        </Button>
        {canManage && (
          <>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil size={16} /> Edit
            </Button>
            <Button variant="danger" onClick={handleDeleteOccurrence}>
              <Trash2 size={16} /> Delete
            </Button>
          </>
        )}
      </PageHeader>

      <div style={{ padding: "var(--spacing-4) var(--spacing-4) var(--spacing-8)" }}>
        <div style={{ marginBottom: "var(--spacing-3)" }}>
          <StatusBadge tone={occurrence.status === OCCURRENCE_STATUS.OPEN ? "success" : "warning"}>
            {occurrence.status === OCCURRENCE_STATUS.OPEN ? "Open" : "Closed"}
          </StatusBadge>
        </div>

        <StatCards
          columns={4}
          stats={[
            { title: "Total budget", value: formatINR(t.totalBudget), icon: <Wallet size={20} />, color: "var(--color-primary)" },
            { title: "Spent (expenses)", value: formatINR(t.expenseTotal), icon: <ArrowDownCircle size={20} />, color: "var(--color-danger)" },
            { title: "Received (payments)", value: formatINR(t.paymentTotal), icon: <ArrowUpCircle size={20} />, color: "var(--color-success)" },
            { title: "Remaining", value: formatINR(t.remainingBudget), icon: <Coins size={20} />, color: remainingNegative ? "var(--color-danger)" : "var(--color-primary)" },
          ]}
        />

        {/* ---------------- Expenses ---------------- */}
        <div style={sectionHeaderStyle}>
          <Text as="h2" size="xl" weight="semibold" color="heading">
            Expenses ({expenses.length})
          </Text>
          {canManage && (
            <Button size="sm" onClick={addExpense}>
              <Plus size={16} /> Add expense
            </Button>
          )}
        </div>

        {expenses.length === 0 ? (
          <EmptyState variant="inline" title="No expenses yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            {expenses.map((exp) => (
              <Card key={exp._id}>
                <div style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <Text as="div" weight="semibold" color="heading">{exp.title}</Text>
                    <Text as="div" size="sm" color="muted">
                      {[exp.category, formatDate(exp.incurredAt)].filter((x) => x && x !== "—").join(" · ") || "No date"}
                    </Text>
                    {exp.notes && (
                      <Text as="div" size="sm" color="body" style={{ marginTop: "var(--spacing-1)" }}>{exp.notes}</Text>
                    )}
                    <AttachmentList attachments={exp.attachments} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexShrink: 0 }}>
                    <Text as="span" weight="semibold" color="heading">{formatINR(exp.amount)}</Text>
                    {canManage && (
                      <>
                        <IconButton icon={<Pencil size={16} />} variant="ghost" size="small" ariaLabel="Edit expense" onClick={() => editExpense(exp)} />
                        <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel="Delete expense" onClick={() => deleteExpense(exp)} />
                      </>
                    )}
                  </div>
                </div>

                {/* bills under this expense */}
                <div style={{ marginTop: "var(--spacing-3)", paddingTop: "var(--spacing-3)", borderTop: "var(--border-1) solid var(--color-border-light, var(--color-border-primary))" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-2)" }}>
                    <Text as="span" size="sm" weight="medium" color="muted">Bills ({(exp.bills || []).length})</Text>
                    {canManage && (
                      <Button size="sm" variant="ghost" onClick={() => addBill(exp)}>
                        <Plus size={14} /> Add bill
                      </Button>
                    )}
                  </div>
                  {(exp.bills || []).length === 0 ? (
                    <Text as="div" size="sm" color="muted">No bills attached.</Text>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                      {exp.bills.map((bill) => (
                        <div key={bill._id} style={{ ...rowStyle, padding: "var(--spacing-2) var(--spacing-3)", background: "var(--color-bg-secondary)", borderRadius: "var(--radius-md)" }}>
                          <div style={{ minWidth: 0 }}>
                            <Text as="div" size="sm" weight="medium" color="body">
                              {[bill.vendor, bill.billNumber].filter(Boolean).join(" · ") || "Bill"}
                            </Text>
                            <Text as="div" size="xs" color="muted">{formatDate(bill.billedAt)}</Text>
                            <AttachmentList attachments={bill.attachments} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-1)", flexShrink: 0 }}>
                            <Text as="span" size="sm" color="body">{formatINR(bill.amount)}</Text>
                            {canManage && (
                              <>
                                <IconButton icon={<Pencil size={14} />} variant="ghost" size="small" ariaLabel="Edit bill" onClick={() => editBill(exp, bill)} />
                                <IconButton icon={<Trash2 size={14} />} variant="ghost" size="small" ariaLabel="Delete bill" onClick={() => deleteBill(exp, bill)} />
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ---------------- Payments ---------------- */}
        <div style={sectionHeaderStyle}>
          <Text as="h2" size="xl" weight="semibold" color="heading">
            Payments received ({payments.length})
          </Text>
          {canManage && (
            <Button size="sm" onClick={addPayment}>
              <Plus size={16} /> Add payment
            </Button>
          )}
        </div>

        {payments.length === 0 ? (
          <EmptyState variant="inline" title="No payments recorded yet" />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
            {payments.map((pay) => (
              <Card key={pay._id}>
                <div style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <Text as="div" weight="semibold" color="heading">{pay.source || "Payment"}</Text>
                    <Text as="div" size="sm" color="muted">
                      {[pay.method, pay.reference, formatDate(pay.receivedAt)].filter((x) => x && x !== "—").join(" · ") || "No date"}
                    </Text>
                    {pay.notes && <Text as="div" size="sm" color="body" style={{ marginTop: "var(--spacing-1)" }}>{pay.notes}</Text>}
                    <AttachmentList attachments={pay.attachments} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexShrink: 0 }}>
                    <Text as="span" weight="semibold" color="success">{formatINR(pay.amount)}</Text>
                    {canManage && (
                      <>
                        <IconButton icon={<Pencil size={16} />} variant="ghost" size="small" ariaLabel="Edit payment" onClick={() => editPayment(pay)} />
                        <IconButton icon={<Trash2 size={16} />} variant="ghost" size="small" ariaLabel="Delete payment" onClick={() => deletePayment(pay)} />
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* ---------------- Documents ---------------- */}
        <div style={sectionHeaderStyle}>
          <Text as="h2" size="xl" weight="semibold" color="heading">
            Documents ({documents.length})
          </Text>
          {canManage && (
            <>
              <input ref={docInputRef} type="file" accept={ATTACHMENT_ACCEPT} multiple hidden onChange={(e) => handleDocFiles(e.target.files)} />
              <Button size="sm" onClick={() => docInputRef.current?.click()} loading={uploadingDocs} disabled={uploadingDocs}>
                <FileText size={16} /> {uploadingDocs ? "Uploading…" : "Add documents"}
              </Button>
            </>
          )}
        </div>

        {documents.length === 0 ? (
          <EmptyState variant="inline" title="No documents attached" />
        ) : (
          <Card>
            <AttachmentList attachments={documents} onRemove={canManage ? removeDocument : null} />
          </Card>
        )}
      </div>

      {editOpen && (
        <CreateExpenditureModal
          isOpen={editOpen}
          occurrence={occurrence}
          onClose={() => setEditOpen(false)}
          onSaved={applyResult}
        />
      )}

      {entry && (
        <EntryModal
          type={entry.type}
          initial={entry.initial}
          onSubmit={entry.submit}
          onSaved={applyResult}
          onClose={() => setEntry(null)}
        />
      )}
    </div>
  )
}

export default ExpenditureOccurrencePage
