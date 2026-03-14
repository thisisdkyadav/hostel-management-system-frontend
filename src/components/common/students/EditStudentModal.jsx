import React, { useEffect, useMemo, useRef, useState } from "react"
import { FaExclamationTriangle, FaInfoCircle, FaSpinner } from "react-icons/fa"
import { Modal, Button, Input } from "czero/react"
import { Checkbox, Select } from "@/components/ui"
import { useAuth } from "../../../contexts/AuthProvider"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { adminApi, hostelApi, studentApi } from "../../../service"
import PersonalInfoSection from "./forms/sections/PersonalInfoSection"
import AcademicInfoSection from "./forms/sections/AcademicInfoSection"
import GuardianInfoSection from "./forms/sections/GuardianInfoSection"

const normalizeLookupValue = (value) => String(value || "").trim().toLowerCase()

const createDefaultDayScholarForm = (studentData = {}) => ({
  isDayScholar: Boolean(studentData?.isDayScholar),
  address: studentData?.dayScholarDetails?.address || "",
  ownerName: studentData?.dayScholarDetails?.ownerName || "",
  ownerPhone: studentData?.dayScholarDetails?.ownerPhone || "",
  ownerEmail: studentData?.dayScholarDetails?.ownerEmail || "",
})

const createDefaultAllocationForm = () => ({
  hostelId: "",
  hostelType: "",
  unit: "",
  unitId: "",
  unitError: "",
  roomId: "",
  roomNumber: "",
  bedNumber: "",
  validationError: "",
  roomsLoading: false,
})

const getRoomCacheKey = ({ hostelId = "", unitId = "", hostelType = "" } = {}) => {
  if (hostelType === "unit-based" && unitId) return `unit:${unitId}`
  if (hostelId) return `hostel:${hostelId}`
  return ""
}

const getSelectedRoom = (form, roomsByCacheKey) => {
  const cacheKey = getRoomCacheKey(form)
  const rooms = roomsByCacheKey[cacheKey] || []
  return rooms.find((room) => room.id === form.roomId) || null
}

const getBedOccupant = (room, bedNumber) => (
  room?.students?.find((student) => String(student.bedNumber) === String(bedNumber)) || null
)

