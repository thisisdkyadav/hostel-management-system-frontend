// CZero Configuration
// Generated from theme.css for Hostel Management System
// This maps your existing theme variables to CZero's design system

export default {
  // ═══════════════════════════════════════════════════
  // GLOBAL DESIGN TOKENS
  // ═══════════════════════════════════════════════════

  color: {
    // Background colors
    bg: { 
      light: "0 0% 100%",          // #FFFFFF
      dark: "0 0% 10%"             // #1A1A1A
    },
    
    // Foreground (text) colors
    fg: { 
      light: "216 54% 10%",        // #0A1628
      dark: "0 0% 96%"             // #F5F5F5
    },
    
    // Primary brand color: #1360AB
    primary: { 
      light: "209 79% 37%",        // #1360AB
      dark: "211 76% 65%"          // #5B9FE8
    },
    primaryFg: { 
      light: "0 0% 100%",          // White text on primary
      dark: "0 0% 100%"            // White text on primary
    },
    
    // Secondary/neutral colors
    secondary: { 
      light: "210 17% 98%",        // #FAFBFC
      dark: "0 0% 12%"             // #1F1F1F
    },
    secondaryFg: { 
      light: "216 54% 10%",        // #0A1628
      dark: "0 0% 91%"             // #E8E8E8
    },
    
    // Muted colors for subtle backgrounds
    muted: { 
      light: "214 32% 91%",        // #E2E8F0
      dark: "0 0% 20%"             // #333333
    },
    mutedFg: { 
      light: "215 16% 47%",        // #64748B
      dark: "0 0% 45%"             // #737373
    },
    
    // Danger/Error colors
    danger: { 
      light: "0 84% 60%",          // #EF4444
      dark: "0 91% 71%"            // #F87171
    },
    dangerFg: { 
      light: "0 0% 100%",          // White
      dark: "0 0% 100%"            // White
    },
    
    // Success colors
    success: { 
      light: "142 71% 45%",        // #22C55E
      dark: "142 69% 58%"          // #4ADE80
    },
    successFg: { 
      light: "0 0% 100%",          // White
      dark: "0 0% 100%"            // White
    },
    
    // Warning colors
    warning: { 
      light: "38 92% 50%",         // #F59E0B
      dark: "45 93% 57%"           // #FBBF24
    },
    warningFg: { 
      light: "0 0% 100%",          // White
      dark: "0 0% 0%"              // Black (for contrast)
    },
    
    // Border colors
    border: { 
      light: "214 32% 91%",        // #E2E8F0
      dark: "0 0% 18%"             // #2E2E2E
    },
    
    // Focus ring color
    ring: { 
      light: "209 79% 37%",        // #1360AB (matches primary)
      dark: "211 76% 65%"          // #5B9FE8 (matches dark primary)
    },
  },

  // Border radius scale - based on your theme's harmonious scale
  radius: {
    none: "0",
    sm: "6px",                     // --radius-sm
    md: "8px",                     // --radius-md
    lg: "10px",                    // --radius-lg
    xl: "12px",                    // --radius-xl (base reference)
    full: "9999px",                // --radius-full (avatars, pills)
  },

  // Shadow definitions
  shadow: {
    none: "none",
    sm: "0 1px 3px rgba(0, 0, 0, 0.05)",                    // --shadow-sm
    md: "0 4px 12px rgba(0, 0, 0, 0.1)",                    // --shadow-md
    lg: "0 10px 25px rgba(0, 0, 0, 0.1)",                   // --shadow-lg
  },

  // Spacing scale
  spacing: {
    xs: "0.25rem",                 // 4px  - --spacing-1
    sm: "0.5rem",                  // 8px  - --spacing-2
    md: "0.75rem",                 // 12px - --spacing-3
    lg: "1rem",                    // 16px - --spacing-4
    xl: "1.5rem",                  // 24px - --spacing-6
    "2xl": "2rem",                 // 32px - --spacing-8
  },

  // Typography settings
  typography: {
    fontFamily: '"Roboto", sans-serif',                    // --font-family-primary
    size: {
      xs: "0.75rem",               // 12px - --font-size-xs
      sm: "0.875rem",              // 14px - --font-size-base
      md: "1rem",                  // 16px - --font-size-lg
      lg: "1.125rem",              // 18px - --font-size-xl
      xl: "1.25rem",               // 20px - --font-size-2xl
    },
    weight: {
      normal: "400",               // --font-weight-normal
      medium: "500",               // --font-weight-medium
      semibold: "600",             // --font-weight-semibold
      bold: "700",                 // --font-weight-bold
    },
    lineHeight: {
      tight: "1.25",               // --line-height-tight
      normal: "1.5",               // --line-height-normal
      relaxed: "1.625",            // --line-height-relaxed
    },
  },

  // Transition settings
  transition: {
    fast: "150ms ease",            // --transition-fast
    normal: "200ms ease",          // --transition-normal
    slow: "300ms ease",            // --transition-slow
  },

  // ═══════════════════════════════════════════════════
  // COMPONENT-LEVEL CUSTOMIZATION
  // ═══════════════════════════════════════════════════

  components: {
    // Button component
    button: {
      // Use padding-based sizing (like old button) instead of fixed heights
      paddingY: { 
        sm: "0.5rem",              // py-2
        md: "0.625rem",            // py-2.5
        lg: "0.75rem"              // py-3
      },
      paddingX: { 
        sm: "1rem",                // px-4
        md: "1.25rem",             // px-5
        lg: "1.5rem"               // px-6
      },
      fontSize: { 
        sm: "$font-size-xs",       // 0.75rem
        md: "$font-size-sm",       // 0.875rem (original)
        lg: "$font-size-md"        // 1rem (original)
      },
      fontWeight: "$font-weight-medium",
      borderRadius: "12px",        // --radius-button-md (default)
      gap: "0.5rem",

      states: {
        hover: { opacity: "0.9" },
        focus: { 
          ringWidth: "2px", 
          ringOffset: "2px", 
          ringColor: "$color-ring" 
        },
        disabled: { opacity: "0.5" },
      },

      // Custom variants matching your theme
      variants: {
        primary: {
          bg: "#1360AB",
          color: "white",
          hover: { bg: "#0F4C81" },
        },
        secondary: {
          bg: "#E8F1FE",
          color: "#1360AB",
          hover: { bg: "#D2E3FC" },
        },
        danger: {
          bg: "#EF4444",
          color: "white",
          hover: { bg: "#DC2626" },
        },
        success: {
          bg: "#22C55E",
          color: "white",
          hover: { bg: "#16A34A" },
        },
        outline: {
          bg: "white",
          color: "#1360AB",
          border: "2px solid #1360AB",
          hover: { bg: "#E8F1FE" },
        },
        white: {
          bg: "white",
          color: "#334155",
          border: "1px solid #E2E8F0",
          hover: { bg: "#F8FAFC", color: "#1E293B" },
        },
        ghost: {
          bg: "transparent",
          color: "#64748B",
          hover: { bg: "#F8FAFC", color: "#1360AB" },
        },
        gradient: {
          bg: "linear-gradient(135deg, #1360AB, #2E7BC4)",
          color: "white",
          shadow: "0 4px 15px rgba(19, 96, 171, 0.25)",
          hover: { 
            bg: "linear-gradient(135deg, #0F4C81, #1360AB)",
            shadow: "0 4px 15px rgba(19, 96, 171, 0.35)" 
          },
        },
      },
    },

    // Input component
    input: {
      height: { 
        sm: "32px",                // --input-height-sm
        md: "40px",                // --input-height-md
        lg: "48px"                 // --input-height-lg
      },
      borderRadius: "10px",        // --radius-input
      borderColor: "$color-border",
    },

    // Card component
    card: {
      padding: "1.5rem",           // --card-padding
      borderRadius: "16px",        // --radius-card
      shadow: "$shadow-sm",
    },

    // Badge component
    badge: {
      borderRadius: "6px",         // --radius-badge
      fontSize: { 
        sm: "0.6875rem",           // --badge-font-sm
        md: "0.75rem"              // --badge-font-md
      },
    },

    // Table component
    table: {
      borderRadius: "var(--radius-card)",             // Keep table clipping in sync with card shell
      borderWidth: "var(--border-1, 1px)",
      borderColor: "var(--table-border)",
      headerBg: "var(--table-header-bg)",
      headerFontWeight: "var(--font-weight-medium)",
      cellPadding: "var(--table-cell-padding-md, 0.75rem 1rem)",
      rowHoverBg: "var(--table-row-hover)",
      stripedBg: "var(--table-stripe-bg)",
    },
  },
};
