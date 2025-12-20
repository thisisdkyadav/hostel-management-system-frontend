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
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = "var(--color-bg-muted)"
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = "transparent"
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={styles.contentWrapper}>
        {activeTab === "personal" && <PersonalInfoSection data={formData} onChange={(data) => handleChange("personal", data)} />}
        {activeTab === "academic" && <AcademicInfoSection data={formData} onChange={(data) => handleChange("academic", data)} />}
        {activeTab === "guardian" && <GuardianInfoSection data={formData} onChange={(data) => handleChange("guardian", data)} />}
      </div>

      <div style={styles.buttonContainer}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          style={{
            ...styles.cancelButton,
            opacity: loading ? "var(--opacity-disabled)" : "var(--opacity-100)",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.backgroundColor = "var(--color-bg-muted)"
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "var(--color-bg-hover)"
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            opacity: loading ? "var(--opacity-disabled)" : "var(--opacity-100)",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.target.style.backgroundColor = "var(--color-primary-hover)"
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "var(--color-primary)"
          }}
        >
          {loading ? (
            <>
              <svg style={styles.spinner} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={styles.spinnerCircle} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={styles.spinnerPath} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
