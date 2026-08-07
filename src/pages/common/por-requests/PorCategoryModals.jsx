import { Building2, Plus, Trash2 } from "lucide-react"
import { DataTable, Button, Input } from "hzero"
import { EmptyState, Field, Grid, HStack, Label, Modal, Select, Surface, Text, VStack } from "@/components/ui"
import { infoBoxStyle, sectionLabelStyle } from "@/components/gymkhana/events-page/sharedPrimitives"

export const PorCategoryFormModal = ({
  isOpen,
  isSaving,
  formData,
  reviewerOptions,
  onChangeName,
  onChangeStepLabel,
  onSelectReviewer,
  onAddReviewer,
  onRemoveReviewer,
  onAddStep,
  onRemoveStep,
  onClose,
  onSubmit,
  isEdit = false,
}) => {
  if (!isOpen) return null

  const reviewerOptionMap = new Map(
    (Array.isArray(reviewerOptions) ? reviewerOptions : []).map((option) => [option.id, option])
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit POR Category" : "Create POR Category"}
      width={980}
      minHeight="50vh"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit?.()
        }}
        className="flex min-h-[42vh] flex-col justify-between gap-6"
      >
        <div className="space-y-5">
          <Field label="Category Name" htmlFor="por-category-name" required>
            <Input
              id="por-category-name"
              value={formData.name}
              onChange={(event) => onChangeName?.(event.target.value)}
              placeholder="e.g. Technical Council"
              disabled={isSaving}
              required
            />
          </Field>

          <div className="space-y-4">
            <HStack align="center" justify="between" gap={3}>
              <div>
                <Text as="div" size="sm" weight="semibold" color="heading">
                  Gymkhana Review Steps
                </Text>
                <Text as="div" size="sm" color="muted" style={{ marginTop: "4px" }}>
                  Add one or more Gymkhana stages that should recommend the POR before Office - Student Affairs.
                </Text>
              </div>

              <Button type="button" variant="secondary" onClick={onAddStep} disabled={isSaving}>
                <Plus size={16} />
                Add Step
              </Button>
            </HStack>

            <div className="space-y-4">
              {(Array.isArray(formData.gymkhanaSteps) ? formData.gymkhanaSteps : []).map((step, stepIndex) => {
                const selectedReviewerIds = Array.isArray(step.reviewerUserIds) ? step.reviewerUserIds : []
                const selectedReviewers = selectedReviewerIds
                  .map((reviewerId) => reviewerOptionMap.get(reviewerId))
                  .filter(Boolean)
                const availableReviewerOptions = (Array.isArray(reviewerOptions) ? reviewerOptions : [])
                  .filter((option) => !selectedReviewerIds.includes(option.id))
                  .map((option) => ({
                    value: option.id,
                    label: option.label,
                  }))

                return (
                  <Surface bg="secondary" padding={4} radius="card-sm" border="1px solid var(--color-border-primary)" key={`por-category-step-${stepIndex}`}>
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                      <div className="space-y-4">
                        <Field label={<>Step {stepIndex + 1} Label</>} htmlFor={`por-category-step-label-${stepIndex}`} required>
                          <Input
                            id={`por-category-step-label-${stepIndex}`}
                            value={step.label}
                            onChange={(event) => onChangeStepLabel?.(stepIndex, event.target.value)}
                            placeholder={`Gymkhana Step ${stepIndex + 1}`}
                            disabled={isSaving}
                            required
                          />
                        </Field>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
                          <Field label="Add Gymkhana Reviewer" htmlFor={`por-category-step-reviewer-${stepIndex}`}>
                            <Select
                              id={`por-category-step-reviewer-${stepIndex}`}
                              value={step.reviewerPickerId || ""}
                              onChange={(event) => onSelectReviewer?.(stepIndex, event.target.value)}
                              options={availableReviewerOptions}
                              placeholder="Select reviewer"
                              disabled={isSaving}
                            />
                          </Field>
                          <Button
                            type="button"
                            variant="secondary"
                            onClick={() => onAddReviewer?.(stepIndex)}
                            disabled={isSaving || !step.reviewerPickerId}
                          >
                            Add Reviewer
                          </Button>
                        </div>

                        <div style={infoBoxStyle}>
                          <span style={sectionLabelStyle}>Assigned Reviewers</span>
                          {selectedReviewers.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {selectedReviewers.map((reviewer) => (
                                <div
                                  key={`${reviewer.id}-${stepIndex}`}
                                  className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-border-primary)] bg-[var(--color-bg-primary)] px-3 py-2"
                                >
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                                      {reviewer.name}
                                    </div>
                                    <div className="truncate text-xs text-[var(--color-text-muted)]">
                                      {reviewer.email}
                                    </div>
                                    <div className="mt-1 text-[11px] text-[var(--color-text-placeholder)]">
                                      {reviewer.subRole || reviewer.role}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onRemoveReviewer?.(stepIndex, reviewer.id)}
                                    disabled={isSaving}
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                              Select at least one Gymkhana user for this step.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveStep?.(stepIndex)}
                          disabled={isSaving || (formData.gymkhanaSteps?.length || 0) <= 1}
                        >
                          <Trash2 size={14} />
                          Remove Step
                        </Button>
                      </div>
                    </div>
                  </Surface>
                )
              })}
            </div>
          </div>
        </div>

        <HStack justify="end" gap={3}>
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="button" onClick={() => onSubmit?.()} loading={isSaving} disabled={isSaving}>
            {isEdit ? "Save Category" : "Create Category"}
          </Button>
        </HStack>
      </form>
    </Modal>
  )
}

