import { createContext, useContext } from "react"
import { Modal as HzModal } from "hzero"

/**
 * hzero's Modal, unless a page swaps it: the student phone app provides a bottom
 * sheet with the same props, so shared dialogs (dining, guest accommodation)
 * slide up from the bottom there and stay centred modals everywhere else.
 * The context holds a render function: (modalProps) => element.
 */
export const ModalOverrideContext = createContext(null)

const AdaptiveModal = (props) => {
  const renderOverride = useContext(ModalOverrideContext)
  return renderOverride ? renderOverride(props) : <HzModal {...props} />
}

export default AdaptiveModal
