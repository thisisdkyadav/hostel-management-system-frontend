import React from "react"
import { getMediaUrl } from "../../../../utils/mediaUtils"
import { Button } from "hzero"
import { FaEye } from "react-icons/fa"
import { Grid, Heading, HStack, IconCircle, Surface, Text, VStack } from "@/components/ui"

const PaymentInfoViewer = ({ paymentInfo, onViewScreenshot }) => {
  if (!paymentInfo) {
    return (
      <Surface bg="var(--color-warning-bg-light)" padding={4} radius="lg" border="var(--border-1) solid var(--color-warning-bg)">
        <HStack gap={3} align="center">
          <IconCircle size="var(--avatar-sm)" bg="warning">
            <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-warning)' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </IconCircle>
          <div>
            <Heading as="h4" weight="medium" color="warning-text" size="base">Payment Information Not Submitted</Heading>
            <Text size="sm" color="warning" style={{ marginTop: 'var(--spacing-0-5)' }}>Student has not yet submitted payment information</Text>
          </div>
        </HStack>
      </Surface>
    )
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Surface bg="var(--color-success-bg-light)" padding={6} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
      <HStack gap={3} align="center" style={{ marginBottom: 'var(--spacing-4)' }}>
        <IconCircle size="var(--avatar-sm)" bg="success">
          <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zM14 6a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2h8zM6 8a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4a2 2 0 012-2h2z" />
          </svg>
        </IconCircle>
        <div>
          <Heading as="h4" weight="semibold" color="success-text" size="base">Payment Information</Heading>
          <Text size="sm" color="success" style={{ marginTop: 'var(--spacing-0-5)' }}>Student payment details and verification</Text>
        </div>
      </HStack>

      <VStack gap={4}>
        {/* Payment Details Grid */}
        <Grid min={250} gap={4}>
          <Surface bg="primary" padding={4} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
            <HStack gap={2} align="center" style={{ marginBottom: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              <Text as="span" size="sm" weight="medium" color="body">Payment Amount</Text>
            </HStack>
            <Text size="xl" weight="semibold" color="primary">{formatAmount(paymentInfo.amount)}</Text>
          </Surface>

          <Surface bg="primary" padding={4} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
            <HStack gap={2} align="center" style={{ marginBottom: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <Text as="span" size="sm" weight="medium" color="body">Payment Date</Text>
            </HStack>
            <Text size="xl" weight="semibold" color="primary">{formatDate(paymentInfo.dateOfPayment)}</Text>
          </Surface>
        </Grid>

        {/* Transaction ID */}
        <Surface bg="primary" padding={4} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
          <HStack gap={2} align="center" style={{ marginBottom: 'var(--spacing-2)' }}>
            <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <Text as="span" size="sm" weight="medium" color="body">Transaction ID</Text>
          </HStack>
          <Surface as="p" bg="tertiary" padding="var(--spacing-2) var(--spacing-3)" radius="md" border={`var(--border-1) solid var(--color-border-primary)`} color="primary" size="xl" weight="semibold" style={{ fontFamily: 'monospace' }}>{paymentInfo.transactionId}</Surface>
        </Surface>

        {/* Payment Screenshot */}
        <Surface bg="primary" padding={4} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
          <HStack gap="none" align="center" justify="between" style={{ marginBottom: 'var(--spacing-3)' }}>
            <HStack gap={2} align="center">
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <Text as="span" size="sm" weight="medium" color="body">Payment Screenshot</Text>
            </HStack>
            <Button onClick={onViewScreenshot} variant="primary" size="sm">
              <FaEye />
              View Screenshot
            </Button>
          </HStack>
          <Surface bg="tertiary" padding={3} radius="md" align="center">
            <div style={{ width: 'var(--icon-3xl)', height: 'var(--icon-3xl)', backgroundColor: 'var(--color-bg-muted)', borderRadius: 'var(--radius-lg)', margin: '0 auto var(--spacing-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg style={{ width: 'var(--icon-xl)', height: 'var(--icon-xl)', color: 'var(--color-text-light)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <Text size="sm" color="muted">Payment screenshot available</Text>
          </Surface>
        </Surface>

        {/* Additional Information */}
        {paymentInfo.additionalInfo && (
          <Surface bg="primary" padding={4} radius="lg" border="var(--border-1) solid var(--color-success-bg)">
            <HStack gap={2} align="center" style={{ marginBottom: 'var(--spacing-2)' }}>
              <svg style={{ width: 'var(--icon-md)', height: 'var(--icon-md)', color: 'var(--color-success)' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <Text as="span" size="sm" weight="medium" color="body">Additional Information</Text>
            </HStack>
            <Surface as="p" bg="tertiary" padding={3} radius="md" border={`var(--border-1) solid var(--color-border-primary)`} color="primary" size="base">{paymentInfo.additionalInfo}</Surface>
          </Surface>
        )}

        {/* Submission Timestamp */}
        {paymentInfo.submittedAt && (
          <div style={{ textAlign: 'center', paddingTop: 'var(--spacing-2)', borderTop: `var(--border-1) solid var(--color-success-bg)` }}>
            <Text size="xs" color="light">
              Submitted on {formatDate(paymentInfo.submittedAt)} at{" "}
              {new Date(paymentInfo.submittedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </div>
        )}
      </VStack>
    </Surface>
  )
}

export default PaymentInfoViewer
