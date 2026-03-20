import { useEffect, useMemo, useState } from "react"
import { Select } from "@/components/ui"
import ConfigListManager from "./ConfigListManager"
import {
  countConfiguredBatches,
  createBatchScopeOptions,
  getBatchScopeLabel,
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

  const degreeOptions = useMemo(
    () => createBatchScopeOptions(degrees, "degree"),
    [degrees]
  )

  const departmentOptions = useMemo(
    () => createBatchScopeOptions(departments, "department"),
    [departments]
  )

  useEffect(() => {
    const validValues = new Set(degreeOptions.map((option) => option.value))
    if (!selectedDegree || !validValues.has(selectedDegree)) {
      setSelectedDegree(degreeOptions[0]?.value || "")
    }
  }, [degreeOptions, selectedDegree])

  useEffect(() => {
    const validValues = new Set(departmentOptions.map((option) => option.value))
    if (!selectedDepartment || !validValues.has(selectedDepartment)) {
      setSelectedDepartment(departmentOptions[0]?.value || "")
    }
  }, [departmentOptions, selectedDepartment])

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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Degree</label>
          <Select
            value={selectedDegree}
            onChange={(event) => setSelectedDegree(event.target.value)}
            options={degreeOptions}
            placeholder="Select Degree Scope"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--color-text-body)] mb-2">Department</label>
          <Select
            value={selectedDepartment}
            onChange={(event) => setSelectedDepartment(event.target.value)}
            options={departmentOptions}
            placeholder="Select Department Scope"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border-primary)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
        Managing batches for <span className="font-medium text-[var(--color-text-body)]">{getBatchScopeLabel(selectedDegree, "degree") || "No degree scope selected"}</span>
        {" / "}
        <span className="font-medium text-[var(--color-text-body)]">{getBatchScopeLabel(selectedDepartment, "department") || "No department scope selected"}</span>.
        {" "}Configured batches in system: <span className="font-medium text-[var(--color-text-body)]">{totalBatches}</span>
      </div>

      <ConfigListManager
        items={currentBatches}
        onUpdate={handleUpdateSelectionBatches}
        onRename={handleRenameBatch}
        isLoading={isLoading}
        title="Batch Management"
        description="Add, remove, or rename the allowed batch values for the selected degree and department scope. Mixed Degree applies across all degrees, Mixed Department applies across all departments."
        itemLabel="Batch"
        placeholder="Enter batch name (e.g., First Year, 2023, 2024)"
      />
    </div>
  )
}

export default StudentBatchManager
