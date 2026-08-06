/**
 * The election modals, one file each under ./election-modals.
 *
 * This file stays as the barrel so its two importers need no edit:
 * ElectionsPage.jsx takes six names from here, AdminElectionWorkspace.jsx
 * takes LiveVotingFullscreenModal.
 */
export { ElectionHistoryModal, CloneElectionModal } from "./election-modals/ElectionRecordModals"
export { LiveVotingFullscreenModal } from "./election-modals/LiveVotingFullscreenModal"
export { ElectionWizardModal } from "./election-modals/ElectionWizardModal"
export { AdminNominationReviewModal } from "./election-modals/AdminNominationReviewModal"
export { StudentNominationModal } from "./election-modals/StudentNominationModal"
export { AdminResultsEditModal } from "./election-modals/AdminResultsEditModal"
