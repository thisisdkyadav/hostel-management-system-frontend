import PhoneSheet from "./PhoneSheet"
import Segmented from "./Segmented"

// hzero Modal widths at or above this are full forms / long reads: open them tall.
const TALL_FROM_WIDTH = 640

/**
 * hzero Modal's props (isOpen, onClose, title, footer, width, and tabs /
 * activeTab / onTabChange) rendered as a PhoneSheet.
 */
const SheetModal = ({ isOpen = true, onClose, title, footer, width, tabs, activeTab, onTabChange, children }) => {
  if (!isOpen) return null
  const hasTabs = Array.isArray(tabs) && tabs.length > 1
  return (
    <PhoneSheet title={title || ""} label={typeof title === "string" ? title : undefined} onClose={onClose} footer={footer} tall={Number(width) >= TALL_FROM_WIDTH}>
      <div className="mk-sheet-modal">
        {hasTabs && (
          <Segmented label={typeof title === "string" ? title : "Sections"} options={tabs.map((tab) => ({ value: tab.id, label: tab.name || tab.label }))} value={activeTab} onChange={(value) => onTabChange?.(value)} stretch />
        )}
        {children}
      </div>
    </PhoneSheet>
  )
}

/** For ModalOverrideContext: render hzero Modal props as a sheet. */
export const renderSheetModal = (props) => <SheetModal {...props} />

export default SheetModal
