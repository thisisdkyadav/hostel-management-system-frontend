import { getDocument, GlobalWorkerOptions, PermissionFlag, version } from "pdfjs-dist"
// Vite emits the worker separately; it is only loaded when normal merging fails.
// eslint-disable-next-line import/no-unresolved
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url"

GlobalWorkerOptions.workerSrc = workerUrl

const withTimeout = async (promise, message) => {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(message)), 60_000) }),
    ])
  } finally {
    clearTimeout(timer)
  }
}

export const renderPdfForPrinting = async (bytes, onProgress = () => {}) => {
  const assetBase = `${import.meta.env.BASE_URL}pdfjs/${version}/`
  const task = getDocument({
    data: bytes.slice(), // PDF.js transfers its buffer to the worker.
    password: "",
    cMapUrl: `${assetBase}cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${assetBase}standard_fonts/`,
    wasmUrl: `${assetBase}wasm/`,
    iccUrl: `${assetBase}iccs/`,
    isEvalSupported: false,
  })
  let renderTask
  let canvas
  try {
    const pdf = await withTimeout(task.promise, "Timed out opening this PDF for printing.")
    const permissions = await withTimeout(pdf.getPermissions(), "Timed out checking PDF print permissions.")
    const allowed = permissions === null ? null : new Set(permissions)
    if (allowed && !allowed.has(PermissionFlag.PRINT) && !allowed.has(PermissionFlag.PRINT_HIGH_QUALITY)) {
      throw new Error("This PDF does not allow printing.")
    }
    if (!pdf.numPages) throw new Error("This PDF has no printable pages.")
    const { PDFDocument } = await import("pdf-lib")
    const output = await PDFDocument.create()
    for (let number = 1; number <= pdf.numPages; number += 1) {
      onProgress({ pageNumber: number, pageCount: pdf.numPages })
      const page = await withTimeout(pdf.getPage(number), "Timed out reading a PDF page.")
      const original = page.getViewport({ scale: 1 })
      // 150 dpi, bounded to avoid exhausting browser canvas memory on large pages.
      const scale = Math.min(150 / 72, 8192 / Math.max(original.width, original.height), Math.sqrt(16_000_000 / (original.width * original.height)))
      const viewport = page.getViewport({ scale })
      canvas = document.createElement("canvas")
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      renderTask = page.render({ canvasContext: canvas.getContext("2d"), viewport, intent: "print", background: "rgb(255,255,255)" })
      await withTimeout(renderTask.promise, "Timed out rendering a PDF page for printing.")
      renderTask = null
      const blob = await new Promise((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not create the printed page image.")), "image/png"))
      const image = await output.embedPng(await blob.arrayBuffer())
      output.addPage([original.width, original.height]).drawImage(image, { x: 0, y: 0, width: original.width, height: original.height })
      canvas.width = canvas.height = 0
      canvas = null
      page.cleanup()
    }
    return await output.save()
  } finally {
    renderTask?.cancel()
    if (canvas) canvas.width = canvas.height = 0
    await task.destroy()
  }
}
