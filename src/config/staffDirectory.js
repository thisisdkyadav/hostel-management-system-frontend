import {
  Award, Bolt, Brush, Building2, Calendar, GraduationCap, Hammer, Hash, Lock, Mail,
  MoreHorizontal, Phone, Shield, ShieldCheck, Tag, User, UserCheck, UserCog,
  Users, Wifi, Wrench,
} from "lucide-react"
import { adminApi, superAdminApi } from "../service"
import {
  ACADEMICS_SUBROLE_OPTIONS,
  GYMKHANA_SUBROLE_OPTIONS,
} from "../constants/adminConstants"
import { HCU_SUBROLE } from "../constants/adminSubRoles"
import StaffAttendanceModal from "../components/admin/staff/StaffAttendanceModal"

/**
 * Every staff directory in the admin area, described rather than built.
 *
 * Eight screens were doing one job — list people, narrow the list, add, edit,
 * delete — in about 3,200 lines, because each had its own card, its own stats
 * row, its own add modal and its own edit form. The differences between them
 * are entirely in this file now: which endpoint, which fields, which filters.
 * StaffDirectory and StaffFormModal do the rest, once.
 *
 * A config is deliberately data and never JSX — icons and detail modals are
 * component references, stats and cards are functions of the list. Nothing in
 * this file renders, so nothing in it can quietly grow a layout of its own.
 *
 * Field types StaffFormModal understands:
 *   text · email · password · tel · date · select · checkboxes · image
 */

// ─── shared pieces ───────────────────────────────────────────────────────────

const hostelOptions = (ctx, emptyLabel) => [
  { value: "", label: emptyLabel },
  ...(ctx.hostelList || []).map((hostel) => ({ value: hostel._id, label: hostel.name })),
]

const hostelNames = (ids, ctx) => {
  const list = Array.isArray(ids) ? ids : ids ? [ids] : []
  if (list.length === 0) return null
  return list
    .map((ref) => {
      const id = typeof ref === "string" ? ref : ref?._id
      return (ctx.hostelList || []).find((h) => h._id === id)?.name || "Unknown hostel"
    })
    .join(", ")
}

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : null

const ASSIGNMENT_FILTERS = (isAssigned) => [
  { value: "all", label: "All" },
  { value: "assigned", label: "Assigned", match: isAssigned },
  { value: "unassigned", label: "Unassigned", match: (s) => !isAssigned(s) },
]

/** Assigned/unassigned is the same question on four of these screens. */
const assignmentStatus = (assigned) =>
  assigned
    ? { variant: "success", label: "Assigned" }
    : { variant: "warning", label: "Unassigned" }

const CREDENTIAL_FIELDS = [
  { name: "name", label: "Name", type: "text", icon: User, required: true, placeholder: "Full name" },
  { name: "email", label: "Email", type: "email", icon: Mail, required: true, placeholder: "name@iiti.ac.in" },
]

const PASSWORD_FIELD = {
  name: "password",
  label: "Password",
  type: "password",
  icon: Lock,
  placeholder: "Leave empty to create without a password",
}

// ─── wardens, associate wardens, hostel supervisors ──────────────────────────

/**
 * Three roles, one shape: a person attached to one or more hostels. They differ
 * only in wording and endpoint, so they are generated rather than written out.
 */
