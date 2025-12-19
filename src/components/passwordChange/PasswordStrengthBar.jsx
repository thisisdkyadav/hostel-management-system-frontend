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
  const colors = [
    'var(--color-danger)',
    'var(--color-warning)',
    'var(--color-warning-light)',
    'var(--color-success)'
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)' }}>
      <div style={{ display: 'flex', gap: 'var(--spacing-1)', height: 'var(--spacing-1-5)' }}>
        {[1, 2, 3, 4].map((level) => (
          <div key={level} style={{ height: '100%', borderRadius: 'var(--radius-full)', flex: 1, backgroundColor: level <= strength ? colors[strength - 1] : 'var(--color-bg-muted)', transition: 'var(--transition-colors)' }} ></div>
        ))}
      </div>
      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
        Password strength: {strength > 0 ? labels[strength - 1] : "Too weak"}
      </p>
    </div>
  )
}

export default PasswordStrengthBar
