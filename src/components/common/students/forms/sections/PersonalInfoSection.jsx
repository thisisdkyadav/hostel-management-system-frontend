import React, { useState } from "react"
import { Camera, GraduationCap } from "lucide-react"
import { FormField, Grid, IconButton, Text } from "hzero"
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
        <GraduationCap className="mr-[var(--spacing-2)]" color="var(--color-primary)" />
        <Text as="h3" weight="semibold" color="heading">Personal Information</Text>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative h-24 w-24 rounded-full mb-2">
          {data.profileImage ? (
            <img src={getMediaUrl(data.profileImage)} alt={data.name} className="h-24 w-24 rounded-full object-cover border-4 shadow-md" style={{ borderColor: 'var(--color-primary)' }} />
          ) : (
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-[var(--color-primary-bg)] border-4 shadow-md" style={{ borderColor: 'var(--color-primary)' }}>
              <GraduationCap className="h-12 w-12" color="var(--color-primary)" />
            </div>
          )}
          {/* A button, so it can be tabbed to and announced. It was a Surface
              with an onClick and its hover assigned in JavaScript. */}
          <IconButton
            variant="primary"
            size="small"
            icon={<Camera />}
            ariaLabel="Change profile photo"
            onClick={() => setIsImageModalOpen(true)}
            className="absolute bottom-0 right-0"
          />
        </div>
        <Text as="span" size="sm" color="muted">Click the camera icon to change profile photo</Text>
      </div>

      {isImageModalOpen && <ImageUploadModal userId={data.userId} isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onImageUpload={handleImageUpload} />}

      <Grid cols={{ base: 1, md: 2 }} gap={4}>
        <FormField label="Full Name" name="name" type="text" value={data.name || ""} onChange={handleChange} required />

        <FormField label="Roll Number" name="rollNumber" type="text" value={data.rollNumber || ""} onChange={handleChange} required />

        <FormField label="Email Address" name="email" type="email" value={data.email || ""} onChange={handleChange} required />

        <FormField label="Secondary Email" name="secondaryEmail" type="email" value={data.secondaryEmail || ""} onChange={handleChange} />

        <FormField label="Phone Number" name="phone" type="tel" value={data.phone || ""} onChange={handleChange} />

        <FormField label="Gender" name="gender" type="select" value={data.gender || ""} onChange={handleChange} options={[{ value: "", label: "Select Gender" }, { value: "Male", label: "Male" }, { value: "Female", label: "Female" }, { value: "Other", label: "Other" },]} required />

        <FormField label="Date of Birth" name="dateOfBirth" type="date" value={data.dateOfBirth || ""} onChange={handleChange} />
      </Grid>

      <FormField label="Address" name="address" type="textarea" value={data.address || ""} onChange={handleChange} rows={3} />
    </div>
  )
}

export default PersonalInfoSection
