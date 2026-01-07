// Main barrel export for all pages

// Auth pages (public/login)
export * from './auth'

// Common pages (shared across roles)
export * from './common'

// Role-specific pages
export * as AdminPages from './admin'
export * as GuardPages from './guard'
export * as MaintenancePages from './maintenance'
export * as StudentPages from './student'
export * as SuperAdminPages from './superadmin'
export * as WardenPages from './warden'

// Utility pages
export { default as NotFoundPage } from './NotFoundPage'
export { default as LoadingPage } from './LoadingPage'
