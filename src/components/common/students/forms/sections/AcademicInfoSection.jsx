import React from "react"
import { FaUserGraduate } from "react-icons/fa"
import FormField from "../../../FormField"

const AcademicInfoSection = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-4">
        <FaUserGraduate className="text-[#1360AB] mr-2" />
        <h3 className="font-semibold text-gray-800">Academic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Department" name="department" type="text" value={data.department || ""} onChange={handleChange} />

        <FormField
          label="Degree"
          name="degree"
          type="select"
          value={data.degree || ""}
          onChange={handleChange}
          options={[
            { value: "", label: "Select Degree" },
            { value: "B.Tech", label: "B.Tech" },
            { value: "M.Tech", label: "M.Tech" },
            { value: "PhD", label: "PhD" },
            { value: "BSc", label: "BSc" },
            { value: "MSc", label: "MSc" },
            { value: "BBA", label: "BBA" },
            { value: "MBA", label: "MBA" },
          ]}
        />

        <FormField label="Admission Date" name="admissionDate" type="date" value={data.admissionDate ? new Date(data.admissionDate).toISOString().split("T")[0] : ""} onChange={handleChange} />
      </div>
    </div>
  )
}

export default AcademicInfoSection
