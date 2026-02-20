import { useCallback, useEffect, useMemo, useState } from "react"
import { Button, DataTable, Input, Modal } from "czero/react"
import { Card, SearchInput } from "@/components/ui"
import { FaSlidersH, FaUserShield } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { authzApi } from "../../service"
import useAuthz from "../../hooks/useAuthz"
import AuthzFieldGuide from "../../components/authz/AuthzFieldGuide"

const STUDENT_ROLE = "Student"
const ALL_NON_STUDENT_FILTER = "__all_non_students__"
const NON_STUDENT_ROLE_OPTIONS = [
  { value: ALL_NON_STUDENT_FILTER, label: "All Non-Students" },
  { value: "Super Admin", label: "Super Admin" },
  { value: "Admin", label: "Admin" },
  { value: "Warden", label: "Warden" },
  { value: "Associate Warden", label: "Associate Warden" },
  { value: "Hostel Supervisor", label: "Hostel Supervisor" },
  { value: "Security", label: "Security" },
  { value: "Hostel Gate", label: "Hostel Gate" },
  { value: "Maintenance Staff", label: "Maintenance Staff" },
  { value: "Gymkhana", label: "Gymkhana" },
]
const OVERRIDE_MODE = {
  DEFAULT: "default",
  ALLOW: "allow",
  DENY: "deny",
}

const unique = (values = []) => [...new Set(values.filter(Boolean))]

const toSelectionMap = (keys = [], allow = [], deny = []) => {
  const map = {}
  for (const key of keys) {
    map[key] = OVERRIDE_MODE.DEFAULT
  }
  for (const key of allow || []) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      map[key] = OVERRIDE_MODE.ALLOW
    }
  }
  for (const key of deny || []) {
    if (Object.prototype.hasOwnProperty.call(map, key)) {
      map[key] = OVERRIDE_MODE.DENY
    }
  }
  return map
}

const toConstraintRawValue = (valueType, value) => {
  if (valueType === "boolean") return value ? "true" : "false"
  if (valueType === "number") return typeof value === "number" ? String(value) : ""
  if (valueType === "string") return typeof value === "string" ? value : ""

  if (typeof value === "undefined") return ""
  return JSON.stringify(value, null, 2)
}

const parseConstraintValue = (valueType, rawValue) => {
  const trimmed = String(rawValue ?? "").trim()

  if (valueType === "boolean") {
    return trimmed === "true"
  }

  if (valueType === "number") {
    if (!trimmed) throw new Error("Number value is required")
    const parsed = Number(trimmed)
    if (!Number.isFinite(parsed)) {
      throw new Error("Invalid number value")
    }
    return parsed
  }

  if (valueType === "string") {
    return String(rawValue ?? "")
  }

  if (!trimmed) {
    if (valueType === "any") return null
    throw new Error("JSON value is required")
  }

  let parsed
  try {
    parsed = JSON.parse(trimmed)
  } catch {
    if (valueType === "any") {
      return String(rawValue ?? "")
    }
    throw new Error("Invalid JSON value")
  }

  if (valueType === "string_array") {
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      throw new Error("Expected a JSON array of strings")
    }
    return parsed
  }

  if (valueType === "number_array") {
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "number" && Number.isFinite(item))) {
      throw new Error("Expected a JSON array of numbers")
    }
    return parsed
  }

  if (valueType === "object") {
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Expected a JSON object")
    }
    return parsed
  }

  return parsed
}

const buildConstraintDraft = (definitions = [], overrideConstraints = []) => {
  const overrideMap = new Map(
    (overrideConstraints || [])
      .filter((entry) => entry && typeof entry === "object" && typeof entry.key === "string")
      .map((entry) => [entry.key, entry.value])
  )

  return definitions.reduce((acc, definition) => {
    const hasOverride = overrideMap.has(definition.key)
    const value = hasOverride ? overrideMap.get(definition.key) : definition.defaultValue

    acc[definition.key] = {
      enabled: hasOverride,
      valueType: definition.valueType,
      label: definition.label,
      rawValue: toConstraintRawValue(definition.valueType, value),
    }

    return acc
  }, {})
}

const OverrideSelect = ({ value, onChange, disabled = false }) => {
  return (
    <select
      className="h-9 rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-2 text-xs"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <option value={OVERRIDE_MODE.DEFAULT}>Default</option>
      <option value={OVERRIDE_MODE.ALLOW}>Allow</option>
      <option value={OVERRIDE_MODE.DENY}>Deny</option>
    </select>
  )
}

