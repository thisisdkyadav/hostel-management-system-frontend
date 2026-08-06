import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { FaFilter, FaChartPie, FaBuilding, FaUserGraduate, FaListAlt, FaBox, FaBoxes } from "react-icons/fa"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Alert, HStack, Label, Select, Text, VStack } from "@/components/ui"
import { Button, Table } from "czero/react"

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
          <Text size="sm" color="muted">View inventory distribution across hostels and students</Text>
        </div>

        {/* Hostel Filter (only for student and item type tabs) */}
        {activeTab !== "hostel" && (
          <div className="flex items-center gap-2">
            <VStack gap="medium">
              <div>
                <Label>Choose Hostel</Label>
                <Select value={selectedHostel} onChange={handleHostelChange} icon={<FaBuilding />} options={[{ value: "", label: "Select a hostel..." }, ...hostelList.map((h) => ({ value: h._id, label: h.name }))]} />
              </div>
            </VStack>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          <Button onClick={() => setActiveTab("hostel")} variant={activeTab === "hostel" ? "primary" : "ghost"} size="md">
            <FaBuilding />
            By Hostel
          </Button>
          <Button onClick={() => setActiveTab("student")} variant={activeTab === "student" ? "primary" : "ghost"} size="md">
            <FaUserGraduate />
            By Student
          </Button>
          <Button onClick={() => setActiveTab("itemType")} variant={activeTab === "itemType" ? "primary" : "ghost"} size="md">
            <FaListAlt />
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
              <Text color="muted">No hostel inventory data available</Text>
            </div>
          ) : (
            hostelSummary.map((hostel) => (
              <div
                key={hostel._id}
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--card-radius)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-card)", border: "1px solid var(--card-border)", transition: "var(--transition-all)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "var(--shadow-card)")}
              >
                <HStack gap="none" align="center" style={{ marginBottom: "var(--spacing-4)" }}>
                  <div style={{ width: "var(--spacing-10)", height: "var(--spacing-10)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
                    <FaBuilding style={{ color: "var(--color-primary)" }} />
                  </div>
                  <Text as="div" size="lg" weight="medium" color="secondary">{hostel.hostelName}</Text>
                </HStack>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)", padding: "var(--spacing-3)", backgroundColor: "var(--color-bg-tertiary)", borderRadius: "var(--radius-lg)" }}>
                  <div>
                    <Text as="div" size="sm" color="muted">Total Allocated</Text>
                    <Text as="div" size="lg" weight="semibold">{hostel.totalAllocated}</Text>
                  </div>
                  <div>
                    <Text as="div" size="sm" color="muted">Available</Text>
                    <Text as="div" size="lg" weight="semibold" color="success">{hostel.totalAvailable}</Text>
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
                        <HStack gap="none" align="center">
                          <div style={{ width: "var(--spacing-6)", height: "var(--spacing-6)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-2)" }}>
                            <FaBox style={{ color: "var(--color-primary)", fontSize: "var(--font-size-xs)" }} />
                          </div>
                          <Text as="span" size="sm">{item.itemName}</Text>
                        </HStack>
                        <Text as="div" size="sm">
                          <Text as="span" weight="medium" color={item.available < 10 ? "var(--color-danger)" : "var(--color-success)"}>{item.available}</Text>
                          <Text as="span" color="muted"> / {item.allocated}</Text>
                        </Text>
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
              <Text color="muted">No student inventory data available</Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Student</Table.Head>
                    <Table.Head>Roll Number</Table.Head>
                    <Table.Head>Total Items</Table.Head>
                    <Table.Head>Details</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {studentSummary.map((student) => (
                    <Table.Row key={student._id}
                    >
                      <Table.Cell style={{ whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)" }}>{student.studentName}</Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>{student.rollNumber}</Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)" }}>{student.totalItems}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          {student.items.map((item) => (
                            <div key={item.id} style={{ display: "flex", alignItems: "center", fontSize: "var(--font-size-sm)" }}>
                              <div style={{ width: "var(--spacing-6)", height: "var(--spacing-6)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-2)" }}>
                                <FaBox style={{ color: "var(--color-primary)", fontSize: "var(--font-size-xs)" }} />
                              </div>
                              <Text as="span" weight="medium" color="body">{item.itemName}</Text>
                              <span style={{ margin: "0 var(--spacing-1)", color: "var(--color-text-placeholder)" }}>•</span>
                              <Text as="span" color="tertiary">{item.count}</Text>
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
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
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
              <Text color="muted">No item type summary data available</Text>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Item Type</Table.Head>
                    <Table.Head>
                      Total Assigned
                    </Table.Head>
                    <Table.Head>Student Count</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {itemTypeSummary.map((item) => (
                    <Table.Row key={item._id}
                    >
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <HStack gap="none" align="center">
                          <div style={{ width: "var(--spacing-8)", height: "var(--spacing-8)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-bg)", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "var(--spacing-3)" }}>
                            <FaBox style={{ color: "var(--color-primary)" }} />
                          </div>
                          <Text as="span" weight="medium" color="secondary">{item.itemName}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)" }}>{item.totalAssigned}</Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <span style={{ padding: "var(--badge-padding-sm)", borderRadius: "var(--radius-full)", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-medium)", backgroundColor: "var(--color-info-bg)", color: "var(--color-info-text)" }}>{item.studentCount}</span>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InventoryReports
