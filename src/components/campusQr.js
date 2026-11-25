import forge from "node-forge"

/** Minutes a campus QR stays valid; the gate scanner rejects older codes. */
export const CAMPUS_QR_MINUTES = 5

const encrypt = (aesKey, data) => {
  const key = forge.util.hexToBytes(aesKey)
  const iv = forge.random.getBytesSync(16)
  const cipher = forge.cipher.createCipher("AES-CBC", key)
  cipher.start({ iv })
  cipher.update(forge.util.createBuffer(String(data), "utf8"))
  cipher.finish()
  return forge.util.encode64(iv) + ":" + forge.util.encode64(cipher.output.getBytes())
}

/** The string a campus QR encodes: the student's email and the encrypted expiry time. */
export const campusQrValue = (publicKey, email, expiryMs) => JSON.stringify({ e: email, d: encrypt(publicKey, expiryMs) })
