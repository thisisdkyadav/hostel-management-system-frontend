import hmsLogo from "../../assets/hms-logo-t-256.svg"
import "../../styles/login.css"

/**
 * The shell every auth page sits in: the decorative background, the centred
 * card, and the logo.
 *
 * This markup used to be copy-pasted six times across four pages — once per
 * page, and once more for each of ResetPasswordPage's loading and error
 * states. The copies had drifted to 4, 6 and 24 blobs; nothing in the design
 * depended on that, it was just where each paste stopped.
 */

// Position, size and animation for each blob live in login.css, keyed by
// number. The markup carries no information beyond the count.
const BLOB_COUNT = 24

export const AuthLayout = ({ children }) => (
  <div className="login-page">
    {/* Decorative only — nothing here is worth announcing. */}
    <div className="login-bg-container" aria-hidden="true">
      {Array.from({ length: BLOB_COUNT }, (_, i) => (
        <div key={i} className={`login-blob-${i + 1}`} />
      ))}
    </div>

    <div className="login-content-container">
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-logo-section">
            <img src={hmsLogo} className="login-logo" alt="HMS Logo" />
          </div>
          {children}
        </div>
      </div>
    </div>
  </div>
)

/**
 * The in-card spinner, at the two sizes login.css styles: "large" for a page
 * that is entirely a loading state, the default for one sitting inside a
 * button. Was the same four lines of SVG pasted into four files.
 */
export const AuthSpinner = ({ size = "default" }) => (
  <svg
    className={size === "large" ? "login-spinner-large" : "login-spinner"}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
)

export default AuthLayout
