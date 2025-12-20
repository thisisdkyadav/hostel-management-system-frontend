import React from "react"

const EmptyState = ({
  icon: Icon,
  title = "No Data Found",
  message = "There is no data available to display",
  iconBgColor = "bg-[var(--color-primary-bg)]",
  iconColor = "text-[var(--color-primary)]"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className={`w-16 h-16 ${iconBgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-medium text-[var(--color-text-body)]">{title}</h3>
      <p className="text-[var(--color-text-muted)] mt-1 max-w-md mx-auto">{message}</p>
    </div>
  )
}

export default EmptyState
