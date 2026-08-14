import React, { useEffect, useMemo, useRef, useState } from "react"
import { Info, TriangleAlert } from "lucide-react"
import { Button, Checkbox, Field, Grid, Heading, HStack, Input, Label, Modal, Select, Spinner, Surface, Text, useToast, VStack } from "hzero"
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
  const { toast } = useToast()
  const { user } = useAuth()
  const { hostelList = [] } = useGlobal()
  const isAdmin = user?.role === "Admin"
  const isHostelSupervisor = user?.role === "Hostel Supervisor"
  // Supervisors get status on top of the basic profile tabs; full allocation /
  // day-scholar tooling stays Admin-only.
  const canEditStatus = isAdmin || isHostelSupervisor
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

    if (isAdmin) {
      return [
        ...baseTabs,
        { id: "status", label: "Status" },
        { id: "dayScholar", label: "Day Scholar" },
        { id: "allocation", label: "Allocation" },
      ]
    }

    if (canEditStatus) {
      return [...baseTabs, { id: "status", label: "Status" }]
    }

    return baseTabs
  }, [isAdmin, canEditStatus])

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
        toast.success("Student information updated.")
      } else if (activeTab === "status") {
        await handleSaveStatus()
        toast.success("Student status updated.")
      } else if (activeTab === "dayScholar") {
        await handleSaveDayScholar()
        toast.success("Day scholar details updated.")
      } else if (activeTab === "allocation") {
        await handleSaveAllocation()
        toast.success("Student allocation updated.")
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
        <VStack gap={4}>
          <div>
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-1)" }}>
              Update Student Status
            </Heading>
            <Text color="muted" size="sm">
              Change the lifecycle status for {studentData.name || studentData.rollNumber}.
            </Text>
          </div>

          <Field label="Status" spacing={1}>
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
          </Field>
        </VStack>
      )
    }

    if (activeTab === "dayScholar") {
      return (
        <VStack gap={4}>
          <div>
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-1)" }}>
              Update Day Scholar Details
            </Heading>
            <Text color="muted" size="sm">
              Turn day scholar mode on or off here. The additional residence fields are optional.
            </Text>
          </div>

          <Checkbox
            checked={dayScholarForm.isDayScholar}
            onChange={(event) => setDayScholarForm((prev) => ({ ...prev, isDayScholar: event.target.checked }))}
            label="Student is a day scholar"
          />

          {dayScholarForm.isDayScholar && (
            <Grid cols={2} gap={4}>
              <div style={{ gridColumn: "1 / -1" }}>
                <Label spacing={1}>
                  Address
                </Label>
                <Input
                  type="text"
                  value={dayScholarForm.address}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, address: event.target.value }))}
                  placeholder="Optional address"
                />
              </div>

              <Field label="Owner Name" spacing={1}>
                <Input
                  type="text"
                  value={dayScholarForm.ownerName}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, ownerName: event.target.value }))}
                  placeholder="Optional owner name"
                />
              </Field>

              <Field label="Owner Phone" spacing={1}>
                <Input
                  type="text"
                  value={dayScholarForm.ownerPhone}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, ownerPhone: event.target.value }))}
                  placeholder="Optional owner phone"
                />
              </Field>

              <div style={{ gridColumn: "1 / -1" }}>
                <Label spacing={1}>
                  Owner Email
                </Label>
                <Input
                  type="email"
                  value={dayScholarForm.ownerEmail}
                  onChange={(event) => setDayScholarForm((prev) => ({ ...prev, ownerEmail: event.target.value }))}
                  placeholder="Optional owner email"
                />
              </div>
            </Grid>
          )}
        </VStack>
      )
    }

    if (activeTab === "allocation") {
      return (
        <VStack gap={4}>
          <div>
            <Heading as="h3" size="lg" weight="semibold" color="body" style={{ marginBottom: "var(--spacing-1)" }}>
              Update Allocation
            </Heading>
            <Text color="muted" size="sm">
              Use the same guarded allocation flow here: select a valid hostel, validate the unit when required, choose an existing room, and then choose a bed.
            </Text>
          </div>

          {allocationLookupLoading ? (
            <HStack align="center" gap={2} color="muted">
              <Spinner size={16} />
              Loading current allocation details...
            </HStack>
          ) : (
            <>
              {allocationLookup?.currentAllocation && (
                <Surface bg="info" padding="var(--spacing-2) var(--spacing-3)" radius="lg" color="info-text" size="sm" style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-2)" }}>
                  <Info style={{ marginTop: "2px" }} />
                  <span>
                    Current allocation:{" "}
                    <strong>
                      {allocationLookup.currentAllocation.hostelName}
                      {allocationLookup.currentAllocation.unitNumber ? ` / ${allocationLookup.currentAllocation.unitNumber}` : ""}
                      {allocationLookup.currentAllocation.roomNumber ? ` / ${allocationLookup.currentAllocation.roomNumber}` : ""}
                      {allocationLookup.currentAllocation.bedNumber ? ` / Bed ${allocationLookup.currentAllocation.bedNumber}` : ""}
                    </strong>
                  </span>
                </Surface>
              )}

              <Grid cols={2} gap={4}>
                <Field label="Hostel" spacing={1}>
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
                </Field>

                {allocationForm.hostelType === "unit-based" && (
                  <Field label="Unit Number" spacing={1}>
                    <Input
                      type="text"
                      value={allocationForm.unit}
                      onChange={handleAllocationUnitChange}
                      onBlur={handleAllocationUnitBlur}
                      placeholder={units.length > 0 ? `Example: ${units[0].unitNumber}` : "Enter unit number"}
                      error={Boolean(allocationForm.unitError || (allocationForm.validationError && !allocationForm.unitId))}
                    />
                  </Field>
                )}

                <Field label="Room" spacing={1}>
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
                </Field>

                <Field label="Bed Number" spacing={1}>
                  <Select
                    value={allocationForm.bedNumber}
                    onChange={handleAllocationBedChange}
                    options={bedOptions}
                    placeholder={allocationForm.roomId ? "Select bed" : "Select room first"}
                    disabled={!allocationForm.roomId}
                    error={Boolean(allocationForm.validationError && !allocationForm.bedNumber)}
                  />
                </Field>
              </Grid>

              <VStack gap={2}>
                {occupiedBedStudent && occupiedBedStudent.id !== allocationLookup?.id && (
                  <Surface bg="warning" padding="var(--spacing-2) var(--spacing-3)" radius="lg" color="warning-text" size="sm" style={{ display: "flex", alignItems: "flex-start", gap: "var(--spacing-2)" }}>
                    <TriangleAlert style={{ marginTop: "2px" }} />
                    <span>
                      Bed {allocationForm.bedNumber} is currently occupied by <strong>{occupiedBedStudent.name}</strong>.
                      Updating this allocation will unallocate that student.
                    </span>
                  </Surface>
                )}

                {allocationForm.unitError && (
                  <Surface bg="var(--color-danger-bg-light)" padding="var(--spacing-2) var(--spacing-3)" radius="lg" color="danger" size="sm">
                    {allocationForm.unitError}
                  </Surface>
                )}

                {allocationForm.validationError && (
                  <Surface bg="var(--color-danger-bg-light)" padding="var(--spacing-2) var(--spacing-3)" radius="lg" color="danger" size="sm">
                    {allocationForm.validationError}
                  </Surface>
                )}

                {allocationForm.roomsLoading && (
                  <HStack align="center" gap={2} size="sm" color="muted">
                    <Spinner size={16} />
                    Loading rooms...
                  </HStack>
                )}

                {currentHostel && currentHostel.type === "unit-based" && allocationForm.hostelId && !allocationForm.unit && !allocationForm.unitError && units.length > 0 && (
                  <Text as="div" size="xs" color="muted">
                    Available units include: {units.slice(0, 6).map((unit) => unit.unitNumber).join(", ")}
                    {units.length > 6 ? "..." : ""}
                  </Text>
                )}
              </VStack>
            </>
          )}
        </VStack>
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
        <HStack gap={3} justify="end">
          <Button type="button" onClick={onClose} disabled={loading} variant="secondary" size="md">
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={loading || allocationLookupLoading} variant="primary" size="md" loading={loading}>
            Save Changes
          </Button>
        </HStack>
      )}
    >
      <VStack gap={5}>
        <HStack gap={2} wrap>
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
        </HStack>

        {error && (
          <Surface bg="var(--color-danger-bg-light)" padding="var(--spacing-2) var(--spacing-3)" radius="lg" color="danger" size="sm">
            {error}
          </Surface>
        )}

        {renderContent()}
      </VStack>
    </Modal>
  )
}

export default EditStudentModal
