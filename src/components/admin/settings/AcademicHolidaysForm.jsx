import { useMemo, useState } from "react"
import { Button, Grid, HStack, Input, Surface, Text, VStack } from "hzero"
import { Calendar, Plus, Save, Trash2 } from "lucide-react"

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
    <VStack gap={6}>
      <Grid cols="minmax(180px, 240px) auto" gap={2} style={{ justifyContent: "start" }}>
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
          <Plus size={16} /> Add Year
        </Button>
      </Grid>

      {sortedYears.length === 0 ? (
        <Text as="div" color="muted" style={{ border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", padding: "var(--spacing-4)" }}>
          No year configured yet. Add a year first, then add holidays for that year.
        </Text>
      ) : (
        <>
          <HStack gap={2} wrap>
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
          </HStack>

          <Surface bg="primary" padding={4} radius="card-sm" border="var(--border-1) solid var(--color-border-primary)">
            <HStack gap={3} align="center" justify="between" wrap style={{ marginBottom: "var(--spacing-3)" }}>
              <HStack inline gap={2} align="center">
                <Calendar size={16} color="var(--color-primary)" />
                <Text as="span" weight="semibold" color="heading">
                  Holidays for {selectedYear}
                </Text>
                <Surface as="span" bg="brand" padding="var(--spacing-0-5) var(--spacing-2)" radius="full" color="brand" size="xs" weight="semibold">
                  {selectedYearHolidays.length}
                </Surface>
              </HStack>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={() => handleDeleteYear(selectedYear)}
                disabled={isLoading}
              >
                <Trash2 size={14} /> Delete Year
              </Button>
            </HStack>

            <Grid cols="minmax(220px, 1fr) minmax(180px, 220px) auto" gap={2} style={{ marginBottom: "var(--spacing-4)" }}>
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
                <Plus size={14} /> Add
              </Button>
            </Grid>

            {selectedYearHolidays.length === 0 ? (
              <Text as="div" color="muted" size="sm">
                No holidays added for this year.
              </Text>
            ) : (
              <VStack gap={2}>
                {selectedYearHolidays.map((holiday) => (
                  <Grid cols="1fr auto auto" gap={2} align="center" style={{ border: "var(--border-1) solid var(--color-border-primary)", borderRadius: "var(--radius-md)", padding: "var(--spacing-2) var(--spacing-3)", backgroundColor: "var(--color-bg-secondary)" }} key={`${holiday.date}-${holiday.title}`}>
                    <Text as="span" color="body" size="sm" weight="medium">
                      {holiday.title}
                    </Text>
                    <Surface as="span" bg="primary" padding="var(--spacing-0-5) var(--spacing-2)" radius="full" border="var(--border-1) solid var(--color-border-primary)" color="muted" size="xs" weight="medium" style={{ whiteSpace: "nowrap" }}>
                      {formatDateLabel(holiday.date)}
                    </Surface>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteHoliday(holiday)}
                      disabled={isLoading}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Grid>
                ))}
              </VStack>
            )}
          </Surface>
        </>
      )}

      {error && (
        <Surface bg="var(--color-danger-bg-light)" padding="var(--spacing-2) var(--spacing-3)" radius="md" border="var(--border-1) solid var(--color-danger-light)" color="danger" size="sm">
          {error}
        </Surface>
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
          <Save size={16} /> Save Academic Holidays
        </Button>
      </div>
    </VStack>
  )
}

export default AcademicHolidaysForm
