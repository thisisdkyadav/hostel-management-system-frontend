export {
  CALENDAR_DAY_BORDER,
  CALENDAR_DAY_TINT,
  CALENDAR_STATUS_TO_APPROVER,
  CALENDAR_WEEKDAY_LABELS,
  DEFAULT_CATEGORY_DEFINITIONS,
  DEFAULT_CATEGORY_KEY,
  ORGANISING_UNIT_OPTIONS,
  POST_STUDENT_AFFAIRS_STAGE_OPTIONS,
  PROGRAMME_MODE_OPTIONS,
  PROGRAMME_TYPE_OPTIONS,
  PROPOSAL_STATUS_TO_APPROVER,
  REGISTRATION_CATEGORIES,
  VALID_OBJECT_ID_REGEX,
  createDefaultOverlapState,
  formatDateKey,
  formatDateRange,
  getCategoryBadgeStyle,
  getCategoryColor,
  getDateConflicts,
  getEventStatusVariant,
  getCalendarCategoryDefinitions,
  getBudgetSummary,
  normalizeEvent,
  normalizeEventId,
  rangesOverlap,
  startOfDay,
  toDate,
} from "./events-page/shared"

import {
  getCategoryColor,
  getCategoryLabelsMap,
  getCategoryOptions,
  getCategoryOrder,
} from "./events-page/shared"

export const CATEGORY_OPTIONS = getCategoryOptions()
export const CATEGORY_LABELS = getCategoryLabelsMap()
export const CATEGORY_ORDER = getCategoryOrder()
export const CATEGORY_COLORS = CATEGORY_ORDER.reduce((colors, category) => {
  colors[category] = getCategoryColor(category)
  return colors
}, {})
