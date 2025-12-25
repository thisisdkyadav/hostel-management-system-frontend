import React, { useState } from "react"
import AvailableInventory from "../../components/wardens/inventory/AvailableInventory"
import StudentAssignments from "../../components/wardens/inventory/StudentAssignments"
import Button from "../../components/common/Button"

const StudentInventory = () => {
  const [activeTab, setActiveTab] = useState("available")

  const styles = {
    container: {
      maxWidth: "var(--container-xl)",
      margin: "0 auto",
      padding: "var(--spacing-6) var(--spacing-4)",
    },
    header: {
      marginBottom: "var(--spacing-6)",
    },
    title: {
      fontSize: "var(--font-size-3xl)",
      fontWeight: "var(--font-weight-bold)",
      color: "var(--color-text-secondary)",
    },
    subtitle: {
      fontSize: "var(--font-size-sm)",
      color: "var(--color-text-muted)",
      marginTop: "var(--spacing-1)",
    },
    tabContainer: {
      borderBottom: "var(--border-1) solid var(--color-border-primary)",
      marginBottom: "var(--spacing-6)",
    },
    tabNav: {
      display: "flex",
      gap: "var(--spacing-8)",
    },
    tab: {
      padding: "var(--spacing-4) var(--spacing-1)",
      display: "flex",
      alignItems: "center",
      fontWeight: "var(--font-weight-medium)",
      fontSize: "var(--font-size-sm)",
      borderBottom: "var(--border-2) solid transparent",
      background: "none",
      border: "none",
      cursor: "pointer",
      transition: "var(--transition-colors)",
    },
    tabActive: {
      borderBottom: "var(--border-2) solid var(--color-primary)",
      color: "var(--color-primary)",
    },
    tabInactive: {
      color: "var(--color-text-muted)",
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Student Inventory Management</h1>
        <p style={styles.subtitle}>Manage and assign inventory items to students</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <nav style={styles.tabNav}>
          <Button onClick={() => setActiveTab("available")}
            variant={activeTab === "available" ? "primary" : "ghost"}
            size="medium"
            style={{ borderBottom: activeTab === "available" ? 'var(--border-2) solid var(--color-primary)' : 'var(--border-2) solid transparent' }}
          >
            Available Inventory
          </Button>
          <Button onClick={() => setActiveTab("assignments")}
            variant={activeTab === "assignments" ? "primary" : "ghost"}
            size="medium"
            style={{ borderBottom: activeTab === "assignments" ? 'var(--border-2) solid var(--color-primary)' : 'var(--border-2) solid transparent' }}
          >
            Student Assignments
          </Button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "available" && <AvailableInventory />}
        {activeTab === "assignments" && <StudentAssignments />}
      </div>
    </div>
  )
}

export default StudentInventory
