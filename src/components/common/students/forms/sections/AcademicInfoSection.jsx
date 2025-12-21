import React, { useState, useEffect } from "react"
import { FaUserGraduate } from "react-icons/fa"
import FormField from "../../../FormField"
import { adminApi } from "../../../../../services/adminApi"

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
          <select name="department" value={data.department || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" style={{ '--tw-ring-color': 'var(--color-primary)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} disabled={isLoading}>
            <option value="">Select Department</option>
            {isLoading ? (
              <option value="" disabled>
                Loading departments...
              </option>
            ) : (
              validDepartments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))
            )}
            {/* Allow custom value if current department is not in the valid list */}
            {data.department && !validDepartments.includes(data.department) && <option value={data.department}>{data.department}</option>}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
          <select name="degree" value={data.degree || ""} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none" style={{ '--tw-ring-color': 'var(--color-primary)' }} onFocus={(e) => { e.target.style.boxShadow = 'var(--input-focus-ring)'; e.target.style.borderColor = 'var(--color-primary)'; }} onBlur={(e) => { e.target.style.boxShadow = 'none'; e.target.style.borderColor = 'var(--color-border-input)'; }} disabled={isLoading}>
            <option value="">Select Degree</option>
            {isLoading ? (
              <option value="" disabled>
                Loading degrees...
              </option>
            ) : (
              validDegrees.map((degree) => (
                <option key={degree} value={degree}>
                  {degree}
                </option>
              ))
            )}
            {/* Allow custom value if current degree is not in the valid list */}
            {data.degree && !validDegrees.includes(data.degree) && <option value={data.degree}>{data.degree}</option>}
          </select>
        </div>

        <FormField label="Admission Date" name="admissionDate" type="date" value={data.admissionDate ? (data.admissionDate instanceof Date ? data.admissionDate.toISOString().split("T")[0] : new Date(data.admissionDate).toISOString().split("T")[0]) : ""} onChange={handleChange} />
      </div>
    </div>
  )
}

export default AcademicInfoSection
