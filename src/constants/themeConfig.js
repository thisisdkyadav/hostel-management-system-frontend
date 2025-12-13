/**
 * Theme Colors Configuration
 * 
 * Central place to define all colors used across the application.
 * Update these values to change colors throughout the app.
 */

// Main brand colors
export const brand = {
  primary: "#0b57d0",       // Main theme color
  primaryHover: "#0e4eb5",  // Hover state
  primaryLight: "#e8f0fe",  // Light background
  primaryDark: "#0842a0",   // Darker shade
}

export const colors = {
  // Primary brand color
  primary: {
    50: "#e8f0fe",
    100: "#d2e3fc",
    200: "#a8c7fa",
    300: "#7cacf8",
    400: "#4c8df6",
    500: "#0b57d0",  // Main
    600: "#0e4eb5",  // Hover
    700: "#0842a0",
    800: "#063b8a",
    900: "#042f6e",
    main: "#0b57d0",
  },

  // Secondary color
  secondary: {
    50: "#f0f9ff",
    100: "#e0f2fe",
    light: "#e8f0fe",
    main: "#0b57d0",
  },

  // Status colors
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },

  danger: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },

  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },

  // Neutral colors
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
}

// Tailwind-compatible color classes
// Using custom colors via inline styles where needed
export const colorClasses = {
  primary: {
    bg: "bg-[#0b57d0]",
    bgHover: "hover:bg-[#0e4eb5]",
    bgLight: "bg-[#e8f0fe]",
    text: "text-[#0b57d0]",
    textHover: "hover:text-[#0e4eb5]",
    border: "border-[#0b57d0]",
    ring: "ring-[#0b57d0]",
  },

  secondary: {
    bg: "bg-[#e8f0fe]",
    bgHover: "hover:bg-[#d2e3fc]",
    text: "text-[#0b57d0]",
    border: "border-[#d2e3fc]",
  },

  success: {
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-700",
    bgLight: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
    ring: "ring-emerald-500",
  },

  danger: {
    bg: "bg-red-600",
    bgHover: "hover:bg-red-700",
    bgLight: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
    ring: "ring-red-500",
  },

  white: {
    bg: "bg-white",
    bgHover: "hover:bg-gray-50",
    text: "text-gray-700",
    textHover: "hover:text-gray-900",
    border: "border-gray-200",
    borderHover: "hover:border-gray-300",
    ring: "ring-gray-400",
  },

  ghost: {
    bg: "bg-transparent",
    bgHover: "hover:bg-gray-100",
    text: "text-gray-600",
    textHover: "hover:text-gray-900",
    ring: "ring-gray-400",
  },
}

export default { colors, colorClasses, brand }
