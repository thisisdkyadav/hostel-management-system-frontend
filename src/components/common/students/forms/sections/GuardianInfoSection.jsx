import React from "react"
import { FaMapMarkerAlt } from "react-icons/fa"
import FormField from "../../../FormField"

const GuardianInfoSection = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-4">
        <FaMapMarkerAlt className="text-[#1360AB] mr-2" />
        <h3 className="font-semibold text-gray-800">Guardian Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Guardian Name" name="guardian" type="text" value={data.guardian || ""} onChange={handleChange} />

        <FormField label="Guardian Phone" name="guardianPhone" type="tel" value={data.guardianPhone || ""} onChange={handleChange} />

        <FormField label="Guardian Email" name="guardianEmail" type="email" value={data.guardianEmail || ""} onChange={handleChange} />
      </div>
    </div>
  )
}

export default GuardianInfoSection
