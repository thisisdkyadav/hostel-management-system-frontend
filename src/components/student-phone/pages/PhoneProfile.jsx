import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BedDouble,
  BookOpen,
  Calendar,
  ChevronRight,
  Droplet,
  FileText,
  Hash,
  KeyRound,
  Mail,
  MapPin,
  MonitorSmartphone,
  Pencil,
  Phone,
  ShieldPlus,
  Smartphone,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthProvider";
import { getMediaUrl } from "../../../utils/mediaUtils";
import { formatDateOnly } from "../../../utils/formatters";
import StudentEditProfileModal from "../../profile/StudentEditProfileModal";
import StudentFamilyDetails from "../../profile/StudentFamilyDetails";
import PdfViewerModal from "../../common/pdf/PdfViewerModal";
import ChangePasswordModal from "../../passwordChange/ChangePasswordModal";
import ManageSessionsModal from "../../sessions/ManageSessionsModal";
import { setPhoneBeta } from "../phoneBeta";
import { ErrorCard, Field, shortDate } from "../kit/ListBits";
import { myHealthQuery, myProfileQuery } from "../phoneQueries";
import { renderSheetModal } from "../kit/SheetModal";
import { ModalOverrideContext } from "../../common/AdaptiveModal";

const dateLabel = (value) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()))
    return formatDateOnly(value);
  return shortDate(value, true);
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

const Section = ({ title, children }) => (
  <section className="mp-section">
    <h2 className="mk-label">{title}</h2>
    <ul className="mk-list">{children}</ul>
  </section>
);

const ActionRow = ({ icon, label, onClick, tone }) => {
  const Icon = icon;
  return (
    <li>
      <button
        type="button"
        className="mk-field mk-field--action"
        data-tone={tone}
        onClick={onClick}
      >
        <Icon size={18} className="mk-field__icon" aria-hidden="true" />
        <span className="mk-field__main">
          <span className="mk-field__value">{label}</span>
        </span>
        <ChevronRight size={18} className="mk-row__chev" aria-hidden="true" />
      </button>
    </li>
  );
};

