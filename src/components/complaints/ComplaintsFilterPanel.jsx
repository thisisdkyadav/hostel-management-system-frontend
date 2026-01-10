import React from "react"
import { RotateCcw } from "lucide-react"
import { Button, Select, Card, VStack, Label } from "@/components/ui"

const ComplaintsFilterPanel = ({ filters, updateFilter, resetFilters, hostels, categories }) => {
  return (
    <Card style={{ marginTop: 'var(--spacing-6)', overflow: 'visible' }} padding="p-4">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)' }}>
        <h3 style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
          Filters
        </h3>
        <Button onClick={resetFilters} variant="ghost" size="small" icon={<RotateCcw size={14} />}>
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <VStack gap="xsmall">
          <Label size="sm">Status</Label>
          <Select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            placeholder="All Statuses"
            options={[
              { value: "all", label: "All Complaints" },
              { value: "Pending", label: "Pending" },
              { value: "In Progress", label: "In Progress" },
              { value: "Forwarded to IDO", label: "Forwarded to IDO" },
              { value: "Resolved", label: "Resolved" }
            ]}
          />
        </VStack>

        {hostels.length > 0 && (
          <VStack gap="xsmall">
            <Label size="sm">Hostel</Label>
            <Select
              value={filters.hostelId}
              onChange={(e) => updateFilter("hostelId", e.target.value)}
              placeholder="All Hostels"
              options={[
                { value: "all", label: "All Hostels" },
                ...hostels.map((hostel) => ({
                  value: hostel._id || hostel.id,
                  label: hostel.name || hostel
                }))
              ]}
            />
          </VStack>
        )}

        <VStack gap="xsmall">
          <Label size="sm">Category</Label>
          <Select
            value={filters.category}
            onChange={(e) => updateFilter("category", e.target.value)}
            placeholder="All Categories"
            options={[
              { value: "all", label: "All Categories" },
              ...categories.map((category) => ({ value: category, label: category }))
            ]}
          />
        </VStack>

        <VStack gap="xsmall">
          <Label size="sm">Feedback Rating</Label>
          <Select
            value={filters.feedbackRating}
            onChange={(e) => updateFilter("feedbackRating", e.target.value)}
            placeholder="All Ratings"
            options={[
              { value: "all", label: "All Ratings" },
              { value: "5", label: "5 - Excellent" },
              { value: "4", label: "4 - Good" },
              { value: "3", label: "3 - Average" },
              { value: "2", label: "2 - Poor" },
              { value: "1", label: "1 - Very Poor" }
            ]}
          />
        </VStack>

        <VStack gap="xsmall">
          <Label size="sm">Satisfaction Status</Label>
          <Select
            value={filters.satisfactionStatus}
            onChange={(e) => updateFilter("satisfactionStatus", e.target.value)}
            placeholder="All Statuses"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "Satisfied", label: "Satisfied" },
              { value: "Unsatisfied", label: "Unsatisfied" },
              { value: "False Resolution", label: "False Resolution" }
            ]}
          />
        </VStack>

        <VStack gap="xsmall">
          <Label size="sm">Items per page</Label>
          <Select
            value={filters.limit}
            onChange={(e) => updateFilter("limit", Number(e.target.value))}
            options={[
              { value: 5, label: "5" },
              { value: 10, label: "10" },
              { value: 20, label: "20" },
              { value: 50, label: "50" }
            ]}
          />
        </VStack>
      </div>
    </Card>
  )
}

export default ComplaintsFilterPanel
