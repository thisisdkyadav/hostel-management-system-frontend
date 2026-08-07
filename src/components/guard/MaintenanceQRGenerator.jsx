import React, { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { useAuth } from "../../contexts/AuthProvider"
import { FaQrcode, FaSyncAlt, FaInfoCircle } from "react-icons/fa"
import forge from "node-forge"
import { Button } from "hzero"
import { Grid, Heading, HStack, Text, VStack } from "@/components/ui"

const MaintenanceQRGenerator = () => {
  const { user } = useAuth()
  const [publicKey, setPublicKey] = useState("")
  const [qrData, setQrData] = useState("")
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)
  const [expiryTime, setExpiryTime] = useState(null)
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    const storedPublicKey = localStorage.getItem("publicKey")
    setPublicKey(storedPublicKey)
  }, [])

  useEffect(() => {
    let timer
    if (expiryTime) {
      timer = setInterval(() => {
        const now = Date.now()
        const timeLeft = Math.max(0, Math.floor((expiryTime - now) / 1000))

        if (timeLeft <= 0) {
          clearInterval(timer)
          setShowQR(false)
          setExpiryTime(null)
        }

        setCountdown(timeLeft)
      }, 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [expiryTime])

  const formatCountdown = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const encryptData = (aesKey, data) => {
    const key = forge.util.hexToBytes(aesKey)
    const iv = forge.random.getBytesSync(16)

    const cipher = forge.cipher.createCipher("AES-CBC", key)
    cipher.start({ iv })
    cipher.update(forge.util.createBuffer(data, "utf8"))
    cipher.finish()

    return forge.util.encode64(iv) + ":" + forge.util.encode64(cipher.output.getBytes())
  }

  const generateQR = () => {
    if (!publicKey) {
      alert("Public key not found. Please contact the administrator.")
      return
    }

    setLoading(true)

    const expiryMinutes = 5
    const expiryMs = Date.now() + expiryMinutes * 60 * 1000

    const encryptedData = encryptData(publicKey, expiryMs)
    const qrData = {
      email: user.email,
      encryptedData: encryptedData,
    }
    const qrDataString = JSON.stringify(qrData)
    setQrData(qrDataString)
    setShowQR(true)
    setLoading(false)
    setExpiryTime(expiryMs)
  }

  return (
    <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-6)', boxShadow: 'var(--shadow-sm)', border: `var(--border-1) solid var(--color-border-light)`, transition: 'var(--transition-all)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}>
      <HStack gap="none" align="center" style={{ marginBottom: 'var(--spacing-4)' }}>
        <Text as="div" color="brand" style={{ padding: 'var(--spacing-2-5)', marginRight: 'var(--spacing-3)', borderRadius: 'var(--radius-xl)', backgroundColor: 'var(--color-primary-bg)' }}>
          <FaQrcode size={parseInt(getComputedStyle(document.documentElement).getPropertyValue('--icon-lg'))} />
        </Text>
        <Heading as="h2" size="xl" weight="bold" color="secondary">Maintenance Attendance QR Code</Heading>
      </HStack>

      <div style={{ backgroundColor: 'var(--color-info-bg-light)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-5)', display: 'flex', alignItems: 'flex-start' }}>
        <FaInfoCircle style={{ marginTop: 'var(--spacing-0-5)', marginRight: 'var(--spacing-2)', flexShrink: 0 }} color="var(--color-primary)" />
        <Text size="sm" color="body">Generate your QR code for attendance tracking. Hostel gate personnel will scan this code to mark your attendance. For security reasons, each code expires after 5 minutes.</Text>
      </div>

      {!showQR ? (
        <Button onClick={generateQR} loading={loading} variant="primary" fullWidth>
          <FaQrcode /> Generate QR Code
        </Button>
      ) : (
        <VStack gap="none" align="center">
          <div style={{ backgroundColor: 'var(--color-white)', padding: 'var(--spacing-4)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', border: `var(--border-1) solid var(--color-border-primary)`, display: 'inline-block' }}>
            <QRCodeSVG id="qr-code-canvas" value={qrData} size={240} bgColor={"#ffffff"} fgColor={getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim() || "#1360AB"} level={"H"} includeMargin={true} />
          </div>

          {countdown !== null && (
            <HStack align="center" gap="none" size="sm" weight="medium" style={{ marginTop: 'var(--spacing-3)' }}>
              <div style={{
                display: 'inline-block', width: 'var(--spacing-3)', height: 'var(--spacing-3)', borderRadius: 'var(--radius-full)', marginRight: 'var(--spacing-2)', backgroundColor: countdown > 60 ? 'var(--color-success)' : 'var(--color-danger)',
                animation: countdown > 60 ? 'none' : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}></div>
              <span>Expires in {formatCountdown(countdown)} minutes</span>
            </HStack>
          )}

          <Grid cols={1} gap={3} style={{ width: '100%', marginTop: 'var(--spacing-4)' }}>
            <Button onClick={generateQR} variant="secondary">
              <FaSyncAlt /> Refresh
            </Button>
          </Grid>
        </VStack>
      )}
    </div>
  )
}

export default MaintenanceQRGenerator
