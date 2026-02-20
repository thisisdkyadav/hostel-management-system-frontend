import { useCallback, useEffect, useMemo, useState } from "react"
import { Button, Input } from "czero/react"
import { Card } from "@/components/ui"
import { authzApi } from "../../service"

const ROLE_OPTIONS = [
  "Admin",
  "Super Admin",
  "Warden",
  "Associate Warden",
  "Hostel Supervisor",
  "Security",
  "Hostel Gate",
  "Maintenance Staff",
  "Student",
  "Gymkhana",
]

const parseKeyList = (value = "") => {
  if (typeof value !== "string") return []

  return [
    ...new Set(
      value
        .split(/[\n,]/g)
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ]
}

const parseConstraints = (value = "") => {
  const trimmed = value.trim()
  if (!trimmed) return []

  const parsed = JSON.parse(trimmed)
  if (!Array.isArray(parsed)) {
    throw new Error("Constraints must be a JSON array")
  }

  return parsed
}

const toMultiline = (arr = []) => (Array.isArray(arr) ? arr.join("\n") : "")
const intersection = (left = [], right = []) => {
  const rightSet = new Set(right)
  return left.filter((item) => rightSet.has(item))
}

const AuthzManagementPage = () => {
  const canViewAuthz = true
  const canUpdateAuthz = true

  const [catalog, setCatalog] = useState(null)
  const [roleFilter, setRoleFilter] = useState("Admin")
  const [search, setSearch] = useState("")

  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 25 })
  const [selectedUserId, setSelectedUserId] = useState("")
  const [selectedUserData, setSelectedUserData] = useState(null)

  const [allowRoutesText, setAllowRoutesText] = useState("")
  const [denyRoutesText, setDenyRoutesText] = useState("")
  const [allowCapabilitiesText, setAllowCapabilitiesText] = useState("")
  const [denyCapabilitiesText, setDenyCapabilitiesText] = useState("")
  const [constraintsText, setConstraintsText] = useState("[]")
  const [reason, setReason] = useState("")

  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const applyOverrideToForm = useCallback((override = {}) => {
    setAllowRoutesText(toMultiline(override.allowRoutes))
    setDenyRoutesText(toMultiline(override.denyRoutes))
    setAllowCapabilitiesText(toMultiline(override.allowCapabilities))
    setDenyCapabilitiesText(toMultiline(override.denyCapabilities))
    setConstraintsText(JSON.stringify(override.constraints || [], null, 2))
  }, [])

  const fetchCatalog = useCallback(async () => {
    if (!canViewAuthz) return

    setLoadingCatalog(true)
    setError("")

    try {
      const response = await authzApi.getCatalog()
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load AuthZ catalog")
      }
      setCatalog(response.data?.catalog || null)
    } catch (err) {
      setError(err.message || "Failed to load AuthZ catalog")
    } finally {
      setLoadingCatalog(false)
    }
  }, [canViewAuthz])

  const fetchUsers = useCallback(
    async (role, page) => {
      if (!canViewAuthz) return

      setLoadingUsers(true)
      setError("")

      try {
        const response = await authzApi.getUsersByRole(role, { page, limit: pagination.limit })
        if (!response?.success) {
          throw new Error(response?.message || "Failed to load users")
        }

        const data = response.data?.data || []
        const nextPagination = response.data?.pagination || { page: 1, pages: 1, total: 0, limit: pagination.limit }

        setUsers(data)
        setPagination((prev) => ({ ...prev, ...nextPagination }))

        if (data.length > 0 && !selectedUserId) {
          setSelectedUserId(data[0]._id)
        }

        if (data.length === 0) {
          setSelectedUserId("")
          setSelectedUserData(null)
          applyOverrideToForm({})
        }
      } catch (err) {
        setError(err.message || "Failed to load users")
      } finally {
        setLoadingUsers(false)
      }
    },
    [applyOverrideToForm, canViewAuthz, pagination.limit, selectedUserId]
  )

  const fetchUserDetail = useCallback(
    async (userId) => {
      if (!canViewAuthz || !userId) return

      setLoadingDetail(true)
      setError("")

      try {
        const response = await authzApi.getUserAuthz(userId)
        if (!response?.success) {
          throw new Error(response?.message || "Failed to load user AuthZ")
        }

        setSelectedUserData(response.data || null)
        applyOverrideToForm(response.data?.authz?.override || {})
      } catch (err) {
        setError(err.message || "Failed to load user AuthZ")
      } finally {
        setLoadingDetail(false)
      }
    },
    [applyOverrideToForm, canViewAuthz]
  )

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  useEffect(() => {
    fetchUsers(roleFilter, pagination.page)
  }, [fetchUsers, pagination.page, roleFilter])

  useEffect(() => {
    if (selectedUserId) {
      fetchUserDetail(selectedUserId)
    }
  }, [fetchUserDetail, selectedUserId])

  const roleDefaultRouteKeys = useMemo(() => {
    if (!catalog || !roleFilter) return []
    return catalog.roleDefaults?.routeAccess?.[roleFilter] || []
  }, [catalog, roleFilter])

  const filteredUsers = useMemo(() => {
    const searchText = search.trim().toLowerCase()
    if (!searchText) return users

    return users.filter((user) => {
      const name = String(user?.name || "").toLowerCase()
      const email = String(user?.email || "").toLowerCase()
      return name.includes(searchText) || email.includes(searchText)
    })
  }, [search, users])

  const overrideSummary = useMemo(() => {
    const override = selectedUserData?.authz?.override || {}
    return {
      allowRoutes: Array.isArray(override.allowRoutes) ? override.allowRoutes.length : 0,
      denyRoutes: Array.isArray(override.denyRoutes) ? override.denyRoutes.length : 0,
      allowCapabilities: Array.isArray(override.allowCapabilities) ? override.allowCapabilities.length : 0,
      denyCapabilities: Array.isArray(override.denyCapabilities) ? override.denyCapabilities.length : 0,
      constraints: Array.isArray(override.constraints) ? override.constraints.length : 0,
    }
  }, [selectedUserData])

  const effectiveSummary = useMemo(() => {
    const effective = selectedUserData?.authz?.effective || {}
    const routeAccess = effective.routeAccess || {}
    const capabilities = effective.capabilities || {}
    const constraints = effective.constraints || {}

    const enabledRoutes = Object.values(routeAccess).filter(Boolean).length
    const enabledCapabilities = Object.entries(capabilities).filter(([key, value]) => key !== "*" && value === true).length
    const hasWildcard = capabilities["*"] === true
    const totalCapabilities = Math.max(
      Object.keys(capabilities).length - (Object.prototype.hasOwnProperty.call(capabilities, "*") ? 1 : 0),
      0
    )

    return {
      enabledRoutes,
      totalRoutes: Object.keys(routeAccess).length,
      enabledCapabilities,
      totalCapabilities,
      hasWildcard,
      totalConstraints: Object.keys(constraints).length,
    }
  }, [selectedUserData])

  const draftValidation = useMemo(() => {
    const allowRoutes = parseKeyList(allowRoutesText)
    const denyRoutes = parseKeyList(denyRoutesText)
    const allowCapabilities = parseKeyList(allowCapabilitiesText)
    const denyCapabilities = parseKeyList(denyCapabilitiesText)

    const errors = []
    const warnings = []

    const overlappingRoutes = intersection(allowRoutes, denyRoutes)
    const overlappingCapabilities = intersection(allowCapabilities, denyCapabilities)

    if (overlappingRoutes.length > 0) {
      errors.push(`Same route key appears in allow and deny: ${overlappingRoutes.join(", ")}`)
    }

    if (overlappingCapabilities.length > 0) {
      errors.push(`Same capability key appears in allow and deny: ${overlappingCapabilities.join(", ")}`)
    }

    if (allowCapabilities.includes("*") && denyCapabilities.length > 0) {
      warnings.push("Allowing wildcard capability (*) while denying specific capabilities can be confusing. Deny wins.")
    }

    if (denyCapabilities.includes("*") && allowCapabilities.length > 0) {
      warnings.push("Denying wildcard capability (*) will override all explicit allowed capabilities.")
    }

    try {
      parseConstraints(constraintsText)
    } catch (err) {
      errors.push(err.message || "Invalid constraints JSON")
    }

    return { errors, warnings }
  }, [allowCapabilitiesText, allowRoutesText, constraintsText, denyCapabilitiesText, denyRoutesText])

  const handleSaveOverride = async () => {
    if (!canUpdateAuthz) return
    if (!selectedUserId) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      if (draftValidation.errors.length > 0) {
        throw new Error(draftValidation.errors.join("; "))
      }

      const override = {
        allowRoutes: parseKeyList(allowRoutesText),
        denyRoutes: parseKeyList(denyRoutesText),
        allowCapabilities: parseKeyList(allowCapabilitiesText),
        denyCapabilities: parseKeyList(denyCapabilitiesText),
        constraints: parseConstraints(constraintsText),
      }

      const response = await authzApi.updateUserAuthz(selectedUserId, {
        override,
        reason: reason.trim() || null,
      })

      if (!response?.success) {
        const validationErrors = Array.isArray(response?.errors)
          ? response.errors.map((item) => item.message).join("; ")
          : ""
        throw new Error(validationErrors || response?.message || "Failed to update AuthZ override")
      }

      setSuccess("AuthZ override updated successfully")
      setReason("")

      await Promise.all([fetchUserDetail(selectedUserId), fetchUsers(roleFilter, pagination.page)])
    } catch (err) {
      setError(err.message || "Failed to update AuthZ override")
    } finally {
      setSaving(false)
    }
  }

  const handleResetOverride = async () => {
    if (!canUpdateAuthz) return
    if (!selectedUserId) return

    const confirmReset = window.confirm("Reset all AuthZ overrides for selected user?")
    if (!confirmReset) return

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await authzApi.resetUserAuthz(selectedUserId, {
        reason: reason.trim() || null,
      })

      if (!response?.success) {
        throw new Error(response?.message || "Failed to reset AuthZ override")
      }

      setSuccess("AuthZ override reset successfully")
      setReason("")

      await Promise.all([fetchUserDetail(selectedUserId), fetchUsers(roleFilter, pagination.page)])
    } catch (err) {
      setError(err.message || "Failed to reset AuthZ override")
    } finally {
      setSaving(false)
    }
  }

  if (!canViewAuthz) {
    return (
      <div className="p-6">
        <Card>
          <Card.Body className="p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Access Denied</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              You do not have access to the AuthZ management route.
            </p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">AuthZ Management</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage Layer-3 route/capability/constraint overrides for users.
        </p>
      </div>

      {error ? <div className="rounded-md border border-[var(--color-danger)] bg-[var(--color-danger-bg-light)] px-4 py-3 text-sm text-[var(--color-danger)]">{error}</div> : null}
      {success ? <div className="rounded-md border border-[var(--color-success)] bg-[var(--color-success-bg-light)] px-4 py-3 text-sm text-[var(--color-success-text)]">{success}</div> : null}
      {draftValidation.warnings.length > 0 ? (
        <div className="rounded-md border border-[var(--color-warning)] bg-[var(--color-warning-bg-light)] px-4 py-3 text-sm text-[var(--color-warning-text)]">
          {draftValidation.warnings.map((warning) => (
            <div key={warning}>{warning}</div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <Card.Body className="p-4 space-y-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Role</label>
                <select
                  className="w-full h-10 rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-3 text-sm"
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value)
                    setPagination((prev) => ({ ...prev, page: 1 }))
                    setSelectedUserId("")
                    setSelectedUserData(null)
                  }}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Search User</label>
              <Input
                type="search"
                placeholder="Name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="text-xs text-[var(--color-text-muted)]">
              {loadingUsers ? "Loading users..." : `${pagination.total} users`} • page {pagination.page}/{Math.max(pagination.pages || 1, 1)}
            </div>

            <div className="max-h-[520px] overflow-auto border border-[var(--color-border-primary)] rounded-[var(--radius-card-sm)]">
              {filteredUsers.map((user) => (
                <button
                  key={user._id}
                  className={`w-full text-left px-3 py-3 border-b border-[var(--color-border-light)] hover:bg-[var(--color-bg-hover)] ${selectedUserId === user._id ? "bg-[var(--color-primary-bg)]" : ""}`}
                  onClick={() => setSelectedUserId(user._id)}
                >
                  <div className="text-sm font-medium text-[var(--color-text-primary)]">{user.name}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{user.email}</div>
                </button>
              ))}
              {!loadingUsers && filteredUsers.length === 0 ? (
                <div className="px-3 py-8 text-sm text-[var(--color-text-muted)] text-center">No users found</div>
              ) : null}
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1 || loadingUsers}
                onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
              >
                Prev
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= (pagination.pages || 1) || loadingUsers}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
              >
                Next
              </Button>
            </div>
          </Card.Body>
        </Card>

        <Card className="xl:col-span-2">
          <Card.Body className="p-4 space-y-4">
            {!selectedUserId ? (
              <p className="text-sm text-[var(--color-text-muted)]">Select a user to manage AuthZ override.</p>
            ) : (
              <>
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {selectedUserData?.user?.name || "Selected user"}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {selectedUserData?.user?.email} • {selectedUserData?.user?.role}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Catalog v{selectedUserData?.authz?.effective?.catalogVersion || catalog?.version || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="rounded-[var(--radius-card-sm)] bg-[var(--color-bg-tertiary)] p-3 text-xs text-[var(--color-text-muted)]">
                    <div className="font-medium text-[var(--color-text-secondary)] mb-2">Explicit Override</div>
                    <div>allowRoutes: {overrideSummary.allowRoutes}</div>
                    <div>denyRoutes: {overrideSummary.denyRoutes}</div>
                    <div>allowCapabilities: {overrideSummary.allowCapabilities}</div>
                    <div>denyCapabilities: {overrideSummary.denyCapabilities}</div>
                    <div>constraints: {overrideSummary.constraints}</div>
                  </div>
                  <div className="rounded-[var(--radius-card-sm)] bg-[var(--color-bg-tertiary)] p-3 text-xs text-[var(--color-text-muted)]">
                    <div className="font-medium text-[var(--color-text-secondary)] mb-2">Effective AuthZ</div>
                    <div>routes enabled: {effectiveSummary.enabledRoutes}/{effectiveSummary.totalRoutes}</div>
                    <div>capabilities enabled: {effectiveSummary.enabledCapabilities}/{effectiveSummary.totalCapabilities}</div>
                    <div>wildcard capability: {effectiveSummary.hasWildcard ? "true" : "false"}</div>
                    <div>constraint keys: {effectiveSummary.totalConstraints}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Allow Routes (newline/comma separated)</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] p-3 text-xs font-mono"
                      value={allowRoutesText}
                      onChange={(e) => setAllowRoutesText(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAllowRoutesText(toMultiline(roleDefaultRouteKeys))}
                      >
                        Fill Role Defaults
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setAllowRoutesText("")}>Clear</Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Deny Routes (newline/comma separated)</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] p-3 text-xs font-mono"
                      value={denyRoutesText}
                      onChange={(e) => setDenyRoutesText(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Allow Capabilities (newline/comma separated)</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] p-3 text-xs font-mono"
                      value={allowCapabilitiesText}
                      onChange={(e) => setAllowCapabilitiesText(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Deny Capabilities (newline/comma separated)</label>
                    <textarea
                      className="w-full min-h-[120px] rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] p-3 text-xs font-mono"
                      value={denyCapabilitiesText}
                      onChange={(e) => setDenyCapabilitiesText(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Constraints JSON Array</label>
                  <textarea
                    className="w-full min-h-[160px] rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] p-3 text-xs font-mono"
                    value={constraintsText}
                    onChange={(e) => setConstraintsText(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Reason (optional)</label>
                  <Input
                    type="text"
                    placeholder="Reason for this AuthZ change"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    loading={saving}
                    disabled={!canUpdateAuthz || loadingDetail || saving}
                    onClick={handleSaveOverride}
                  >
                    Save Override
                  </Button>
                  <Button
                    variant="danger"
                    size="md"
                    loading={saving}
                    disabled={!canUpdateAuthz || loadingDetail || saving}
                    onClick={handleResetOverride}
                  >
                    Reset Override
                  </Button>
                </div>

                <div className="rounded-[var(--radius-card-sm)] bg-[var(--color-bg-tertiary)] p-3 text-xs text-[var(--color-text-muted)]">
                  <div className="font-medium text-[var(--color-text-secondary)] mb-2">Catalog Quick Stats</div>
                  <div>Routes: {loadingCatalog ? "..." : catalog?.routes?.length || 0}</div>
                  <div>Capabilities: {loadingCatalog ? "..." : catalog?.capabilities?.length || 0}</div>
                  <div>Constraints: {loadingCatalog ? "..." : catalog?.constraints?.length || 0}</div>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  )
}

export default AuthzManagementPage
