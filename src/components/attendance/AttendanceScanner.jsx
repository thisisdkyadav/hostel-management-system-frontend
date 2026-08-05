import { useEffect, useRef, useState } from "react"
import { Html5Qrcode } from "html5-qrcode"
import { Button, StatusBadge, Input } from "czero/react"
import { Avatar, Alert } from "@/components/ui"
import { useToast } from "@/components/ui/feedback"
import { Camera, CameraOff, Keyboard, UserCheck } from "lucide-react"
import { attendanceApi } from "../../service"

const READER_ID = "attendance-qr-reader"

const AttendanceScanner = ({ occurrenceId, disabled = false, onMarked }) => {
  const { toast } = useToast()
  const [cameraOn, setCameraOn] = useState(false)
  const [hardwareOn, setHardwareOn] = useState(false)
  const [manualRoll, setManualRoll] = useState("")
  const [busy, setBusy] = useState(false)
  const [lastResult, setLastResult] = useState(null)

  const scannerRef = useRef(null)
  const processingRef = useRef(false)
  const lastKeyRef = useRef({ key: "", t: 0 })
  const handleQrRef = useRef(() => {})

  const applyResult = (res) => {
    const dup = res.result === "duplicate"
    const name = res.student?.name || res.student?.rollNumber || "Student"
    setLastResult({ type: dup ? "duplicate" : "success", student: res.student, inRoster: res.inRoster })
    toast[dup ? "info" : "success"](dup ? `${name} already marked present` : `${name} marked present`)
    onMarked?.()
  }

  const applyError = (err) => {
    const message = err?.message || "Scan failed"
    setLastResult({ type: "error", message })
    toast.error(message)
  }

  const submitScan = async (payload) => {
    if (processingRef.current) return
    processingRef.current = true
    setBusy(true)
    try {
      const res = await attendanceApi.scan(occurrenceId, payload)
      applyResult(res)
    } catch (err) {
      applyError(err)
    } finally {
      processingRef.current = false
      setBusy(false)
    }
  }

  const handleQr = (decodedText, source) => {
    let data
    try {
      data = JSON.parse(decodedText)
    } catch {
      setLastResult({ type: "error", message: "Unrecognized QR code" })
      return
    }
    if (!data?.e || !data?.d) {
      setLastResult({ type: "error", message: "Invalid QR code format" })
      return
    }
    const now = Date.now()
    if (processingRef.current) return
    if (lastKeyRef.current.key === data.d && now - lastKeyRef.current.t < 3000) return
    lastKeyRef.current = { key: data.d, t: now }
    submitScan({ email: data.e, encryptedData: data.d, source })
  }

  // Keep the ref pointing at the latest handler so the camera/keyboard effects
  // (which subscribe once) always call the current closure.
  useEffect(() => {
    handleQrRef.current = handleQr
  })

  const submitManual = async () => {
    const roll = manualRoll.trim()
    if (!roll || processingRef.current) return
    processingRef.current = true
    setBusy(true)
    try {
      const res = await attendanceApi.mark(occurrenceId, { rollNumber: roll, source: "manual" })
      applyResult(res)
      setManualRoll("")
    } catch (err) {
      applyError(err)
    } finally {
      processingRef.current = false
      setBusy(false)
    }
  }

  // Camera scanning (html5-qrcode)
  useEffect(() => {
    if (!cameraOn) return undefined

    const scanner = new Html5Qrcode(READER_ID)
    scannerRef.current = scanner

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 },
        (decodedText) => handleQrRef.current(decodedText, "camera"),
        () => {}
      )
      .catch((err) => {
        toast.error("Failed to start camera: " + (err?.message || "unknown error"))
        setCameraOn(false)
      })

    return () => {
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {})
      scannerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOn])

  // Hardware / keyboard-wedge scanning
  useEffect(() => {
    if (!hardwareOn) return undefined

    let buffer = ""
    let lastTime = 0

    const onKeyDown = (e) => {
      const active = document.activeElement
      const tag = active?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || active?.isContentEditable) return

      const now = Date.now()
      if (now - lastTime > 1000) buffer = ""
      lastTime = now

      if (e.key === "Enter") {
        const scanned = buffer
        buffer = ""
        if (scanned) handleQrRef.current(scanned, "scanner")
        return
      }
      if (e.key.length === 1) buffer += e.key
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [hardwareOn])

  if (disabled) {
    return (
      <Alert type="warning" icon>
        This occurrence is closed. Reopen it to scan attendance.
      </Alert>
    )
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
      <div style={{ display: "flex", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
        <Button variant={cameraOn ? "danger" : "primary"} onClick={() => setCameraOn((v) => !v)}>
          {cameraOn ? <><CameraOff size={16} /> Stop Camera</> : <><Camera size={16} /> Scan with Camera</>}
        </Button>
        <Button variant={hardwareOn ? "success" : "outline"} onClick={() => setHardwareOn((v) => !v)}>
          <Keyboard size={16} /> {hardwareOn ? "Hardware Scanner: On" : "Use Hardware Scanner"}
        </Button>
      </div>

      {hardwareOn && (
        <Alert type="info" icon>
          Hardware scanner active — scan a student QR and it will be recorded automatically. Keep this
          page focused and click outside any text field.
        </Alert>
      )}

      {cameraOn && (
        <div
          id={READER_ID}
          style={{
            width: "100%",
            maxWidth: 360,
            margin: "0 auto",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
          }}
        />
      )}

      <div style={{ display: "flex", gap: "var(--spacing-2)", alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Input
            value={manualRoll}
            onChange={(e) => setManualRoll(e.target.value)}
            placeholder="Enter roll number (manual entry)"
            onKeyDown={(e) => {
              if (e.key === "Enter") submitManual()
            }}
          />
        </div>
        <Button variant="secondary" onClick={submitManual} loading={busy} disabled={busy || !manualRoll.trim()}>
          <UserCheck size={16} /> Mark
        </Button>
      </div>

      {lastResult && lastResult.type === "error" && (
        <Alert type="error" icon dismissible onDismiss={() => setLastResult(null)}>
          {lastResult.message}
        </Alert>
      )}

      {lastResult && lastResult.type !== "error" && lastResult.student && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-3)",
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--color-border-primary)",
            backgroundColor: "var(--color-bg-tertiary)",
          }}
        >
          <Avatar src={lastResult.student.profileImage} name={lastResult.student.name} size="medium" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: "var(--font-weight-semibold)", color: "var(--color-text-heading)" }}>
              {lastResult.student.name || lastResult.student.rollNumber}
            </div>
            <div style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text-muted)" }}>
              {lastResult.student.rollNumber}
              {lastResult.student.department ? ` · ${lastResult.student.department}` : ""}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)", alignItems: "flex-end" }}>
            <StatusBadge
              tone={lastResult.type === "duplicate" ? "warning" : "success"}
              showDot
            >
              {lastResult.type === "duplicate" ? "Already present" : "Marked present"}
            </StatusBadge>
            {lastResult.inRoster === false && (
              <StatusBadge tone="warning" showDot={false}>Not in roster</StatusBadge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AttendanceScanner
