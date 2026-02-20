import { useMemo, useState } from "react"
import { Card, SearchInput } from "@/components/ui"

const KeyRow = ({ title, keyName, description, extra = null }) => (
  <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] bg-[var(--color-bg-primary)] p-3">
    <div className="text-sm font-semibold text-[var(--color-text-primary)]">{title}</div>
    <div className="mt-1 text-[11px] font-mono text-[var(--color-text-muted)]">{keyName}</div>
    {extra ? <div className="mt-1 text-xs text-[var(--color-text-muted)]">{extra}</div> : null}
    <div className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">{description}</div>
  </div>
)

const normalize = (value = "") => String(value || "").trim().toLowerCase()

const getRouteEffectText = (label) =>
  `Default keeps role default route access for this key. Allow explicitly grants access to ${label}. Deny explicitly blocks ${label} for this user.`

const getCapabilityEffectText = (label) =>
  `Default keeps role default capability for this key. Allow enables ${label} actions anywhere this capability is checked. Deny blocks ${label} actions and related API operations.`

const getConstraintEffectText = (valueType) =>
  `Override checkbox OFF keeps role/default value. Override checkbox ON applies the entered value for this user. Value type expected: ${valueType}.`

const AuthzFieldGuide = ({ catalog = null }) => {
  const [routeSearch, setRouteSearch] = useState("")
  const [capabilitySearch, setCapabilitySearch] = useState("")
  const [constraintSearch, setConstraintSearch] = useState("")

  const routeItems = useMemo(() => {
    const routes = Array.isArray(catalog?.routes) ? catalog.routes : []
    return [...routes].sort((a, b) => String(a.key).localeCompare(String(b.key)))
  }, [catalog])

  const capabilityItems = useMemo(() => {
    const capabilities = Array.isArray(catalog?.capabilities) ? catalog.capabilities : []
    const sorted = [...capabilities].sort((a, b) => String(a.key).localeCompare(String(b.key)))

    return [
      {
        key: "*",
        label: "Wildcard Capability",
        description: "Special capability key that represents broad capability access.",
      },
      ...sorted,
    ]
  }, [catalog])

  const constraintItems = useMemo(() => {
    const constraints = Array.isArray(catalog?.constraints) ? catalog.constraints : []
    return [...constraints].sort((a, b) => String(a.key).localeCompare(String(b.key)))
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

    return capabilityItems.filter((item) => {
      const haystack = `${item.key} ${item.label} ${item.description || ""}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [capabilityItems, capabilitySearch])

  const filteredConstraints = useMemo(() => {
    const term = normalize(constraintSearch)
    if (!term) return constraintItems

    return constraintItems.filter((item) => {
      const haystack = `${item.key} ${item.label} ${item.valueType}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [constraintItems, constraintSearch])

  return (
    <div className="space-y-4">
      <Card>
        <Card.Body className="p-4 space-y-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">How This Screen Works</h2>
          <p className="text-sm text-[var(--color-text-muted)] leading-6">
            This screen edits per-user Layer-3 AuthZ override. Role authorization still runs first. Override is additive and
            takes effect on top of role defaults.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] leading-6">
            Value behavior for route/capability selectors: Default = keep role default value, Allow = force true, Deny = force
            false.
          </p>
          <div className="text-xs text-[var(--color-text-muted)]">
            Catalog snapshot: routes {routeItems.length}, capabilities {Math.max(capabilityItems.length - 1, 0)}, constraints {constraintItems.length}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Main Page Fields</h3>
          <KeyRow
            title="Role"
            keyName="roleFilter"
            description="Filters user list by role. All Non-Students excludes Student role and shows all other roles."
          />
          <KeyRow
            title="Search user by name or email"
            keyName="search"
            description="Client-side filter over current list page using name/email contains match."
          />
          <KeyRow
            title="User / Role / Override columns"
            keyName="table"
            description="Shows identity, role, and explicit override counts to quickly identify who has custom authz changes."
          />
          <KeyRow
            title="Configure"
            keyName="openEditor"
            description="Opens popup editor and loads current override + effective merged authorization for that user."
          />
          <KeyRow
            title="Prev / Next"
            keyName="pagination"
            description="Moves server-backed pages for the selected role filter."
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Popup Core Fields</h3>
          <KeyRow
            title="Override Draft"
            keyName="draftSummary"
            description="Live count of unsaved override entries in this popup session."
          />
          <KeyRow
            title="Current Effective Access"
            keyName="effectiveSummary"
            description="Current merged authz for this user (role defaults + persisted override)."
          />
          <KeyRow
            title="Reason"
            keyName="reason"
            description="Optional audit reason attached to update/reset actions."
          />
          <KeyRow
            title="Save Changes / Reset Override"
            keyName="actions"
            description="Save validates and persists override. Reset clears explicit override and returns behavior to role defaults."
          />
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Route Fields (Each Route Key)</h3>
            <SearchInput
              value={routeSearch}
              onChange={(e) => setRouteSearch(e.target.value)}
              placeholder="Search route key / label / path"
              className="w-full sm:w-96"
            />
          </div>

          <div className="max-h-[24rem] overflow-auto space-y-2">
            {filteredRoutes.map((item) => (
              <KeyRow
                key={item.key}
                title={item.label}
                keyName={item.key}
                extra={`Paths: ${(item.paths || []).join(", ") || "-"}`}
                description={getRouteEffectText(item.label)}
              />
            ))}

            {filteredRoutes.length === 0 ? (
              <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] p-3 text-sm text-[var(--color-text-muted)] text-center">
                No route fields match the search.
              </div>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Capability Fields (Each Capability Key)</h3>
            <SearchInput
              value={capabilitySearch}
              onChange={(e) => setCapabilitySearch(e.target.value)}
              placeholder="Search capability key / label"
              className="w-full sm:w-96"
            />
          </div>

          <div className="max-h-[24rem] overflow-auto space-y-2">
            {filteredCapabilities.map((item) => (
              <KeyRow
                key={item.key}
                title={item.label}
                keyName={item.key}
                extra={item.description || null}
                description={getCapabilityEffectText(item.label)}
              />
            ))}

            {filteredCapabilities.length === 0 ? (
              <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] p-3 text-sm text-[var(--color-text-muted)] text-center">
                No capability fields match the search.
              </div>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Constraint Fields and Checkboxes</h3>
            <SearchInput
              value={constraintSearch}
              onChange={(e) => setConstraintSearch(e.target.value)}
              placeholder="Search constraint key / label"
              className="w-full sm:w-96"
            />
          </div>

          <div className="max-h-[24rem] overflow-auto space-y-2">
            {filteredConstraints.map((item) => (
              <KeyRow
                key={item.key}
                title={item.label}
                keyName={item.key}
                extra={`Value type: ${item.valueType} | Default value: ${JSON.stringify(item.defaultValue)}`}
                description={getConstraintEffectText(item.valueType)}
              />
            ))}

            {filteredConstraints.length === 0 ? (
              <div className="rounded-[var(--radius-card-sm)] border border-[var(--color-border-light)] p-3 text-sm text-[var(--color-text-muted)] text-center">
                No constraint fields match the search.
              </div>
            ) : null}
          </div>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body className="p-4 space-y-2">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">Practical Notes</h3>
          <p className="text-sm text-[var(--color-text-muted)] leading-6">
            Some features use OR checks across capabilities. Example: student list can pass via either
            <span className="font-mono"> cap.students.list.view </span> or
            <span className="font-mono"> cap.students.view</span>. Denying one key may still allow access through another key.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] leading-6">
            Existing hardcoded frontend restrictions still apply unless the corresponding UI logic is changed.
          </p>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AuthzFieldGuide
