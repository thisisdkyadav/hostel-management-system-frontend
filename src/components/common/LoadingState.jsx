import React from "react"

const LoadingState = ({ message = "Loading...", description = "Please wait" }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-gray-200 border-t-[#1360AB] rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-medium text-gray-700">{message}</h3>
      {description && <p className="text-gray-500 mt-1">{description}</p>}
    </div>
  )
}

export default LoadingState
