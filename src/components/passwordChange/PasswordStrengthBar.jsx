import React from "react"

const PasswordStrengthBar = ({ password }) => {
  const getStrength = (pwd) => {
    if (!pwd) return 0

    let score = 0

    if (pwd.length >= 6) score += 1
    if (pwd.length >= 12) score += 1

    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    return Math.min(score, 4)
  }

  const strength = getStrength(password)

  if (!password) {
    return null
  }

  const labels = ["Weak", "Fair", "Good", "Strong"]
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"]

  return (
    <div className="space-y-1">
      <div className="flex gap-1 h-1.5">
        {[1, 2, 3, 4].map((level) => (
          <div key={level} className={`h-full rounded-full flex-1 ${level <= strength ? colors[strength - 1] : "bg-gray-200"}`}></div>
        ))}
      </div>
      <p className="text-xs text-gray-500">Password strength: {strength > 0 ? labels[strength - 1] : "Too weak"}</p>
    </div>
  )
}

export default PasswordStrengthBar
