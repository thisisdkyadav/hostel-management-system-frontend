import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Alert, Button, Checkbox, DataTable, Field, HStack, Input, Modal, Text, useConfirm, useToast, VStack } from "hzero"
import { ListChecks, RefreshCw, UserMinus, UserPlus } from "lucide-react"
import { queryKeys } from "@/lib/query"
import { faceScannerApi } from "@/service"
import { formatDateTime, getErrorMessage } from "@/components/dining/diningPeriodHelpers"

const OP_LABEL = { add: "Add", face: "Photo", remove: "Remove", "": "Waited too long" }

const Count = ({ label, value, tone, hint }) => (
  <div className="fm-count" data-tone={tone}>
    <strong>{value ?? "-"}</strong>
    <span>{label}</span>
    {hint && <span className="fm-count-hint">{hint}</span>}
  </div>
)

const lastRunText = (result) => {
  if (!result) return "Never synced."
  if (result.error) return `Last run ${formatDateTime(result.at)} failed: ${result.error}`
  const q = result.queued || {}
  const parts = [`${q.add || 0} added`, `${q.face || 0} photos`, `${q.remove || 0} removed`]
  return `Last run ${formatDateTime(result.at)}: ${parts.join(", ")}${result.removalsHeld ? `, ${result.removalsHeld} removals held back` : ""}.`
}

