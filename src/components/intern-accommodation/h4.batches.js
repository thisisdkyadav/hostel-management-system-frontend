const time = (value) => (value ? new Date(value).getTime() : NaN)

// Students sharing h4.batchId form one group; requests without a batch stand alone.
export const groupByBatch = (requests) => {
  const map = new Map()
  for (const r of requests) {
    const key = r.h4.batchId ? String(r.h4.batchId) : `single:${r._id}`
    if (!map.has(key)) map.set(key, { key, students: [] })
    map.get(key).students.push(r)
  }
  return [...map.values()].map((g) => {
    const first = g.students[0]
    const genders = {}
    const statuses = {}
    let from = null
    let to = null
    let created = null
    for (const r of g.students) {
      const gender = r.h4.gender || "Other"
      genders[gender] = (genders[gender] || 0) + 1
      statuses[r.status] = (statuses[r.status] || 0) + 1
      if (time(r.stay?.fromDate) < time(from) || (!from && r.stay?.fromDate)) from = r.stay.fromDate
      if (time(r.stay?.toDate) > time(to) || (!to && r.stay?.toDate)) to = r.stay.toDate
      if (time(r.createdAt) < time(created) || (!created && r.createdAt)) created = r.createdAt
    }
    return {
      ...g,
      label: first.h4.batchLabel || `Batch by ${first.h4.creatorName || "—"}`,
      facultyName: first.h4.facultyName,
      from,
      to,
      created,
      genders,
      statuses: Object.entries(statuses),
    }
  })
}

// "12 · 8M 4F"
export const batchGenderSplit = (g) => {
  const parts = []
  if (g.genders.Male) parts.push(`${g.genders.Male}M`)
  if (g.genders.Female) parts.push(`${g.genders.Female}F`)
  const other = g.students.length - (g.genders.Male || 0) - (g.genders.Female || 0)
  if (other) parts.push(`${other}O`)
  return `${g.students.length}${parts.length ? ` · ${parts.join(" ")}` : ""}`
}
