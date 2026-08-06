import React from "react"
import { FaBuilding } from "react-icons/fa"
import { useGlobal } from "../../../../contexts/GlobalProvider"
import { HStack, Surface, Text, VStack } from "@/components/ui"

const AccommodationDetails = ({ hostelName, allocatedRooms }) => {
  return (
    <Surface bg="muted" padding={4} radius="lg">
      <h3 style={{ fontWeight: "var(--font-weight-medium)", color: "var(--color-text-secondary)", marginBottom: "var(--spacing-3)", display: "flex", alignItems: "center", }} >
        <FaBuilding style={{ marginRight: "var(--spacing-2)", color: "var(--color-primary)", fontSize: "var(--icon-md)", }} />{" "}
        Accommodation Details
      </h3>
      <VStack gap={2}>
        <HStack gap="none" justify="between">
          <Text as="span" color="muted" size="sm">
            Hostel:
          </Text>
          <Text as="span" weight="medium" size="sm">
            {hostelName}
          </Text>
        </HStack>
        {allocatedRooms && allocatedRooms.length > 0 ? (
          <div>
            <span style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)", display: "block", marginBottom: "var(--spacing-1)", }} >
              Allocated Rooms:
            </span>
            <VStack gap={1}>
              {allocatedRooms.map((room, index) => (
                <Text as="div" size="sm" weight="medium" key={index}>
                  {room.length > 1 ? `${room[1]}-${room[0]}` : `Room ${room[0]}`}
                </Text>
              ))}
            </VStack>
          </div>
        ) : (
          <HStack gap="none" justify="between">
            <Text as="span" color="muted" size="sm">
              Room:
            </Text>
            <Text as="span" weight="medium" size="sm">
              Not allocated yet
            </Text>
          </HStack>
        )}
      </VStack>
    </Surface>
  )
}

export default AccommodationDetails