const hostelRole = ({ key, title, plural, api, extraFields = [], extraCard = () => [] }) => ({
  title,
  plural,
  icon: UserCog,
  searchPlaceholder: `Search ${plural.toLowerCase()} by name, email or hostel`,
  api,
  gridCols: { base: 1, md: 2, lg: 3 },

  filters: ASSIGNMENT_FILTERS((s) => s.hostelIds?.length > 0),
  search: (s, ctx) => [s.name, s.email, s.phone, s.extensionNumber, s.category, hostelNames(s.hostelIds, ctx)],

  stats: (list) => [
    { title: `Total ${plural}`, value: list.length, subtitle: `${plural} on record`, icon: Users, color: "var(--color-primary)" },
    { title: "Assigned", value: list.filter((s) => s.hostelIds?.length > 0).length, subtitle: "Attached to a hostel", icon: UserCheck, color: "var(--color-success)" },
    { title: "Unassigned", value: list.filter((s) => !s.hostelIds?.length).length, subtitle: "Available to assign", icon: Building2, color: "var(--color-warning)" },
  ],

  card: (s, ctx) => ({
    subtitle: s.category,
    image: s.profileImage,
    status: assignmentStatus(s.hostelIds?.length > 0),
    meta: formatDate(s.joinDate) ? `Joined ${formatDate(s.joinDate)}` : "Join date not recorded",
    fields: [
      { icon: Mail, value: s.email, label: "Email" },
      { icon: Phone, value: s.phone || "Not provided", label: "Phone" },
      ...extraCard(s),
      { icon: Building2, value: hostelNames(s.hostelIds, ctx) || "Not assigned", label: "Hostels" },
    ],
  }),

  fields: {
    create: [
      ...CREDENTIAL_FIELDS,
      PASSWORD_FIELD,
      { name: "phone", label: "Phone", type: "tel", icon: Phone, placeholder: "+91 98765 43210" },
      ...extraFields,
      { name: "category", label: "Category", type: "text", icon: Tag, placeholder: "e.g. Senior, Junior" },
      { name: "joinDate", label: "Join date", type: "date", icon: Calendar },
    ],
    edit: [
      { name: "profileImage", label: "Profile photo", type: "image" },
      CREDENTIAL_FIELDS[0],
      { name: "phone", label: "Phone", type: "tel", icon: Phone, placeholder: "+91 98765 43210" },
      ...extraFields,
      { name: "category", label: "Category", type: "text", icon: Tag, placeholder: "e.g. Senior, Junior" },
      {
        name: "hostelIds",
        label: "Hostel assignments",
        type: "checkboxes",
        options: (ctx) => (ctx.hostelList || []).map((h) => ({ value: h._id, label: h.name })),
        empty: "No hostels configured yet.",
      },
      { name: "joinDate", label: "Join date", type: "date", icon: Calendar },
    ],
  },

  // hostelIds arrive populated and go back as ids.
  toValues: (s) => ({ ...s, hostelIds: (s.hostelIds || []).map((h) => h._id || h), joinDate: s.joinDate?.slice(0, 10) || "" }),
  key,
})

// ─── gymkhana and academics ──────────────────────────────────────────────────

const subRoleRole = ({ key, title, plural, api, subRoles, extraFields = [], extraCard = () => [] }) => ({
  title,
  plural,
  icon: Award,
  searchPlaceholder: `Search ${plural.toLowerCase()} by name, email or sub-role`,
  api,
  gridCols: { base: 1, md: 2, lg: 3 },

  filters: [{ value: "all", label: "All" }, ...subRoles.map((r) => ({ value: r.value, label: r.label, match: (s) => s.subRole === r.value }))],
  search: (s) => [s.name, s.email, s.role, s.subRole, s.position, categoryText(s)],

  stats: (list) => [
    { title: `Total ${plural}`, value: list.length, subtitle: `${plural} on record`, icon: Users, color: "var(--color-primary)" },
    ...subRoles.map((r) => ({
      title: r.label,
      value: list.filter((s) => s.subRole === r.value).length,
      subtitle: "By sub-role",
      icon: Award,
      color: "var(--color-purple-text)",
    })),
  ],

  card: (s) => ({
    subtitle: s.position || s.subRole || "No sub-role assigned",
    status: s.subRole ? { variant: "primary", label: s.subRole } : { variant: "default", label: "No sub-role" },
    meta: `${title} user`,
    fields: [
      { icon: Mail, value: s.email || "Not available", label: "Email" },
      { label: "Sub role", value: s.subRole || "Not assigned" },
      ...extraCard(s),
    ],
  }),

  fields: {
    create: [
      ...CREDENTIAL_FIELDS,
      PASSWORD_FIELD,
      { name: "subRole", label: "Sub role", type: "select", icon: Award, required: true, options: subRoles, placeholder: "Select a sub role" },
      ...extraFields,
    ],
    edit: [
      CREDENTIAL_FIELDS[0],
      { name: "subRole", label: "Sub role", type: "select", icon: Award, required: true, options: subRoles, placeholder: "Select a sub role" },
      ...extraFields,
    ],
  },
  key,
})

