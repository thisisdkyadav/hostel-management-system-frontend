import React from "react"
import { FaUserGraduate } from "react-icons/fa"
import FormField from "../../../FormField"

const PersonalInfoSection = ({ data, onChange }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({ [name]: value })
  }

  //   const handleImageChange = (e) => {
  // const file = e.target.files[0]
  // if (file) {
  //   const imageUrl = URL.createObjectURL(file)
  //   onChange({ image: imageUrl })
  // }
  //   }

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-4">
        <FaUserGraduate className="text-[#1360AB] mr-2" />
        <h3 className="font-semibold text-gray-800">Personal Information</h3>
      </div>

      <div className="flex flex-col items-center mb-6">
        <div className="relative h-24 w-24 rounded-full mb-2">
          {data.image ? (
            <img src={data.image} alt={data.name} className="h-24 w-24 rounded-full object-cover border-4 border-[#1360AB] shadow-md" />
          ) : (
            <div className="flex items-center justify-center h-24 w-24 rounded-full bg-blue-100 border-4 border-[#1360AB] shadow-md">
              <FaUserGraduate className="h-12 w-12 text-[#1360AB]" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-[#1360AB] text-white p-1 rounded-full cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
            {/* <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} /> */}
          </label>
        </div>
        <span className="text-sm text-gray-500">Click to change profile photo</span>
      </div>

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
