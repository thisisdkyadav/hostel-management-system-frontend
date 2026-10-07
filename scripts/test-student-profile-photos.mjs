import assert from "node:assert/strict"
import { test } from "node:test"
import { buildProfilePhotoItems, uploadProfilePhotoBatches } from "../src/utils/studentProfilePhotos.js"

const file = (name, extra = {}) => ({ name, type: "image/jpeg", size: 1024, ...extra })

test("JPEG filenames identify exact rolls; invalid files and duplicate rolls are reported", () => {
  const items = buildProfilePhotoItems([
    file("230001024.JPG"), file("230001024.jpeg"), file("abc-123.JPEG"),
    file("photo.png", { type: "image/png" }), file("big.jpg", { size: 512001 }),
    file("empty.jpg", { size: 0 }), file("bad name.jpg"),
  ])
  assert.equal(items[0].rollNumber, "230001024")
  assert.equal(items[2].rollNumber, "ABC-123")
  assert.deepEqual(items.map((item) => item.status), ["ready", "invalid", "ready", "invalid", "invalid", "invalid", "invalid"])
})

test("4,000-file queue stays within four active uploads and continues after failures", async () => {
  const items = buildProfilePhotoItems(Array.from({ length: 4000 }, (_, index) => file(`${index}.jpg`)))
  let active = 0
  let maxActive = 0
  const results = []
  await uploadProfilePhotoBatches({
    items,
    upload: async (picture) => {
      active += 1
      maxActive = Math.max(active, maxActive)
      await new Promise((resolve) => setImmediate(resolve))
      active -= 1
      if (picture.name === "12.jpg") throw new Error("Temporary failure")
      return { status: picture.name === "13.jpg" ? "skipped" : "updated" }
    },
    onBatch: (batch) => results.push(...batch),
  })
  assert.equal(results.length, 4000)
  assert.equal(maxActive, 4)
  assert.equal(results.filter((item) => item.status === "updated").length, 3998)
  assert.equal(results[12].status, "error")
  assert.equal(results[13].status, "skipped")
  assert.equal(results[3999].status, "updated")
})

test("stopping finishes the current batch; resuming only uploads pending files", async () => {
  let items = buildProfilePhotoItems(Array.from({ length: 9 }, (_, index) => file(`${index}.jpg`)))
  let stopped = false
  const uploads = []
  const upload = async (picture) => { uploads.push(picture.name); return { status: "updated" } }
  await uploadProfilePhotoBatches({
    items, upload, shouldStop: () => stopped,
    onBatch: (batch) => {
      const updated = new Map(batch.map((item) => [item.id, item]))
      items = items.map((item) => updated.get(item.id) || item)
      stopped = true
    },
  })
  assert.equal(uploads.length, 4)
  await uploadProfilePhotoBatches({ items, upload, onBatch: () => {} })
  assert.equal(uploads.length, 9)
  assert.equal(new Set(uploads).size, 9)
})

test("retry only uploads failed files and treats malformed responses as failures", async () => {
  let results
  await uploadProfilePhotoBatches({
    items: buildProfilePhotoItems([file("1.jpg"), file("2.jpg")]),
    upload: async (picture) => picture.name === "1.jpg" ? {} : { status: "updated" },
    onBatch: (batch) => { results = batch },
  })
  const retried = []
  await uploadProfilePhotoBatches({
    items: results.map((item) => item.status === "error" ? { ...item, status: "ready" } : item),
    upload: async (picture) => { retried.push(picture.name); return { status: "updated" } },
    onBatch: () => {},
  })
  assert.deepEqual(retried, ["1.jpg"])
})
