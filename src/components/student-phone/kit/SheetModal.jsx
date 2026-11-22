import PhoneSheet from "./PhoneSheet"

// hzero Modal widths at or above this are full forms / long reads: open them tall.
const TALL_FROM_WIDTH = 640

/** hzero Modal's props (isOpen, onClose, title, footer, width) rendered as a PhoneSheet. */
const SheetModal = ({ isOpen = true, onClose, title, footer, width, children }) => {
  if (!isOpen) return null
  return (
    <PhoneSheet title={title || ""} label={typeof title === "string" ? title : undefined} onClose={onClose} footer={footer} tall={Number(width) >= TALL_FROM_WIDTH}>
      <div className="mk-sheet-modal">{children}</div>
    </PhoneSheet>
  )
}

/** For ModalOverrideContext: render hzero Modal props as a sheet. */
export const renderSheetModal = (props) => <SheetModal {...props} />

export default SheetModal
