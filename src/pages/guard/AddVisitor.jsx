import React, { useState } from "react"
import VisitorForm from "../../components/visitor/VisitorForm"
import VisitorTable from "../../components/visitor/VisitorTable"
import { securityApi } from "../../services/apiService"
import { useSecurity } from "../../contexts/SecurityProvider"

const AddVisitor = () => {
  const { visitors = [] } = useSecurity()

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
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-2.5 mr-3 bg-blue-100 text-[#1360AB] rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Visitor Registration</h1>
        </div>
      </header>

      <div className="mb-10">
        <VisitorForm onAddVisitor={handleAddVisitor} />
      </div>

      <div className="mb-6 flex items-center">
        <div className="p-2 mr-3 bg-blue-100 text-[#1360AB] rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Recent Visitor Records</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Total Records:</span>
            <span className="font-semibold text-[#1360AB]">{visitors.length}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span>Checked In: {visitors.filter((v) => v.status === "Checked In").length}</span>
            </div>

            <div className="flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-lg text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span>Checked Out: {visitors.filter((v) => v.status === "Checked Out").length}</span>
            </div>
          </div>
        </div>
      </div>

      <VisitorTable visitors={visitors} onUpdateVisitor={handleUpdateVisitor} />
    </div>
  )
}

export default AddVisitor
