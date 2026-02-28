import { useMemo, useState } from "react"
import { Button, Modal } from "czero/react"
import { Card, SearchInput } from "@/components/ui"
import { getFilteredHintKeysFromCatalog } from "../../utils/authzRouteCapabilityHints"

const normalize = (value = "") => String(value || "").trim().toLowerCase()

const getDefaultRolesForRoute = (catalog, routeKey) => {
  const roleDefaults = catalog?.roleDefaults?.routeAccess || {}
  return Object.entries(roleDefaults)
    .filter(([, routeKeys]) => Array.isArray(routeKeys) && routeKeys.includes(routeKey))
    .map(([role]) => role)
}

const getConstraintPlainLanguage = (constraint) => {
  const type = constraint?.valueType
  const label = constraint?.label || constraint?.key

  if (type === "boolean") {
    return `${label}: turn override ON only when this user needs a different true/false behavior than role default.`
  }
  if (type === "number") {
    return `${label}: set a numeric limit/value for this user. Keep override OFF to use role default.`
  }
  if (type === "string") {
    return `${label}: set a custom text value for this user only.`
  }
  if (type === "string_array" || type === "string[]") {
    return `${label}: provide a JSON array of strings, for example ["A", "B"].`
  }
  if (type === "number_array" || type === "number[]") {
    return `${label}: provide a JSON array of numbers, for example [1, 2, 3].`
  }
  if (type === "object") {
    return `${label}: provide a JSON object, for example {"limit": 10}.`
  }
  return `${label}: override only when this user needs custom behavior.`
}

