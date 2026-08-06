import { FaFilter } from "react-icons/fa"
import { MdClearAll } from "react-icons/md"
import { Grid, Label, Select, Surface } from "@/components/ui"
import { Button, Input } from "czero/react"

const LeavesFilterPanel = ({ filters, updateFilter, resetFilters, isAdmin }) => {
  return (
    <Surface bg="primary" padding={5} radius="xl" shadow="sm" border="var(--border-1) solid var(--color-border-light)" style={{ marginTop: 'var(--spacing-4)' }}>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)', paddingBottom: 'var(--spacing-3)', borderBottom: `var(--border-1) solid var(--color-border-light)`, gap: 'var(--gap-md)', flexWrap: 'wrap' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', marginBottom: 0 }}>
          <FaFilter style={{ marginRight: 'var(--spacing-2)', color: 'var(--color-primary)' }} /> Advanced Filters
        </h3>
        <Button onClick={resetFilters} variant="outline" size="sm">
          <MdClearAll /> Reset Filters
        </Button>
      </div>

      <Grid min={200} gap="var(--gap-md)">
        <div>
          <Label color="tertiary">Status</Label>
          <Select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} options={[
            { value: "all", label: "All" },
            { value: "Pending", label: "Pending" },
            { value: "Approved", label: "Approved" },
            { value: "Rejected", label: "Rejected" }
          ]} />
        </div>

        <div>
          <Label color="tertiary">Start Date</Label>
          <Input type="date" value={filters.startDate} onChange={(e) => updateFilter("startDate", e.target.value)} />
        </div>

        <div>
          <Label color="tertiary">End Date</Label>
          <Input type="date" value={filters.endDate} onChange={(e) => updateFilter("endDate", e.target.value)} />
        </div>

        <div>
          <Label color="tertiary">Items Per Page</Label>
          <Select value={filters.limit} onChange={(e) => updateFilter("limit", Number(e.target.value))} options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 50, label: "50" }
          ]} />
        </div>
      </Grid>
    </Surface>
  )
}

export default LeavesFilterPanel
