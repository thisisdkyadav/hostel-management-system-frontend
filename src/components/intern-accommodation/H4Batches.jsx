import { DataTable, HStack, Modal, StatusBadge, Text, VStack } from "hzero"
import { getStatusTone } from "@/constants/accommodationStatus"
import { date } from "./h4.format"
import { batchGenderSplit } from "./h4.batches"

export function BatchTable({ groups, loading, selectable, selectedKeys, onSelectionChange, onOpen }) {
  const columns = [
    {
      key: "label",
      header: "Batch",
      render: (g) => (
        <VStack gap={1}>
          <Text weight="semibold" size="sm">{g.label}</Text>
          <Text size="xs" color="muted">{g.facultyName || "—"} · created {date(g.created)}</Text>
        </VStack>
      ),
    },
    { key: "students", header: "Students", render: (g) => <Text size="sm">{batchGenderSplit(g)}</Text> },
    { key: "stay", header: "Stay", render: (g) => <Text size="sm">{date(g.from)} – {date(g.to)}</Text> },
    {
      key: "status",
      header: "Status",
      render: (g) => (
        <HStack gap={1} wrap>
          {g.statuses.map(([status, n]) => (
            <StatusBadge key={status} status={status} tone={getStatusTone(status)}>{n} {status}</StatusBadge>
          ))}
        </HStack>
      ),
    },
    {
      key: "needs",
      header: "Needs you",
      align: "right",
      render: (g) => (g.eligible.length > 0 ? <Text size="sm" weight="semibold">{g.eligible.length}</Text> : null),
    },
  ]
  return (
    <DataTable
      data={groups}
      columns={columns}
      isLoading={loading}
      selectable={selectable}
      selectedRows={selectedKeys}
      onSelectionChange={onSelectionChange}
      getRowId={(g) => g.key}
      pagination
      pageSize={10}
      onRowClick={onOpen}
      emptyMessage="Nothing in this queue right now."
    />
  )
}

export function BatchModal({ group, columns, selectable, selectedIds, onSelectionChange, onRowClick, onClose, actions }) {
  return (
    <Modal isOpen onClose={onClose} title={group.label} width={960}>
      <VStack gap={3}>
        <HStack justify="between" align="center" wrap gap={2}>
          <Text size="sm" color="muted">
            {batchGenderSplit(group)} · {group.facultyName || "—"} · {date(group.from)} – {date(group.to)}
          </Text>
          {actions}
        </HStack>
        <DataTable
          data={group.students}
          columns={columns}
          selectable={selectable}
          selectedRows={selectedIds}
          onSelectionChange={onSelectionChange}
          getRowId={(r) => r._id}
          pagination
          pageSize={10}
          onRowClick={onRowClick}
        />
      </VStack>
    </Modal>
  )
}
