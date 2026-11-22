import "./student-phone.css"
import { Smartphone } from "lucide-react"
import { Switch } from "hzero"
import { isPhoneDevice } from "./phoneMode"
import { setPhoneBeta, usePhoneBeta } from "./phoneBeta"

/** Profile card (phones only): switch the new phone app beta on or off. */
const PhoneBetaCard = () => {
  const on = usePhoneBeta()
  if (!isPhoneDevice()) return null
  return (
    <div className="sp-beta-card">
      <span className="sp-beta-card__icon" aria-hidden="true">
        <Smartphone size={20} />
      </span>
      <div className="sp-beta-card__text">
        <strong>
          New phone app <span className="sp-beta-card__tag">Beta</span>
        </strong>
        <span>SMS redesigned for your phone. Turn it off any time to go back.</span>
      </div>
      <Switch checked={on} onChange={(event) => setPhoneBeta(event.target.checked)} aria-label="Use the new phone app" />
    </div>
  )
}

export default PhoneBetaCard
