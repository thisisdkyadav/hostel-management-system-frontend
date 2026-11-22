import ProfileAvatar from "./ProfileAvatar"
import ChangePasswordButton from "../passwordChange/ChangePasswordButton"
import ManageSessionsButton from "../sessions/ManageSessionsButton"
import { Heading, HStack, Surface, Text } from "hzero"

const ProfileHeader = ({ user, role, subtitle }) => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-0 sm:space-x-5">
      <ProfileAvatar user={user} size="large" />
      <div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start">
          <Heading as="h2" size="xl" weight="bold" color="secondary">
            {user.name}
          </Heading>
          <Surface bg="brand" padding="var(--spacing-1) var(--spacing-3)" radius="full" color="brand" size="xs" weight="medium" style={{ marginTop: "var(--spacing-1)" }} className="sm:mt-0 sm:ml-4">
            {role}
          </Surface>
        </div>
        <Text color="muted" size="base" style={{ marginTop: "var(--spacing-1)" }}>
          {subtitle}
        </Text>
        <HStack gap="var(--gap-sm)" wrap style={{ marginTop: "var(--spacing-3)" }} className="justify-center sm:justify-start">
          <ChangePasswordButton email={user.email} />
          <ManageSessionsButton email={user.email} />

        </HStack>
      </div>
    </div>
  )
}

export default ProfileHeader
