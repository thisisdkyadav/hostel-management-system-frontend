import "./student-phone.css";
import { Smartphone } from "lucide-react";
import { Switch } from "hzero";
import { isPhoneDevice } from "./phoneMode";
import { setPhoneBeta, usePhoneBeta } from "./phoneBeta";

/** Profile card (phones only): use the phone app (default) or, for this visit, the classic layout. */
const PhoneBetaCard = () => {
  const on = usePhoneBeta();
  if (!isPhoneDevice()) return null;
  return (
    <div className="sp-beta-card">
      <span className="sp-beta-card__icon" aria-hidden="true">
        <Smartphone size={20} />
      </span>
      <div className="sp-beta-card__text">
        <strong>Phone app</strong>
        <span>
          SMS designed for your phone. Turn it off to use the classic layout for this visit; it comes back when you reopen SMS.
        </span>
      </div>
      <Switch
        checked={on}
        onChange={(event) => setPhoneBeta(event.target.checked)}
        aria-label="Use the phone app"
      />
    </div>
  );
};

export default PhoneBetaCard;
