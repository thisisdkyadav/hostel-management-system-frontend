const asArray = (value) => Array.isArray(value) ? value : []

export const formatProofLocation = (location) => [
  location.section,
  location.fieldLabel,
  location.itemNumber ? `Item ${location.itemNumber}${location.itemTitle ? `: ${location.itemTitle}` : ""}` : "",
  `Proof ${location.proofNumber}`,
].filter(Boolean).join(" → ")

export const collectPdfDocumentsFromProofs = (proofs = [], fallbackLabel = "Supporting Document", context = {}) =>
  asArray(proofs).flatMap((proof, index) => {
    const isPor = proof?.sourceType === "por"
    const linkedPor = proof?.linkedPor
    const url = isPor ? linkedPor?.supportingDocumentUrl : proof?.url
    if (!url) return []

    const proofPath = context.proofsPath ? `${context.proofsPath}[${index}]` : `proofs[${index}]`
    return [{
      url,
      label: (isPor ? linkedPor?.supportingDocumentName || linkedPor?.positionTitle : "") || proof?.label || fallbackLabel,
      locations: [{
        ...context,
        section: context.section || fallbackLabel,
        proofNumber: index + 1,
        proofLabel: proof?.label || "",
        sourceType: isPor ? "por" : "upload",
        fieldPath: `${proofPath}.${isPor ? "linkedPor.supportingDocumentUrl" : "url"}`,
        ...(isPor ? { linkedPorTitle: linkedPor?.positionTitle || "", porRequestId: proof.porRequestId || linkedPor?.id || null } : {}),
      }],
    }]
  })

export const collectApplicationPdfDocuments = (application = null) => {
  if (!application) return []

  const documents = []
  const addProofs = (proofs, context) => {
    documents.push(...collectPdfDocumentsFromProofs(proofs, context.fieldLabel || context.section, context))
  }

  addProofs(application.coursework?.proofs, {
    section: "Student Academic Profile", fieldLabel: "Coursework (CGPA / CPI)", proofsPath: "coursework.proofs",
  })
  addProofs(application.projectThesis?.btpAwardProofs, {
    section: "BTP & Project Grade Details", fieldLabel: "BTP award", proofsPath: "projectThesis.btpAwardProofs",
  })
  addProofs(application.projectThesis?.projectGradeProofs, {
    section: "BTP & Project Grade Details", fieldLabel: "Project grade", proofsPath: "projectThesis.projectGradeProofs",
  })

  const addItemProofs = (items, section, itemsPath) => {
    for (const [index, item] of asArray(items).entries()) {
      addProofs(item?.proofs, {
        section,
        itemNumber: index + 1,
        itemTitle: item?.title || "",
        eventName: item?.eventName || "",
        referenceCode: item?.referenceCode || "",
        proofsPath: `${itemsPath}[${index}].proofs`,
      })
    }
  }

  addItemProofs(application.projectThesis?.publicationItems, "Project publications / patents", "projectThesis.publicationItems")
  addItemProofs(application.projectThesis?.technologyTransferItems, "Technology transfer", "projectThesis.technologyTransferItems")
  addItemProofs(application.responsibilityItems, "Responsibilities", "responsibilityItems")
  addItemProofs(application.awardItems, "Awards", "awardItems")
  addItemProofs(application.culturalItems, "Cultural activities", "culturalItems")
  addItemProofs(application.scienceTechnologyItems, "Science & Technology activities", "scienceTechnologyItems")
  addItemProofs(application.gamesSportsItems, "Games & Sports activities", "gamesSportsItems")
  addItemProofs(application.coCurricularItems, "Co-curricular activities", "coCurricularItems")

  const uniqueByUrl = new Map()
  for (const document of documents) {
    const key = String(document.url).trim()
    if (!key) continue
    const existing = uniqueByUrl.get(key)
    if (existing) {
      existing.locations.push(...document.locations)
    } else {
      uniqueByUrl.set(key, document)
    }
  }

  return [...uniqueByUrl.values()]
}
