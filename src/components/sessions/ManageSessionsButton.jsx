import React, { useState } from "react"
import { MdComputer } from "react-icons/md"
import Button from "../common/Button"
import ManageSessionsModal from "./ManageSessionsModal"

const ManageSessionsButton = ({ email }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)} variant="secondary" size="medium" icon={<MdComputer />}>
        Manage Sessions
      </Button>

      {showModal && <ManageSessionsModal onClose={() => setShowModal(false)} email={email} />}
    </>
  )
}

export default ManageSessionsButton
