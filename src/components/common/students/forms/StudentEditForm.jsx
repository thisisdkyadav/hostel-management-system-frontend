import React, { useState } from "react"
import PersonalInfoSection from "./sections/PersonalInfoSection"
import AcademicInfoSection from "./sections/AcademicInfoSection"
import GuardianInfoSection from "./sections/GuardianInfoSection"
import { Button } from "@/components/ui"

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

  const styles = {
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--spacing-6)",
    },
    tabContainer: {
      display: "flex",
      gap: "var(--spacing-1)",
      backgroundColor: "var(--color-bg-hover)",
      padding: "var(--spacing-1)",
      borderRadius: "var(--radius-lg)",
    },
    tab: {
      padding: "var(--spacing-2) var(--spacing-4)",
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)",
      borderRadius: "var(--radius-md)",
      transition: "var(--transition-all)",
      cursor: "pointer",
      border: "none",
      outline: "none",
    },
    tabActive: {
      backgroundColor: "var(--color-bg-primary)",
      color: "var(--color-primary)",
      boxShadow: "var(--shadow-sm)",
    },
    tabInactive: {
      backgroundColor: "transparent",
      color: "var(--color-text-muted)",
    },
    contentWrapper: {
      backgroundColor: "var(--color-bg-primary)",
      borderRadius: "var(--radius-lg)",
      padding: "var(--spacing-4)",
    },
    buttonContainer: {
      display: "flex",
      justifyContent: "flex-end",
      gap: "var(--spacing-4)",
      paddingTop: "var(--spacing-4)",
      borderTop: "var(--border-1) solid var(--color-border-light)",
    },
    cancelButton: {
      padding: "var(--spacing-2-5) var(--spacing-4)",
      backgroundColor: "var(--color-bg-hover)",
      color: "var(--color-text-body)",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-all)",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
    },
    submitButton: {
      padding: "var(--spacing-2-5) var(--spacing-4)",
      backgroundColor: "var(--color-primary)",
      color: "var(--color-white)",
      borderRadius: "var(--radius-lg)",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-all)",
      boxShadow: "var(--shadow-sm)",
      display: "flex",
      alignItems: "center",
      gap: "var(--spacing-2)",
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-medium)",
    },
    spinner: {
      animation: "spin 1s linear infinite",
      marginLeft: "calc(-1 * var(--spacing-1))",
      marginRight: "var(--spacing-2)",
      height: "var(--icon-md)",
      width: "var(--icon-md)",
    },
    spinnerCircle: {
      opacity: "var(--opacity-25)",
    },
    spinnerPath: {
      opacity: "var(--opacity-75)",
    },
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.tabContainer}>
        {tabs.map((tab) => (
          <Button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
            variant={activeTab === tab.id ? "primary" : "ghost"}
            size="small"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <div style={styles.contentWrapper}>
        {activeTab === "personal" && <PersonalInfoSection data={formData} onChange={(data) => handleChange("personal", data)} />}
        {activeTab === "academic" && <AcademicInfoSection data={formData} onChange={(data) => handleChange("academic", data)} />}
        {activeTab === "guardian" && <GuardianInfoSection data={formData} onChange={(data) => handleChange("guardian", data)} />}
      </div>

      <div style={styles.buttonContainer}>
        <Button type="button" onClick={onCancel} disabled={loading} variant="secondary" size="medium">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} variant="primary" size="medium" isLoading={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

export default StudentEditForm
