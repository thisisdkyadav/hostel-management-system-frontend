/**
 * UI Components - Main Export
 * 
 * This is the main entry point for all UI components.
 * Import from '@/components/ui' for cleaner imports.
 * 
 * @example
 * import { Select, Card } from '@/components/ui'
 */

// ==============================================
// FORM COMPONENTS
// ==============================================
export { default as Select } from './form/Select'
export { default as Textarea } from './form/Textarea'
export { default as Checkbox } from './form/Checkbox'
export { default as Radio } from './form/Radio'
export { default as RadioGroup } from './form/RadioGroup'
export { default as Switch } from './form/Switch'
export { default as FileInput } from './form/FileInput'
export { default as SearchInput } from './form/SearchInput'
export { default as DatePicker } from './form/DatePicker'
export { default as Label } from './form/Label'
export { default as FormField } from './form/FormField'

// ==============================================
// BUTTON COMPONENTS
// ==============================================
export { default as Button } from './button/Button'
export { default as IconButton } from './button/IconButton'
export { default as ButtonGroup } from './button/ButtonGroup'
export { default as ToggleButtonGroup } from './button/ToggleButtonGroup'

// ==============================================
// LAYOUT COMPONENTS
// ==============================================
export { default as Card, CardHeader, CardTitle, CardDescription, CardContent, CardBody, CardFooter } from './layout/Card'
export { default as Container } from './layout/Container'
export { default as Stack, HStack, VStack } from './layout/Stack'
export { default as Divider } from './layout/Divider'
export { default as Spacer } from './layout/Spacer'

// ==============================================
// FEEDBACK COMPONENTS
// ==============================================
export { default as Toast, useToast, ToastProvider } from './feedback/Toast'
export { default as Alert } from './feedback/Alert'
export { default as Spinner } from './feedback/Spinner'
export { default as Skeleton, SkeletonText, SkeletonCircle, SkeletonCard } from './feedback/Skeleton'
export { default as Progress } from './feedback/Progress'
export { default as LoadingState } from './feedback/LoadingState'
export { default as ErrorState } from './feedback/ErrorState'
export { default as EmptyState } from './feedback/EmptyState'

// ==============================================
// DATA DISPLAY COMPONENTS
// ==============================================
export { default as Badge } from './data-display/Badge'
export { default as Avatar, AvatarGroup } from './data-display/Avatar'
export { default as Tag } from './data-display/Tag'
export { default as StatCards, StatCard } from './data-display/StatCard'
export { default as CompactStudentTag, StudentTagGroup } from './data-display/CompactStudentTag'

// ==============================================
// NAVIGATION COMPONENTS
// ==============================================
export { default as Pagination } from './navigation/Pagination'
export { default as Breadcrumb } from './navigation/Breadcrumb'
export { default as StepIndicator } from './navigation/StepIndicator'

// ==============================================
// OVERLAY COMPONENTS
// ==============================================
export { default as Tooltip } from './overlay/Tooltip'
export { default as Popover } from './overlay/Popover'
export { default as Drawer } from './overlay/Drawer'
export { default as ConfirmDialog } from './overlay/ConfirmDialog'

// ==============================================
// TABLE COMPONENTS
// ==============================================

// ==============================================
// TYPOGRAPHY COMPONENTS
// ==============================================
export { default as Heading } from './typography/Heading'
export { default as Text } from './typography/Text'
