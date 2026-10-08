import { useId, useState } from "react"
import { Button, Panel } from "hzero"
import { ChevronDown } from "lucide-react"
import { ISSUE_LABELS } from "../catererHelpers"
import { formatClock } from "./mealRecordsHelpers"
import "./MealRecords.css"

/** Collapsible list of attempts that were not verified (duplicates, wrong caterer, outside meal time...). */
const ScannerIssues = ({ issues = [], issueCount = 0 }) => {
  const [open, setOpen] = useState(false)
  const regionId = useId()

  if (!(issueCount > 0)) return null

  return (
    <Panel
      className="mr-issues"
      title="Scanner issues"
      accent="warning"
      count={issueCount}
      actions={
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={open}
          aria-controls={regionId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Hide" : "Show"}
          <ChevronDown size={16} className="mr-issues__chevron" data-open={open || undefined} aria-hidden="true" />
        </Button>
      }
    >
      <div id={regionId} hidden={!open}>
        {open && (
          <ul className="mr-issues__list">
            {issues.map((issue, index) => {
              const name = issue.student?.name
              const roll = issue.student?.rollNumber || issue.rollNumber
              return (
                <li key={issue.id || index} className="mr-issue">
                  <span className="mr-issue__time">{formatClock(issue.scannedAt || issue.createdAt)}</span>
                  <div className="mr-issue__who">
                    <span className="mr-issue__name">{name || (roll ? "Unknown student" : "Unknown")}</span>
                    {roll && <span className="mr-issue__roll">{roll}</span>}
                  </div>
                  <div className="mr-issue__what">
                    <span className="mr-issue__reason">{ISSUE_LABELS[issue.status] || issue.status || "Not verified"}</span>
                    {issue.message && <span className="mr-issue__message">{issue.message}</span>}
                  </div>
                </li>
              )
            })}
            {issues.length < issueCount && (
              <li className="mr-issue mr-issue--note">Showing the latest {issues.length} of {issueCount}.</li>
            )}
          </ul>
        )}
      </div>
    </Panel>
  )
}

export default ScannerIssues
