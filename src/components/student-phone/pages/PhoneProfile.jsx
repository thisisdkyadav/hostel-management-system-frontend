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
  Plus,
  Phone,
  ShieldPlus,
  LogOut,
  Monitor,
  User,
  Users,
} from "lucide-react";
import { useAuth } from "../../../contexts/AuthProvider";
import { useLogout } from "../../../hooks/useLogout";
import { getMediaUrl } from "../../../utils/mediaUtils";
import StudentEditProfileModal from "../../profile/StudentEditProfileModal";
import { studentProfileApi } from "../../../service";
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
  // Date-only strings (YYYY-MM-DD) as a local date, so no timezone shift; same "24 Jan 2004" style as the rest of the app.
  const match = typeof value === "string" && value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) return shortDate(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])), true);
  return shortDate(value, true);
};

const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

/** Call button for a phone-number Field. */
const CallButton = ({ phone, who }) => (
  <a className="mk-btn mk-btn--soft mk-btn--sm" href={`tel:${String(phone).replace(/[^\d+]/g, "")}`} aria-label={`Call ${who}`}>
    <Phone size={15} aria-hidden="true" /> Call
  </a>
);

/** Family members on record, read-only here (edited from Edit profile). */
const FamilySection = ({ onAdd }) => {
  const query = useQuery({ queryKey: ["student", "family"], queryFn: () => studentProfileApi.getFamilyMembers() });
  const members = query.data?.data || [];
  if (query.isPending) return null;
  return (
    <section className="mp-section">
      <h2 className="mk-label">Family</h2>
      {query.isError && !query.data ? (
        <ErrorCard text="Couldn't load your family details." onRetry={() => query.refetch()} />
      ) : members.length === 0 ? (
        <div className="mp-empty-row">
          <p className="mk-sub">No family members added yet.</p>
          <button type="button" className="mk-btn mk-btn--soft mk-btn--sm" onClick={onAdd}>
            <Plus size={16} /> Add
          </button>
        </div>
      ) : (
        <ul className="mk-list">
          {members.map((member) => (
            <Field
              key={member.id || member._id}
              icon={Users}
              label={member.relationship || "Family"}
              value={[member.name, member.phone].filter(Boolean).join(" · ")}
              action={member.phone ? <CallButton phone={member.phone} who={member.name || "family member"} /> : null}
            />
          ))}
        </ul>
      )}
    </section>
  );
};

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
        {tone !== "danger" && <ChevronRight size={18} className="mk-row__chev" aria-hidden="true" />}
      </button>
    </li>
  );
};

/** Your profile: who you are, where you live, who to call, and account settings. */
const PhoneProfile = () => {
  const { user } = useAuth();
  const logout = useLogout();
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
    queryClient.invalidateQueries({ queryKey: ["student", "family"] });
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
              action={data.guardianPhone ? <CallButton phone={data.guardianPhone} who={data.guardian || "guardian"} /> : null}
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
                value={
                  provider?.name || insurance?.insuranceNumber ? (
                    <>
                      {provider?.name && <span className="mk-line">{provider.name}</span>}
                      {insurance?.insuranceNumber && <span className="mk-line mk-sub">Policy {insurance.insuranceNumber}</span>}
                    </>
                  ) : null
                }
              />
              {provider?.startDate && provider?.endDate && (
                <Field
                  icon={Calendar}
                  label="Cover"
                  value={`${shortDate(provider.startDate, true)} – ${shortDate(provider.endDate, true)}`}
                  action={new Date(provider.endDate) < new Date() ? <span className="mh-insure__flag">Expired</span> : <span className="mp-ok">Active</span>}
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

        <FamilySection onAdd={() => setModal("edit")} />

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
            icon={Monitor}
            label="Switch to the classic view"
            onClick={() => setPhoneBeta(false)}
          />
          <ActionRow icon={LogOut} label="Log out" tone="danger" onClick={logout} />
        </Section>

        {modal === "edit" && (
          <StudentEditProfileModal
            isOpen
            userId={userId}
            currentData={data}
            onClose={() => {
              setModal(null);
              queryClient.invalidateQueries({ queryKey: ["student", "family"] });
            }}
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
