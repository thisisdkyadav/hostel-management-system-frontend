import { Archive, ArchiveRestore, Info, Pencil, Users } from "lucide-react"
import { Button, Card, StatusBadge } from "hzero"
import { audienceLabel, defaultLabel, formStatus, periodRange } from "./tagHelpers"
import "./Tags.css"

const Fact = ({ label, children }) => (
  <div className="tg-fact">
    <dt>{label}</dt>
    <dd>{children}</dd>
  </div>
)

const TagCard = ({ tag, onOpen, onEdit, onArchive }) => {
  const status = formStatus(tag.form)
  const isPeriod = tag.kind === "period"
  const counts = tag.counts || { yes: 0, no: 0, answered: 0 }
  return (
    <Card className="tg-card" data-archived={tag.isArchived || undefined}>
      <div className="tg-card__head">
        <button type="button" className="tg-card__title" onClick={() => onOpen(tag.id)} aria-label={`Open ${tag.name}`}>
          <span className="tg-card__name">{tag.name}</span>
          {tag.question && <span className="tg-card__question">{tag.question}</span>}
        </button>
        <div className="tg-card__badges">
          {isPeriod && <StatusBadge tone="info" showDot={false}>Allocation tag</StatusBadge>}
          {tag.isArchived && <StatusBadge tone="neutral" showDot={false}>Archived</StatusBadge>}
        </div>
      </div>

      <dl className="tg-facts">
        <Fact label="Dates">{periodRange(tag.startDate, tag.endDate)}</Fact>
        <Fact label="Default">
          <StatusBadge tone={tag.defaultValue === true ? "success" : tag.defaultValue === false ? "danger" : "neutral"} showDot={false}>
            {defaultLabel(tag.defaultValue)}
          </StatusBadge>
        </Fact>
        {!isPeriod && (
          <>
            <Fact label="Form">
              <StatusBadge tone={status.tone} showDot={false}>{status.label}</StatusBadge>
            </Fact>
            <Fact label="Audience">{audienceLabel(tag.form)}</Fact>
          </>
        )}
      </dl>

      {isPeriod && (
        <p className="tg-card__note">
          <Info size={14} aria-hidden="true" /> Edit in the dining period
        </p>
      )}

      <div className="tg-card__foot">
        <div className="tg-counts" aria-label="Answers">
          <span className="tg-counts__item" data-tone="yes"><b>{counts.yes}</b> yes</span>
          <span className="tg-counts__item" data-tone="no"><b>{counts.no}</b> no</span>
          <span className="tg-counts__item"><b>{counts.answered}</b> answered</span>
        </div>
        <div className="tg-card__actions">
          <Button variant="secondary" size="sm" onClick={() => onOpen(tag.id)}>
            <Users size={16} /> Students
          </Button>
          {!isPeriod && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(tag)} aria-label={`Edit ${tag.name}`}>
                <Pencil size={16} /> Edit
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onArchive(tag)} aria-label={`${tag.isArchived ? "Unarchive" : "Archive"} ${tag.name}`}>
                {tag.isArchived ? <ArchiveRestore size={16} /> : <Archive size={16} />}
                {tag.isArchived ? "Unarchive" : "Archive"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

/** The tags of one kind as cards: dates, default, form status, audience and answer counts. */
const TagList = ({ tags, onOpen, onEdit, onArchive }) => (
  <div className="tg-list">
    {tags.map((tag) => (
      <TagCard key={tag.id} tag={tag} onOpen={onOpen} onEdit={onEdit} onArchive={onArchive} />
    ))}
  </div>
)

export default TagList
