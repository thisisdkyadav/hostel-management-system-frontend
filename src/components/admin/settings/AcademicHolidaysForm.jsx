import { useMemo, useState } from "react"
import { HiCalendar, HiPlus, HiSave, HiTrash } from "react-icons/hi"
import { Button, Input } from "czero/react"

const YEAR_REGEX = /^\d{4}$/
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

const normalizeAcademicHolidays = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {}
  }

  const normalized = {}
  for (const [year, holidays] of Object.entries(value)) {
    if (!YEAR_REGEX.test(year) || !Array.isArray(holidays)) continue

    const dedupe = new Set()
    const normalizedHolidays = []
    for (const holiday of holidays) {
      const title = String(holiday?.title || "").trim()
      const date = String(holiday?.date || "").trim()
      if (!title || !DATE_REGEX.test(date)) continue
      const dedupeKey = `${date}|${title.toLowerCase()}`
      if (dedupe.has(dedupeKey)) continue
      dedupe.add(dedupeKey)
      normalizedHolidays.push({ title, date })
    }

    normalizedHolidays.sort((a, b) => {
      if (a.date === b.date) return a.title.localeCompare(b.title)
      return a.date.localeCompare(b.date)
    })

    normalized[year] = normalizedHolidays
  }

  return normalized
}

const formatDateLabel = (dateValue) => {
  if (!DATE_REGEX.test(dateValue || "")) return dateValue || "Invalid date"
  const [year, month, day] = dateValue.split("-").map((part) => parseInt(part, 10))
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
}

