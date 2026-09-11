import { hostelApi, studentApi } from "../../service"
import { queryKeys } from "./queryKeys"

export const asList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.data)) return value.data
  return []
}

export const hostelIdOf = (hostel) => hostel?.id || hostel?._id || null

export const unitIdOf = (unit) => unit?.id || unit?._id || null

export const userIdOf = (student) => {
  const value = student?.userId
  if (!value) return null
  if (typeof value === "object") return value._id || value.id || null
  return value
}

export const fetchHostelUnits = async (hostelId) => asList(await hostelApi.getUnits(hostelId))

export const fetchHostelRooms = async (hostelId) => asList(await hostelApi.getRooms({ hostelId }))

export const fetchUnitRooms = async (unitId) => asList(await hostelApi.getRoomsByUnit(unitId))

export const fetchStudentDetails = async (userId) => {
  const response = await studentApi.getStudentDetails(userId)
  return response?.data ?? null
}

export const seedUnitRooms = (queryClient, units) => {
  for (const unit of units || []) {
    const unitId = unitIdOf(unit)
    if (!unitId || !Array.isArray(unit.rooms)) continue
    if (queryClient.getQueryData(queryKeys.hostels.unitRooms(unitId)) == null) {
      queryClient.setQueryData(queryKeys.hostels.unitRooms(unitId), unit.rooms)
    }
  }
}

export const prefetchHostelMap = async (queryClient, hostel) => {
  const hostelId = hostelIdOf(hostel)
  if (!hostelId) return
  if (hostel.type === "room-only") {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.hostels.rooms(hostelId),
      queryFn: () => fetchHostelRooms(hostelId),
    })
    return
  }
  await queryClient.prefetchQuery({
    queryKey: queryKeys.hostels.units(hostelId),
    queryFn: () => fetchHostelUnits(hostelId),
  })
  seedUnitRooms(queryClient, queryClient.getQueryData(queryKeys.hostels.units(hostelId)))
}

export const prefetchUnitRooms = async (queryClient, unit) => {
  const unitId = unitIdOf(unit)
  if (!unitId) return
  if (Array.isArray(unit?.rooms) && queryClient.getQueryData(queryKeys.hostels.unitRooms(unitId)) == null) {
    queryClient.setQueryData(queryKeys.hostels.unitRooms(unitId), unit.rooms)
  }
  await queryClient.prefetchQuery({
    queryKey: queryKeys.hostels.unitRooms(unitId),
    queryFn: () => fetchUnitRooms(unitId),
  })
}

export const prefetchStudentDetails = (queryClient, students) => {
  const seen = new Set()
  for (const student of students || []) {
    const userId = userIdOf(student)
    if (!userId || seen.has(String(userId))) continue
    seen.add(String(userId))
    queryClient
      .prefetchQuery({
        queryKey: queryKeys.students.details(userId),
        queryFn: () => fetchStudentDetails(userId),
      })
      .catch(() => {})
  }
}

export const prefetchRoomsStudents = (queryClient, rooms) => {
  prefetchStudentDetails(
    queryClient,
    (rooms || []).flatMap((room) => room.students || []),
  )
}

export const prefetchHostelPeek = async (queryClient, hostel) => {
  await prefetchHostelMap(queryClient, hostel)
  if (hostel?.type === "room-only") return
  const units = queryClient.getQueryData(queryKeys.hostels.units(hostelIdOf(hostel))) || []
  await Promise.all(units.map((unit) => prefetchUnitRooms(queryClient, unit)))
}

export const prefetchUnitPeek = (queryClient, unit) => {
  prefetchUnitRooms(queryClient, unit)
  prefetchRoomsStudents(queryClient, unit?.rooms)
}

export const prefetchRoomPeek = (queryClient, room) => {
  if (!room) return
  prefetchStudentDetails(queryClient, room.students || [])
}
