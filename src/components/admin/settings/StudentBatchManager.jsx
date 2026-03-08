import { useEffect, useMemo, useState } from "react"
import { Select } from "@/components/ui"
import ConfigListManager from "./ConfigListManager"
import {
  countConfiguredBatches,
  getBatchesForSelection,
  setBatchesForSelection,
} from "../../../utils/studentBatchConfig"

const StudentBatchManager = ({
  degrees = [],
  departments = [],
  studentBatches = {},
  onUpdate,
  onRename,
  isLoading = false,
}) => {
  const [selectedDegree, setSelectedDegree] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState("")

  useEffect(() => {
    if (!selectedDegree || !degrees.includes(selectedDegree)) {
      setSelectedDegree(degrees[0] || "")
    }
  }, [degrees, selectedDegree])

  useEffect(() => {
    if (!selectedDepartment || !departments.includes(selectedDepartment)) {
      setSelectedDepartment(departments[0] || "")
    }
  }, [departments, selectedDepartment])

  const currentBatches = useMemo(
    () => getBatchesForSelection(studentBatches, selectedDegree, selectedDepartment),
    [selectedDegree, selectedDepartment, studentBatches]
  )

  const totalBatches = useMemo(
    () => countConfiguredBatches(studentBatches),
    [studentBatches]
  )

  const handleUpdateSelectionBatches = (updatedBatches) => {
    const nextConfig = setBatchesForSelection(studentBatches, selectedDegree, selectedDepartment, updatedBatches)
    onUpdate(nextConfig)
  }

  const handleRenameBatch = (oldName, newName) => {
    return onRename({
      degree: selectedDegree,
      department: selectedDepartment,
      oldName,
      newName,
    })
  }

  if (degrees.length === 0 || departments.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-4 text-sm text-[var(--color-text-muted)]">
        Add degrees and departments first. Batch management is scoped to a degree and department combination.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Degree</label>
          <Select
            value={selectedDegree}
            onChange={(event) => setSelectedDegree(event.target.value)}
            options={degrees.map((degree) => ({ value: degree, label: degree }))}
            placeholder="Select Degree"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Department</label>
          <Select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            options={departments.map((department) => ({ value: department, label: department }))}
            placeholder="Select Department"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
        Managing batches for <span className="font-medium text-[var(--color-text-body)]">{selectedDegree || "No degree selected"}</span>
        {" / "}
        <span className="font-medium text-[var(--color-text-body)]">{selectedDepartment || "No department selected"}</span>.
        {" "}Configured batches in system: <span className="font-medium text-[var(--color-text-body)]">{totalBatches}</span>
      </div>

      <ConfigListManager
        items={currentBatches}
        onUpdate={handleUpdateSelectionBatches}
        onRename={handleRenameBatch}
        isLoading={isLoading}
        title="Batch Management"
        description="Add, remove, or rename the allowed batch values for the selected degree and department combination."
        itemLabel="Batch"
        placeholder="Enter batch name (e.g., First Year, 2023, 2024)"
      />
    </div>
  )
}

export default StudentBatchManager
