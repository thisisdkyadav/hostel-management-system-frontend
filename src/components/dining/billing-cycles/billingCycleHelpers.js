/**
 * Billing-cycle analytics (client side). The detail endpoint returns one row per
 * allocated student; every filter/grouping below is derived from those rows so
 * all numbers on the page move together when a category filter changes.
 */

export const CATEGORY_FIELDS = [
  { id: "caterer", label: "Caterer" },
  { id: "hostel", label: "Hostel" },
  { id: "degree", label: "Degree" },
  { id: "department", label: "Department" },
  { id: "batch", label: "Batch" },
  { id: "gender", label: "Gender" },
]

export const EMPTY_FILTERS = Object.fromEntries(CATEGORY_FIELDS.map((field) => [field.id, "all"]))

export const optionsFor = (students, field) =>
  [...new Set(students.map((student) => student[field]))].sort((a, b) => String(a).localeCompare(String(b), "en", { numeric: true }))

export const applyFilters = (students, filters, search = "") => {
  const term = search.trim().toLowerCase()
  return students.filter((student) => {
    if (CATEGORY_FIELDS.some((field) => filters[field.id] !== "all" && student[field.id] !== filters[field.id])) return false
    if (!term) return true
    return student.rollNumber.toLowerCase().includes(term) || student.name.toLowerCase().includes(term)
  })
}

const pct = (part, whole) => (whole > 0 ? (part / whole) * 100 : null)

/**
 * Aggregate a set of student rows. `slotsPerDay` and `elapsedDays` come from
 * the cycle so attendance = meals eaten / meals offered on non-rebate days.
 */
export const aggregate = (students, { elapsedDays = 0, mealsOfferedPerStudent = 0 } = {}) => {
  const slotsPerDay = elapsedDays > 0 ? mealsOfferedPerStudent / elapsedDays : 0
  const totals = students.reduce(
    (acc, student) => {
      acc.students += 1
      acc.meals += student.meals
      acc.ate += student.meals > 0 ? 1 : 0
      acc.rebateDays += student.rebateDays
      acc.rebaters += student.approvedRebateDays > 0 ? 1 : 0
      acc.pendingRebates += student.pendingRebates
      acc.billed += student.billed
      acc.offered += Math.max(0, mealsOfferedPerStudent - student.rebateDays * slotsPerDay)
      if (student.fee) {
        acc.withFee += 1
        acc.paid += student.fee.paid
        if (student.fee.clearance === "dues") {
          acc.dues += 1
          acc.duesAmount += Math.abs(student.fee.balance)
        }
      }
      return acc
    },
    { students: 0, meals: 0, ate: 0, rebateDays: 0, rebaters: 0, pendingRebates: 0, billed: 0, offered: 0, withFee: 0, paid: 0, dues: 0, duesAmount: 0 }
  )
  return {
    ...totals,
    attendance: pct(totals.meals, totals.offered),
    ateRate: pct(totals.ate, totals.students),
    avgMeals: totals.students ? totals.meals / totals.students : 0,
  }
}

export const groupBy = (students, field, context) => {
  const groups = new Map()
  students.forEach((student) => {
    const key = student[field]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(student)
  })
  return [...groups.entries()]
    .map(([key, rows]) => ({ key, ...aggregate(rows, context) }))
    .sort((a, b) => b.students - a.students)
}

export const formatPct = (value, digits = 0) => (value === null || value === undefined ? "—" : `${value.toFixed(digits)}%`)

export const toCsv = (students, mealSlots) => {
  const header = ["Roll Number", "Name", "Caterer", "Hostel", "Degree", "Department", "Batch", "Gender", "Meals", ...mealSlots.map((slot) => slot.name), "Days Eaten", "Rebate Days", "Chargeable Days", "Billed", "Mess Fee Paid", "Balance", "Clearance"]
  const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`
  const rows = students.map((student) => [
    student.rollNumber, student.name, student.caterer, student.hostel, student.degree, student.department, student.batch, student.gender,
    student.meals, ...mealSlots.map((slot) => student.mealsBySlot[slot.key] || 0), student.daysEaten, student.rebateDays, student.chargeableDays,
    student.billed, student.fee?.paid ?? "", student.fee?.balance ?? "", student.fee?.clearance ?? "no mess fee",
  ])
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n")
}
