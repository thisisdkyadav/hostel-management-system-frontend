import React, { useState, useEffect } from "react"
import { FaUserGraduate } from "react-icons/fa"
import { FormField, Select } from "@/components/ui"
import { adminApi, studentApi } from "../../../../../service"

const AcademicInfoSection = ({ data, onChange }) => {
  const [validDegrees, setValidDegrees] = useState([])
  const [validDepartments, setValidDepartments] = useState([])
  const [availableBatches, setAvailableBatches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  useEffect(() => {
    fetchConfigData()
  }, [])

  useEffect(() => {
    const fetchBatchOptions = async () => {
      if (!data.degree || !data.department) {
        setAvailableBatches([])
        return
      }

      setBatchLoading(true)
      try {
        const response = await studentApi.getBatchList({
          degree: data.degree,
          department: data.department,
        })
        setAvailableBatches(response || [])
        if (data.batch && !(response || []).includes(data.batch)) {
          onChange({ batch: "" })
        }
      } catch (err) {
        console.error("Error fetching batch options:", err)
        setAvailableBatches([])
      } finally {
        setBatchLoading(false)
      }
    }

    fetchBatchOptions()
  }, [data.degree, data.department])

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
    if (name === "degree" || name === "department") {
      onChange({ [name]: value, batch: "" })
      return
    }
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
          <Select
            name="batch"
            value={data.batch || ""}
            onChange={handleChange}
            disabled={isLoading || batchLoading || !data.degree || !data.department}
            options={[
              { value: "", label: !data.degree || !data.department ? "Select degree and department first" : "Select Batch" },
              ...(batchLoading ? [{ value: "", label: "Loading batches...", disabled: true }] : availableBatches.map((batch) => ({ value: batch, label: batch }))),
              ...(data.batch && !availableBatches.includes(data.batch) ? [{ value: data.batch, label: data.batch }] : []),
            ]}
          />
        </div>

        <FormField label="Admission Date" name="admissionDate" type="date" value={data.admissionDate ? (data.admissionDate instanceof Date ? data.admissionDate.toISOString().split("T")[0] : new Date(data.admissionDate).toISOString().split("T")[0]) : ""} onChange={handleChange} />
      </div>
    </div>
  )
}

export default AcademicInfoSection
