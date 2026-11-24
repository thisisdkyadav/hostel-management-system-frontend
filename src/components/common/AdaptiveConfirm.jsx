import { createContext, useContext } from "react"
import { ConfirmDialog as HzConfirmDialog, useConfirm as useHzConfirm } from "hzero"

/**
 * hzero's ConfirmDialog / useConfirm, unless a host swaps them: the student
 * phone app provides bottom-sheet confirmations (closed by Back, like its other
 * sheets). Everywhere else these are exactly hzero's.
 *
 * Context value: { confirm(options) => Promise<boolean>, renderDialog(props) => element }
 */
export const ConfirmOverrideContext = createContext(null)

/** Same props as hzero ConfirmDialog. */
export const AdaptiveConfirmDialog = (props) => {
  const override = useContext(ConfirmOverrideContext)
  if (!props.isOpen) return null
  return override ? override.renderDialog(props) : <HzConfirmDialog {...props} />
}

/** Same call as hzero useConfirm(): confirm({ title, message, confirmText, cancelText, variant | isDestructive }). */
export const useAdaptiveConfirm = () => {
  const override = useContext(ConfirmOverrideContext)
  const hzConfirm = useHzConfirm()
  return override ? override.confirm : hzConfirm
}
