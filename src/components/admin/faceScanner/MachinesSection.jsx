import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Alert, Button, DataTable, EmptyState, Field, Heading, HStack, IconButton, Input, Modal, Select, StatusBadge, Tabs, Text, useConfirm, useToast, VStack,
} from "hzero"
import { Activity, Cpu, ImageDown, Pencil } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { faceScannerApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"
import "./MachinesSection.css"

const MODE = {
  shadow: { label: "Recording only", tone: "neutral" },
  live: { label: "Live", tone: "success" },
}

const agoText = (value) => {
  if (!value) return "never"
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.round(seconds / 60)} min ago`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} h ago`
  return formatDateTime(value)
}

const clockText = (seconds) => {
  if (seconds === null || seconds === undefined) return "-"
  if (Math.abs(seconds) < 5) return "In sync"
  const abs = Math.abs(seconds)
  const amount = abs >= 90 ? `${Math.round(abs / 60)} min` : `${abs}s`
  return seconds > 0 ? `${amount} fast` : `${amount} slow`
}

const usedFor = (scanner) => {
  if (!scanner) return null
  const place = scanner.type === "dining-meal" ? scanner.caterer || "Dining" : scanner.hostel || "Hostel gate"
  return `${scanner.name} · ${place}`
}

const FaceImport = ({ faces, onStart, starting }) => {
  const job = faces?.job
  return (
    <div className="fm-faces">
      <Text size="sm" color="muted">
        Faces kept in HMS: <strong>{faces?.stored ?? 0}</strong>
        {faces?.withoutFace ? ` · ${faces.withoutFace} still only in EasyWDMS` : ""}
        {job?.running && ` · copying… ${job.stored || 0} done`}
        {!job?.running && job?.finishedAt && ` · last copy ${formatDateTime(job.finishedAt)}: ${job.stored} stored, ${job.unusable} unusable, ${job.failed} failed`}
      </Text>
      <Button variant="secondary" size="small" onClick={onStart} loading={starting || job?.running} disabled={job?.running}>
        <ImageDown size={16} /> Copy faces from EasyWDMS
      </Button>
    </div>
  )
}

const EditMachineModal = ({ machine, scanners, onClose }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [form, setForm] = useState({ alias: machine.alias, faceScannerId: machine.scanner?.id || "", mode: machine.mode })
  const save = useMutation({
    mutationFn: () => faceScannerApi.updateMachine(machine.sn, form),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.faceMachines.list(), data)
      toast.success("Machine updated")
      onClose()
    },
  })
  const scannerOptions = [
    { value: "", label: "Not linked" },
    ...scanners.map((s) => ({ value: s._id, label: `${s.name} (${s.type === "dining-meal" ? "Dining" : "Hostel gate"}, ${s.direction})` })),
  ]
  const goingLive = form.mode === "live" && machine.mode !== "live"

  return (
    <Modal isOpen title={`Machine ${machine.sn}`} onClose={onClose} width={520}>
      <VStack gap={4}>
        <Field label="Name" htmlFor="fm-alias" help="What staff call this machine, e.g. “Mess A entrance”.">
          <Input id="fm-alias" value={form.alias} maxLength={60} onChange={(e) => setForm((f) => ({ ...f, alias: e.target.value }))} />
        </Field>
        <Field label="Used for" htmlFor="fm-scanner" help="Which scanner's rules apply to its punches: caterer or hostel, and direction.">
          <Select id="fm-scanner" value={form.faceScannerId} options={scannerOptions} onChange={(e) => setForm((f) => ({ ...f, faceScannerId: e.target.value }))} />
        </Field>
        <Field label="Mode" htmlFor="fm-mode">
          <Select
            id="fm-mode"
            value={form.mode}
            options={[
              { value: "shadow", label: "Recording only: keep punches, change nothing" },
              { value: "live", label: "Live: punches become meal / gate records" },
            ]}
            onChange={(e) => setForm((f) => ({ ...f, mode: e.target.value }))}
          />
        </Field>
        {goingLive && (
          <Alert type="warning">
            Only make a machine live once EasyWDMS no longer sends its punches to HMS, or every meal will be recorded twice.
            Punches older than 30 minutes are never turned into records.
          </Alert>
        )}
        {save.isError && <Alert type="error">{getErrorMessage(save.error, "Couldn't save the machine")}</Alert>}
        <HStack gap={2} justify="end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => save.mutate()} loading={save.isPending}>Save</Button>
        </HStack>
      </VStack>
    </Modal>
  )
}

