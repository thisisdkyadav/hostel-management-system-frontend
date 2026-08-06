/**
 * The circular initial shown beside a POR applicant.
 *
 * Its own module because it is a function returning JSX rather than a
 * component, and react-refresh cannot hot-update a file that exports both.
 */
export const renderStudentAvatar = (name) => {
  const initials = String(name || "S")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
  return <div className="por-student-avatar">{initials}</div>
}