const categoryText = (s) =>
  (Array.isArray(s.categoryLabels) && s.categoryLabels.length > 0 && s.categoryLabels.join(", ")) ||
  (Array.isArray(s.categories) && s.categories.length > 0 && s.categories.join(", ")) ||
  null

// ─── maintenance ─────────────────────────────────────────────────────────────

/**
 * The trade a maintenance member practises: its label, its mark, and its
 * colour twice over — `badge` is an hzero Badge variant, `tone` is the CSS
 * colour a StatCard takes. Seven trades need seven distinguishable colours,
 * which is exactly the palette; Attendant is teal rather than the pink the
 * old card used, because that pink is HMS's gender token and has no business
 * labelling a job.
 */
export const MAINTENANCE_CATEGORIES = [
  { value: "Plumbing", label: "Plumber", icon: Wrench, badge: "primary", tone: "var(--color-primary)" },
  { value: "Electrical", label: "Electrician", icon: Bolt, badge: "warning", tone: "var(--color-warning)" },
  { value: "Civil", label: "Carpenter", icon: Hammer, badge: "orange", tone: "var(--color-orange-text)" },
  { value: "Cleanliness", label: "House keeping", icon: Brush, badge: "success", tone: "var(--color-success)" },
  { value: "Internet", label: "IT technician", icon: Wifi, badge: "purple", tone: "var(--color-purple-text)" },
  { value: "Attendant", label: "Attendant", icon: User, badge: "teal", tone: "var(--color-teal-text)" },
  { value: "Other", label: "Other", icon: MoreHorizontal, badge: "default", tone: "var(--color-text-muted)" },
]

const maintenanceCategory = (value) =>
  MAINTENANCE_CATEGORIES.find((c) => c.value === value) || MAINTENANCE_CATEGORIES[MAINTENANCE_CATEGORIES.length - 1]

// ─── the registry ────────────────────────────────────────────────────────────

