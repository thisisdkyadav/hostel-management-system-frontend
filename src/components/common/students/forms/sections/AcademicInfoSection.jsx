import React, { useState, useEffect } from "react"
import { FaUserGraduate } from "react-icons/fa"
import { FormField, Select } from "@/components/ui"
import { adminApi } from "../../../../../service"

const AcademicInfoSection = ({ data, onChange }) => {
  const [validDegrees, setValidDegrees] = useState([])
  const [validDepartments, setValidDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchConfigData()
  }, [])

  const fetchConfigData = async () => {
    setIsLoading(true)
    try {
      const [degreesResponse, departmentsResponse] = await Promise.all([adminApi.getDegrees(), adminApi.getDepartments()])

      setValidDegrees(degreesResponse.value || [])
      setValidDepartments(departmentsResponse.value || [])
    } catch (err) {
      console.error("Error fetching academic configuration:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-4">
        <FaUserGraduate style={{ color: 'var(--color-primary)' }} className="mr-2" />
        <h3 className="font-semibold text-gray-800">Academic Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <Select name="department" value={data.department || ""} onChange={handleChange} disabled={isLoading}
            options={[
              { value: "", label: "Select Department" },
              ...(isLoading ? [{ value: "", label: "Loading departments...", disabled: true }] : validDepartments.map((dept) => ({ value: dept, label: dept }))),
              ...(data.department && !validDepartments.includes(data.department) ? [{ value: data.department, label: data.department }] : [])
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
          <Select name="degree" value={data.degree || ""} onChange={handleChange} disabled={isLoading}
            options={[
              { value: "", label: "Select Degree" },
              ...(isLoading ? [{ value: "", label: "Loading degrees...", disabled: true }] : validDegrees.map((degree) => ({ value: degree, label: degree }))),
              ...(data.degree && !validDegrees.includes(data.degree) ? [{ value: data.degree, label: data.degree }] : [])
            ]}
          />
        </div>

        <FormField label="Admission Date" name="admissionDate" type="date" value={data.admissionDate ? (data.admissionDate instanceof Date ? data.admissionDate.toISOString().split("T")[0] : new Date(data.admissionDate).toISOString().split("T")[0]) : ""} onChange={handleChange} />
      </div>
    </div>
  )
}

export default AcademicInfoSection
