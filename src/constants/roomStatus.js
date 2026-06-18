/**
 * Room status values (must mirror the backend Room model enum).
 *
 * "Active" is the only operational state: allocatable, counted in capacity/occupancy,
 * and shown with bed-level detail. Every other value behaves like the legacy "Inactive"
 * (room out of service) and exists so the UI can show *why* a room is unavailable.
 */
export const ROOM_STATUSES = ["Active", "Inactive", "Guest", "Storage", "Maintenance"]

export const ROOM_STATUS_OPTIONS = ROOM_STATUSES.map((value) => ({ value, label: value }))

/** A room is usable (allocatable, occupiable) only when it is Active. */
export const isRoomActive = (status) => status === "Active"
