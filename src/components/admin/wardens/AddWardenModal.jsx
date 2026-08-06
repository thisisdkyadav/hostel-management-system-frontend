import React, { useEffect, useState } from "react"
import { FiUser, FiMail, FiPhone, FiLock, FiCalendar, FiTag, FiBriefcase } from "react-icons/fi"
import { adminApi } from "../../../service"
import { ACADEMICS_SUBROLE_OPTIONS, GYMKHANA_SUBROLE_OPTIONS } from "../../../constants/adminConstants"
import { Checkbox, EmptyState, Field, Heading, HStack, Label, Select, Surface, Text, VStack } from "@/components/ui"
import { Button, Input } from "czero/react"
import { Modal } from "@/components/ui"

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
  const isAcademics = staffType === "academics"
  const staffTitle = staffType === "warden" ? "Warden" : staffType === "associateWarden" ? "Associate Warden" : staffType === "hostelSupervisor" ? "Hostel Supervisor" : staffType === "gymkhana" ? "Gymkhana" : "Academics"

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
      if ((isGymkhana || isAcademics) && !formData.subRole) {
        alert(`Please select a ${staffTitle} sub role.`)
        return
      }

      const payload = isGymkhana || isAcademics
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            subRole: formData.subRole,
            ...(isGymkhana
              ? {
                  categories: formData.categories,
                  position: formData.position,
                }
              : {}),
          }
        : formData

      const response = staffType === "warden"
        ? await adminApi.addWarden(payload)
        : staffType === "associateWarden"
          ? await adminApi.addAssociateWarden(payload)
          : staffType === "hostelSupervisor"
            ? await adminApi.addHostelSupervisor(payload)
            : staffType === "gymkhana"
              ? await adminApi.addGymkhana(payload)
              : await adminApi.addAcademics(payload)

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
          <Surface bg="brand" padding={4} radius="lg">
            <HStack align="center" gap="none" color="var(--color-primary-dark)">
              <FiUser style={{ marginRight: 'var(--spacing-2)' }} />
              <Heading as="h4" weight="medium">Basic Information</Heading>
            </HStack>
          </Surface>

          <Field label="Name" htmlFor="name" required>
            <Input type="text" name="name" id="name" value={formData.name} onChange={handleChange} icon={<FiUser />} placeholder="Dr. Full Name" required />
          </Field>

          <Field label="Email" htmlFor="email" required>
            <Input type="email" name="email" id="email" value={formData.email} onChange={handleChange} icon={<FiMail />} placeholder="email@iiti.ac.in" required />
          </Field>

          <Field label="Password" htmlFor="password">
            <Input type="password" name="password" id="password" value={formData.password} onChange={handleChange} icon={<FiLock />} placeholder="Leave empty to create without password" />
          </Field>

          {isGymkhana || isAcademics ? (
            <>
              <Field label="Sub Role" htmlFor="subRole" required>
                <Select
                  name="subRole"
                  id="subRole"
                  value={formData.subRole}
                  onChange={handleChange}
                  options={isGymkhana ? GYMKHANA_SUBROLE_OPTIONS : ACADEMICS_SUBROLE_OPTIONS}
                  placeholder={`Select ${staffTitle} sub role`}
                  icon={<FiTag />}
                  required
                />
              </Field>

              {isGymkhana ? (
                <>
                  <Field label="Position" htmlFor="position">
                    <Input
                      type="text"
                      name="position"
                      id="position"
                      value={formData.position}
                      onChange={handleChange}
                      icon={<FiBriefcase />}
                      placeholder="e.g., Cultural Coordinator"
                    />
                  </Field>

                  <Field label="Categories">
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
                          <HStack gap="none" align="center" key={category.key}>
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
                            <Text as="label" size="sm" color="body" style={{ marginLeft: "var(--spacing-3)" }} htmlFor={`gymkhana-category-${category.key}`}>
                              {category.label}
                            </Text>
                          </HStack>
                        ))
                      ) : (
                        <EmptyState variant="inline" message="No Gymkhana categories configured yet." />
                      )}
                    </div>
                  </Field>
                </>
              ) : null}
            </>
          ) : (
            <>
              <Field label="Phone" htmlFor="phone">
                <Input type="text" name="phone" id="phone" value={formData.phone} onChange={handleChange} icon={<FiPhone />} placeholder="+91 9876543210" />
              </Field>

              <Field label="Category" htmlFor="category">
                <Input type="text" name="category" id="category" value={formData.category} onChange={handleChange} icon={<FiTag />} placeholder="e.g., Senior, Junior" />
              </Field>

              <Field label="Join Date" htmlFor="joinDate">
                <Input type="date" name="joinDate" id="joinDate" value={formData.joinDate} onChange={handleChange} icon={<FiCalendar />} />
              </Field>
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