const ACTIVITY_TABS = [
  { value: "punches", label: "Punches" },
  { value: "commands", label: "Commands" },
  { value: "log", label: "Traffic" },
]

const OUTCOME = {
  shadow: "Recorded only",
  unlinked: "Not linked",
  "too-old": "Too old",
  "clock-ahead": "Machine clock ahead",
  "scanner-inactive": "Scanner inactive",
  error: "Error",
}

const ActivityModal = ({ machine, onClose }) => {
  const [tab, setTab] = useState("punches")
  const query = useQuery({
    queryKey: queryKeys.faceMachines.activity(machine.sn),
    queryFn: () => faceScannerApi.getMachineActivity(machine.sn),
    refetchInterval: 10_000,
  })
  const data = query.data || { punches: [], commands: [], log: [] }

  const columns = {
    punches: [
      { key: "pin", header: "Roll number", render: (r) => <span className="fm-mono">{r.pin}</span> },
      { key: "localTime", header: "Machine time", render: (r) => <span className="fm-mono">{r.localTime}</span> },
      {
        key: "outcome",
        header: "Result",
        render: (r) =>
          r.outcome?.processed ? (
            <span className="fm-note" data-tone={r.outcome.success ? "ok" : "bad"}>
              {r.outcome.message || (r.outcome.success ? "Recorded" : "Rejected")}
              {r.outcome.ms !== null && r.outcome.ms !== undefined ? ` · ${r.outcome.ms} ms` : ""}
            </span>
          ) : (
            <span className="fm-note">{OUTCOME[r.outcome?.reason] || "Not processed"}</span>
          ),
      },
    ],
    commands: [
      { key: "commandId", header: "#", render: (r) => <span className="fm-mono">{r.commandId}</span> },
      { key: "command", header: "Command", render: (r) => <span className="fm-mono fm-wrap">{r.command}</span> },
      { key: "status", header: "Status", render: (r) => <span className="fm-note">{r.status}{r.returnCode !== null ? ` (${r.returnCode})` : ""}</span> },
      { key: "createdAt", header: "Queued", render: (r) => <span className="fm-note">{formatDateTime(r.createdAt)}</span> },
    ],
    log: [
      { key: "at", header: "Time", render: (r) => <span className="fm-note">{formatDateTime(r.at)}</span> },
      { key: "path", header: "Request", render: (r) => <span className="fm-mono fm-wrap">{r.method} {r.path}{r.query ? `?${r.query}` : ""}</span> },
      { key: "response", header: "Answer", render: (r) => <span className="fm-mono fm-wrap">{r.status} · {r.response}</span> },
      { key: "ms", header: "ms", align: "right", render: (r) => <span className="fm-mono">{r.ms}</span> },
    ],
  }

  return (
    <Modal isOpen title={`${machine.alias || machine.sn}: activity`} onClose={onClose} width={900}>
      <VStack gap={4}>
        <Tabs variant="pills" tabs={ACTIVITY_TABS} activeTab={tab} setActiveTab={setTab} />
        {query.isError && <Alert type="error">{getErrorMessage(query.error, "Couldn't load activity")}</Alert>}
        <DataTable data={data[tab]} columns={columns[tab]} loading={query.isLoading} getRowId={(r, i) => `${tab}-${i}`} emptyMessage="Nothing yet." />
      </VStack>
    </Modal>
  )
}

