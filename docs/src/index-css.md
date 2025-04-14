# Global Stylesheet (`/src/index.css`)

This file defines the global CSS styles and configurations for the application, primarily integrating and extending Tailwind CSS.

## Purpose and Functionality

- **Font Import:** Imports the "Roboto" font from Google Fonts.
- **Tailwind Integration:** Imports Tailwind CSS base styles, components, and utilities using `@import "tailwindcss";`.
- **Base Styling:** Sets the default `font-family` for the `body` to "Roboto".
- **Custom Animations:** Defines several custom CSS `@keyframes` animations:
  - `fadeIn`: Fade in with slight upward movement.
  - `slideUp`: Slide up from bottom with fade-in.
  - `pulse`: Standard opacity pulse.
  - `pulse-slow`: Slower pulse with vertical movement and scaling (used in `LoadingScreen`).
  - `ping-slow`: Slower scaling/opacity pulse (used in `LoadingScreen`).
  - `loading-bar`: Horizontal sliding animation (used in `LoadingScreen`).
  - `ripple`: Expanding circle effect (used in `Button` component).
  - `shake`: Horizontal shaking effect (used in `Button` component).
  - `float`: Gentle vertical floating effect.
- **Animation Classes:** Provides utility classes (e.g., `.animate-fadeIn`, `.animate-pulse-slow`, `.ripple-effect`, `.animate-shake`) to apply these custom animations.
- **Custom Utilities:** Defines some custom utility classes:
  - `.bg-gradient-radial`: For applying radial gradients.
  - `.backdrop-blur-xs`: Applies a small backdrop blur effect.
  - `.shadow-glow`: Applies a specific blue glow box-shadow.
- **Tailwind Extension:** Uses `@layer utilities` to potentially extend or override Tailwind utilities (specifically `animate-slideUp` in this case).

## Usage

This file is imported once in the application's main entry point (`/src/main.jsx`) to apply styles globally. Tailwind utility classes are used directly in components, while the custom animation classes (`.animate-*`, `.ripple-effect`) are applied as needed.
