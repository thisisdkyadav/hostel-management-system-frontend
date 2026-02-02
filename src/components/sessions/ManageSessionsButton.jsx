import React, { useState } from "react"
import { MdComputer } from "react-icons/md"
import { Button } from "czero/react"
import ManageSessionsModal from "./ManageSessionsModal"

const ManageSessionsButton = ({ email }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)} variant="secondary" size="md">
        <MdComputer /> Manage Sessions
      </Button>

      {showModal && <ManageSessionsModal onClose={() => setShowModal(false)} email={email} />}
    </>
  )
}

export default ManageSessionsButton
