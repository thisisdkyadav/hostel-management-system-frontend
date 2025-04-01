import React from "react"
import { FaUser } from "react-icons/fa"

const VisitorInformation = ({ visitors }) => {
  return (
    <div>
      <h3 className="font-medium text-gray-700 mb-3 flex items-center">
        <FaUser className="mr-2 text-[#1360AB]" /> Visitor Information
      </h3>
      <div className="space-y-3">
        {visitors.map((visitor, index) => (
          <div key={index} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-2 sm:mb-0">
                <h4 className="font-medium text-gray-800">{visitor.name}</h4>
                <p className="text-sm text-gray-600">Relation: {visitor.relation}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-sm text-gray-600">{visitor.phone}</span>
                <span className="text-sm text-gray-600">{visitor.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VisitorInformation
