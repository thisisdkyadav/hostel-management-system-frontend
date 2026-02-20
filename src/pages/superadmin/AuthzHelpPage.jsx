import { Button } from "czero/react"
import { useNavigate } from "react-router-dom"
import AuthzFieldGuide from "../../components/authz/AuthzFieldGuide"
import useAuthz from "../../hooks/useAuthz"

const AuthzHelpPage = () => {
  const navigate = useNavigate()
  const { catalog } = useAuthz()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">AuthZ Management Help</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Field-by-field guide for the Super Admin AuthZ configuration screen.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/super-admin/authz")}>Back to AuthZ</Button>
      </header>

      <AuthzFieldGuide catalog={catalog} />
    </div>
  )
}

export default AuthzHelpPage
