import { ArrowLeft, ArrowRight, ArrowUp, MousePointer2 } from "lucide-react"
import { Text } from "hzero"
import OccupancyTile from "../../../common/OccupancyTile"

const UNIT_GROUPS = [
  { id: "A", used: 2, total: 2 },
  { id: "B", used: 1, total: 2 },
  { id: "C", used: 0, total: 2 },
  { id: "D", used: 2, total: 2 },
  { id: "E", used: 1, total: 2 },
  { id: "F", used: 0, total: 2 },
]

const PEEK_FACES = [
  { id: "demo-a", name: "Ada" },
  { id: "demo-l", name: "Lin" },
]

const GuideCallout = ({ id, side }) => (
  <span className="guide-callout" data-side={side}>
    {side === "start" ? (
      <>
        <span className="guide-callout__id">{id}</span>
        <ArrowRight size={12} strokeWidth={2.5} aria-hidden="true" />
      </>
    ) : (
      <>
        <ArrowLeft size={12} strokeWidth={2.5} aria-hidden="true" />
        <span className="guide-callout__id">{id}</span>
      </>
    )}
  </span>
)

const HostelExplorerGuide = () => (
  <div className="explorer-guide">
    <div className="explorer-guide__prompt">
      <span className="explorer-guide__nudge" aria-hidden="true">
        <ArrowUp size={20} />
      </span>
      <Text as="h2" size="lg" weight="semibold" color="primary">
        Hover a hostel to open its map
      </Text>
      <Text size="sm" color="muted">
        Nothing is selected until you do. Watch the loop, then hover a hostel above.
      </Text>
    </div>

    <section className="guide-film" aria-label="How a unit tile works">
      <div className="guide-film__scene" aria-hidden="true">
        <div className="guide-film__host">
          <div className="guide-callouts" data-side="start" aria-hidden="true">
            {UNIT_GROUPS.slice(0, 3).map((room) => (
              <GuideCallout key={room.id} id={room.id} side="start" />
            ))}
          </div>
          <OccupancyTile
            label="101"
            used={6}
            total={12}
            groups={UNIT_GROUPS}
            size="lg"
            layout="split-bottom"
            tabIndex={-1}
          />
          <div className="guide-callouts" data-side="end" aria-hidden="true">
            {UNIT_GROUPS.slice(3).map((room) => (
              <GuideCallout key={room.id} id={room.id} side="end" />
            ))}
          </div>
          <span className="guide-film__cursor" aria-hidden="true">
            <MousePointer2 size={18} />
          </span>
          <div className="guide-film__popover" aria-hidden="true">
            <div className="guide-film__popover-in">
              <div className="guide-film__rooms">
                <OccupancyTile label="101" used={2} total={2} faces={PEEK_FACES} size="md" layout="peek" tabIndex={-1} />
                <OccupancyTile
                  label="102"
                  used={1}
                  total={2}
                  faces={[{ id: "demo-b", name: "Bo" }]}
                  size="md"
                  layout="peek"
                  tabIndex={-1}
                />
                <OccupancyTile label="103" used={0} total={2} size="md" layout="peek" tabIndex={-1} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="guide-film__legend">
        <span>A–F are rooms</span>
        <span>Two dots each · filled is occupied</span>
        <span>Hover pops the rooms in that unit</span>
      </p>
    </section>

    <div className="explorer-guide__board">
      <figure className="explorer-guide__card">
        <div className="guide-spot guide-spot--peek" aria-hidden="true">
          <OccupancyTile label="204" used={2} total={2} faces={PEEK_FACES} size="md" layout="peek" tabIndex={-1} />
          <span className="guide-pin guide-pin--top">
            Room number
            <span className="guide-pin__shaft" />
          </span>
          <span className="guide-pin guide-pin--pips">
            <span className="guide-pin__shaft" />
            Beds · two dots
          </span>
          <span className="guide-pin guide-pin--faces">
            <span className="guide-pin__shaft" />
            Students
          </span>
        </div>
        <figcaption className="explorer-guide__caption">
          <Text as="h3" size="sm" weight="semibold" color="primary">
            Room inside a unit
          </Text>
          <Text size="xs" color="muted">
            Pops up when you hover a unit tile.
          </Text>
        </figcaption>
      </figure>

      <figure className="explorer-guide__card">
        <div className="guide-spot guide-spot--compact" aria-hidden="true">
          <OccupancyTile label="12" used={1} total={2} size="md" layout="compact" tabIndex={-1} />
          <span className="guide-pin guide-pin--top">
            Room number
            <span className="guide-pin__shaft" />
          </span>
          <span className="guide-pin guide-pin--dots">
            <span className="guide-pin__shaft" />
            Beds
          </span>
        </div>
        <figcaption className="explorer-guide__caption">
          <Text as="h3" size="sm" weight="semibold" color="primary">
            Room-only tile
          </Text>
          <Text size="xs" color="muted">
            Hostels with no units use this compact plate.
          </Text>
        </figcaption>
      </figure>
    </div>
  </div>
)

export default HostelExplorerGuide
