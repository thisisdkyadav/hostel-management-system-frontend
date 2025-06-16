import React, { useState } from "react"
import { FaUserGraduate } from "react-icons/fa"
import { HiCamera } from "react-icons/hi"
import FormField from "../../../FormField"
import ImageUploadModal from "../../../ImageUploadModal"
import { getMediaUrl } from "../../../../../utils/mediaUtils"
const PersonalInfoSection = ({ data, onChange }) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  const handleImageUpload = (imageUrl) => {
    onChange({ profileImage: imageUrl })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-4">
        <FaUserGraduate className="text-[#1360AB] mr-2" />
        <h3 className="font-semibold text-gray-800">Personal Information</h3>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative h-24 w-24 rounded-full mb-2">
          {data.profileImage ? (
            <img src={getMediaUrl(data.profileImage)} alt={data.name} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md" />
          ) : (
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md">
              <FaUserGraduate className="h-12 w-12 text-[#1360AB]" />
            </div>
          )}
          <div onClick={() => setIsImageModalOpen(true)} className="absolute bottom-0 right-0 bg-[#1360AB] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#0F4C81] transition-colors">
            <HiCamera className="w-4 h-4" />
          </div>
        </div>
        <span className="text-sm text-gray-500">Click the camera icon to change profile photo</span>
      </div>

      {isImageModalOpen && <ImageUploadModal userId={data.userId} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Full Name" name="name" type="text" value={data.name || ""} onChange={handleChange} required />

        <FormField label="Roll Number" name="rollNumber" type="text" value={data.rollNumber || ""} onChange={handleChange} required />

        <FormField label="Email Address" name="email" type="email" value={data.email || ""} onChange={handleChange} required />

        <FormField label="Phone Number" name="phone" type="tel" value={data.phone || ""} onChange={handleChange} />

        <FormField
          label="Gender"
          name="gender"
          type="select"
          value={data.gender || ""}
          onChange={handleChange}
          options={[
            { value: "", label: "Select Gender" },
            { value: "Male", label: "Male" },
            { value: "Female", label: "Female" },
            { value: "Other", label: "Other" },
          ]}
          required
        />

        <FormField label="Date of Birth" name="dateOfBirth" type="date" value={data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split("T")[0] : ""} onChange={handleChange} />
      </div>

      <FormField label="Address" name="address" type="textarea" value={data.address || ""} onChange={handleChange} rows={3} />
    </div>
  )
}

export default PersonalInfoSection