const AcademicHolidaysForm = ({ academicHolidays, onUpdate, isLoading }) => {
  const initialHolidays = normalizeAcademicHolidays(academicHolidays)
  const initialYears = Object.keys(initialHolidays).sort((a, b) => b.localeCompare(a))

  const [localHolidays, setLocalHolidays] = useState(initialHolidays)
  const [selectedYear, setSelectedYear] = useState(initialYears[0] || "")
  const [newYear, setNewYear] = useState("")
  const [newHolidayTitle, setNewHolidayTitle] = useState("")
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [error, setError] = useState("")

  const sortedYears = useMemo(
    () => Object.keys(localHolidays).sort((a, b) => b.localeCompare(a)),
    [localHolidays]
  )

  const hasChanges = useMemo(() => {
    const normalizedCurrent = normalizeAcademicHolidays(localHolidays)
    const normalizedOriginal = normalizeAcademicHolidays(academicHolidays)
    return JSON.stringify(normalizedCurrent) !== JSON.stringify(normalizedOriginal)
  }, [academicHolidays, localHolidays])

  const selectedYearHolidays = useMemo(
    () => (selectedYear ? localHolidays[selectedYear] || [] : []),
    [localHolidays, selectedYear]
  )

  const resetHolidayInputs = () => {
    setNewHolidayTitle("")
    setNewHolidayDate("")
  }

  const handleAddYear = () => {
    const normalizedYear = newYear.trim()
    if (!YEAR_REGEX.test(normalizedYear)) {
      setError("Year must be in YYYY format (example: 2026)")
      return
    }
    if (localHolidays[normalizedYear]) {
      setError("This year already exists")
      return
    }

    setLocalHolidays((prev) => ({ ...prev, [normalizedYear]: [] }))
    setSelectedYear(normalizedYear)
    setNewYear("")
    setError("")
    resetHolidayInputs()
  }

  const handleDeleteYear = (year) => {
    setLocalHolidays((prev) => {
      const next = { ...prev }
      delete next[year]
      return next
    })

    setSelectedYear((prev) => {
      if (prev !== year) return prev
      const remainingYears = sortedYears.filter((value) => value !== year)
      return remainingYears[0] || ""
    })
    setError("")
    resetHolidayInputs()
  }

  const handleAddHoliday = () => {
    if (!selectedYear) {
      setError("Select a year first")
      return
    }

    const title = newHolidayTitle.trim()
    const date = newHolidayDate.trim()

    if (!title || !DATE_REGEX.test(date)) {
      setError("Holiday needs a title and a valid date")
      return
    }

    const duplicate = selectedYearHolidays.some(
      (holiday) => holiday.date === date && holiday.title.toLowerCase() === title.toLowerCase()
    )
    if (duplicate) {
      setError("This holiday already exists for the selected year")
      return
    }

    setLocalHolidays((prev) => {
      const next = { ...prev }
      const nextHolidays = [...(next[selectedYear] || []), { title, date }]
      nextHolidays.sort((a, b) => {
        if (a.date === b.date) return a.title.localeCompare(b.title)
        return a.date.localeCompare(b.date)
      })
      next[selectedYear] = nextHolidays
      return next
    })

    setError("")
    resetHolidayInputs()
  }

  const handleDeleteHoliday = (holidayToDelete) => {
    if (!selectedYear) return

    setLocalHolidays((prev) => {
      const next = { ...prev }
      next[selectedYear] = (next[selectedYear] || []).filter(
        (holiday) =>
          !(holiday.date === holidayToDelete.date && holiday.title === holidayToDelete.title)
      )
      return next
    })
  }

  const handleSubmit = () => {
    const normalized = normalizeAcademicHolidays(localHolidays)
    onUpdate(normalized)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-6)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(180px, 220px) 1fr",
          gap: "var(--spacing-2)",
        }}
      >
        <Input
          type="text"
          value={newYear}
          onChange={(event) => {
            setNewYear(event.target.value)
            setError("")
          }}
          placeholder="Add year (YYYY)"
          disabled={isLoading}
        />
        <Button type="button" variant="primary" onClick={handleAddYear} disabled={isLoading}>
          <HiPlus size={16} /> Add Year
        </Button>
      </div>

      {sortedYears.length === 0 ? (
        <div
          style={{
            border: "var(--border-1) solid var(--color-border-primary)",
            borderRadius: "var(--radius-card-sm)",
            padding: "var(--spacing-4)",
            color: "var(--color-text-muted)",
          }}
        >
          No year configured yet. Add a year first, then add holidays for that year.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--spacing-2)",
            }}
          >
            {sortedYears.map((year) => {
              const isActive = year === selectedYear
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => {
                    setSelectedYear(year)
                    setError("")
                  }}
                  disabled={isLoading}
                  style={{
                    border: `var(--border-1) solid ${isActive ? "var(--color-primary)" : "var(--color-border-primary)"}`,
                    backgroundColor: isActive ? "var(--color-primary-bg)" : "var(--color-bg-primary)",
                    color: isActive ? "var(--color-primary)" : "var(--color-text-body)",
                    borderRadius: "var(--radius-badge-pill)",
                    padding: "var(--spacing-1-5) var(--spacing-3)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)",
                    cursor: "pointer",
                  }}
                >
                  {year}
                </button>
              )
            })}
          </div>

          <div
            style={{
              border: "var(--border-1) solid var(--color-border-primary)",
              borderRadius: "var(--radius-card-sm)",
              padding: "var(--spacing-4)",
              backgroundColor: "var(--color-bg-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "var(--spacing-3)",
                marginBottom: "var(--spacing-3)",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "inline-flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                <HiCalendar size={16} style={{ color: "var(--color-primary)" }} />
                <span style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
                  Holidays for {selectedYear}
                </span>
              </div>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDeleteYear(selectedYear)}
                disabled={isLoading}
              >
                <HiTrash size={14} /> Delete Year
              </Button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 220px) auto",
                gap: "var(--spacing-2)",
                marginBottom: "var(--spacing-4)",
              }}
            >
              <Input
                type="text"
                value={newHolidayTitle}
                onChange={(event) => {
                  setNewHolidayTitle(event.target.value)
                  setError("")
                }}
                placeholder="Holiday title"
                disabled={isLoading || !selectedYear}
              />
              <Input
                type="date"
                value={newHolidayDate}
                onChange={(event) => {
                  setNewHolidayDate(event.target.value)
                  setError("")
                }}
                disabled={isLoading || !selectedYear}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleAddHoliday}
                disabled={isLoading || !selectedYear}
              >
                <HiPlus size={14} /> Add
              </Button>
            </div>

            {selectedYearHolidays.length === 0 ? (
              <div style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
                No holidays added for this year.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                {selectedYearHolidays.map((holiday) => (
                  <div
                    key={`${holiday.date}-${holiday.title}`}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      alignItems: "center",
                      gap: "var(--spacing-2)",
                      border: "var(--border-1) solid var(--color-border-primary)",
                      borderRadius: "var(--radius-md)",
                      padding: "var(--spacing-2) var(--spacing-3)",
                      backgroundColor: "var(--color-bg-secondary)",
                    }}
                  >
                    <span style={{ color: "var(--color-text-body)", fontSize: "var(--font-size-sm)" }}>
                      {holiday.title}
                    </span>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-xs)" }}>
                      {formatDateLabel(holiday.date)}
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteHoliday(holiday)}
                      disabled={isLoading}
                    >
                      <HiTrash size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {error && (
        <div
          style={{
            color: "var(--color-danger)",
            backgroundColor: "var(--color-danger-bg-light)",
            border: "var(--border-1) solid var(--color-danger-light)",
            borderRadius: "var(--radius-md)",
            padding: "var(--spacing-2) var(--spacing-3)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          paddingTop: "var(--spacing-4)",
          borderTop: "var(--border-1) solid var(--color-border-primary)",
        }}
      >
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          loading={isLoading}
          disabled={isLoading || !hasChanges}
        >
          <HiSave size={16} /> Save Academic Holidays
        </Button>
      </div>
    </div>
  )
}

export default AcademicHolidaysForm
