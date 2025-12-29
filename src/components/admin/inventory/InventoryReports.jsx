import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../services/inventoryApi"
import { FaFilter, FaChartPie, FaBuilding, FaUserGraduate, FaListAlt, FaBox, FaBoxes } from "react-icons/fa"
import { useGlobal } from "../../../contexts/GlobalProvider"
import Button from "../../common/Button"
import Select from "../../common/ui/Select"

const InventoryReports = () => {
  const { hostelList } = useGlobal()
  const [activeTab, setActiveTab] = useState("hostel")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedHostel, setSelectedHostel] = useState("")
  const [hostelSummary, setHostelSummary] = useState([])
  const [studentSummary, setStudentSummary] = useState([])
  const [itemTypeSummary, setItemTypeSummary] = useState([])

  // Fetch hostel summary
  const fetchHostelSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getInventorySummaryByHostel()
      setHostelSummary(response)
    } catch (err) {
      setError(err.message || "Failed to fetch hostel inventory summary")
    } finally {
      setLoading(false)
    }
  }

  // Fetch student summary
  const fetchStudentSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getInventorySummaryByStudent({
        hostelId: selectedHostel || undefined,
      })
      setStudentSummary(response)
    } catch (err) {
      setError(err.message || "Failed to fetch student inventory summary")
    } finally {
      setLoading(false)
    }
  }

  // Fetch item type summary
  const fetchItemTypeSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.getInventorySummaryByItemType({
        hostelId: selectedHostel || undefined,
      })
      setItemTypeSummary(response)
    } catch (err) {
      setError(err.message || "Failed to fetch item type inventory summary")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === "hostel") {
      fetchHostelSummary()
    } else if (activeTab === "student") {
      fetchStudentSummary()
    } else if (activeTab === "itemType") {
      fetchItemTypeSummary()
    }
  }, [activeTab, selectedHostel])

  // Handle hostel filter change
  const handleHostelChange = (e) => {
    setSelectedHostel(e.target.value)
  }

  // Get hostel name
  const getHostelName = (id) => {
    if (!hostelList) return "Unknown Hostel"
    const hostel = hostelList.find((h) => h._id === id)
    return hostel ? hostel.name : "Unknown Hostel"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>Inventory Reports</h3>
          <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>View inventory distribution across hostels and students</p>
        </div>

        {/* Hostel Filter (only for student and item type tabs) */}
        {activeTab !== "hostel" && (
          <div className="flex items-center gap-2">
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              <div>
                <label style={{ display: "block", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Choose Hostel</label>
                <Select value={selectedHostel} onChange={handleHostelChange} icon={<FaBuilding />} options={[{ value: "", label: "Select a hostel..." }, ...hostelList.map((h) => ({ value: h._id, label: h.name }))]} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Button onClick={() => setActiveTab("hostel")} variant={activeTab === "hostel" ? "primary" : "ghost"} size="medium" icon={<FaBuilding />}>
            By Hostel
          </Button>
          <Button onClick={() => setActiveTab("student")} variant={activeTab === "student" ? "primary" : "ghost"} size="medium" icon={<FaUserGraduate />}>
            By Student
          </Button>
          <Button onClick={() => setActiveTab("itemType")} variant={activeTab === "itemType" ? "primary" : "ghost"} size="medium" icon={<FaListAlt />}>
            By Item Type
          </Button>
        </nav>
      </div>

      {error && <div style={{ backgroundColor: "var(--color-danger-bg)", color: "var(--color-danger-text)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)" }}>{error}</div>}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}></div>
        </div>
      )}

      {/* Hostel Summary */}
      {activeTab === "hostel" && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hostelSummary.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--spacing-12) 0" }}>
              <FaBoxes style={{ margin: "0 auto", color: "var(--color-border-primary)", fontSize: "var(--font-size-5xl)", marginBottom: "var(--spacing-4)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>No hostel inventory data available</p>
            </div>
          ) : (
            hostelSummary.map((hostel) => (
              <div
                key={hostel._id}
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--card-radius)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-card)", border: "1px solid var(--card-border)", transition: "var(--transition-all)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
              >
                <div style={{ display: "flex", alignItems: "center", marginBottom: "var(--spacing-4)" }}>
                  <div style={{ width: "var(--spacing-10)", height: "var(--spacing-10)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
                    <FaBuilding style={{ color: "var(--color-primary)" }} />
                  </div>
                  <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{hostel.hostelName}</div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)", padding: "var(--spacing-3)", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                  <div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Total Allocated</div>
                    <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>{hostel.totalAllocated}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>Available</div>
                    <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)", color: "var(--color-success)" }}>{hostel.totalAvailable}</div>
                  </div>
                </div>
                <div style={{ borderTop: "1px solid var(--color-border-light)", paddingTop: "var(--spacing-3)" }}>
                  <div style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)", marginBottom: "var(--spacing-2)" }}>Item Distribution</div>
                  <div className="space-y-2">
                    {hostel.items.map((item) => (
                      <div
                        key={item.itemTypeId}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--spacing-2)", borderRadius: "var(--radius-md)", transition: "var(--transition-colors)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ width: "var(--spacing-6)", height: "var(--spacing-6)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-2)" }}>
                            <FaBox style={{ color: "var(--color-primary)", fontSize: "var(--font-size-xs)" }} />
                          </div>
                          <span style={{ fontSize: "var(--font-size-sm)" }}>{item.itemName}</span>
                        </div>
                        <div style={{ fontSize: "var(--font-size-sm)" }}>
                          <span style={{ fontWeight: "var(--font-weight-medium)", color: item.available < 10 ? "var(--color-danger)" : "var(--color-success)" }}>{item.available}</span>
                          <span style={{ color: "var(--color-text-muted)" }}> / {item.allocated}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Student Summary */}
      {activeTab === "student" && !loading && (
        <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--card-radius)", boxShadow: "var(--shadow-card)", border: "1px solid var(--card-border)", overflow: "hidden" }}>
          {studentSummary.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-12) 0" }}>
              <FaUserGraduate style={{ margin: "0 auto", color: "var(--color-border-primary)", fontSize: "var(--font-size-5xl)", marginBottom: "var(--spacing-4)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>No student inventory data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: "var(--table-header-bg)" }}>
                  <tr>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>Student</th>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>Roll Number</th>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>Total Items</th>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>Details</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "var(--color-bg-primary)", borderTop: "1px solid var(--table-border)" }}>
                  {studentSummary.map((student) => (
                    <tr
                      key={student._id}
                      style={{ borderBottom: "1px solid var(--table-border)", transition: "var(--transition-colors)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--table-row-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{student.studentName}</td>
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", color: "var(--color-text-tertiary)" }}>{student.rollNumber}</td>
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                        <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)" }}>{student.totalItems}</span>
                      </td>
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)" }}>
                        <div className="space-y-1">
                          {student.items.map((item) => (
                            <div key={item.id} style={{ display: "flex", alignItems: "center", fontSize: "var(--font-size-sm)" }}>
                              <div style={{ width: "var(--spacing-6)", height: "var(--spacing-6)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-2)" }}>
                                <FaBox style={{ color: "var(--color-primary)", fontSize: "var(--font-size-xs)" }} />
                              </div>
                              <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-body)" }}>{item.itemName}</span>
                              <span style={{ margin: "0 var(--spacing-1)", color: "var(--color-text-placeholder)" }}>•</span>
                              <span style={{ color: "var(--color-text-tertiary)" }}>{item.count}</span>
                              <span style={{ margin: "0 var(--spacing-1)", color: "var(--color-text-placeholder)" }}>•</span>
                              <span
                                style={{
                                  fontSize: "var(--font-size-xs)",
                                  padding: "var(--spacing-1) var(--spacing-2)",
                                  borderRadius: "var(--radius-full)",
                                  backgroundColor: item.status === "Issued" ? "var(--color-success-bg)" : item.status === "Damaged" ? "var(--color-danger-bg)" : "var(--color-bg-muted)",
                                  color: item.status === "Issued" ? "var(--color-success-text)" : item.status === "Damaged" ? "var(--color-danger-text)" : "var(--color-text-secondary)",
                                }}
                              >
                                {item.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Item Type Summary */}
      {activeTab === "itemType" && !loading && (
        <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--card-radius)", boxShadow: "var(--shadow-card)", border: "1px solid var(--card-border)", overflow: "hidden" }}>
          {itemTypeSummary.length === 0 ? (
            <div style={{ textAlign: "center", padding: "var(--spacing-12) 0" }}>
              <FaBox style={{ margin: "0 auto", color: "var(--color-border-primary)", fontSize: "var(--font-size-5xl)", marginBottom: "var(--spacing-4)" }} />
              <p style={{ color: "var(--color-text-muted)" }}>No item type summary data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: "var(--table-header-bg)" }}>
                  <tr>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>Item Type</th>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>
                      Total Assigned
                    </th>
                    <th style={{ padding: "var(--spacing-3) var(--spacing-6)", textAlign: "left", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", color: "var(--table-header-text)", textTransform: "uppercase", letterSpacing: "var(--letter-spacing-wide)" }}>Student Count</th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: "var(--color-bg-primary)", borderTop: "1px solid var(--table-border)" }}>
                  {itemTypeSummary.map((item) => (
                    <tr
                      key={item._id}
                      style={{ borderBottom: "1px solid var(--table-border)", transition: "var(--transition-colors)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--table-row-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    >
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
                            <FaBox style={{ color: "var(--color-primary)" }} />
                          </div>
                          <span style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{item.itemName}</span>
                        </div>
                      </td>
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)" }}>{item.totalAssigned}</td>
                      <td style={{ padding: "var(--spacing-4) var(--spacing-6)", whiteSpace: "nowrap" }}>
                        <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)" }}>{item.studentCount}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryReports
