import React, { useState } from "react"
import VisitorForm from "../../components/visitor/VisitorForm"
import VisitorTable from "../../components/visitor/VisitorTable"
import { securityApi } from "../../services/apiService"
import { useSecurity } from "../../contexts/SecurityProvider"

const AddVisitor = () => {
  const { visitors = [] } = useSecurity()

  // [
  //   {
  //     id: 1,
  //     name: "Rahul Sharma",
  //     phone: "9876543210",
  //     date: "2025-03-20",
  //     time: "14:30",
  //     roomNumber: "B-204",
  //     status: "Checked In",
  //   }
  // ]

  const handleAddVisitor = async (newVisitor) => {
    try {
      const response = await securityApi.addVisitor(newVisitor)
      if (response) {
        return true
      } else {
        throw new Error("Failed to add visitor")
      }
    } catch (error) {
      console.error(error)
      return false
    }
  }

  const handleUpdateVisitor = (updatedVisitor) => {
    // setVisitors(visitors.map((visitor) => (visitor.id === updatedVisitor.id ? updatedVisitor : visitor)))
  }

  return (
    <div className="flex-1 px-10 pb-6 bg-[#EFF3F4]">
      <div className="mt-8">
        <VisitorForm onAddVisitor={handleAddVisitor} />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 px-3">Visitor Records</h2>
        <VisitorTable visitors={visitors} onUpdateVisitor={handleUpdateVisitor} />
      </div>
    </div>
  )
}

export default AddVisitor
