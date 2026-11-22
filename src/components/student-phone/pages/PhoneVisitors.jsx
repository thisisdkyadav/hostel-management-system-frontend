import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { BedDouble, BookOpen, Plus } from "lucide-react";
import { accommodationApi } from "../../../service";
import { queryKeys } from "../../../lib/query";
import {
  getStatusTone,
  getStudentStatusLabel,
} from "../../../constants/accommodationStatus";
import AccommodationRequestWizard from "../../accommodation/AccommodationRequestWizard";
import AccommodationRequestDetail from "../../accommodation/AccommodationRequestDetail";
import AccommodationGuidelinesModal from "../../accommodation/AccommodationGuidelinesModal";
import {
  EmptyCard,
  ErrorCard,
  Ghosts,
  Lead,
  Pill,
  Row,
  shortDate,
} from "../kit/ListBits";
import { visitorRequestsQuery } from "../phoneQueries";
import { renderSheetModal } from "../kit/SheetModal";
import { ModalOverrideContext } from "../../common/AdaptiveModal";

const TONE = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  primary: "info",
};

const stayLine = (request) => {
  const from = request.stay?.fromDate;
  const to = request.stay?.toDate;
  if (!from) return "";
  const nights = request.nights
    ? ` · ${request.nights} night${request.nights === 1 ? "" : "s"}`
    : "";
  return `${shortDate(from)}${to ? ` – ${shortDate(to, true)}` : ""}${nights}`;
};

const guestsLine = (request) => {
  const count = request.persons ?? (request.guests?.length || 0);
  return count ? `${count} guest${count === 1 ? "" : "s"}` : "";
};

/** Guest accommodation: your requests as a list, the same wizard and detail as on desktop. */
const PhoneVisitors = () => {
  const queryClient = useQueryClient();
  const query = useQuery(visitorRequestsQuery());
  const requests = useMemo(() => query.data?.data?.items || [], [query.data]);
  const [guidelinesOpen, setGuidelinesOpen] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [resubmitTarget, setResubmitTarget] = useState(null);
  const [selected, setSelected] = useState(null);
  const [searchParams] = useSearchParams();
  const handledParam = useRef(null);

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: queryKeys.accommodationRequests.all,
    });

  const openDetail = async (row) => {
    setSelected(row);
    try {
      const res = await accommodationApi.getRequest(row._id || row.id);
      if (res?.data) setSelected(res.data);
    } catch {
      /* keep the row data */
    }
  };

  // Deep link from emails: ?request=<id>, once the guidelines are out of the way.
  useEffect(() => {
    const id = searchParams.get("request");
    if (!id || query.isPending || guidelinesOpen || handledParam.current === id)
      return;
    const match = requests.find(
      (r) => String(r._id) === id || String(r.id) === id,
    );
    if (match) {
      handledParam.current = id;
      queueMicrotask(() => openDetail(match));
    }
  }, [searchParams, requests, query.isPending, guidelinesOpen]);

  const refreshSelected = async () => {
    await refresh();
    if (!selected) return;
    try {
      const res = await accommodationApi.getRequest(
        selected._id || selected.id,
      );
      setSelected(res?.data || null);
    } catch {
      setSelected(null);
    }
  };

  const list = () => {
    if (query.isPending) return <Ghosts count={3} />;
    if (query.isError && !query.data)
      return (
        <ErrorCard
          text="Couldn't load your requests."
          onRetry={() => query.refetch()}
        />
      );
    if (requests.length === 0) {
      return (
        <EmptyCard
          icon={BedDouble}
          title="No requests yet"
          text="Family or friends visiting? Request a hostel room for them. Tap New to start."
        />
      );
    }
    return (
      <ul className="mk-list">
        {requests.map((request) => {
          const label = getStudentStatusLabel(request.status);
          const tone = TONE[getStatusTone(request.status)] || "info";
          return (
            <li key={request._id || request.id}>
              <Row
                lead={<Lead icon={BedDouble} tone={tone} />}
                title={stayLine(request) || "Guest stay"}
                meta={guestsLine(request)}
                onClick={() => openDetail(request)}
              >
                <Pill tone={tone}>{label}</Pill>
              </Row>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <ModalOverrideContext.Provider value={renderSheetModal}>
      <div className="mk-page mk-page--fab">
        <div className="mk-title-row">
          <h1 className="mk-title">Guest stays</h1>
          <button
            type="button"
            className="mk-btn mk-btn--soft mk-btn--sm"
            onClick={() => setGuidelinesOpen(true)}
          >
            <BookOpen size={16} /> Guidelines
          </button>
        </div>
        {list()}

        <button
          type="button"
          className="mk-fab"
          onClick={() => {
            setResubmitTarget(null);
            setWizardOpen(true);
          }}
          aria-label="New guest request"
        >
          <Plus size={22} strokeWidth={2.5} />
          <span>New</span>
        </button>

        <AccommodationGuidelinesModal
          open={guidelinesOpen}
          onClose={() => setGuidelinesOpen(false)}
        />
        <AccommodationRequestWizard
          open={wizardOpen}
          existingRequest={resubmitTarget}
          onClose={() => setWizardOpen(false)}
          onSubmitted={refresh}
        />
        <AccommodationRequestDetail
          open={Boolean(selected)}
          request={selected}
          onClose={() => setSelected(null)}
          onChanged={refreshSelected}
          onResubmit={(request) => {
            setSelected(null);
            setResubmitTarget(request);
            setWizardOpen(true);
          }}
        />
      </div>
    </ModalOverrideContext.Provider>
  );
};

export default PhoneVisitors;
