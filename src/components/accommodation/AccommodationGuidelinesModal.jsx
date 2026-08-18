import { Alert, Button, HStack, Modal, Surface, Text, VStack } from "hzero"
import {
  BadgeCheck,
  Building2,
  CreditCard,
  DoorOpen,
  FileText,
  Gavel,
  Receipt,
  Send,
  UserCheck,
  Wallet,
} from "lucide-react"

const STEPS = [
  {
    icon: FileText,
    title: "Submit accommodation request",
    body: "Raise the request in the Visitors’ Accommodation Portal with all required guest and stay details, well in advance.",
  },
  {
    icon: Building2,
    title: "Availability confirmation",
    body: "The Chief Warden’s Office checks and confirms whether accommodation can be provided for those dates.",
  },
  {
    icon: UserCheck,
    title: "Forwarding for recommendation",
    body: "If space is available, the request is sent to your Faculty Advisor / supervisor for recommendation.",
  },
  {
    icon: Gavel,
    title: "Approval by Chief Warden",
    body: "After the recommendation, the request goes to the Chief Warden for approval.",
  },
  {
    icon: CreditCard,
    title: "Allotment & payment details",
    body: "On approval, the Chief Warden’s Office shares the applicable charges and payment details with you.",
  },
  {
    icon: Wallet,
    title: "Advance payment",
    body: "Pay the full amount in advance — preferably right after approval, and at least three working days before the stay starts.",
  },
  {
    icon: BadgeCheck,
    title: "Confirmation of booking",
    body: "Booking is confirmed only after the advance payment is received. Approval alone is not confirmation. If payment is not received in time, the booking may be cancelled or released for someone else.",
  },
  {
    icon: DoorOpen,
    title: "Room allotment",
    body: "Once payment is verified, the Hostel Office assigns the specific room(s) for your guests.",
  },
  {
    icon: Receipt,
    title: "Verification & receipt",
    body: "The Accountant verifies the payment. After that, the receipt appears in your SMS portal.",
  },
]

const NOTES = [
  "Accommodation depends on availability, approval by the competent authority, and receipt of advance payment.",
  "No stay is confirmed until the prescribed advance payment has been received.",
  "You and your guests must follow all applicable hostel rules and regulations.",
]

const AccommodationGuidelinesModal = ({ open, onClose }) => {
  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
      <Button variant="primary" onClick={onClose}>
        I understand
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Guest accommodation guidelines"
      width={720}
      closeButtonVariant="button"
      footer={footer}
    >
      <VStack gap={4}>
        <Surface
          bg="primary"
          padding={4}
          radius="lg"
          style={{
            background: "linear-gradient(135deg, var(--color-primary-soft, var(--color-bg-secondary)) 0%, var(--color-bg-tertiary) 100%)",
            border: "1px solid var(--color-border-primary)",
          }}
        >
          <HStack gap={3} align="start">
            <Send size={22} style={{ flexShrink: 0, marginTop: 2, color: "var(--color-primary)" }} />
            <div>
              <Text as="div" weight="semibold" color="primary">
                Booking for parents / family through the SMS portal
              </Text>
              <Text as="div" size="sm" color="muted" style={{ marginTop: "var(--spacing-1)" }}>
                Please read this short process before you raise a request. Payment locks the booking — approval alone does not.
              </Text>
            </div>
          </HStack>
        </Surface>

        <VStack gap={3}>
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <HStack key={step.title} gap={3} align="start">
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "999px",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "var(--color-primary)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                  aria-hidden
                >
                  {index + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingBottom: index < STEPS.length - 1 ? "var(--spacing-1)" : 0 }}>
                  <HStack gap={2} align="center" style={{ marginBottom: "var(--spacing-1)" }}>
                    <Icon size={16} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                    <Text as="span" weight="semibold" size="sm">
                      {step.title}
                    </Text>
                  </HStack>
                  <Text as="div" size="sm" color="muted">
                    {step.body}
                  </Text>
                </div>
              </HStack>
            )
          })}
        </VStack>

        <Alert variant="warning" title="Important">
          <VStack gap={1} style={{ marginTop: "var(--spacing-1)" }}>
            {NOTES.map((note) => (
              <Text as="div" key={note} size="sm">
                • {note}
              </Text>
            ))}
          </VStack>
        </Alert>
      </VStack>
    </Modal>
  )
}

export default AccommodationGuidelinesModal