export const STAFF_TYPES = {
  warden: hostelRole({
    key: "warden",
    title: "Warden",
    plural: "Wardens",
    api: { list: adminApi.getAllWardens, create: adminApi.addWarden, update: adminApi.updateWarden, remove: adminApi.deleteWarden },
  }),

  associateWarden: hostelRole({
    key: "associateWarden",
    title: "Associate warden",
    plural: "Associate wardens",
    api: { list: adminApi.getAllAssociateWardens, create: adminApi.addAssociateWarden, update: adminApi.updateAssociateWarden, remove: adminApi.deleteAssociateWarden },
  }),

  hostelSupervisor: {
    ...hostelRole({
      key: "hostelSupervisor",
      title: "Hostel supervisor",
      plural: "Hostel supervisors",
      api: { list: adminApi.getAllHostelSupervisors, create: adminApi.addHostelSupervisor, update: adminApi.updateHostelSupervisor, remove: adminApi.deleteHostelSupervisor },
      extraCard: (s) => [
        { icon: Hash, value: s.extensionNumber ? `Ext ${s.extensionNumber}` : "Not provided", label: "Extension" },
      ],
    }),
    fields: {
      create: [
        ...CREDENTIAL_FIELDS,
        PASSWORD_FIELD,
        { type: "heading", name: "contactHeading", label: "Contact" },
        { name: "phone", label: "Phone Number", type: "tel", icon: Phone, placeholder: "10-digit phone number", help: "Optional" },
        { name: "extensionNumber", label: "Extension Number", type: "text", icon: Hash, placeholder: "e.g. 2345", help: "Optional" },
        { name: "category", label: "Category", type: "text", icon: Tag, placeholder: "e.g. Senior, Junior" },
        { name: "joinDate", label: "Join date", type: "date", icon: Calendar },
      ],
      edit: [
        { name: "profileImage", label: "Profile photo", type: "image" },
        CREDENTIAL_FIELDS[0],
        { type: "heading", name: "contactHeading", label: "Contact" },
        { name: "phone", label: "Phone Number", type: "tel", icon: Phone, placeholder: "10-digit phone number", help: "Optional" },
        { name: "extensionNumber", label: "Extension Number", type: "text", icon: Hash, placeholder: "e.g. 2345", help: "Optional" },
        { name: "category", label: "Category", type: "text", icon: Tag, placeholder: "e.g. Senior, Junior" },
        {
          name: "hostelIds",
          label: "Hostel assignments",
          type: "checkboxes",
          options: (ctx) => (ctx.hostelList || []).map((h) => ({ value: h._id, label: h.name })),
          empty: "No hostels configured yet.",
        },
        { name: "joinDate", label: "Join date", type: "date", icon: Calendar },
      ],
    },
  },

  gymkhana: subRoleRole({
    key: "gymkhana",
    title: "Gymkhana",
    plural: "Gymkhana users",
    api: { list: adminApi.getAllGymkhanaUsers, create: adminApi.addGymkhana, update: adminApi.updateGymkhana, remove: adminApi.deleteGymkhana },
    subRoles: GYMKHANA_SUBROLE_OPTIONS,
    extraFields: [
      { name: "position", label: "Position", type: "text", icon: Tag, placeholder: "e.g. Secretary, Convenor" },
      {
        name: "categories",
        label: "Categories",
        type: "checkboxes",
        // Fetched, not configured — the admin can add event categories at will.
        options: (ctx) => (ctx.gymkhanaCategories || []).map((c) => ({ value: c.key, label: c.label || c.key })),
        empty: "No Gymkhana categories configured yet.",
      },
    ],
    extraCard: (s) => [{ label: "Categories", value: categoryText(s) || "Not assigned" }],
  }),

  academics: subRoleRole({
    key: "academics",
    title: "Academics",
    plural: "Academics users",
    api: { list: adminApi.getAllAcademicsUsers, create: adminApi.addAcademics, update: adminApi.updateAcademics, remove: adminApi.deleteAcademics },
    subRoles: ACADEMICS_SUBROLE_OPTIONS,
  }),

  security: {
    key: "security",
    title: "Security login",
    plural: "Security staff",
    icon: Shield,
    searchPlaceholder: "Search security staff by name or email",
    api: { list: adminApi.getAllSecurityLogins, create: adminApi.addSecurity, update: adminApi.updateSecurity, remove: adminApi.deleteSecurity },
    gridCols: { base: 1, md: 2, lg: 3 },

    filters: ASSIGNMENT_FILTERS((s) => Boolean(s.hostelId)),
    search: (s, ctx) => [s.name, s.email, hostelNames(s.hostelId, ctx)],

    stats: (list) => [
      { title: "Total security", value: list.length, subtitle: "Security staff members", icon: ShieldCheck, color: "var(--color-primary)" },
      { title: "Assigned", value: list.filter((s) => s.hostelId).length, subtitle: "Currently assigned", icon: UserCheck, color: "var(--color-success)" },
      { title: "Unassigned", value: list.filter((s) => !s.hostelId).length, subtitle: "Available to assign", icon: Building2, color: "var(--color-warning)" },
    ],

    // Attendance history is a different screen from the card, not a bigger
    // card — so it stays a modal of its own, shared with maintenance. The
    // reference and its props stay separate so this file holds no JSX.
    detailsModal: StaffAttendanceModal,
    detailsProps: { staffType: "security" },

    card: (s, ctx) => ({
      subtitle: "Security staff",
      status: assignmentStatus(Boolean(s.hostelId)),
      fields: [
        { icon: Mail, value: s.email, label: "Email" },
        { icon: Building2, value: hostelNames(s.hostelId, ctx) || "Not assigned to any hostel", label: "Hostel" },
      ],
    }),

    fields: {
      create: [
        ...CREDENTIAL_FIELDS,
        { ...PASSWORD_FIELD, required: true, placeholder: "Enter a strong password", help: "At least 8 characters." },
        { name: "hostelId", label: "Assign hostel", type: "select", icon: Building2, required: true, options: (ctx) => hostelOptions(ctx, "Select a hostel") },
      ],
      edit: [
        CREDENTIAL_FIELDS[0],
        { name: "hostelId", label: "Hostel assignment", type: "select", icon: Building2, options: (ctx) => hostelOptions(ctx, "Not assigned to any hostel") },
      ],
    },
  },

  maintenance: {
    key: "maintenance",
    title: "Maintenance staff",
    plural: "Maintenance staff",
    icon: Wrench,
    searchPlaceholder: "Search staff by name, email or trade",
    api: { list: adminApi.getAllMaintenanceStaff, create: adminApi.addMaintenanceStaff, update: adminApi.updateMaintenanceStaff, remove: adminApi.deleteMaintenanceStaff },
    gridCols: { base: 1, lg: 2, xl: 3 },

    filters: [
      { value: "all", label: "All" },
      ...MAINTENANCE_CATEGORIES.map((c) => ({ value: c.value, label: c.label, match: (s) => s.category === c.value })),
    ],
    // Trades stay together under the "All" filter, in the order the filter row
    // lists them. Anything unrecognised sorts to the end rather than to "P".
    sort: (a, b) => {
      const rank = (s) => {
        const index = MAINTENANCE_CATEGORIES.findIndex((c) => c.value === s.category)
        return index === -1 ? MAINTENANCE_CATEGORIES.length : index
      }
      return rank(a) - rank(b)
    },
    search: (s) => [s.name, s.email, s.category, maintenanceCategory(s.category).label],

    // Every trade, not a sample of them: the point of this row is to see the
    // shape of the workforce at a glance, and three of seven is not a shape.
    stats: (list) => [
      { title: "Total staff", value: list.length, subtitle: "All trades", icon: Wrench, color: "var(--color-primary)" },
      ...MAINTENANCE_CATEGORIES.map((c) => ({
        title: c.label,
        value: list.filter((s) => s.category === c.value).length,
        subtitle: "On record",
        icon: c.icon,
        color: c.tone,
      })),
    ],

    detailsModal: StaffAttendanceModal,
    detailsProps: { staffType: "maintenance", showWorkStats: true },

    card: (s) => {
      const category = maintenanceCategory(s.category)
      return {
        subtitle: category.label,
        image: s.profileImage,
        status: { variant: category.badge, label: category.label },
        fields: [
          { icon: Mail, value: s.email, label: "Email" },
          { icon: Phone, value: s.phone || "Not provided", label: "Phone" },
        ],
      }
    },

    fields: {
      create: [
        ...CREDENTIAL_FIELDS,
        { ...PASSWORD_FIELD, required: true, placeholder: "Enter a strong password" },
        { name: "category", label: "Trade", type: "select", icon: Wrench, required: true, options: MAINTENANCE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })), placeholder: "Select a trade" },
      ],
      edit: [
        CREDENTIAL_FIELDS[0],
        { name: "phone", label: "Phone", type: "tel", icon: Phone, placeholder: "+91 98765 43210" },
        { name: "category", label: "Trade", type: "select", icon: Wrench, required: true, options: MAINTENANCE_CATEGORIES.map((c) => ({ value: c.value, label: c.label })) },
      ],
    },
  },

  hcu: {
    key: "hcu",
    title: "HCU staff",
    plural: "HCU staff",
    icon: GraduationCap,
    searchPlaceholder: "Search HCU staff by name or email",
    // Admins live behind the super-admin endpoints; the list is narrowed to
    // the one sub-role this screen administers.
    api: {
      list: async () => ((await superAdminApi.getAllAdmins()) || []).filter((a) => a?.subRole === HCU_SUBROLE),
      create: (payload) => superAdminApi.createAdmin({ ...payload, subRole: HCU_SUBROLE }),
      update: superAdminApi.updateAdmin,
      remove: superAdminApi.deleteAdmin,
    },
    gridCols: { base: 1, md: 2, lg: 3 },

    filters: [],
    search: (s) => [s.name, s.email, s.phone],

    stats: (list) => [
      { title: "Total HCU staff", value: list.length, subtitle: "Health Centre Unit", icon: Users, color: "var(--color-primary)" },
      { title: "With phone", value: list.filter((s) => s.phone).length, subtitle: "Reachable", icon: Phone, color: "var(--color-success)" },
    ],

    card: (s) => ({
      subtitle: "Health Centre Unit",
      status: { variant: "primary", label: "HCU" },
      fields: [
        { icon: Mail, value: s.email, label: "Email" },
        { icon: Phone, value: s.phone || "Not provided", label: "Phone" },
      ],
    }),

    fields: {
      create: [...CREDENTIAL_FIELDS, { ...PASSWORD_FIELD, required: true }, { name: "phone", label: "Phone", type: "tel", icon: Phone }],
      edit: [CREDENTIAL_FIELDS[0], { name: "phone", label: "Phone", type: "tel", icon: Phone }],
    },
  },
}

export default STAFF_TYPES
