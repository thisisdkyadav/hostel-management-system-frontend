# Button Component (`/src/components/common/Button.jsx`)

This component renders a flexible and themeable button element.

## Purpose and Functionality

The `Button` component provides a standardized way to create buttons across the application. It supports various visual styles, sizes, loading states, icons, and interaction animations.

## Props

| Prop        | Type     | Description                                                                                                        | Default     | Required |
| :---------- | :------- | :----------------------------------------------------------------------------------------------------------------- | :---------- | :------- |
| `children`  | `node`   | The content to display inside the button (e.g., text).                                                             | -           | Yes      |
| `onClick`   | `func`   | Function to call when the button is clicked.                                                                       | `undefined` | No       |
| `type`      | `string` | The button's type attribute (`'button'`, `'submit'`, `'reset'`).                                                   | `'button'`  | No       |
| `variant`   | `string` | Visual style of the button (`'primary'`, `'secondary'`, `'danger'`, `'success'`, `'outline'`, `'white'`).          | `'primary'` | No       |
| `size`      | `string` | Size of the button (`'small'`, `'medium'`, `'large'`).                                                             | `'medium'`  | No       |
| `className` | `string` | Additional CSS classes to apply to the button element.                                                             | `''`        | No       |
| `icon`      | `node`   | An optional icon element to display before the button text.                                                        | `undefined` | No       |
| `isLoading` | `bool`   | If true, displays a loading spinner and disables the button.                                                       | `false`     | No       |
| `disabled`  | `bool`   | If true, disables the button.                                                                                      | `false`     | No       |
| `fullWidth` | `bool`   | If true, makes the button take up the full width of its container.                                                 | `false`     | No       |
| `animation` | `string` | Specifies a hover/click animation (`'none'`, `'pulse'`, `'bounce'`, `'slideIn'`, `'glow'`, `'ripple'`, `'shake'`). | `'none'`    | No       |
| `...rest`   | `object` | Any other standard button attributes (e.g., `aria-label`).                                                         | `{}`        | No       |

## Variants

- **primary:** Main action button style (Blue background).
- **secondary:** Secondary action style (Light blue background, blue text, hover changes).
- **danger:** For destructive actions (Red background).
- **success:** For successful actions (Green background).
- **outline:** White background with blue border and text.
- **white:** Plain white background, gray text.

## Sizes

- **small:** Smaller padding and text size.
- **medium:** Default padding and text size.
- **large:** Larger padding and text size.

## Animations

- **none:** No animation.
- **pulse:** Subtle pulsing effect on hover.
- **bounce:** Bounces slightly on hover.
- **slideIn:** Moves up slightly on hover.
- **glow:** Adds a shadow glow effect on hover.
- **ripple:** Creates a material-style ripple effect originating from the click point.
- **shake:** Shakes briefly when clicked (`active` state).

## Loading State

When `isLoading` is `true`, the button content is replaced with a spinner and the text "Loading...", and the button is disabled.

## Icon Support

If an `icon` prop (React node, e.g., an icon component) is provided, it is displayed to the left of the `children` content.
