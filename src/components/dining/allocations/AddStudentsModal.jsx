import { Button, Modal } from "hzero"
import AllocationAddPanel from "../AllocationAddPanel"

/** Add one student, or a roll-number CSV, to a kitchen of the period being viewed. */
const AddStudentsModal = ({ isOpen, mode, periodId, caterers, defaultCatererId, onClose }) => {
  if (!isOpen) return null
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={mode === "bulk" ? "Bulk upload students" : "Add a student"}
      size="md"
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >
      <AllocationAddPanel periodId={periodId} caterers={caterers} defaultCatererId={defaultCatererId} mode={mode} />
    </Modal>
  )
}

export default AddStudentsModal
