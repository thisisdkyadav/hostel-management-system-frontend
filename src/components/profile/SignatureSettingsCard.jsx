import { useEffect, useMemo, useRef, useState } from "react"
import { Button, Input } from "czero/react"
import { compressImage } from "pdf-certificate-kit"
import toast from "react-hot-toast"
import { PenLine, Trash2, Upload, Type, Image as ImageIcon } from "lucide-react"
import {
  Card,
  CardHeader,
  CardContent,
  Label,
  FileInput,
  ToggleButtonGroup,
  Spinner,
} from "@/components/ui"
import { signatureApi, uploadApi } from "@/service"
import { resolveUploadedFileRef } from "@/service/modules/upload.api"
import { getMediaUrl } from "@/utils/mediaUtils"

const SIGNATURE_TYPES = [
  { value: "image", label: "Image", icon: <ImageIcon size={15} /> },
  { value: "text", label: "Text", icon: <Type size={15} /> },
]

/**
 * Universal profile section: lets any user define their certificate signature
 * (name + position + image or text). Images are downscaled client-side so both
 * the stored file and any generated PDF stay tiny. Students always sign as "Student".
 */
const SignatureSettingsCard = ({ user }) => {
  const isStudent = user?.role === "Student"
  const defaultPosition = isStudent ? "Student" : user?.subRole || user?.role || ""

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [type, setType] = useState("image")
  const [name, setName] = useState("")
  const [position, setPosition] = useState(defaultPosition)
  const [text, setText] = useState("")
  const [imageRef, setImageRef] = useState(null)
  // Local (just-compressed) preview takes precedence over the stored ref's URL.
  const [localPreview, setLocalPreview] = useState("")
  const fileInputRef = useRef(null)

  useEffect(() => {
    let active = true
    signatureApi
      .getMine()
      .then((data) => {
        if (!active) return
        const signature = data?.signature
        if (signature) {
          setType(signature.type === "text" ? "text" : "image")
          setName(signature.name || user?.name || "")
          setPosition(isStudent ? "Student" : signature.position || defaultPosition)
          setText(signature.text || "")
          setImageRef(signature.imageRef || null)
        } else {
          setName(user?.name || "")
          setPosition(defaultPosition)
        }
      })
      .catch((error) => {
        console.error("Failed to load signature:", error)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const imageSrc = useMemo(() => {
    if (localPreview) return localPreview
    if (imageRef) return getMediaUrl(imageRef)
    return ""
  }, [localPreview, imageRef])

  const handleImageSelect = async (event) => {
    const file = event?.target?.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      // Downscale + recompress to a small PNG before uploading.
      const compressed = await compressImage(file, { maxDimension: 400, mimeType: "image/png" })
      setLocalPreview(compressed.dataUrl)

      const formData = new FormData()
      formData.append("image", compressed.blob, "signature.png")
      const response = await uploadApi.uploadSignatureImage(formData)
      const fileRef = resolveUploadedFileRef(response)
      if (!fileRef) throw new Error("Upload did not return a file reference")
      setImageRef(fileRef)
      toast.success("Signature image uploaded")
    } catch (error) {
      console.error("Signature image upload failed:", error)
      setLocalPreview("")
      toast.error(error?.message || "Failed to upload signature image")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      toast.error("Please enter a name for your signature")
      return
    }
    if (type === "image" && !imageRef) {
      toast.error("Please upload a signature image")
      return
    }
    if (type === "text" && !text.trim()) {
      toast.error("Please enter your signature text")
      return
    }

    setSaving(true)
    try {
      const data = await signatureApi.updateMine({
        type,
        name: trimmedName,
        position: isStudent ? "Student" : position.trim(),
        imageRef: type === "image" ? imageRef : null,
        text: type === "text" ? text.trim() : "",
      })
      const signature = data?.signature
      if (signature) {
        setImageRef(signature.imageRef || null)
        setLocalPreview("")
      }
      toast.success("Signature saved")
    } catch (error) {
      console.error("Failed to save signature:", error)
      toast.error(error?.message || "Failed to save signature")
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    setSaving(true)
    try {
      await signatureApi.deleteMine()
      setType("image")
      setName(user?.name || "")
      setPosition(defaultPosition)
      setText("")
      setImageRef(null)
      setLocalPreview("")
      toast.success("Signature removed")
    } catch (error) {
      console.error("Failed to remove signature:", error)
      toast.error(error?.message || "Failed to remove signature")
    } finally {
      setSaving(false)
    }
  }

  const hasExistingSignature = Boolean(imageRef) || Boolean(text.trim())

  return (
    <Card style={{ marginTop: "var(--spacing-6)" }}>
      <CardHeader
        icon={<PenLine size={18} />}
        title="Signature"
        subtitle="Used on certificates that include you as a signatory. Add an image of your signature or type it as text."
      />

      <CardContent>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "var(--spacing-6)" }}>
            <Spinner />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "var(--spacing-4)",
              }}
            >
              <div>
                <Label htmlFor="signature-name" required>
                  Name
                </Label>
                <Input
                  id="signature-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Name shown on the certificate"
                />
              </div>
              <div>
                <Label htmlFor="signature-position">Position</Label>
                <Input
                  id="signature-position"
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                  placeholder="e.g. Dean, Student Affairs"
                  disabled={isStudent}
                  readOnly={isStudent}
                />
                {isStudent ? (
                  <p style={{ marginTop: "var(--spacing-1)", fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Students always sign as “Student”.
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Label>Signature type</Label>
              <div style={{ marginTop: "var(--spacing-1)" }}>
                <ToggleButtonGroup options={SIGNATURE_TYPES} value={type} onChange={setType} size="small" />
              </div>
            </div>

            {type === "image" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                <Label>Signature image</Label>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)", flexWrap: "wrap" }}>
                  <div
                    style={{
                      width: 220,
                      height: 90,
                      border: "1px dashed var(--color-border-input)",
                      borderRadius: "var(--radius-lg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "var(--color-bg-secondary)",
                      overflow: "hidden",
                    }}
                  >
                    {imageSrc ? (
                      <img
                        src={imageSrc}
                        alt="Signature preview"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                        No image
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                    <FileInput
                      ref={fileInputRef}
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleImageSelect}
                      hidden
                      id="signature-image-input"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      loading={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload size={15} /> {imageRef ? "Replace image" : "Upload image"}
                    </Button>
                    <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      PNG with transparent background works best. Auto-compressed to a small size.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="signature-text">Signature text</Label>
                <Input
                  id="signature-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Your name as a typed signature"
                />
                {text.trim() ? (
                  <div
                    style={{
                      marginTop: "var(--spacing-2)",
                      padding: "var(--spacing-3) var(--spacing-4)",
                      border: "1px dashed var(--color-border-input)",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-bg-secondary)",
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      fontStyle: "italic",
                      fontSize: "var(--font-size-xl)",
                      color: "var(--color-text-heading)",
                    }}
                  >
                    {text}
                  </div>
                ) : null}
              </div>
            )}

            <div style={{ display: "flex", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
              <Button onClick={handleSave} loading={saving} disabled={uploading}>
                Save signature
              </Button>
              {hasExistingSignature ? (
                <Button variant="ghost" onClick={handleRemove} disabled={saving || uploading}>
                  <Trash2 size={15} /> Remove
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SignatureSettingsCard
