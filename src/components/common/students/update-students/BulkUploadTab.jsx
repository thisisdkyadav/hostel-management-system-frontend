import React from "react"
import { Alert, Heading, Surface, Text, VStack } from "hzero"

/**
 * The shape every bulk-update tab has.
 *
 * All seven tabs in this modal are the same screen: a heading, an optional
 * control or two, a CSV uploader, the error from the last parse, a line
 * confirming what will happen, and a preview of the first few rows. They were
 * written out seven times, and drifted — three of them styled the error box
 * with `bg-red-50 text-red-600`, which is Tailwind's palette rather than the
 * theme's, so those three did not follow dark mode while the other four did.
 *
 * Owning the shape here is what stops that: there is one error box now.
 *
 * @param {React.ReactNode} title - What this tab updates
 * @param {React.ReactNode} children - Controls and the uploader, in order
 * @param {string} error - Message from the last parse, if it failed
 * @param {string} status - What will happen, once a file parses cleanly
 * @param {React.ReactNode} preview - The parsed rows, usually a PreviewTable
 */
const BulkUploadTab = ({ title, children, error, status, preview }) => (
  <VStack gap={5}>
    <Heading as="h3" size="lg" weight="medium" color="secondary">
      {title}
    </Heading>

    {children}

    {error && <Alert type="error">{error}</Alert>}

    {!error && status && (
      <Surface bg="success" padding={4} radius="lg" color="success-text" weight="medium">
        {status}
      </Surface>
    )}

    {preview}
  </VStack>
)

/**
 * A titled section inside a tab, for the tabs that need one before the upload.
 */
export const TabSection = ({ title, children }) => (
  <Surface as="section" style={{ borderTop: "1px solid var(--color-border-primary)", paddingTop: "var(--spacing-4)" }}>
    {title && (
      <Heading as="h4" size="base" weight="medium" color="body" style={{ marginBottom: "var(--spacing-3)" }}>
        {title}
      </Heading>
    )}
    {children}
  </Surface>
)

/**
 * The "Field Input Types" list every uploader shows above its drop zone.
 *
 * @param {Array<[string, string]>} fields - Field name and what it accepts
 */
export const FieldList = ({ fields }) => (
  <div>
    <Text weight="medium" style={{ marginBottom: "var(--spacing-1)" }}>
      Field Input Types:
    </Text>
    <VStack as="ul" gap={1}>
      {fields.map(([name, description]) => (
        <li key={name}>
          <Text as="span" weight="medium">
            {name}:
          </Text>{" "}
          {description}
        </li>
      ))}
    </VStack>
  </div>
)

export default BulkUploadTab