export const PorCategoryManagementModal = ({
  isOpen,
  categories,
  onClose,
  onAdd,
  onEdit,
}) => {
  if (!isOpen) return null

  const categoryRows = Array.isArray(categories) ? categories : []
  const categoryColumns = [
    {
      header: "Category",
      key: "name",
      render: (category) => (
        <Grid cols={1} gap="4px">
          <Text as="div" weight="medium" color="primary">
            {category.name || "—"}
          </Text>
          <Text as="div" size="sm" color="muted">
            {(category.gymkhanaSteps?.length || category.stepCount || 0)} Gymkhana step
            {(category.gymkhanaSteps?.length || category.stepCount || 0) === 1 ? "" : "s"}
          </Text>
        </Grid>
      ),
    },
    {
      header: "Review Flow",
      key: "steps",
      render: (category) => (
        <Grid cols={1} gap="4px">
          {(Array.isArray(category.gymkhanaSteps) ? category.gymkhanaSteps : []).map((step, index) => (
            <Text as="div" size="sm" color="muted" key={`${category.id}-table-step-${index}`}>
              {index + 1}. {step.label || "Step"}
            </Text>
          ))}
        </Grid>
      ),
    },
    {
      header: "Reviewers",
      key: "reviewers",
      render: (category) => {
        const reviewerCount = (Array.isArray(category.gymkhanaSteps) ? category.gymkhanaSteps : []).reduce(
          (count, step) => count + (Array.isArray(step.reviewers) ? step.reviewers.length : Array.isArray(step.reviewerUserIds) ? step.reviewerUserIds.length : 0),
          0
        )

        return reviewerCount || "—"
      },
    },
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage POR Categories"
      width={1080}
      minHeight="50vh"
    >
      <VStack gap={5} className="min-h-[42vh]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="text-sm text-[var(--color-text-muted)]">
              Create categories and define the ordered Gymkhana review flow before Office - Student Affairs.
            </div>
          </div>
          <div className="flex justify-start lg:justify-end">
            <Button onClick={onAdd}>
              <Plus size={16} />
              Add Category
            </Button>
          </div>
        </div>
        {categoryRows.length > 0 ? (
          <DataTable
            columns={categoryColumns}
            data={categoryRows}
            loading={false}
            emptyMessage="No POR categories added yet."
            onRowClick={onEdit}
          />
        ) : (
          <EmptyState
            icon={Building2}
            title="No POR Categories Yet"
            message="Create the first POR category to define how Gymkhana recommendations should flow before Student Affairs."
          />
        )}
      </VStack>
    </Modal>
  )
}