/** Face machines that talk to HMS directly. They register themselves on first contact. */
const MachinesSection = ({ scanners = [] }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const confirm = useConfirm()
  const [editing, setEditing] = useState(null)
  const [watching, setWatching] = useState(null)

  const query = useQuery({
    queryKey: queryKeys.faceMachines.list(),
    queryFn: faceScannerApi.getMachines,
    refetchInterval: (q) => (q.state.data?.faces?.job?.running ? 5_000 : 30_000),
  })
  const machines = query.data?.machines || []

  const importFaces = useMutation({
    mutationFn: faceScannerApi.importFaces,
    onSuccess: () => {
      toast.success("Copying faces in the background")
      queryClient.invalidateQueries({ queryKey: queryKeys.faceMachines.all })
    },
    onError: (error) => toast.error(getErrorMessage(error, "Couldn't start the copy")),
  })

  const startImport = async () => {
    const ok = await confirm({
      title: "Copy faces from EasyWDMS?",
      message: "HMS downloads every bio photo EasyWDMS has and keeps its own copy, so the machines can later be fed from HMS. Already-copied photos are skipped. Nothing changes on the machines.",
      confirmText: "Copy faces",
    })
    if (ok) importFaces.mutate()
  }

  const columns = [
    {
      key: "machine",
      header: "Machine",
      render: (m) => (
        <div className="fm-who">
          <strong>{m.alias || m.model || "Unnamed machine"}</strong>
          <span className="fm-mono">{m.sn}</span>
          {m.alias && m.model && <span>{m.model}</span>}
        </div>
      ),
    },
    {
      key: "status",
      header: "Connection",
      render: (m) => (
        <div className="fm-who">
          <StatusBadge status={m.online ? "Online" : "Offline"} tone={m.online ? "success" : "danger"} />
          <span>Seen {agoText(m.lastSeenAt)}</span>
        </div>
      ),
    },
    {
      key: "mode",
      header: "Mode",
      render: (m) => <StatusBadge status={MODE[m.mode]?.label || m.mode} tone={MODE[m.mode]?.tone || "neutral"} />,
    },
    {
      key: "usedFor",
      header: "Used for",
      render: (m) => (m.scanner ? <span className="fm-note">{usedFor(m.scanner)}</span> : <span className="fm-note" data-tone="bad">Not linked</span>),
    },
    {
      key: "people",
      header: "People / faces",
      render: (m) => (
        <div className="fm-who">
          <span className="fm-mono">{m.users ?? "-"} people</span>
          <span className="fm-mono">
            {m.faces ?? "-"}{m.maxFaces ? ` / ${m.maxFaces}` : ""} faces
          </span>
        </div>
      ),
    },
    {
      key: "today",
      header: "Today",
      render: (m) => (
        <div className="fm-who">
          <span className="fm-mono">{m.punchesToday} punches</span>
          <span>Last {agoText(m.lastPunchAt)}</span>
        </div>
      ),
    },
    {
      key: "clock",
      header: "Clock",
      render: (m) => (
        <span className="fm-note" data-tone={m.clockOffsetSeconds !== null && Math.abs(m.clockOffsetSeconds) >= 60 ? "bad" : undefined}>
          {clockText(m.clockOffsetSeconds)}
        </span>
      ),
    },
    {
      key: "firmware",
      header: "Firmware",
      render: (m) => (
        <div className="fm-who">
          <span className="fm-mono">{m.firmware || "-"}</span>
          {m.pushVersion && <span>Push {m.pushVersion}</span>}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (m) => (
        <HStack gap={1} justify="end">
          <IconButton icon={<Activity size={16} />} variant="ghost" size="small" ariaLabel={`Activity for ${m.sn}`} onClick={() => setWatching(m)} />
          <IconButton icon={<Pencil size={16} />} variant="ghost" size="small" ariaLabel={`Edit ${m.sn}`} onClick={() => setEditing(m)} />
        </HStack>
      ),
    },
  ]

  return (
    <section>
      <HStack gap={4} align="center" justify="between" wrap>
        <VStack gap={1}>
          <Heading as="h2" size="xl" weight="bold" color="secondary">Machines connected to HMS</Heading>
          <Text size="sm" color="muted">
            These machines talk to HMS directly. A machine appears here by itself the first time it connects, and starts in recording-only mode.
          </Text>
        </VStack>
      </HStack>

      <FaceImport faces={query.data?.faces} onStart={startImport} starting={importFaces.isPending} />

      {query.isError && <Alert type="error">{getErrorMessage(query.error, "Couldn't load machines")}</Alert>}

      <div className="fm-table">
        {!query.isLoading && machines.length === 0 ? (
          <EmptyState
            icon={<Cpu size={32} />}
            title="No machine has connected yet"
            description="Machines still report to EasyWDMS. Once a machine's server address points at HMS, it shows up here within a few seconds."
          />
        ) : (
          <DataTable data={machines} columns={columns} loading={query.isLoading} getRowId={(m) => m.sn} />
        )}
      </div>

      {editing && <EditMachineModal machine={editing} scanners={scanners} onClose={() => setEditing(null)} />}
      {watching && <ActivityModal machine={watching} onClose={() => setWatching(null)} />}
    </section>
  )
}

export default MachinesSection
