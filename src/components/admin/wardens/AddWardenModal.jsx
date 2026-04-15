import React, { useEffect, useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiTag, FiBriefcase } from "react-icons/fi"
import { adminApi } from "../../../service"
import { Checkbox, VStack, HStack, Label, Select } from "@/components/ui"
import { Button, Modal, Input } from "czero/react"

const normalizeGymkhanaCategoryDefinitions = (categoryDefinitions = []) => {
  if (!Array.isArray(categoryDefinitions)) return []

  return categoryDefinitions
    .map((category) => ({
      key: String(category?.key || "").trim(),
      label: String(category?.label || "").trim(),
    }))
    .filter((category) => category.key && category.label)
}

const AddWardenModal = ({ show, staffType = "warden", onClose, onAdd }) => {
  const isGymkhana = staffType === "gymkhana"
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : staffType === "hostelSupervisor" ? "Hostel Supervisor" : "Gymkhana"
  const gymkhanaSubRoleOptions = [
    { value: "GS Gymkhana", label: "GS Gymkhana" },
    { value: "President Gymkhana", label: "President Gymkhana" },
    { value: "Election Officer", label: "Election Officer" },
  ]

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    joinDate: "",
    category: "",
    subRole: "",
    categories: [],
    position: "",
  })
  const [gymkhanaCategoryDefinitions, setGymkhanaCategoryDefinitions] = useState([])

  useEffect(() => {
    if (!show || !isGymkhana) return

    let isSubscribed = true

    const fetchGymkhanaCategories = async () => {
      try {
        const response = await adminApi.getGymkhanaEventCategories()
        if (!isSubscribed) return
        setGymkhanaCategoryDefinitions(normalizeGymkhanaCategoryDefinitions(response?.value))
      } catch (error) {
        console.error("Error fetching Gymkhana categories:", error)
        if (!isSubscribed) return
        setGymkhanaCategoryDefinitions([])
      }
    }

    fetchGymkhanaCategories()

    return () => {
      isSubscribed = false
    }
  }, [show, isGymkhana])

  const handleChange = (e) => {
    const { name, value, checked } = e.target

    if (name === "categories") {
      setFormData((prev) => {
        const existingCategories = Array.isArray(prev.categories) ? prev.categories : []
        if (checked) {
          return { ...prev, categories: [...new Set([...existingCategories, value])] }
        }
        return { ...prev, categories: existingCategories.filter((categoryKey) => categoryKey !== value) }
      })
      return
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      if (isGymkhana && !formData.subRole) {
        alert("Please select a Gymkhana sub role.")
        return
      }

      const payload = isGymkhana
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            subRole: formData.subRole,
            categories: formData.categories,
            position: formData.position,
          }
        : formData

      const response = staffType === "warden"
        ? await adminApi.addWarden(payload)
        : staffType === "associateWarden"
          ? await adminApi.addAssociateWarden(payload)
          : staffType === "hostelSupervisor"
            ? await adminApi.addHostelSupervisor(payload)
            : await adminApi.addGymkhana(payload)

      if (!response) {
        alert(`Failed to add ${staffTitle.toLowerCase()}. Please try again.`)
        return
      }
      onAdd()
      alert(`${staffTitle} added successfully!`)

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        joinDate: "",
        category: "",
        subRole: "",
        categories: [],
        position: "",
      })

      onClose()
    } catch (error) {
      console.error(`Error adding ${staffTitle.toLowerCase()}:`, error)
      alert(`Failed to add ${staffTitle.toLowerCase()}. Please try again.`)
    }
  }

  if (!show) return null

  return (
    <Modal isOpen={show} title={`Add New ${staffTitle}`} onClose={onClose} width={500}>
      <form onSubmit={handleSubmit}>
        <VStack gap="large">
          <div style={{ backgroundColor: 'var(--color-primary-bg)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-primary-dark)' }}>
              <FiUser style={{ marginRight: 'var(--spacing-2)' }} />
              <h4 style={{ fontWeight: 'var(--font-weight-medium)' }}>Basic Information</h4>
            </div>
          </div>

          <div>
            <Label htmlFor="name" required>Name</Label>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Dr. Full Name" required />
          </div>

          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="email@iiti.ac.in" required />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Leave empty to create without password" />
          </div>

          {isGymkhana ? (
            <>
              <div>
                <Label htmlFor="subRole" required>Sub Role</Label>
                <Select
                  name="subRole"
                  id="subRole"
                  value={formData.subRole}
                  onChange={handleChange}
                  options={gymkhanaSubRoleOptions}
                  placeholder="Select Gymkhana sub role"
                  icon={<FiTag />}
                  required
                />
              </div>

              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  type="text"
                  name="position"
                  id="position"
                  value={formData.position}
                  onChange={handleChange}
                  icon={<FiBriefcase />}
                  placeholder="e.g., Cultural Coordinator"
                />
              </div>

              <div>
                <Label>Categories</Label>
                <div
                  style={{
                    marginTop: "var(--spacing-2)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--spacing-2)",
                    maxHeight: "12rem",
                    overflowY: "auto",
                    border: "var(--border-1) solid var(--color-border-input)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--spacing-3)",
                  }}
                >
                  {gymkhanaCategoryDefinitions.length > 0 ? (
                    gymkhanaCategoryDefinitions.map((category) => (
                      <div key={category.key} style={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          id={`gymkhana-category-${category.key}`}
                          name="categories"
                          checked={formData.categories.includes(category.key)}
                          onChange={(event) =>
                            handleChange({
                              target: {
                                name: "categories",
                                value: category.key,
                                checked: event.target.checked,
                              },
                            })
                          }
                        />
                        <label
                          htmlFor={`gymkhana-category-${category.key}`}
                          style={{ marginLeft: "var(--spacing-3)", fontSize: "var(--font-size-sm)", color: "var(--color-text-body)" }}
                        >
                          {category.label}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>No Gymkhana categories configured yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} placeholder="+91 9876543210" />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Input type="text" name="category" id="category" value={formData.category} onChange={handleChange} icon={<FiTag />} placeholder="e.g., Senior, Junior" />
              </div>

              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input type="date" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} icon={<FiCalendar />} />
              </div>
            </>
          )}

          <HStack gap="small" justify="end" style={{ paddingTop: 'var(--spacing-5)', marginTop: 'var(--spacing-6)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
            <Button type="button" onClick={onClose} variant="secondary" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Add {staffTitle}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Modal>
  )
}

export default AddWardenModal