/** Your profile: who you are, where you live, who to call, and account settings. */
const PhoneProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const profile = useQuery(myProfileQuery());
  const health = useQuery(myHealthQuery());
  const [modal, setModal] = useState(null); // edit | password | sessions | insurance
  const data = profile.data || null;
  const healthData = health.data?.data || null;
  const userId = data?.userId || user?._id;

  if (profile.isPending) {
    return (
      <div className="mk-page">
        <div className="mp-hero">
          <span className="mk-shimmer mp-avatar" />
          <span className="mk-shimmer mp-ghost-line" />
          <span className="mk-shimmer mp-ghost-line mp-ghost-line--short" />
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="mk-page">
        <h1 className="mk-title">Profile</h1>
        <ErrorCard
          text="Couldn't load your profile."
          onRetry={() => profile.refetch()}
        />
      </div>
    );
  }

  const room =
    data.displayRoom || [data.room, data.bedNumber].filter(Boolean).join(" ");
  const hostelLine = [
    data.hostel?.name || data.hostel,
    data.unit?.unitNumber || data.unit,
    room,
  ]
    .filter((part) => part && typeof part === "string")
    .join(" · ");
  const academic = [data.degree, data.department, data.batch]
    .filter(Boolean)
    .join(" · ");
  const insurance = healthData?.insurance;
  const provider = insurance?.insuranceProvider;
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: myProfileQuery().queryKey });
    queryClient.invalidateQueries({ queryKey: myHealthQuery().queryKey });
  };

  return (
    <ModalOverrideContext.Provider value={renderSheetModal}>
      <div className="mk-page">
        <div className="mp-hero">
          {data.profileImage ? (
            <img
              className="mp-avatar"
              src={getMediaUrl(data.profileImage)}
              alt=""
            />
          ) : (
            <span className="mp-avatar mp-avatar--initials" aria-hidden="true">
              {initials(data.name)}
            </span>
          )}
          <h1 className="mp-name">{data.name}</h1>
          <p className="mk-sub">
            {[data.rollNumber, academic].filter(Boolean).join(" · ")}
          </p>
          {hostelLine && (
            <span className="mp-chip">
              <BedDouble size={14} aria-hidden="true" /> {hostelLine}
            </span>
          )}
          <button
            type="button"
            className="mk-btn mk-btn--soft mk-btn--sm"
            onClick={() => setModal("edit")}
          >
            <Pencil size={16} /> Edit profile
          </button>
        </div>

        <Section title="Contact">
          <Field icon={Mail} label="Email" value={data.email} />
          <Field
            icon={Mail}
            label="Secondary email"
            value={data.secondaryEmail}
          />
          <Field icon={Phone} label="Phone" value={data.phone} />
          <Field icon={MapPin} label="Permanent address" value={data.address} />
        </Section>

        <Section title="About you">
          <Field icon={Hash} label="Roll number" value={data.rollNumber} />
          <Field
            icon={Calendar}
            label="Date of birth"
            value={dateLabel(data.dateOfBirth)}
          />
          <Field icon={User} label="Gender" value={data.gender} />
          <Field icon={BookOpen} label="Programme" value={academic} />
          <Field
            icon={Users}
            label="Groups"
            value={
              Array.isArray(data.groups)
                ? data.groups.filter(Boolean).join(", ")
                : ""
            }
          />
          <Field
            icon={Mail}
            label="Faculty advisor"
            value={data.facultyAdvisorEmail}
          />
        </Section>

        {(data.guardian || data.guardianPhone || data.guardianEmail) && (
          <Section title="Emergency contact">
            <Field icon={User} label="Guardian" value={data.guardian} />
            <Field
              icon={Phone}
              label="Guardian phone"
              value={data.guardianPhone}
            />
            <Field
              icon={Mail}
              label="Guardian email"
              value={data.guardianEmail}
            />
          </Section>
        )}

        {healthData &&
          (healthData.bloodGroup ||
            provider?.name ||
            insurance?.insuranceNumber) && (
            <Section title="Health">
              <Field
                icon={Droplet}
                label="Blood group"
                value={healthData.bloodGroup}
              />
              <Field
                icon={ShieldPlus}
                label="Insurance"
                value={[provider?.name, insurance?.insuranceNumber]
                  .filter(Boolean)
                  .join(" · ")}
              />
              {provider?.startDate && provider?.endDate && (
                <Field
                  icon={Calendar}
                  label="Cover"
                  value={`${shortDate(provider.startDate, true)} – ${shortDate(provider.endDate, true)}`}
                />
              )}
              {insurance?.documentRef && (
                <ActionRow
                  icon={FileText}
                  label="View insurance document"
                  onClick={() => setModal("insurance")}
                />
              )}
            </Section>
          )}

        {health.isError && !healthData && (
          <section className="mp-section">
            <h2 className="mk-label">Health</h2>
            <ErrorCard
              text="Couldn't load your health details."
              onRetry={() => health.refetch()}
            />
          </section>
        )}

        <section className="mp-section">
          <h2 className="mk-label">Family</h2>
          <div className="mp-family">
            <StudentFamilyDetails userId={userId} editable={false} />
          </div>
        </section>

        <Section title="Account">
          <ActionRow
            icon={KeyRound}
            label="Change password"
            onClick={() => setModal("password")}
          />
          <ActionRow
            icon={MonitorSmartphone}
            label="Signed-in devices"
            onClick={() => setModal("sessions")}
          />
          <ActionRow
            icon={Smartphone}
            label="Switch to the classic view"
            onClick={() => setPhoneBeta(false)}
          />
        </Section>

        {modal === "edit" && (
          <StudentEditProfileModal
            isOpen
            userId={userId}
            currentData={data}
            onClose={() => setModal(null)}
            onUpdate={() => {
              setModal(null);
              refresh();
            }}
          />
        )}
        {modal === "password" && (
          <ChangePasswordModal
            email={data.email}
            onClose={() => setModal(null)}
          />
        )}
        {modal === "sessions" && (
          <ManageSessionsModal
            email={data.email}
            onClose={() => setModal(null)}
          />
        )}
        <PdfViewerModal
          isOpen={modal === "insurance"}
          onClose={() => setModal(null)}
          documentUrl={insurance?.documentRef}
          title="Insurance Document"
          subtitle={insurance?.documentName || "Student insurance PDF"}
          downloadFileName={insurance?.documentName || "insurance.pdf"}
          fileTypeHint="pdf"
        />
      </div>
    </ModalOverrideContext.Provider>
  );
};

export default PhoneProfile;