const AuthzFieldGuide = ({ catalog = null }) => {
  const [routeSearch, setRouteSearch] = useState("")
  const [capabilitySearch, setCapabilitySearch] = useState("")
  const [constraintSearch, setConstraintSearch] = useState("")
  const [selectedRouteKey, setSelectedRouteKey] = useState(null)

  const routeItems = useMemo(() => {
    const routes = Array.isArray(catalog?.routes) ? catalog.routes : []
    return [...routes].sort((a, b) => String(a.label || a.key).localeCompare(String(b.label || b.key)))
  }, [catalog])

  const capabilityItems = useMemo(() => {
    const capabilities = Array.isArray(catalog?.capabilities) ? catalog.capabilities : []
    return [...capabilities].sort((a, b) => String(a.label || a.key).localeCompare(String(b.label || b.key)))
  }, [catalog])

  const constraintItems = useMemo(() => {
    const constraints = Array.isArray(catalog?.constraints) ? catalog.constraints : []
    return [...constraints].sort((a, b) => String(a.label || a.key).localeCompare(String(b.label || b.key)))
  }, [catalog])

  const filteredRoutes = useMemo(() => {
    const term = normalize(routeSearch)
    if (!term) return routeItems
    return routeItems.filter((item) => {
      const haystack = `${item.key} ${item.label} ${(item.paths || []).join(" ")}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [routeItems, routeSearch])

  const filteredCapabilities = useMemo(() => {
    const term = normalize(capabilitySearch)
    if (!term) return capabilityItems
    return capabilityItems.filter((item) => `${item.key} ${item.label}`.toLowerCase().includes(term))
  }, [capabilityItems, capabilitySearch])

  const filteredConstraints = useMemo(() => {
    const term = normalize(constraintSearch)
    if (!term) return constraintItems
    return constraintItems.filter((item) => `${item.key} ${item.label}`.toLowerCase().includes(term))
  }, [constraintItems, constraintSearch])

  const selectedRoute = useMemo(
    () => routeItems.find((item) => item.key === selectedRouteKey) || null,
    [routeItems, selectedRouteKey]
  )

  const selectedRouteCapabilities = useMemo(
    () => getFilteredHintKeysFromCatalog(
      selectedRoute?.key,
      selectedRoute?.label || "",
      catalog?.capabilities || []
    ),
    [catalog, selectedRoute]
  )

  const selectedRouteDefaultRoles = useMemo(
    () => getDefaultRolesForRoute(catalog, selectedRoute?.key),
    [catalog, selectedRoute]
  )

  return (
    <div className="space-y-4">
      <Card>
        <Card.Body className="p-4 space-y-2">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Simple Editing Flow</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-6">
            Step 1: choose route access (Default / Allow / Deny). Step 2: configure capabilities only if that route is enabled.
            Step 3: apply constraints only when this user needs custom limits.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] leading-6">
            Default uses role defaults. Allow forces ON for this user. Deny forces OFF for this user.
          </p>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Route-Wise Help</h3>
            <SearchInput
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              placeholder="Search route name / key / path"
              className="w-full sm:w-96"
            />
          </div>
          <div className="max-h-[24rem] overflow-auto rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)]">
            {filteredRoutes.map((route) => (
              <div key={route.key} className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-center border-b border-[var(--color-border-light)] px-3 py-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--color-text-primary)]">{route.label}</div>
                  <div className="text-[11px] font-mono text-[var(--color-text-muted)]">{route.key}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mt-1">
                    Paths: {(route.paths || []).join(", ") || "-"}
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => setSelectedRouteKey(route.key)}>
                  View Details
                </Button>
              </div>
            ))}
            {filteredRoutes.length === 0 ? (
              <div className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">No routes match the search.</div>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Capability Keys</h3>
            <SearchInput
              value={capabilitySearch}
              onChange={(e) => setCapabilitySearch(e.target.value)}
              placeholder="Search capability name / key"
              className="w-full sm:w-96"
            />
          </div>
          <div className="max-h-[20rem] overflow-auto rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)]">
            {filteredCapabilities.map((item) => (
              <div key={item.key} className="border-b border-[var(--color-border-light)] px-3 py-2">
                <div className="text-sm text-[var(--color-text-primary)]">{item.label}</div>
                <div className="text-[11px] font-mono text-[var(--color-text-muted)]">{item.key}</div>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Constraint Fields (Clear Meaning)</h3>
            <SearchInput
              value={constraintSearch}
              onChange={(e) => setConstraintSearch(e.target.value)}
              placeholder="Search constraint name / key"
              className="w-full sm:w-96"
            />
          </div>
          <div className="space-y-2">
            {filteredConstraints.map((item) => (
              <div key={item.key} className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] p-3">
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">{item.label}</div>
                <div className="text-[11px] font-mono text-[var(--color-text-muted)]">{item.key} ({item.valueType})</div>
                <div className="text-xs text-[var(--color-text-muted)] mt-2 leading-5">
                  {getConstraintPlainLanguage(item)}
                </div>
                <div className="text-xs text-[var(--color-text-muted)] mt-1">
                  Default value: <span className="font-mono">{JSON.stringify(item.defaultValue)}</span>
                </div>
              </div>
            ))}
            {filteredConstraints.length === 0 ? (
              <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] p-3 text-sm text-[var(--color-text-muted)] text-center">
                No constraints match the search.
              </div>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      {selectedRoute ? (
        <Modal title={`Route Details: ${selectedRoute.label}`} onClose={() => setSelectedRouteKey(null)} width={860}>
          <div className="space-y-3">
            <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-primary)] bg-[var(--color-bg-secondary)] p-3">
              <div className="text-xs text-[var(--color-text-muted)]">Route Key</div>
              <div className="text-sm font-mono text-[var(--color-text-primary)]">{selectedRoute.key}</div>
              <div className="text-xs text-[var(--color-text-muted)] mt-2">
                Paths: {(selectedRoute.paths || []).join(", ") || "-"}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-1">
                Default allowed roles: {selectedRouteDefaultRoles.length > 0 ? selectedRouteDefaultRoles.join(", ") : "None"}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Related Capabilities</div>
              {selectedRouteCapabilities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedRouteCapabilities.map((key) => (
                    <div key={key} className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] px-3 py-2">
                      <div className="text-xs font-mono text-[var(--color-text-secondary)]">{key}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] px-3 py-2 text-xs text-[var(--color-text-muted)]">
                  No direct capability hint found. Use advanced capability search in the editor when needed.
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRouteKey(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  )
}

export default AuthzFieldGuide
