import { useState } from "react"
import { ArrowRight, Keyboard } from "lucide-react"
import { Spinner, useToast } from "hzero"

const errorText = (error) => error?.response?.data?.message || error?.message || "Couldn't check that student in"

/** A small roll-number box in the stream header: type, press Enter, and the scan joins the feed. */
const ManualEntry = ({ onSubmit, onEntry, hint = "" }) => {
  const { toast } = useToast()
  const [roll, setRoll] = useState("")
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    const rollNumber = roll.trim()
    if (!rollNumber || busy) return
    setBusy(true)
    try {
      const data = await onSubmit(rollNumber)
      const verification = data?.verification
      if (verification) onEntry?.(verification)
      const name = verification?.student?.name || rollNumber
      if (verification?.status === "verified") toast.success(`${name} checked in`)
      else toast.warning(`${name}: ${verification?.message || "not checked in"}`)
      setRoll("")
    } catch (error) {
      toast.error(errorText(error))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="lf-manual" onSubmit={submit} role="search" title={hint ? `Check in by roll number. ${hint}.` : "Check in by roll number"}>
      <Keyboard size={16} className="lf-manual-icon" aria-hidden="true" />
      <input
        className="lf-manual-input"
        value={roll}
        onChange={(event) => setRoll(event.target.value)}
        placeholder="Roll number"
        aria-label="Check in by roll number"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="go"
        disabled={busy}
      />
      <button type="submit" className="lf-manual-go" aria-label="Check in" disabled={!roll.trim() || busy}>
        {busy ? <Spinner size={16} thickness="thin" /> : <ArrowRight size={16} aria-hidden="true" />}
      </button>
    </form>
  )
}

export default ManualEntry
