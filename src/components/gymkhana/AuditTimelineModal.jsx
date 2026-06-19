/**
 * Audit Timeline Modal
 *
 * Thin Modal wrapper around <AuditTimeline /> for the "View history" popup.
 * Reusable across any auditable entity — pass entityType + entityId.
 */

import { Button, Modal } from "czero/react"
import AuditTimeline from "./AuditTimeline"

const AuditTimelineModal = ({
    isOpen,
    onClose,
    entityType,
    entityId,
    title = "Change history",
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            width={620}
            footer={
                <Button variant="ghost" onClick={onClose}>
                    Close
                </Button>
            }
        >
            <AuditTimeline entityType={entityType} entityId={entityId} />
        </Modal>
    )
}

export default AuditTimelineModal