/** Who is on one machine, and keeping it equal to HMS's active students. */
const MachineRosterModal = ({ machine, onClose }) => {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const confirm = useConfirm()
  const [roll, setRoll] = useState("")

  const query = useQuery({
    queryKey: queryKeys.faceMachines.roster(machine.sn),
    queryFn: () => faceScannerApi.getMachineRoster(machine.sn),
    refetchInterval: 15_000,
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.faceMachines.all })
  const onError = (fallback) => (error) => toast.error(getErrorMessage(error, fallback))

  const toggle = useMutation({
    mutationFn: (sync) => faceScannerApi.updateMachine(machine.sn, { sync }),
    onSuccess: (data, sync) => {
      queryClient.setQueryData(queryKeys.faceMachines.list(), data)
      toast.success(sync ? "Sync switched on" : "Sync switched off")
      refresh()
    },
    onError: onError("Couldn't change sync"),
  })
  const sync = useMutation({
    mutationFn: (allowRemovals) => faceScannerApi.syncMachineRoster(machine.sn, { allowRemovals }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.faceMachines.roster(machine.sn), data)
      const q = data.result?.queued || {}
      toast.success(`Queued ${q.add || 0} to add, ${q.face || 0} photos, ${q.remove || 0} to remove`)
      refresh()
    },
    onError: onError("Couldn't sync"),
  })
  const push = useMutation({
    mutationFn: () => faceScannerApi.pushMachinePerson(machine.sn, roll.trim()),
    onSuccess: () => {
      toast.success(`Sending ${roll.trim()} to the machine`)
      setRoll("")
      refresh()
    },
    onError: onError("Couldn't send that person"),
  })
  const remove = useMutation({
    mutationFn: () => faceScannerApi.removeMachinePerson(machine.sn, roll.trim()),
    onSuccess: () => {
      toast.success(`Removing ${roll.trim()} from the machine`)
      setRoll("")
      refresh()
    },
    onError: onError("Couldn't remove that person"),
  })
  const read = useMutation({
    mutationFn: () => faceScannerApi.readMachinePeople(machine.sn),
    onSuccess: () => toast.success("Asked the machine for its list. It updates here as it answers."),
    onError: onError("Couldn't ask the machine"),
  })

  const data = query.data
  const preview = data?.preview
  const enabled = Boolean(data?.sync?.enabled)
  const removalsOverGuard = preview && preview.toRemove > preview.removalGuard

  const switchSync = async (next) => {
    if (next) {
      const ok = await confirm({
        title: "Keep this machine in sync?",
        message:
          "Every 2 minutes HMS adds active students who have a face photo and removes students who are no longer active (their face data is deleted from the machine; the photo stays in HMS). Anyone on the machine who isn't an active HMS student is removed too.",
        confirmText: "Switch on",
      })
      if (!ok) return
    }
    toggle.mutate(next)
  }

  const syncWithRemovals = async () => {
    const ok = await confirm({
      title: `Remove ${preview.toRemove} people?`,
      message: `That's more than the ${preview.removalGuard} a sync removes on its own. Check the examples first: they should all be students who have left.`,
      confirmText: "Remove them",
      isDestructive: true,
    })
    if (ok) sync.mutate(true)
  }

  const removeOne = async () => {
    const ok = await confirm({
      title: `Remove ${roll.trim()} from this machine?`,
      message: "Their face data is deleted from the machine. If sync is on and they're still active, the next sync adds them back.",
      confirmText: "Remove",
      isDestructive: true,
    })
    if (ok) remove.mutate()
  }

  const sample = (list = []) => list.map((p) => (typeof p === "string" ? p : `${p.pin}${p.name ? ` ${p.name}` : ""}`)).join(", ")

  return (
    <Modal isOpen title={`${machine.alias || machine.sn}: people`} onClose={onClose} width={820}>
      <VStack gap={4}>
        {query.isError && <Alert type="error">{getErrorMessage(query.error, "Couldn't load this machine's people")}</Alert>}

        <Checkbox
          checked={enabled}
          disabled={!data || toggle.isPending}
          onChange={(e) => switchSync(e.target.checked)}
          label="Keep this machine equal to HMS's active students"
        />
        <Text size="sm" color="muted">{enabled ? lastRunText(data?.sync?.lastResult) : "Off. Nothing is sent to the machine unless you send it below."}</Text>

        {preview && (
          <>
            <div className="fm-counts">
              <Count label="on machine" value={preview.onMachine} />
              <Count label="should be on it" value={preview.wanted} hint="active, with a photo" />
              <Count label="to add" value={preview.toAdd} tone={preview.toAdd ? "warn" : undefined} />
              <Count label="new photo" value={preview.toUpdateFace} tone={preview.toUpdateFace ? "warn" : undefined} />
              <Count label="to remove" value={preview.toRemove} tone={preview.toRemove ? "bad" : undefined} />
              <Count label="in progress" value={preview.inFlight} />
              <Count label="not in HMS" value={preview.unmanaged} hint="removed too" />
              <Count label="active, no photo" value={preview.activeWithoutFace} tone={preview.activeWithoutFace ? "warn" : undefined} />
            </div>
            <VStack gap={1}>
              {preview.samples.add.length > 0 && <Text size="sm" color="muted">To add: {sample(preview.samples.add)}{preview.toAdd > 20 ? "…" : ""}</Text>}
              {preview.samples.remove.length > 0 && (
                <Text size="sm" color="muted">
                  To remove: {preview.samples.remove.map((p) => `${p.pin} (${p.status})`).join(", ")}{preview.toRemove > 20 ? "…" : ""}
                </Text>
              )}
              {preview.samples.activeWithoutFace.length > 0 && (
                <Text size="sm" color="muted">No usable photo: {sample(preview.samples.activeWithoutFace)}{preview.activeWithoutFace > 20 ? "…" : ""}</Text>
              )}
            </VStack>
            {removalsOverGuard && (
              <Alert type="warning">
                {preview.toRemove} people would be removed. A sync removes at most {preview.removalGuard} on its own; confirm larger removals yourself.
              </Alert>
            )}
          </>
        )}

        <HStack gap={2} wrap>
          <Button variant="primary" size="small" onClick={() => sync.mutate(false)} loading={sync.isPending} disabled={!data}>
            <RefreshCw size={16} /> Sync now
          </Button>
          {removalsOverGuard && (
            <Button variant="danger" size="small" onClick={syncWithRemovals} loading={sync.isPending}>
              Sync and remove {preview.toRemove}
            </Button>
          )}
          <Button variant="secondary" size="small" onClick={() => read.mutate()} loading={read.isPending}>
            <ListChecks size={16} /> Ask machine for its list
          </Button>
        </HStack>

        <Field label="One person" htmlFor="fm-roll" help="Send one student's name and face photo to this machine, or remove them. Works with sync off.">
          <HStack gap={2}>
            <Input id="fm-roll" value={roll} placeholder="Roll number" onChange={(e) => setRoll(e.target.value)} />
            <Button variant="secondary" size="small" onClick={() => push.mutate()} loading={push.isPending} disabled={!roll.trim()}>
              <UserPlus size={16} /> Send
            </Button>
            <Button variant="secondary" size="small" onClick={removeOne} loading={remove.isPending} disabled={!roll.trim()}>
              <UserMinus size={16} /> Remove
            </Button>
          </HStack>
        </Field>

        {data?.failures?.length > 0 && (
          <VStack gap={2}>
            <Text size="sm" weight="semibold">Machine said no</Text>
            <DataTable
              data={data.failures}
              getRowId={(r) => `${r.pin}-${r.op}`}
              columns={[
                { key: "pin", header: "Roll number", render: (r) => <span className="fm-mono">{r.pin}</span> },
                { key: "name", header: "Name", render: (r) => <span className="fm-note">{r.name || "-"}</span> },
                { key: "op", header: "Step", render: (r) => <span className="fm-note">{OP_LABEL[r.op] ?? r.op}</span> },
                { key: "code", header: "Code", render: (r) => <span className="fm-mono">{r.code ?? "no answer"}</span> },
                { key: "at", header: "When", render: (r) => <span className="fm-note">{formatDateTime(r.at)}</span> },
              ]}
            />
          </VStack>
        )}
      </VStack>
    </Modal>
  )
}

export default MachineRosterModal
