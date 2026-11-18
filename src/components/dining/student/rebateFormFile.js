// Gets a phone-picked file ready for the long-term rebate form upload.
//
// Phone pickers (Drive, WhatsApp, Files, scanner apps) often hand over files with
// an empty MIME type and no extension, and phone cameras take 10 MB+ photos. So the
// type is worked out from the first bytes, big photos are shrunk, and the file is
// renamed with a proper extension so every later check (ours and the server's) agrees.

export const REBATE_FORM_MAX_MB = 10
const MAX_BYTES = REBATE_FORM_MAX_MB * 1024 * 1024
// Photos above this get re-encoded; a filled A4 form stays readable at 2400px.
const SHRINK_ABOVE_BYTES = 3 * 1024 * 1024
const MAX_EDGE_PX = 2400

const EXTENSIONS = { "application/pdf": "pdf", "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" }

const startsWith = (bytes, signature, offset = 0) => signature.every((value, index) => bytes[offset + index] === value)
const ascii = (bytes, from, to) => String.fromCharCode(...bytes.slice(from, to))

const sniffType = async (file) => {
  const bytes = new Uint8Array(await file.slice(0, 1024).arrayBuffer())
  // "%PDF" may follow a little junk at the start, which PDF readers allow.
  if (ascii(bytes, 0, bytes.length).includes("%PDF-")) return "application/pdf"
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg"
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "image/png"
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 12) === "WEBP") return "image/webp"
  if (ascii(bytes, 0, 4) === "GIF8") return "image/gif"
  if (ascii(bytes, 4, 8) === "ftyp" && /^(heic|heix|hevc|heim|heis|mif1|msf1)$/.test(ascii(bytes, 8, 12))) return "image/heic"
  return ""
}

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => resolve({ image, release: () => URL.revokeObjectURL(url) })
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Couldn't read that photo. Please try another one."))
    }
    image.src = url
  })

const shrinkPhoto = async (file) => {
  const { image, release } = await loadImage(file)
  try {
    const scale = Math.min(1, MAX_EDGE_PX / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(image.naturalWidth * scale)
    canvas.height = Math.round(image.naturalHeight * scale)
    const context = canvas.getContext("2d")
    context.fillStyle = "#fff" // transparent PNGs would turn black in JPEG
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85))
    return blob && blob.size < file.size ? { blob, type: "image/jpeg" } : null
  } finally {
    release()
  }
}

const baseName = (name) => (String(name || "").replace(/\.[^./\\]{1,5}$/, "").trim() || "rebate-form").slice(0, 80)

/** Returns a File with a trusted type, name and size, or throws an Error with a student-facing message. */
export const prepareRebateFormFile = async (file) => {
  const type = await sniffType(file)
  if (type === "image/heic") {
    throw new Error("HEIC photos can't be uploaded. Take a screenshot of the photo, or change the camera format to JPG, and upload that.")
  }
  if (!type) throw new Error("Please choose a PDF or a photo (JPG or PNG) of the filled form.")

  let blob = file
  let finalType = type
  if (type !== "application/pdf" && type !== "image/gif" && file.size > SHRINK_ABOVE_BYTES) {
    const shrunk = await shrinkPhoto(file)
    if (shrunk) ({ blob, type: finalType } = shrunk)
  }
  if (blob.size > MAX_BYTES) {
    const sizeMb = (blob.size / (1024 * 1024)).toFixed(1)
    throw new Error(
      type === "application/pdf"
        ? `This PDF is ${sizeMb} MB; the limit is ${REBATE_FORM_MAX_MB} MB. Scan it at a lower quality or upload a photo instead.`
        : `This photo is ${sizeMb} MB; the limit is ${REBATE_FORM_MAX_MB} MB. Please try another photo.`
    )
  }
  return new File([blob], `${baseName(file.name)}.${EXTENSIONS[finalType]}`, { type: finalType })
}
