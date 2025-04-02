import React, { useState, useEffect } from "react"
import { QRCodeSVG } from "qrcode.react"
import { useAuth } from "../contexts/AuthProvider"
import { FaQrcode, FaSyncAlt, FaDownload, FaInfoCircle } from "react-icons/fa"
import forge from "node-forge"
import Button from "./common/Button"

const QRCodeGenerator = () => {
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
      e: user.email,
      d: encryptedData,
    }
    const qrDataString = JSON.stringify(qrData)
    setQrData(qrDataString)
    setShowQR(true)
    setLoading(false)
    setExpiryTime(expiryMs)
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="p-2.5 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
          <FaQrcode size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Campus Access QR Code</h2>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-5 flex items-start">
        <FaInfoCircle className="text-[#1360AB] mt-0.5 mr-2 flex-shrink-0" />
        <p className="text-sm text-gray-700">This QR code acts as your digital ID. Security personnel will scan this code to verify your identity. For security reasons, each code expires after 5 minutes.</p>
      </div>

      {!showQR ? (
        <Button onClick={generateQR} isLoading={loading} variant="primary" fullWidth icon={<FaQrcode />}>
          Generate QR Code
        </Button>
      ) : (
        <div className="flex flex-col items-center">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 inline-block">
            <QRCodeSVG id="qr-code-canvas" value={qrData} size={240} bgColor={"#ffffff"} fgColor={"#1360AB"} level={"H"} includeMargin={true} />
          </div>

          {countdown !== null && (
            <div className="mt-3 flex items-center text-sm font-medium">
              <div className={`inline-block w-3 h-3 rounded-full mr-2 ${countdown > 60 ? "bg-green-500" : "bg-red-500 animate-pulse"}`}></div>
              <span>Expires in {formatCountdown(countdown)} minutes</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 w-full mt-4">
            <div className="grid grid-cols-1 gap-3 w-full mt-4">
              <Button onClick={generateQR} variant="secondary" icon={<FaSyncAlt />}>
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QRCodeGenerator