const StudentAuthzEditorModal = ({
  open,
  onClose,
  catalog,
  userData,
  routeSelections,
  setRouteSelections,
  capabilitySelections,
  setCapabilitySelections,
  constraintDraft,
  setConstraintDraft,
  reason,
  setReason,
  onSave,
  onReset,
  onHelpClick,
  onHelpPageClick,
  saving,
  loading,
  canUpdate,
  error,
}) => {
  const [routeSearch, setRouteSearch] = useState("")
  const [capabilitySearch, setCapabilitySearch] = useState("")

  const routeLabelMap = useMemo(() => {
    const map = new Map()
    for (const routeDef of catalog?.routes || []) {
      map.set(routeDef.key, routeDef.label)
    }
    return map
  }, [catalog])

  const capabilityLabelMap = useMemo(() => {
    const map = new Map()
    for (const capabilityDef of catalog?.capabilities || []) {
      map.set(capabilityDef.key, capabilityDef.label)
    }
    map.set("*", "Wildcard Capability")
    return map
  }, [catalog])

  const filteredRouteKeys = useMemo(() => {
    const term = routeSearch.trim().toLowerCase()
    const keys = Object.keys(routeSelections || {})

    if (!term) return keys

    return keys.filter((key) => {
      const label = String(routeLabelMap.get(key) || "").toLowerCase()
      return key.toLowerCase().includes(term) || label.includes(term)
    })
  }, [routeLabelMap, routeSearch, routeSelections])

  const filteredCapabilityKeys = useMemo(() => {
    const term = capabilitySearch.trim().toLowerCase()
    const keys = Object.keys(capabilitySelections || {})

    if (!term) return keys

    return keys.filter((key) => {
      const label = String(capabilityLabelMap.get(key) || "").toLowerCase()
      return key.toLowerCase().includes(term) || label.includes(term)
    })
  }, [capabilityLabelMap, capabilitySearch, capabilitySelections])

  const overrideSummary = useMemo(() => {
    const routeValues = Object.values(routeSelections || {})
    const capabilityValues = Object.values(capabilitySelections || {})

    const constraintCount = Object.values(constraintDraft || {}).filter((entry) => entry?.enabled).length

    return {
      allowRoutes: routeValues.filter((value) => value === OVERRIDE_MODE.ALLOW).length,
      denyRoutes: routeValues.filter((value) => value === OVERRIDE_MODE.DENY).length,
      allowCapabilities: capabilityValues.filter((value) => value === OVERRIDE_MODE.ALLOW).length,
      denyCapabilities: capabilityValues.filter((value) => value === OVERRIDE_MODE.DENY).length,
      constraints: constraintCount,
    }
  }, [capabilitySelections, constraintDraft, routeSelections])

  const effectiveSummary = useMemo(() => {
    const effective = userData?.authz?.effective || {}
    const routeAccess = effective.routeAccess || {}
    const capabilities = effective.capabilities || {}

    const enabledRoutes = Object.values(routeAccess).filter(Boolean).length
    const allCapabilityKeys = Object.keys(capabilities).filter((key) => key !== "*")
    const enabledCapabilities = allCapabilityKeys.filter((key) => capabilities[key] === true).length

    return {
      enabledRoutes,
      totalRoutes: Object.keys(routeAccess).length,
      enabledCapabilities,
      totalCapabilities: allCapabilityKeys.length,
      wildcard: capabilities["*"] === true,
    }
  }, [userData])

  if (!open) return null

  return (
    <Modal title="User Access Configuration" onClose={onClose} width={1100}>
      <div className="space-y-4">
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onHelpClick}>Help</Button>
          <Button variant="secondary" size="sm" onClick={onHelpPageClick}>Open Help Page</Button>
        </div>

        {error ? (
          <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-danger)] bg-[var(--color-danger-bg-light)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">Loading user access data...</div>
        ) : (
          <>
            <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] px-4 py-3">
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">{userData?.user?.name || "Selected user"}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                {userData?.user?.email} • {userData?.user?.role}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-[var(--radius-card-sm)] bg-[var(--color-bg-tertiary)] p-3 text-xs text-[var(--color-text-muted)]">
                <div className="font-medium text-[var(--color-text-secondary)] mb-2">Override Draft</div>
                <div>allowRoutes: {overrideSummary.allowRoutes}</div>
                <div>denyRoutes: {overrideSummary.denyRoutes}</div>
                <div>allowCapabilities: {overrideSummary.allowCapabilities}</div>
                <div>denyCapabilities: {overrideSummary.denyCapabilities}</div>
                <div>constraints: {overrideSummary.constraints}</div>
              </div>
              <div className="rounded-[var(--radius-card-sm)] bg-[var(--color-bg-tertiary)] p-3 text-xs text-[var(--color-text-muted)]">
                <div className="font-medium text-[var(--color-text-secondary)] mb-2">Current Effective Access</div>
                <div>routes enabled: {effectiveSummary.enabledRoutes}/{effectiveSummary.totalRoutes}</div>
                <div>capabilities enabled: {effectiveSummary.enabledCapabilities}/{effectiveSummary.totalCapabilities}</div>
                <div>wildcard capability: {effectiveSummary.wildcard ? "true" : "false"}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Route Access</h3>
                  <SearchInput
                    value={routeSearch}
                    onChange={(e) => setRouteSearch(e.target.value)}
                    placeholder="Search routes"
                    className="w-56"
                  />
                </div>
                <div className="max-h-60 overflow-auto rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)]">
                  {filteredRouteKeys.map((key) => (
                    <div key={key} className="grid grid-cols-[1fr_auto] gap-2 items-center border-b border-[var(--color-border-light)] px-3 py-2">
                      <div>
                        <div className="text-xs font-medium text-[var(--color-text-primary)]">{routeLabelMap.get(key) || key}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{key}</div>
                      </div>
                      <OverrideSelect
                        value={routeSelections[key] || OVERRIDE_MODE.DEFAULT}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          setRouteSelections((prev) => ({ ...prev, [key]: nextValue }))
                        }}
                        disabled={!canUpdate || saving}
                      />
                    </div>
                  ))}
                  {filteredRouteKeys.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">No routes found</div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Capabilities</h3>
                  <SearchInput
                    value={capabilitySearch}
                    onChange={(e) => setCapabilitySearch(e.target.value)}
                    placeholder="Search capabilities"
                    className="w-56"
                  />
                </div>
                <div className="max-h-60 overflow-auto rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)]">
                  {filteredCapabilityKeys.map((key) => (
                    <div key={key} className="grid grid-cols-[1fr_auto] gap-2 items-center border-b border-[var(--color-border-light)] px-3 py-2">
                      <div>
                        <div className="text-xs font-medium text-[var(--color-text-primary)]">{capabilityLabelMap.get(key) || key}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)] font-mono">{key}</div>
                      </div>
                      <OverrideSelect
                        value={capabilitySelections[key] || OVERRIDE_MODE.DEFAULT}
                        onChange={(e) => {
                          const nextValue = e.target.value
                          setCapabilitySelections((prev) => ({ ...prev, [key]: nextValue }))
                        }}
                        disabled={!canUpdate || saving}
                      />
                    </div>
                  ))}
                  {filteredCapabilityKeys.length === 0 ? (
                    <div className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">No capabilities found</div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] p-3 space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Constraints</h3>
              {(Object.entries(constraintDraft || {})).map(([key, item]) => (
                <div key={key} className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
                      <input
                        type="checkbox"
                        checked={Boolean(item.enabled)}
                        disabled={!canUpdate || saving}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setConstraintDraft((prev) => ({
                            ...prev,
                            [key]: {
                              ...prev[key],
                              enabled: checked,
                            },
                          }))
                        }}
                      />
                      Override
                    </label>
                    <span className="text-xs font-medium text-[var(--color-text-secondary)]">{item.label}</span>
                    <span className="text-[11px] text-[var(--color-text-muted)] font-mono">{key} ({item.valueType})</span>
                  </div>

                  {item.enabled ? (
                    <div className="mt-3">
                      {item.valueType === "boolean" ? (
                        <select
                          className="h-10 w-40 rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-3 text-sm"
                          value={item.rawValue}
                          disabled={!canUpdate || saving}
                          onChange={(e) => {
                            const nextValue = e.target.value
                            setConstraintDraft((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                rawValue: nextValue,
                              },
                            }))
                          }}
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                        </select>
                      ) : item.valueType === "number" || item.valueType === "string" ? (
                        <Input
                          type={item.valueType === "number" ? "number" : "text"}
                          value={item.rawValue}
                          onChange={(e) => {
                            const nextValue = e.target.value
                            setConstraintDraft((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                rawValue: nextValue,
                              },
                            }))
                          }}
                          placeholder={item.valueType === "number" ? "Enter number" : "Enter text"}
                          disabled={!canUpdate || saving}
                        />
                      ) : (
                        <textarea
                          className="w-full min-h-[84px] rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] p-3 text-xs font-mono"
                          value={item.rawValue}
                          onChange={(e) => {
                            const nextValue = e.target.value
                            setConstraintDraft((prev) => ({
                              ...prev,
                              [key]: {
                                ...prev[key],
                                rawValue: nextValue,
                              },
                            }))
                          }}
                          disabled={!canUpdate || saving}
                          placeholder="Enter JSON value"
                        />
                      )}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">Reason (optional)</label>
              <Input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for this access change"
                disabled={!canUpdate || saving}
              />
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-[var(--color-border-light)]">
              <Button variant="secondary" size="md" onClick={onClose} disabled={saving}>Close</Button>
              <Button variant="danger" size="md" onClick={onReset} disabled={!canUpdate || saving} loading={saving}>Reset Override</Button>
              <Button variant="primary" size="md" onClick={onSave} disabled={!canUpdate || saving} loading={saving}>Save Changes</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

const AuthzManagementPage = () => {
  const navigate = useNavigate()
  const { can } = useAuthz()
  const canViewAuthz = can("cap.authz.view")
  const canUpdateAuthz = can("cap.authz.update")

  const [catalog, setCatalog] = useState(null)
  const [students, setStudents] = useState([])
  const [roleFilter, setRoleFilter] = useState(ALL_NON_STUDENT_FILTER)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0, limit: 25 })
  const [search, setSearch] = useState("")

  const [loadingCatalog, setLoadingCatalog] = useState(false)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [pageError, setPageError] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isHelpOpen, setIsHelpOpen] = useState(false)
  const [selectedUserData, setSelectedUserData] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState("")

  const [routeSelections, setRouteSelections] = useState({})
  const [capabilitySelections, setCapabilitySelections] = useState({})
  const [constraintDraft, setConstraintDraft] = useState({})
  const [reason, setReason] = useState("")

  const fetchCatalog = useCallback(async () => {
    if (!canViewAuthz) return null

    setLoadingCatalog(true)
    try {
      const response = await authzApi.getCatalog()
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load AuthZ catalog")
      }

      const nextCatalog = response.data?.catalog || null
      setCatalog(nextCatalog)
      return nextCatalog
    } catch (err) {
      setPageError(err.message || "Failed to load AuthZ catalog")
      return null
    } finally {
      setLoadingCatalog(false)
    }
  }, [canViewAuthz])

  const fetchUsers = useCallback(async (page = 1) => {
    if (!canViewAuthz) return

    setLoadingStudents(true)
    setPageError("")

    try {
      const query = { page, limit: pagination.limit }
      const roleToFetch = roleFilter === ALL_NON_STUDENT_FILTER ? "" : roleFilter
      if (!roleToFetch) {
        query.excludeRoles = STUDENT_ROLE
      }

      const response = await authzApi.getUsersByRole(roleToFetch, query)
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load users")
      }

      setStudents(response.data?.data || [])
      setPagination((prev) => ({
        ...prev,
        ...(response.data?.pagination || {}),
      }))
    } catch (err) {
      setPageError(err.message || "Failed to load users")
    } finally {
      setLoadingStudents(false)
    }
  }, [canViewAuthz, pagination.limit, roleFilter])

  const initializeEditorDraft = useCallback((userData, activeCatalog) => {
    const override = userData?.authz?.override || {}
    const userRole = userData?.user?.role || "Admin"

    const validRouteKeys = new Set((activeCatalog?.routes || []).map((item) => item.key))
    const roleRouteKeys = activeCatalog?.roleDefaults?.routeAccess?.[userRole] || []
    const routeOptionKeys = unique([
      ...roleRouteKeys,
      ...(override.allowRoutes || []),
      ...(override.denyRoutes || []),
    ]).filter((key) => validRouteKeys.has(key))

    const allCapabilityKeys = ["*", ...(activeCatalog?.capabilities || []).map((item) => item.key)]
    const capabilityOptionKeys = unique([
      ...allCapabilityKeys,
      ...(override.allowCapabilities || []),
      ...(override.denyCapabilities || []),
    ])

    setRouteSelections(toSelectionMap(routeOptionKeys, override.allowRoutes, override.denyRoutes))
    setCapabilitySelections(toSelectionMap(capabilityOptionKeys, override.allowCapabilities, override.denyCapabilities))
    setConstraintDraft(buildConstraintDraft(activeCatalog?.constraints || [], override.constraints || []))
  }, [])

  const loadUserDetail = useCallback(async (userId, activeCatalog = catalog) => {
    if (!userId || !canViewAuthz) return

    setLoadingDetail(true)
    setModalError("")

    try {
      const response = await authzApi.getUserAuthz(userId)
      if (!response?.success) {
        throw new Error(response?.message || "Failed to load user AuthZ")
      }

      const userData = response.data || null
      setSelectedUserData(userData)
      initializeEditorDraft(userData, activeCatalog)
    } catch (err) {
      setModalError(err.message || "Failed to load user AuthZ")
    } finally {
      setLoadingDetail(false)
    }
  }, [canViewAuthz, catalog, initializeEditorDraft])

  useEffect(() => {
    fetchCatalog()
  }, [fetchCatalog])

  useEffect(() => {
    fetchUsers(pagination.page)
  }, [fetchUsers, pagination.page])

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return students

    return students.filter((student) => {
      const name = String(student?.name || "").toLowerCase()
      const email = String(student?.email || "").toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }, [search, students])

  const openEditor = async (userId) => {
    let activeCatalog = catalog

    if (!activeCatalog) {
      activeCatalog = await fetchCatalog()
      if (!activeCatalog) return
    }

    setIsModalOpen(true)
    setSelectedUserData(null)
    setReason("")
    setRouteSelections({})
    setCapabilitySelections({})
    setConstraintDraft({})

    await loadUserDetail(userId, activeCatalog)
  }

  const handleSaveOverride = async () => {
    if (!selectedUserData?.user?._id || !canUpdateAuthz) return

    setSaving(true)
    setModalError("")

    try {
      const allowRoutes = Object.entries(routeSelections)
        .filter(([, value]) => value === OVERRIDE_MODE.ALLOW)
        .map(([key]) => key)
      const denyRoutes = Object.entries(routeSelections)
        .filter(([, value]) => value === OVERRIDE_MODE.DENY)
        .map(([key]) => key)

      const allowCapabilities = Object.entries(capabilitySelections)
        .filter(([, value]) => value === OVERRIDE_MODE.ALLOW)
        .map(([key]) => key)
      const denyCapabilities = Object.entries(capabilitySelections)
        .filter(([, value]) => value === OVERRIDE_MODE.DENY)
        .map(([key]) => key)

      const constraints = []
      for (const [key, item] of Object.entries(constraintDraft || {})) {
        if (!item?.enabled) continue

        try {
          const parsedValue = parseConstraintValue(item.valueType, item.rawValue)
          constraints.push({ key, value: parsedValue })
        } catch (err) {
          throw new Error(`${item.label || key}: ${err.message}`)
        }
      }

      const response = await authzApi.updateUserAuthz(selectedUserData.user._id, {
        override: {
          allowRoutes,
          denyRoutes,
          allowCapabilities,
          denyCapabilities,
          constraints,
        },
        reason: reason.trim() || null,
      })

      if (!response?.success) {
        throw new Error(response?.message || "Failed to save AuthZ override")
      }

      await Promise.all([
        loadUserDetail(selectedUserData.user._id, catalog),
        fetchUsers(pagination.page),
      ])

      setReason("")
    } catch (err) {
      setModalError(err.message || "Failed to save AuthZ override")
    } finally {
      setSaving(false)
    }
  }

  const handleResetOverride = async () => {
    if (!selectedUserData?.user?._id || !canUpdateAuthz) return

    const confirmed = window.confirm("Reset all AuthZ overrides for this user?")
    if (!confirmed) return

    setSaving(true)
    setModalError("")

    try {
      const response = await authzApi.resetUserAuthz(selectedUserData.user._id, {
        reason: reason.trim() || null,
      })

      if (!response?.success) {
        throw new Error(response?.message || "Failed to reset AuthZ override")
      }

      await Promise.all([
        loadUserDetail(selectedUserData.user._id, catalog),
        fetchUsers(pagination.page),
      ])

      setReason("")
    } catch (err) {
      setModalError(err.message || "Failed to reset AuthZ override")
    } finally {
      setSaving(false)
    }
  }

  const openHelpModal = () => setIsHelpOpen(true)
  const openHelpPage = () => navigate("/super-admin/authz/help")

  const columns = [
    {
      header: "User",
      key: "name",
      render: (student) => (
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-primary)]">{student.name}</div>
          <div className="text-xs text-[var(--color-text-muted)]">{student.email}</div>
        </div>
      ),
    },
    {
      header: "Role",
      key: "role",
      render: (student) => (
        <span className="text-sm text-[var(--color-text-secondary)]">{student.role}</span>
      ),
    },
    {
      header: "Override",
      key: "override",
      render: (student) => {
        const override = student?.authz?.override || {}
        const routeCount = (override.allowRoutes || []).length + (override.denyRoutes || []).length
        const capabilityCount = (override.allowCapabilities || []).length + (override.denyCapabilities || []).length
        const constraintCount = (override.constraints || []).length

        return (
          <span className="text-xs text-[var(--color-text-muted)]">
            routes: {routeCount} • capabilities: {capabilityCount} • constraints: {constraintCount}
          </span>
        )
      },
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (student) => (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={() => openEditor(student._id)}
            disabled={loadingCatalog || loadingStudents}
          >
            <FaSlidersH /> Configure
          </Button>
        </div>
      ),
    },
  ]

  if (!canViewAuthz) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <Card>
          <Card.Body className="p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Access Denied</h2>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">You do not have capability `cap.authz.view`.</p>
          </Card.Body>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Non-Student AuthZ Management</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Super Admin can configure Layer-3 route, capability, and constraint overrides for non-student users.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={openHelpModal}>Help</Button>
          <Button variant="secondary" size="sm" onClick={openHelpPage}>Open Help Page</Button>
        </div>
      </header>

      {pageError ? (
        <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-danger)] bg-[var(--color-danger-bg-light)] px-4 py-3 text-sm text-[var(--color-danger)]">
          {pageError}
        </div>
      ) : null}

      <Card>
        <Card.Body className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[var(--color-text-muted)]">Role</label>
              <select
                className="h-10 rounded-[var(--radius-input)] border border-[var(--color-border-input)] bg-[var(--color-bg-primary)] px-3 text-sm"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value)
                  setPagination((prev) => ({ ...prev, page: 1 }))
                }}
              >
                {NON_STUDENT_ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-sm text-[var(--color-text-muted)]">
              {loadingStudents ? "Loading users..." : `${pagination.total} known non-student users`} • page {pagination.page}/{Math.max(pagination.pages || 1, 1)}
            </div>
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name or email"
              className="w-full sm:w-80"
            />
          </div>

          {loadingStudents && students.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">Loading users...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--color-text-muted)]">
              <FaUserShield className="mx-auto mb-2 text-xl text-[var(--color-text-muted)]" />
              No users found on this page.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredStudents}
              emptyMessage="No users found"
              isLoading={loadingStudents}
            />
          )}

          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page <= 1 || loadingStudents}
              onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
            >
              Prev
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page >= (pagination.pages || 1) || loadingStudents}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        </Card.Body>
      </Card>

      <StudentAuthzEditorModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedUserData(null)
          setModalError("")
        }}
        catalog={catalog}
        userData={selectedUserData}
        routeSelections={routeSelections}
        setRouteSelections={setRouteSelections}
        capabilitySelections={capabilitySelections}
        setCapabilitySelections={setCapabilitySelections}
        constraintDraft={constraintDraft}
        setConstraintDraft={setConstraintDraft}
        reason={reason}
        setReason={setReason}
        onSave={handleSaveOverride}
        onReset={handleResetOverride}
        onHelpClick={openHelpModal}
        onHelpPageClick={openHelpPage}
        saving={saving}
        loading={loadingDetail}
        canUpdate={canUpdateAuthz}
        error={modalError}
      />

      {isHelpOpen ? (
        <Modal title="AuthZ Management Help" onClose={() => setIsHelpOpen(false)} width={960}>
          <AuthzFieldGuide catalog={catalog} />
        </Modal>
      ) : null}
    </div>
  )
}

export default AuthzManagementPage
