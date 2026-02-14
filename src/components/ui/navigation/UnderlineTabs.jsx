import React, { forwardRef } from "react"
import { Tabs } from "czero/react"

/**
 * UnderlineTabs - compatibility wrapper over C0 Tabs underline variant.
 */
const UnderlineTabs = forwardRef(({
  tabs = [],
  value,
  onChange,
  size = "medium",
  fullWidth = false,
  showBorder = true,
  className = "",
  style = {},
  ...rest
}, ref) => {
  return (
    <Tabs
      ref={ref}
      tabs={tabs}
      value={value}
      onChange={onChange}
      variant="underline"
      size={size}
      fullWidth={fullWidth}
      showBorder={showBorder}
      className={className}
      style={style}
      {...rest}
    />
  )
})

UnderlineTabs.displayName = "UnderlineTabs"

export default UnderlineTabs
