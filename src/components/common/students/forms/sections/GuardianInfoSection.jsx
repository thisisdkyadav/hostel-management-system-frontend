import React from "react"
import { MapPin } from "lucide-react"
import { FormField, Grid, Text } from "hzero"

const GuardianInfoSection = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-4">
        <MapPin className="mr-[var(--spacing-2)]" color="var(--color-primary)" />
        <Text as="h3" weight="semibold" color="heading">Guardian Information</Text>
      </div>

      <Grid cols={{ base: 1, md: 2 }} gap={4}>
        <FormField label="Guardian Name" name="guardian" type="text" value={data.guardian || ""} onChange={handleChange} />

        <FormField label="Guardian Phone" name="guardianPhone" type="tel" value={data.guardianPhone || ""} onChange={handleChange} />

        <FormField label="Guardian Email" name="guardianEmail" type="email" value={data.guardianEmail || ""} onChange={handleChange} />

        <FormField label="Faculty Advisor Email" name="facultyAdvisorEmail" type="email" value={data.facultyAdvisorEmail || ""} onChange={handleChange} />
      </Grid>
    </div>
  )
}

export default GuardianInfoSection
