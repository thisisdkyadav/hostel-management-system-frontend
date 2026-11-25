import { useCallback, useEffect, useState } from "react"
import { QRCodeSVG } from "qrcode.react"
import { RefreshCw, ShieldAlert } from "lucide-react"
import { useAuth } from "../../../contexts/AuthProvider"
import { CAMPUS_QR_MINUTES, campusQrValue } from "../../campusQr"

const LIFETIME = CAMPUS_QR_MINUTES * 60 * 1000

const readKey = () => {
  try {
    return localStorage.getItem("publicKey") || ""
  } catch {
    return ""
  }
}

const clock = (ms) => {
  const seconds = Math.max(0, Math.ceil(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

/**
 * The campus QR, ready the moment it opens: no "Generate" step at the gate.
 * A fresh code is made when it opens and again whenever the old one expires,
 * so whatever is on screen always scans.
 */
const CampusQr = () => {
  const { user } = useAuth()
  const [publicKey] = useState(readKey)
  const email = user?.email
  const make = useCallback(() => {
    if (!publicKey || !email) return null
    const expires = Date.now() + LIFETIME
    return { value: campusQrValue(publicKey, email, expires), expires }
  }, [publicKey, email])
  const [code, setCode] = useState(make)
  const [now, setNow] = useState(() => Date.now())
  const renew = () => {
    setCode(make())
    setNow(Date.now())
  }

  // One clock: tick the countdown, and swap in a new code once the old one runs out.
  useEffect(() => {
    const timer = setInterval(() => {
      const at = Date.now()
      setNow(at)
      setCode((current) => (!current || current.expires <= at ? make() : current))
    }, 1000)
    return () => clearInterval(timer)
  }, [make])

  const left = code ? code.expires - now : 0

  if (!publicKey) {
    return (
      <div className="mk-empty" role="alert">
        <span className="mk-empty__icon">
          <ShieldAlert size={28} />
        </span>
        <p className="mk-empty__title">QR isn't set up on this device</p>
        <p className="mk-sub">Log out and log in again. If it still doesn't show, contact the hostel office.</p>
      </div>
    )
  }

  return (
    <div className="mq">
      <p className="mq__note">Show this to security at the gate. It proves who you are and changes every {CAMPUS_QR_MINUTES} minutes.</p>
      <div className="mq__code">
        {code && <QRCodeSVG value={code.value} size={232} bgColor="#ffffff" fgColor="#0b1b33" level="H" marginSize={2} title="Campus QR code" />}
        {user?.name && <span className="mq__who">{user.name}</span>}
      </div>
      <div className="mq__timer" aria-live="off">
        <span className="mq__bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${Math.max(0, Math.min(1, left / LIFETIME))})` }} />
        </span>
        <span>
          Renews in <strong>{clock(left)}</strong>
        </span>
        <button type="button" className="mk-btn mk-btn--soft mk-btn--sm" onClick={renew}>
          <RefreshCw size={15} /> Refresh code
        </button>
      </div>
    </div>
  )
}

export default CampusQr
