import React, { useState } from "react"
import { FaKey } from "react-icons/fa"
import { Button } from "@/components/ui"
import ChangePasswordModal from "./ChangePasswordModal"

const ChangePasswordButton = ({ email }) => {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <Button onClick={() => setShowModal(true)} variant="primary" size="medium" icon={<FaKey />}>
        Change Password
      </Button>

      {showModal && <ChangePasswordModal onClose={() => setShowModal(false)} email={email} />}
    </>
  )
}

export default ChangePasswordButton
