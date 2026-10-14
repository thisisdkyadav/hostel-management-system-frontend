import { useMemo, useState } from "react"
import { Alert, Button, DataTable, Field, Grid, HStack, Input, Modal, Select, Text, VStack, useToast } from "hzero"
import { h4Api } from "@/service/modules/intern-accommodation.api"
import { money } from "./h4.format"

const r2 = (n) => Math.round(Number(n || 0) * 100) / 100
const messOptions = [
  { value: "without", label: "Without mess" },
  { value: "with", label: "With mess" },
]

export default function H4ChargesModal({ ids, requests, options, onClose, onDone }) {
  const { toast } = useToast()
  const config = options.config || {}
  const gst = Number(config.gstPercentage || 0)
  const hostelOptions = (options.hostels || []).map((h) => ({ value: String(h._id), label: h.name }))
  const [def, setDef] = useState({
    hostelId: "",
    mess: "without",
    accRate: String(config.accommodationDailyRate || 0),
    messRate: String(config.messDailyRate || 0),
    remarks: "",
  })
  const [over, setOver] = useState({})
  const [busy, setBusy] = useState(false)
  const [errors, setErrors] = useState([])

  const rows = useMemo(() => requests.filter((r) => ids.includes(r._id) && r.status === "CW Approved"), [requests, ids])
  const eff = (r) => ({ hostelId: over[r._id]?.hostelId ?? def.hostelId, mess: over[r._id]?.mess ?? def.mess })
  const setRow = (id, patch) => setOver((o) => ({ ...o, [id]: { ...o[id], ...patch } }))
  const setDefault = (patch) => setDef((d) => ({ ...d, ...patch }))

  const accOf = (r) => r2(r.nights * Number(def.accRate || 0))
  const messOf = (r) => (eff(r).mess === "with" ? r2(r.nights * Number(def.messRate || 0)) : 0)
  const anyMess = rows.some((r) => eff(r).mess === "with")
  const accTotal = rows.reduce((s, r) => s + accOf(r), 0)
  const messTotal = rows.reduce((s, r) => s + messOf(r), 0)
  const accWithGst = accTotal * (1 + gst / 100)

  const missingHostel = rows.some((r) => !eff(r).hostelId)
  const waiver = def.accRate === "" || Number(def.accRate) <= 0
  const invalid = !rows.length || missingHostel || waiver || (anyMess && def.messRate === "")

  const submit = async () => {
    setBusy(true)
    setErrors([])
    try {
      const result = await h4Api.batchOffer({
        requests: rows.map((r) => ({
          id: r._id,
          revision: r.h4.revision,
          hostelId: eff(r).hostelId,
          mess: eff(r).mess,
          accommodationDailyRate: Number(def.accRate),
          messDailyRate: Number(def.messRate || 0),
          remarks: def.remarks,
        })),
      })
      const results = result.data.results || []
      const failed = results.filter((x) => !x.success)
      const done = results.length - failed.length
      toast.success(`${done} request${done === 1 ? "" : "s"} updated`)
      if (failed.length) {
        toast.error(`${failed.length} need attention`)
        setErrors(failed.map((x) => `${requests.find((r) => r._id === x.id)?.applicantName || x.id}: ${x.message}`))
      }
      await onDone()
      if (!failed.length) onClose()
    } catch (e) {
      setErrors([e.message])
    } finally {
      setBusy(false)
    }
  }

  const columns = [
    { key: "name", header: "Name", render: (r) => <Text size="sm" weight="semibold">{r.applicantName || "—"}</Text> },
    { key: "gender", header: "Gender", render: (r) => <Text size="sm">{r.h4.gender || "—"}</Text> },
    { key: "nights", header: "Nights", align: "right", render: (r) => r.nights },
    {
      key: "hostel",
      header: "Hostel",
      width: 200,
      render: (r) => (
        <Select
          size="small"
          value={eff(r).hostelId}
          placeholder="Select hostel"
          options={hostelOptions}
          onChange={(e) => setRow(r._id, { hostelId: e.target.value })}
        />
      ),
    },
    {
      key: "mess",
      header: "Mess",
      width: 150,
      render: (r) => (
        <Select size="small" value={eff(r).mess} options={messOptions} onChange={(e) => setRow(r._id, { mess: e.target.value })} />
      ),
    },
    { key: "acc", header: "Accommodation", align: "right", render: (r) => money(accOf(r)) },
    { key: "messTotal", header: "Mess total", align: "right", render: (r) => (eff(r).mess === "with" ? money(messOf(r)) : "—") },
  ]

  return (
    <Modal
      isOpen
      onClose={busy ? undefined : onClose}
      title={`Issue charges · ${rows.length} student${rows.length === 1 ? "" : "s"}`}
      width={900}
      footer={
        <HStack justify="between" align="center" wrap gap={2}>
          <VStack gap={1}>
            <Text size="sm" weight="semibold">Total {money(accWithGst + messTotal)}</Text>
            <Text size="xs" color="muted">
              Accommodation {money(accTotal)}{gst ? ` + ${gst}% GST` : ""}{anyMess ? ` · Mess ${money(messTotal)}` : ""}
            </Text>
          </VStack>
          <HStack gap={2}>
            <Button variant="ghost" onClick={onClose} disabled={busy}>Cancel</Button>
            <Button onClick={submit} loading={busy} disabled={busy || invalid}>
              Issue charges to {rows.length}
            </Button>
          </HStack>
        </HStack>
      }
    >
      <VStack gap={4}>
        {errors.length > 0 && (
          <Alert type="error">
            {errors.map((m) => (
              <div key={m}>{m}</div>
            ))}
          </Alert>
        )}
        <VStack gap={2}>
          <Text size="sm" weight="semibold">Defaults for all</Text>
          <Grid cols={{ base: 1, lg: anyMess ? 5 : 4 }} gap={3}>
            <Field label="Hostel">
              <Select
                value={def.hostelId}
                placeholder="Select hostel"
                options={hostelOptions}
                onChange={(e) => setDefault({ hostelId: e.target.value })}
              />
            </Field>
            <Field label="Mess">
              <Select value={def.mess} options={messOptions} onChange={(e) => setDefault({ mess: e.target.value })} />
            </Field>
            <Field label="Accommodation / day (₹)">
              <Input type="number" min="0" step="0.01" value={def.accRate} onChange={(e) => setDefault({ accRate: e.target.value })} />
            </Field>
            {anyMess && (
              <Field label="Mess / day (₹)">
                <Input type="number" min="0" step="0.01" value={def.messRate} onChange={(e) => setDefault({ messRate: e.target.value })} />
              </Field>
            )}
            <Field label="Note for payer">
              <Input value={def.remarks} onChange={(e) => setDefault({ remarks: e.target.value })} />
            </Field>
          </Grid>
          {waiver && <Text size="xs" color="muted">Waivers need a reason — issue those one by one from the request.</Text>}
          <Text size="xs" color="muted">Charge days exclude the departure day. Payment links are managed in Settings → Intern Accommodation.</Text>
        </VStack>
        <DataTable data={rows} columns={columns} getRowId={(r) => r._id} />
      </VStack>
    </Modal>
  )
}
