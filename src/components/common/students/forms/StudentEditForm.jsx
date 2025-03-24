import React, { useState } from "react"
import PersonalInfoSection from "./sections/PersonalInfoSection"
import AcademicInfoSection from "./sections/AcademicInfoSection"
import GuardianInfoSection from "./sections/GuardianInfoSection"

const StudentEditForm = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState(initialData)
  const [activeTab, setActiveTab] = useState("personal")

  const handleChange = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "academic", label: "Academic" },
    { id: "guardian", label: "Guardian" },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`py-2 px-4 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id ? "bg-white text-[#1360AB] shadow-sm" : "text-gray-600 hover:bg-gray-200"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Sections */}
      <div className="bg-white rounded-lg p-4">
        {activeTab === "personal" && <PersonalInfoSection data={formData} onChange={(data) => handleChange("personal", data)} />}
        {activeTab === "academic" && <AcademicInfoSection data={formData} onChange={(data) => handleChange("academic", data)} />}
        {activeTab === "guardian" && <GuardianInfoSection data={formData} onChange={(data) => handleChange("guardian", data)} />}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} disabled={loading} className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="px-4 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center">
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </form>
  )
}

export default StudentEditForm
