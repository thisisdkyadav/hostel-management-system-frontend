import React from "react"
import { Building } from "lucide-react"

const NoResults = ({ icon, message = "No results found", suggestion = "Try changing your search or filter criteria" }) => {
  return (
    <div className="mt-8 text-center py-12 px-4 bg-[var(--color-bg-primary)] rounded-xl shadow-sm">
      <div className="animate-pulse mx-auto bg-[var(--color-bg-muted)] w-16 h-16 rounded-full flex items-center justify-center mb-4">
        {icon || <Building size={32} className="text-[var(--color-text-disabled)]" />}
      </div>
      <h3 className="text-xl font-medium text-[var(--color-text-muted)]">{message}</h3>
      <p className="text-[var(--color-text-disabled)] mt-2 max-w-md mx-auto">{suggestion}</p>
    </div>
  )
}

export default NoResults