const EditStudentModal = ({ isOpen, onClose, studentData, onUpdate }) => {
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const isAdmin = user?.role === "Admin"
  const safeHostels = useMemo(() => hostelList.filter(Boolean), [hostelList])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("personal")

  const [profileFormData, setProfileFormData] = useState(null)
  const [statusValue, setStatusValue] = useState("Active")
  const [dayScholarForm, setDayScholarForm] = useState(createDefaultDayScholarForm())
  const [allocationForm, setAllocationForm] = useState(createDefaultAllocationForm())
  const [allocationLookup, setAllocationLookup] = useState(null)
  const [allocationLookupLoading, setAllocationLookupLoading] = useState(false)
  const [unitsByHostelId, setUnitsByHostelId] = useState({})
  const [roomsByCacheKey, setRoomsByCacheKey] = useState({})

  const allocationInitializedRef = useRef(false)

  useEffect(() => {
    if (!studentData || !isOpen) return

    setProfileFormData(studentData)
    setStatusValue(studentData.status || "Active")
    setDayScholarForm(createDefaultDayScholarForm(studentData))
    setAllocationForm(createDefaultAllocationForm())
    setAllocationLookup(null)
    setUnitsByHostelId({})
    setRoomsByCacheKey({})
    setError("")
    setActiveTab("personal")
    allocationInitializedRef.current = false
  }, [studentData, isOpen])

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "personal", label: "Personal" },
      { id: "academic", label: "Academic" },
      { id: "guardian", label: "Guardian" },
    ]

    if (!isAdmin) return baseTabs

    return [
      ...baseTabs,
      { id: "status", label: "Status" },
      { id: "dayScholar", label: "Day Scholar" },
      { id: "allocation", label: "Allocation" },
    ]
  }, [isAdmin])

  const loadUnitsForHostel = async (hostelId) => {
    if (!hostelId) return []
    if (Array.isArray(unitsByHostelId[hostelId])) {
      return unitsByHostelId[hostelId]
    }

    const units = await hostelApi.getUnits(hostelId)
    const safeUnits = Array.isArray(units) ? units : []
    setUnitsByHostelId((current) => ({ ...current, [hostelId]: safeUnits }))
    return safeUnits
  }

  const loadRoomOnlyRooms = async (hostelId) => {
    if (!hostelId) return []
    const cacheKey = getRoomCacheKey({ hostelId })
    if (Array.isArray(roomsByCacheKey[cacheKey])) {
      return roomsByCacheKey[cacheKey]
    }

    const rooms = await hostelApi.getAllocationRooms(hostelId)
    const safeRooms = Array.isArray(rooms) ? rooms : []
    setRoomsByCacheKey((current) => ({ ...current, [cacheKey]: safeRooms }))
    return safeRooms
  }

  const loadUnitRooms = async (unitId) => {
    if (!unitId) return []
    const cacheKey = getRoomCacheKey({ hostelType: "unit-based", unitId })
    if (Array.isArray(roomsByCacheKey[cacheKey])) {
      return roomsByCacheKey[cacheKey]
    }

    const rooms = await hostelApi.getAllocationRoomsByUnit(unitId)
    const safeRooms = Array.isArray(rooms) ? rooms : []
    setRoomsByCacheKey((current) => ({ ...current, [cacheKey]: safeRooms }))
    return safeRooms
  }

  const initializeAllocationForm = async () => {
    if (!studentData?.rollNumber) return

    setAllocationLookupLoading(true)
    setError("")

    try {
      const lookupStudent = await studentApi.getAllocationStudentByRollNumber(studentData.rollNumber)
      setAllocationLookup(lookupStudent)

      const currentAllocation = lookupStudent?.currentAllocation
      if (!currentAllocation?.hostelId) {
        setAllocationForm(createDefaultAllocationForm())
        return
      }

      const nextForm = {
        ...createDefaultAllocationForm(),
        hostelId: currentAllocation.hostelId,
        hostelType: currentAllocation.hostelType || "",
        bedNumber: currentAllocation.bedNumber ? String(currentAllocation.bedNumber) : "",
      }

      if (currentAllocation.hostelType === "unit-based") {
        const units = await loadUnitsForHostel(currentAllocation.hostelId)
        const matchedUnit = units.find((unit) => normalizeLookupValue(unit.unitNumber) === normalizeLookupValue(currentAllocation.unitNumber))

        nextForm.unit = currentAllocation.unitNumber || ""
        nextForm.unitId = matchedUnit?.id || ""

        if (matchedUnit?.id) {
          const rooms = await loadUnitRooms(matchedUnit.id)
          const matchedRoom = rooms.find((room) => normalizeLookupValue(room.roomNumber) === normalizeLookupValue(currentAllocation.roomNumber))
          nextForm.roomId = matchedRoom?.id || ""
          nextForm.roomNumber = matchedRoom?.roomNumber || currentAllocation.roomNumber || ""
        }
      } else {
        const rooms = await loadRoomOnlyRooms(currentAllocation.hostelId)
        const matchedRoom = rooms.find((room) => normalizeLookupValue(room.roomNumber) === normalizeLookupValue(currentAllocation.roomNumber))
        nextForm.roomId = matchedRoom?.id || ""
        nextForm.roomNumber = matchedRoom?.roomNumber || currentAllocation.roomNumber || ""
      }

      setAllocationForm(nextForm)
    } catch (lookupError) {
      setAllocationLookup(null)
      setAllocationForm(createDefaultAllocationForm())
      setError(lookupError.message || "Failed to load current allocation details.")
    } finally {
      setAllocationLookupLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen || !isAdmin || activeTab !== "allocation" || allocationInitializedRef.current) return
    allocationInitializedRef.current = true
    initializeAllocationForm()
  }, [activeTab, isAdmin, isOpen])

  const handleProfileChange = (data) => {
    setProfileFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const handleAllocationHostelChange = async (event) => {
    const nextHostelId = event.target.value
    const nextHostel = safeHostels.find((hostel) => hostel._id === nextHostelId) || null

    setAllocationForm({
      ...createDefaultAllocationForm(),
      hostelId: nextHostelId,
      hostelType: nextHostel?.type || "",
      roomsLoading: nextHostel?.type === "room-only",
    })
    setError("")

    try {
      if (nextHostel?.type === "unit-based") {
        await loadUnitsForHostel(nextHostelId)
        setAllocationForm((prev) => ({ ...prev, roomsLoading: false }))
      } else if (nextHostel?.type === "room-only") {
        await loadRoomOnlyRooms(nextHostelId)
        setAllocationForm((prev) => ({ ...prev, roomsLoading: false }))
      }
    } catch {
      setAllocationForm((prev) => ({
        ...prev,
        roomsLoading: false,
        validationError: nextHostel?.type === "unit-based"
          ? "Failed to load units for this hostel."
          : "Failed to load rooms for this hostel.",
      }))
    }
  }

  const handleAllocationUnitChange = (event) => {
    const value = event.target.value
    setAllocationForm((prev) => ({
      ...prev,
      unit: value,
      unitId: "",
      unitError: "",
      roomId: "",
      roomNumber: "",
      bedNumber: "",
      validationError: "",
    }))
    setError("")
  }

  const handleAllocationUnitBlur = async () => {
    if (allocationForm.hostelType !== "unit-based" || !allocationForm.hostelId) return

    const nextUnitValue = String(allocationForm.unit || "").trim()
    if (!nextUnitValue) {
      setAllocationForm((prev) => ({
        ...prev,
        unit: "",
        unitId: "",
        unitError: "Unit number is required for this hostel.",
      }))
      return
    }

    setAllocationForm((prev) => ({
      ...prev,
      unit: nextUnitValue,
      unitError: "",
      roomId: "",
      roomNumber: "",
      bedNumber: "",
      validationError: "",
      roomsLoading: true,
    }))

    try {
      const units = await loadUnitsForHostel(allocationForm.hostelId)
      const matchedUnit = units.find((unit) => normalizeLookupValue(unit.unitNumber) === normalizeLookupValue(nextUnitValue))

      if (!matchedUnit) {
        setAllocationForm((prev) => ({
          ...prev,
          unitId: "",
          unitError: `Unit ${nextUnitValue} does not exist in the selected hostel.`,
          roomsLoading: false,
        }))
        return
      }

      await loadUnitRooms(matchedUnit.id)
      setAllocationForm((prev) => ({
        ...prev,
        unit: matchedUnit.unitNumber,
        unitId: matchedUnit.id,
        unitError: "",
        roomsLoading: false,
      }))
    } catch {
      setAllocationForm((prev) => ({
        ...prev,
        unitId: "",
        unitError: "Failed to load rooms for the selected unit.",
        roomsLoading: false,
      }))
    }
  }

  const handleAllocationRoomChange = (event) => {
    const value = event.target.value
    const selectedRoom = getSelectedRoom({ ...allocationForm, roomId: value }, roomsByCacheKey)
    setAllocationForm((prev) => ({
      ...prev,
      roomId: value,
      roomNumber: selectedRoom?.roomNumber || "",
      bedNumber: "",
      validationError: "",
    }))
    setError("")
  }

  const handleAllocationBedChange = (event) => {
    const value = event.target.value
    setAllocationForm((prev) => ({
      ...prev,
      bedNumber: value,
      validationError: "",
    }))
    setError("")
  }

  const handleSaveProfile = async () => {
    await studentApi.updateStudent(studentData.userId, profileFormData)
  }

  const handleSaveStatus = async () => {
    const isSuccess = await adminApi.bulkUpdateStudentsStatus([studentData.rollNumber], statusValue)
    if (!isSuccess) {
      throw new Error("Failed to update student status")
    }
  }

  const handleSaveDayScholar = async () => {
    const payload = {
      [studentData.rollNumber]: {
        isDayScholar: dayScholarForm.isDayScholar,
        ...(dayScholarForm.isDayScholar && {
          dayScholarDetails: {
            address: dayScholarForm.address || "",
            ownerName: dayScholarForm.ownerName || "",
            ownerPhone: dayScholarForm.ownerPhone || "",
            ownerEmail: dayScholarForm.ownerEmail || "",
          },
        }),
      },
    }

    const response = await adminApi.bulkUpdateDayScholarDetails(payload)
    if (!response?.success) {
      const firstError = Array.isArray(response?.errors) && response.errors.length > 0
        ? response.errors[0]?.message
        : response?.message
      throw new Error(firstError || "Failed to update day scholar details")
    }
  }

  const handleSaveAllocation = async () => {
    let validationError = ""

    if (!allocationForm.hostelId) {
      validationError = "Select a hostel."
    } else if (allocationForm.hostelType === "unit-based" && !allocationForm.unitId) {
      validationError = allocationForm.unitError || "Enter a valid unit number."
    } else if (!allocationForm.roomId) {
      validationError = "Select a room."
    } else if (!allocationForm.bedNumber) {
      validationError = "Select a bed number."
    }

    if (validationError) {
      setAllocationForm((prev) => ({ ...prev, validationError }))
      throw new Error(validationError)
    }

    const allocationPayload = {
      rollNumber: studentData.rollNumber,
      room: allocationForm.roomNumber,
      bedNumber: Number(allocationForm.bedNumber),
    }

    if (allocationForm.hostelType === "unit-based") {
      allocationPayload.unit = allocationForm.unit
    }

    const response = await hostelApi.updateRoomAllocations([allocationPayload], allocationForm.hostelId)
    if (!response?.success) {
      throw new Error(response?.message || "Failed to update allocation")
    }

    if (Array.isArray(response.errors) && response.errors.length > 0) {
      throw new Error(response.errors[0]?.message || "Failed to update allocation")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")

    try {
      if (["personal", "academic", "guardian"].includes(activeTab)) {
        await handleSaveProfile()
        alert("Student information updated successfully")
      } else if (activeTab === "status") {
        await handleSaveStatus()
        alert("Student status updated successfully")
      } else if (activeTab === "dayScholar") {
        await handleSaveDayScholar()
        alert("Day scholar details updated successfully")
      } else if (activeTab === "allocation") {
        await handleSaveAllocation()
        alert("Student allocation updated successfully")
      }

      onUpdate?.()
      onClose()
    } catch (submitError) {
      console.error("Error updating student:", submitError)
      setError(submitError.message || "Failed to update student information")
    } finally {
      setLoading(false)
    }
  }

  const currentRoom = getSelectedRoom(allocationForm, roomsByCacheKey)
  const occupiedBedStudent = getBedOccupant(currentRoom, allocationForm.bedNumber)
  const currentHostel = safeHostels.find((hostel) => hostel._id === allocationForm.hostelId) || null
  const units = unitsByHostelId[allocationForm.hostelId] || []
  const roomOptions = (roomsByCacheKey[getRoomCacheKey(allocationForm)] || [])
    .filter((room) => room.status === "Active")
    .map((room) => ({
      value: room.id,
      label: `${room.roomNumber} (${room.currentOccupancy || 0}/${room.capacity})`,
    }))
  const bedOptions = currentRoom
    ? Array.from({ length: currentRoom.capacity }, (_, bedIndex) => {
        const bedNumber = bedIndex + 1
        const occupiedStudent = getBedOccupant(currentRoom, bedNumber)
        return {
          value: String(bedNumber),
          label: occupiedStudent
            ? `Bed ${bedNumber} - Occupied by ${occupiedStudent.name}`
            : `Bed ${bedNumber} - Available`,
        }
      })
    : []

  const renderContent = () => {
    if (!profileFormData) return null

    if (activeTab === "personal") {
      return <PersonalInfoSection data={profileFormData} onChange={handleProfileChange} />
    }

    if (activeTab === "academic") {
      return <AcademicInfoSection data={profileFormData} onChange={handleProfileChange} />
    }

    if (activeTab === "guardian") {
      return <GuardianInfoSection data={profileFormData} onChange={handleProfileChange} />
    }

    if (activeTab === "status") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>
              Update Student Status
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Change the lifecycle status for {studentData.name || studentData.rollNumber}.
            </p>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
              Status
            </label>
            <Select
              value={statusValue}
              onChange={(event) => setStatusValue(event.target.value)}
              options={[
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
                { value: "Graduated", label: "Graduated" },
                { value: "Dropped", label: "Dropped" },
              ]}
            />
          </div>
        </div>
      )
    }

    if (activeTab === "dayScholar") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>
              Update Day Scholar Details
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Turn day scholar mode on or off here. The additional residence fields are optional.
            </p>
          </div>

          <Checkbox
            checked={dayScholarForm.isDayScholar}
            onChange={(event) => setDayScholarForm((prev) => ({ ...prev, isDayScholar: event.target.checked }))}
            label="Student is a day scholar"
          />

          {dayScholarForm.isDayScholar && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-4)" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                  Address
                </label>
                <Input
                  type="text"
                  value={dayScholarForm.address}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Optional address"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                  Owner Name
                </label>
                <Input
                  type="text"
                  value={dayScholarForm.ownerName}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, ownerName: event.target.value }))}
                  placeholder="Optional owner name"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                  Owner Phone
                </label>
                <Input
                  type="text"
                  value={dayScholarForm.ownerPhone}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, ownerPhone: event.target.value }))}
                  placeholder="Optional owner phone"
                />
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                  Owner Email
                </label>
                <Input
                  type="email"
                  value={dayScholarForm.ownerEmail}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, ownerEmail: event.target.value }))}
                  placeholder="Optional owner email"
                />
              </div>
            </div>
          )}
        </div>
      )
    }

    if (activeTab === "allocation") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
          <div>
            <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-body)", marginBottom: "var(--spacing-1)" }}>
              Update Allocation
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
              Use the same guarded allocation flow here: select a valid hostel, validate the unit when required, choose an existing room, and then choose a bed.
            </p>
          </div>

          {allocationLookupLoading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", color: "var(--color-text-muted)" }}>
              <FaSpinner className="animate-spin" />
              Loading current allocation details...
            </div>
          ) : (
            <>
              {allocationLookup?.currentAllocation && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--spacing-2)",
                    padding: "var(--spacing-2) var(--spacing-3)",
                    borderRadius: "var(--radius-lg)",
                    backgroundColor: "var(--color-info-bg)",
                    color: "var(--color-info-text)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <FaInfoCircle style={{ marginTop: "2px" }} />
                  <span>
                    Current allocation:{" "}
                    <strong>
                      {allocationLookup.currentAllocation.hostelName}
                      {allocationLookup.currentAllocation.unitNumber ? ` / ${allocationLookup.currentAllocation.unitNumber}` : ""}
                      {allocationLookup.currentAllocation.roomNumber ? ` / ${allocationLookup.currentAllocation.roomNumber}` : ""}
                      {allocationLookup.currentAllocation.bedNumber ? ` / Bed ${allocationLookup.currentAllocation.bedNumber}` : ""}
                    </strong>
                  </span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "var(--spacing-4)" }}>
                <div>
                  <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                    Hostel
                  </label>
                  <Select
                    value={allocationForm.hostelId}
                    onChange={handleAllocationHostelChange}
                    options={safeHostels.map((hostel) => ({
                      value: hostel._id,
                      label: `${hostel.name} (${hostel.type})`,
                    }))}
                    placeholder="Select hostel"
                    error={Boolean(allocationForm.validationError && !allocationForm.hostelId)}
                  />
                </div>

                {allocationForm.hostelType === "unit-based" && (
                  <div>
                    <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                      Unit Number
                    </label>
                    <Input
                      type="text"
                      value={allocationForm.unit}
                      onChange={handleAllocationUnitChange}
                      onBlur={handleAllocationUnitBlur}
                      placeholder={units.length > 0 ? `Example: ${units[0].unitNumber}` : "Enter unit number"}
                      error={Boolean(allocationForm.unitError || (allocationForm.validationError && !allocationForm.unitId))}
                    />
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                    Room
                  </label>
                  <Select
                    value={allocationForm.roomId}
                    onChange={handleAllocationRoomChange}
                    options={roomOptions}
                    placeholder={
                      allocationForm.hostelType === "unit-based"
                        ? allocationForm.unitId ? "Select room" : "Enter unit first"
                        : allocationForm.hostelId ? "Select room" : "Select hostel first"
                    }
                    disabled={!allocationForm.hostelId || (allocationForm.hostelType === "unit-based" && !allocationForm.unitId) || allocationForm.roomsLoading}
                    error={Boolean(allocationForm.validationError && !allocationForm.roomId)}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", marginBottom: "var(--spacing-1)" }}>
                    Bed Number
                  </label>
                  <Select
                    value={allocationForm.bedNumber}
                    onChange={handleAllocationBedChange}
                    options={bedOptions}
                    placeholder={allocationForm.roomId ? "Select bed" : "Select room first"}
                    disabled={!allocationForm.roomId}
                    error={Boolean(allocationForm.validationError && !allocationForm.bedNumber)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {occupiedBedStudent && occupiedBedStudent.id !== allocationLookup?.id && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "var(--spacing-2)",
                      padding: "var(--spacing-2) var(--spacing-3)",
                      borderRadius: "var(--radius-lg)",
                      backgroundColor: "var(--color-warning-bg)",
                      color: "var(--color-warning-text)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <FaExclamationTriangle style={{ marginTop: "2px" }} />
                    <span>
                      Bed {allocationForm.bedNumber} is currently occupied by <strong>{occupiedBedStudent.name}</strong>.
                      Updating this allocation will unallocate that student.
                    </span>
                  </div>
                )}

                {allocationForm.unitError && (
                  <div style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                    {allocationForm.unitError}
                  </div>
                )}

                {allocationForm.validationError && (
                  <div style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
                    {allocationForm.validationError}
                  </div>
                )}

                {allocationForm.roomsLoading && (
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
                    <FaSpinner className="animate-spin" />
                    Loading rooms...
                  </div>
                )}

                {currentHostel && currentHostel.type === "unit-based" && allocationForm.hostelId && !allocationForm.unit && !allocationForm.unitError && units.length > 0 && (
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Available units include: {units.slice(0, 6).map((unit) => unit.unitNumber).join(", ")}
                    {units.length > 6 ? "..." : ""}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )
    }

    return null
  }

  if (!isOpen || !profileFormData) return null

  return (
    <Modal
      title="Edit Student"
      onClose={onClose}
      width={980}
      minHeight="90vh"
      style={{ height: "90vh" }}
      closeButtonVariant="button"
      footer={(
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--spacing-3)" }}>
          <Button type="button" onClick={onClose} disabled={loading} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || allocationLookupLoading} variant="primary" size="md" loading={loading}>
            Save Changes
          </Button>
        </div>
      )}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
        <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              onClick={() => {
                setError("")
                setActiveTab(tab.id)
              }}
              variant={activeTab === tab.id ? "primary" : "ghost"}
              size="sm"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {error && (
          <div style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--color-danger-bg-light)", color: "var(--color-danger)", fontSize: "var(--font-size-sm)" }}>
            {error}
          </div>
        )}

        {renderContent()}
      </div>
    </Modal>
  )
}

export default EditStudentModal
