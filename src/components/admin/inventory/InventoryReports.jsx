import React, { useState, useEffect } from "react"
import { inventoryApi } from "../../../service"
import { useGlobal } from "../../../contexts/GlobalProvider"
import { Alert, Button, Field, Grid, Heading, HStack, IconCircle, Label, Select, Surface, Table, Text, VStack } from "hzero"
import { Box, Boxes, Building2, Filter, GraduationCap, List, PieChart } from "lucide-react"

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
          <Heading as="h3" size="lg" weight="medium" color="secondary">Inventory Reports</Heading>
          <Text size="sm" color="muted">View inventory distribution across hostels and students</Text>
        </div>

        {/* Hostel Filter (only for student and item type tabs) */}
        {activeTab !== "hostel" && (
          <HStack align="center" gap={2}>
            <VStack gap="medium">
              <Field label="Choose Hostel">
                <Select value={selectedHostel} onChange={handleHostelChange} icon={<Building2 size="1em" />} options={[{ value: "", label: "Select a hostel..." }, ...hostelList.map((h) => ({ value: h._id, label: h.name }))]} />
              </Field>
            </VStack>
          </HStack>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border-primary)] mb-6">
        <nav className="flex space-x-8">
          <Button onClick={() => setActiveTab("hostel")} variant={activeTab === "hostel" ? "primary" : "ghost"} size="md">
            <Building2 size="1em" />
            By Hostel
          </Button>
          <Button onClick={() => setActiveTab("student")} variant={activeTab === "student" ? "primary" : "ghost"} size="md">
            <GraduationCap size="1em" />
            By Student
          </Button>
          <Button onClick={() => setActiveTab("itemType")} variant={activeTab === "itemType" ? "primary" : "ghost"} size="md">
            <List size="1em" />
            By Item Type
          </Button>
        </nav>
      </div>

      {error && <Text as="div" color="danger-text" style={{ backgroundColor: "var(--color-danger-bg)", padding: "var(--spacing-3)", borderRadius: "var(--radius-lg)" }}>{error}</Text>}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-8">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}></div>
        </div>
      )}

      {/* Hostel Summary */}
      {activeTab === "hostel" && !loading && (
        <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {hostelSummary.length === 0 ? (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "var(--spacing-12) 0" }}>
              <Boxes size={32} style={{ margin: "0 auto", marginBottom: "var(--spacing-4)" }} color="var(--color-border-primary)" />
              <Text color="muted">No hostel inventory data available</Text>
            </div>
          ) : (
            hostelSummary.map((hostel) => (
              <div
                key={hostel._id}
                className="hover:shadow-[var(--shadow-card-hover)]"
                style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--card-radius)", padding: "var(--spacing-5)", boxShadow: "var(--shadow-card)", border: "var(--border-1) solid var(--card-border)", transition: "var(--transition-all)" }}
              >
                <HStack gap="none" align="center" style={{ marginBottom: "var(--spacing-4)" }}>
                  <IconCircle size="var(--spacing-10)" bg="brand" style={{ marginRight: "var(--spacing-3)" }}>
                    <Building2 color="var(--color-primary)" />
                  </IconCircle>
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
                  <Text as="div" size="sm" weight="medium" color="body" style={{ marginBottom: "var(--spacing-2)" }}>Item Distribution</Text>
                  <div className="space-y-2">
                    {hostel.items.map((item) => (
                      <div
                        key={item.itemTypeId}
                        className="hover:bg-[var(--color-bg-tertiary)]"
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "var(--spacing-2)", borderRadius: "var(--radius-md)", transition: "var(--transition-colors)" }}
                      >
                        <HStack gap="none" align="center">
                          <IconCircle size="var(--spacing-6)" bg="brand" style={{ marginRight: "var(--spacing-2)" }}>
                            <Box size={12} color="var(--color-primary)" />
                          </IconCircle>
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
        </Grid>
      )}

      {/* Student Summary */}
      {activeTab === "student" && !loading && (
        <div style={{ backgroundColor: "var(--card-bg)", borderRadius: "var(--card-radius)", boxShadow: "var(--shadow-card)", border: "1px solid var(--card-border)", overflow: "hidden" }}>
          {studentSummary.length === 0 ? (
            <Surface padding="var(--spacing-12) 0" align="center">
              <GraduationCap size={32} style={{ margin: "0 auto", marginBottom: "var(--spacing-4)" }} color="var(--color-border-primary)" />
              <Text color="muted">No student inventory data available</Text>
            </Surface>
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
                        <Surface as="span" bg="info" padding="var(--badge-padding-sm)" radius="full" color="info-text" size="xs" weight="medium">{student.totalItems}</Surface>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="space-y-1">
                          {student.items.map((item) => (
                            <HStack align="center" gap="none" size="sm" key={item.id}>
                              <IconCircle size="var(--spacing-6)" bg="brand" style={{ marginRight: "var(--spacing-2)" }}>
                                <Box size={12} color="var(--color-primary)" />
                              </IconCircle>
                              <Text as="span" weight="medium" color="body">{item.itemName}</Text>
                              <Text as="span" color="placeholder" style={{ margin: "0 var(--spacing-1)" }}>•</Text>
                              <Text as="span" color="tertiary">{item.count}</Text>
                              <Text as="span" color="placeholder" style={{ margin: "0 var(--spacing-1)" }}>•</Text>
                              <Surface as="span" bg={item.status === "Issued" ? "var(--color-success-bg)" : item.status === "Damaged" ? "var(--color-danger-bg)" : "var(--color-bg-muted)"} padding="var(--spacing-1) var(--spacing-2)" radius="full" color={item.status === "Issued" ? "var(--color-success-text)" : item.status === "Damaged" ? "var(--color-danger-text)" : "var(--color-text-secondary)"} size="xs">
                                {item.status}
                              </Surface>
                            </HStack>
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
            <Surface padding="var(--spacing-12) 0" align="center">
              <Box size={32} style={{ margin: "0 auto", marginBottom: "var(--spacing-4)" }} color="var(--color-border-primary)" />
              <Text color="muted">No item type summary data available</Text>
            </Surface>
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
                          <IconCircle size="var(--spacing-8)" bg="brand" style={{ marginRight: "var(--spacing-3)" }}>
                            <Box color="var(--color-primary)" />
                          </IconCircle>
                          <Text as="span" weight="medium" color="secondary">{item.itemName}</Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap", fontWeight: "var(--font-weight-medium)" }}>{item.totalAssigned}</Table.Cell>
                      <Table.Cell style={{ whiteSpace: "nowrap" }}>
                        <Surface as="span" bg="info" padding="var(--badge-padding-sm)" radius="full" color="info-text" size="xs" weight="medium">{item.studentCount}</Surface>
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
