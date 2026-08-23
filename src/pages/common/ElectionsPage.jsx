import { useEffect, useMemo, useState } from "react"
import { Badge, Button, EmptyState, ErrorState, Grid, Input, LoadingState, Modal, Surface, Table, Text, useToast } from "hzero"
import { FileText, History, Plus } from "lucide-react"
import PageHeader from "@/components/common/PageHeader"
import ConfirmationDialog from "@/components/common/ConfirmationDialog"
import CsvUploader from "@/components/common/CsvUploader"
import { useAuth } from "@/contexts/AuthProvider"
import { useGlobal } from "@/contexts/GlobalProvider"
import { useSocket } from "@/contexts/SocketProvider"
import { electionsApi, emailApi } from "@/service"
import AdminElectionWorkspace from "@/components/elections/AdminElectionWorkspace"
import StudentElectionWorkspace from "@/components/elections/StudentElectionWorkspace"
import {
  ElectionHistoryModal,
  CloneElectionModal,
  ElectionWizardModal,
  AdminNominationReviewModal,
  StudentNominationModal,
  AdminResultsEditModal,
} from "@/components/elections/ElectionModals"
import { HeaderSelect } from "@/components/elections/ElectionShared"
import { escapeCsvValue as escapeCsv } from "@/utils/csvExport"

import { badgeRowStyle, compactStatLabelStyle, compactStatStyle, compactStatValueStyle, detailGridStyle, detailPanelStyle, errorBannerStyle, errorTextStyle, getStatusTone, headerSelectStyle, infoBannerStyle, infoGridStyle, labelStyle, modalBodyStyle, mutedTextStyle, pageStyle, pillBaseStyle, postTabListStyle, postTabStyle, selectStyle, statusToneStyles, textareaStyle, timelineCellStyle, timelinePreviewStyle, workspaceStyle } from "./elections/styles"
import { nominationTabs, nominationTemplateHeaders, phaseOptions, postCategoryOptions, requirementFieldDefs, statusOptions, timelineFieldDefs, votingAccessOptions, votingListTemplateHeaders, wizardSteps } from "./elections/constants"
import { buildD15Timeline, buildResultsDraftMap, formatApiErrorMessage, formatDateTime, formatElectionOptionLabel, formatStageLabel, formatVotePercentage, fromDateTimeLocal, sortByActivity, splitListInput, summarizeScope } from "./elections/helpers"
import { buildElectionFormFromDetail, buildNominationDraftFromPost, buildNominationPayload, createBlankElectionForm, createBlankNominationForm, createBlankPost, createBlankSupporterEntry, hydrateSupporterEntries, serializeElectionFormForApi } from "./elections/form"
import { createEmptyWizardErrors, validateElectionWizard, validateNominationForm } from "./elections/validation"
import { useElectionsData } from "./elections/useElectionsData"






































































const ElectionsPage = () => {
  const { user } = useAuth()
  const { hostelList = [], fetchHostelList } = useGlobal()
  const { on: onSocketEvent, isConnected: isSocketConnected } = useSocket()
  const { toast } = useToast()

  const isAdminView = user?.role === "Admin" || user?.role === "Super Admin"
  const isStudentView = user?.role === "Student"
  const isGymkhanaElectionOfficerView =
    user?.role === "Gymkhana" &&
    String(user?.subRole || "").trim().toLowerCase().replace(/\s+/g, " ") === "election officer"
  const isAdminLikeView = isAdminView || isGymkhanaElectionOfficerView

  const [selectedAdminElectionId, setSelectedAdminElectionId] = useState("")
  const [adminViewTab, setAdminViewTab] = useState(isGymkhanaElectionOfficerView ? "nominations" : "posts")
  const [nominationTab, setNominationTab] = useState("all")
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const [showMockHistoryElections, setShowMockHistoryElections] = useState(false)

  const [selectedStudentElectionId, setSelectedStudentElectionId] = useState("")

  const [wizardOpen, setWizardOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState("create")
  const [wizardForm, setWizardForm] = useState(createBlankElectionForm())

  const [reviewNomination, setReviewNomination] = useState(null)
  const [nominationFormDrafts, setNominationFormDrafts] = useState({})
  const [nominationContext, setNominationContext] = useState(null)
  const [supportLookupKey, setSupportLookupKey] = useState("")
  const [voteSelections, setVoteSelections] = useState({})
  const [resultsDrafts, setResultsDrafts] = useState({})
  const [resultsEditorPostId, setResultsEditorPostId] = useState("")
  const [busyKey, setBusyKey] = useState("")
  const [showSendVotingEmailsConfirm, setShowSendVotingEmailsConfirm] = useState(false)
  const [sendVotingEmailMode, setSendVotingEmailMode] = useState("reuse_existing")
  const [sendVotingEmailReminder, setSendVotingEmailReminder] = useState(false)
  const [sendVotingEmailRollNumbers, setSendVotingEmailRollNumbers] = useState([])
  const [showVotingEmailRecipientsModal, setShowVotingEmailRecipientsModal] = useState(false)
  const [showSendTestEmailsConfirm, setShowSendTestEmailsConfirm] = useState(false)
  const [sendTestEmailRollNumbers, setSendTestEmailRollNumbers] = useState([])
  const [manualTestEmailRollNumber, setManualTestEmailRollNumber] = useState("")
  const [showTestEmailRecipientsModal, setShowTestEmailRecipientsModal] = useState(false)
  const [showSmtpTestModal, setShowSmtpTestModal] = useState(false)
  const [smtpTestEmail, setSmtpTestEmail] = useState("")
  const [smtpTestResult, setSmtpTestResult] = useState(null)
  const [showPublishResultsConfirm, setShowPublishResultsConfirm] = useState(false)
  const [showResultsExportModal, setShowResultsExportModal] = useState(false)
  const [resultsExportVariant, setResultsExportVariant] = useState("flat")
  const [cloneElectionOpen, setCloneElectionOpen] = useState(false)
  const [cloneElectionTitle, setCloneElectionTitle] = useState("")

  const {
    batchOptions,
    groupOptions,
    adminElections,
    selectedAdminElection,
    liveVotingStats,
    loadingVotingStats,
    votingEmailRecipientsData,
    loadingVotingEmailRecipients,
    testEmailRecipientsData,
    loadingTestEmailRecipients,
    studentElections,
    isLoadingCore,
    coreError,
    refetchAdminDetail,
    refetchLiveVotingStats,
    setLiveVotingStatsCache,
    refreshAdminElections,
    refreshStudentPortal,
    retryCore,
    saveElectionMutation,
  } = useElectionsData({
    isAdminView,
    isAdminLikeView,
    isStudentView,
    selectedAdminElectionId,
    showVotingEmailRecipientsModal,
    showTestEmailRecipientsModal,
    liveStatsPollTabActive: isAdminView && adminViewTab === "voting",
  })

  const savingElection = saveElectionMutation.isPending
  const loading = isLoadingCore
  const error = coreError ? formatApiErrorMessage(coreError, "Failed to load elections") : ""

  const normalizedHostels = useMemo(
    () =>
      (hostelList || [])
        .map((hostel) => ({
          id: hostel?._id || hostel?.id || hostel?.name || hostel?.hostelName,
          name: hostel?.name || hostel?.hostelName || "",
        }))
        .filter((hostel) => hostel.id && hostel.name),
    [hostelList]
  )

  const selectedStudentElection = useMemo(
    () => studentElections.find((item) => item.id === selectedStudentElectionId) || null,
    [studentElections, selectedStudentElectionId]
  )

  const adminSelectableElections = useMemo(
    () => adminElections.filter((item) => !Boolean(item?.mockSettings?.enabled)),
    [adminElections]
  )

  const selectedAdminElectionOption = useMemo(
    () =>
      selectedAdminElection ||
      adminElections.find((item) => String(item.id) === String(selectedAdminElectionId)) ||
      null,
    [adminElections, selectedAdminElection, selectedAdminElectionId]
  )

  const filteredNominations = useMemo(() => {
    const nominations = selectedAdminElection?.nominations || []
    if (nominationTab === "all") return nominations
    return nominations.filter((nomination) => nomination.status === nominationTab)
  }, [selectedAdminElection, nominationTab])

  const adminOverview = useMemo(() => {
    const posts = selectedAdminElection?.posts || []
    const nominations = selectedAdminElection?.nominations || []
    return {
      postCount: posts.length,
      nominationCount: nominations.length,
      verifiedCount: nominations.filter((item) => item.status === "verified").length,
      voteCount: posts.reduce((total, post) => total + Number(post.voteCount || 0), 0),
    }
  }, [selectedAdminElection])

  const selectedAdminResultPost = useMemo(
    () => (selectedAdminElection?.results?.posts || []).find((item) => item.postId === resultsEditorPostId) || null,
    [resultsEditorPostId, selectedAdminElection]
  )

  const cloneElectionDisabledReason = useMemo(() => {
    if (!selectedAdminElection) return ""
    if (["voting", "results", "handover", "completed", "cancelled"].includes(selectedAdminElection.currentStage)) {
      return "Copy is only available before voting starts."
    }

    const hasPendingNominationReview = (selectedAdminElection?.nominations || []).some((nomination) =>
      ["submitted", "modification_requested"].includes(String(nomination.status || ""))
    )

    if (hasPendingNominationReview) {
      return "Copy is available only after all nominations are verified, rejected, or withdrawn."
    }

    return ""
  }, [selectedAdminElection])

  const canCloneElection = Boolean(selectedAdminElection && !cloneElectionDisabledReason)
  const isAdminElectionLiveVotingStage = selectedAdminElection?.currentStage === "voting"

  useEffect(() => {
    if (isAdminView && (!hostelList || hostelList.length === 0)) {
      fetchHostelList?.()
    }
  }, [fetchHostelList, hostelList, isAdminView])

  // Default the admin selection once per loaded list; preserve an existing
  // valid pick across background refetches (old loader behaviour).
  const [lastAdminElections, setLastAdminElections] = useState(null)
  if (isAdminLikeView && lastAdminElections !== adminElections) {
    setLastAdminElections(adminElections)
    const nonMockElections = adminElections.filter((item) => !Boolean(item?.mockSettings?.enabled))
    setSelectedAdminElectionId((current) => {
      if (current && adminElections.some((item) => item.id === current)) return current
      return sortByActivity(nonMockElections) || nonMockElections[0]?.id || ""
    })
  }

  // Seed the student portal selection plus nomination drafts / vote selections
  // whenever fresh student election data lands.
  const [lastStudentElections, setLastStudentElections] = useState(null)
  if (isStudentView && lastStudentElections !== studentElections) {
    setLastStudentElections(studentElections)

    setSelectedStudentElectionId((current) => {
      if (current && studentElections.some((item) => item.id === current)) return current
      return sortByActivity(studentElections) || studentElections[0]?.id || ""
    })

    const nextDrafts = {}
    const nextVoteSelections = {}
    studentElections.forEach((election) => {
      ;(election.posts || []).forEach((post) => {
        nextDrafts[`${election.id}:${post.id}`] = buildNominationDraftFromPost(post)
        nextVoteSelections[`${election.id}:${post.id}`] = post.votedCandidateNominationId || ""
      })
    })
    setNominationFormDrafts(nextDrafts)
    setVoteSelections(nextVoteSelections)
  }

  useEffect(() => {
    if (!isGymkhanaElectionOfficerView) return
    if (adminViewTab !== "nominations") {
      setAdminViewTab("nominations")
    }
  }, [adminViewTab, isGymkhanaElectionOfficerView])

  useEffect(() => {
    if (!selectedAdminElection?.results) {
      setResultsDrafts({})
      return
    }
    setResultsDrafts(buildResultsDraftMap(selectedAdminElection.results))
  }, [selectedAdminElection])

  useEffect(() => {
    if (!isAdminView) return

    // The data layer owns stats fetching/clearing; this effect only keeps the
    // tab honest when the voting window closes.
    if (!selectedAdminElection?.votingControlWindowOpen && adminViewTab === "voting") {
      setAdminViewTab("posts")
    }
  }, [adminViewTab, isAdminView, selectedAdminElection?.votingControlWindowOpen])

  useEffect(() => {
    if (!isAdminView) return

    const canViewResults = ["results", "handover", "completed"].includes(selectedAdminElection?.currentStage)
    if (adminViewTab === "results" && !canViewResults) {
      setAdminViewTab("posts")
    }
  }, [adminViewTab, isAdminView, selectedAdminElection?.currentStage])

  useEffect(() => {
    if (!isAdminView || !selectedAdminElectionId) return undefined

    const cleanupVotingUpdate = onSocketEvent?.("election:voting-live:update", (payload) => {
      if (String(payload?.electionId || "") !== String(selectedAdminElectionId)) return
      setLiveVotingStatsCache(() => payload?.stats || null)
    })

    const cleanupDispatchUpdate = onSocketEvent?.("election:voting-live:dispatch", (payload) => {
      if (String(payload?.electionId || "") !== String(selectedAdminElectionId)) return
      setLiveVotingStatsCache((current) => ({
        electionId: String(payload?.electionId || selectedAdminElectionId),
        generatedAt: current?.generatedAt || null,
        overview: current?.overview || {},
        posts: current?.posts || [],
        dispatch: payload?.dispatch || {},
      }))
    })

    return () => {
      cleanupVotingUpdate?.()
      cleanupDispatchUpdate?.()
    }
  }, [isAdminView, onSocketEvent, selectedAdminElectionId])

  const openCreateWizard = () => {
    setWizardMode("create")
    setWizardForm(createBlankElectionForm())
    setWizardOpen(true)
  }

  const openEditWizard = () => {
    if (!selectedAdminElection) return
    setWizardMode("edit")
    setWizardForm(buildElectionFormFromDetail(selectedAdminElection))
    setWizardOpen(true)
  }

  const openCloneElection = () => {
    if (!selectedAdminElection || !canCloneElection) return
    setCloneElectionTitle(`${selectedAdminElection.title} Copy`)
    setCloneElectionOpen(true)
  }

  const saveElection = async () => {
    try {
      const payload = serializeElectionFormForApi(wizardForm)
      const response = await saveElectionMutation.mutateAsync({
        mode: wizardMode,
        id: selectedAdminElectionId,
        payload,
      })

      toast.success(response?.message || "Election saved")
      setWizardOpen(false)
      await refreshAdminElections()
      if (response?.data?.id) {
        setSelectedAdminElectionId(response.data.id)
        // Selecting the new/edited id re-keys the detail query, which fetches
        // on its own; for an edit of the current selection force the refresh.
        if (response.data.id === selectedAdminElectionId) {
          await refetchAdminDetail()
        }
      }
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to save election"))
    }
  }

  const handleReviewNomination = async (nominationId, status, notes = "") => {
    if (!selectedAdminElectionId) return
    const actionKey = `${selectedAdminElectionId}:${nominationId}:${status}`
    try {
      setBusyKey(actionKey)
      const response = await electionsApi.reviewNomination(selectedAdminElectionId, nominationId, {
        status,
        notes,
      })
      toast.success(response?.message || "Nomination updated")
      await refetchAdminDetail()
      setReviewNomination(null)
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to review nomination"))
    } finally {
      setBusyKey("")
    }
  }

  const updateNominationDraft = (key, updater) => {
    setNominationFormDrafts((current) => ({
      ...current,
      [key]:
        typeof updater === "function"
          ? updater(current[key] || createBlankNominationForm())
          : updater,
    }))
  }

  const updateSupporterEntry = (supportType, index, patch) => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    updateNominationDraft(key, (currentForm) => {
      const nextEntries = [...(currentForm[fieldKey] || [])]
      nextEntries[index] = {
        ...createBlankSupporterEntry(),
        ...(nextEntries[index] || {}),
        ...patch,
      }
      return {
        ...currentForm,
        [fieldKey]: nextEntries,
      }
    })
  }

  const addSupporterEntry = (supportType) => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    updateNominationDraft(key, (currentForm) => ({
      ...currentForm,
      [fieldKey]: [...(currentForm[fieldKey] || []), createBlankSupporterEntry()],
    }))
  }

  const removeSupporterEntry = (supportType, index) => {
    if (!nominationContext) return
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    const minimumCount = Number(
      supportType === "proposer"
        ? nominationContext?.post?.requirements?.proposersRequired || 0
        : nominationContext?.post?.requirements?.secondersRequired || 0
    )
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    updateNominationDraft(key, (currentForm) => {
      const nextEntries = [...(currentForm[fieldKey] || [])]
      nextEntries.splice(index, 1)
      return {
        ...currentForm,
        [fieldKey]: hydrateSupporterEntries(nextEntries, minimumCount),
      }
    })
  }

  const lookupSupporter = async (supportType, index, rawRollNumber = "") => {
    if (!nominationContext) return

    const electionId = nominationContext.election.id
    const postId = nominationContext.post.id
    const formKey = `${electionId}:${postId}`
    const fieldKey = supportType === "proposer" ? "proposerEntries" : "seconderEntries"
    const currentEntry = nominationFormDrafts[formKey]?.[fieldKey]?.[index] || createBlankSupporterEntry()
    const rollNumber = String(rawRollNumber || currentEntry.rollNumber || "").trim().toUpperCase()
    const requestKey = `${formKey}:${supportType}:${index}`

    if (!rollNumber) {
      updateSupporterEntry(supportType, index, createBlankSupporterEntry())
      return
    }

    setSupportLookupKey(requestKey)
    try {
      const response = await electionsApi.lookupNominationSupporter(electionId, postId, {
        rollNumber,
        supportType,
        nominationId: nominationContext.post?.myNomination?.id || "",
      })
      const supporter = response?.data || {}
      updateSupporterEntry(supportType, index, {
        rollNumber,
        userId: supporter.userId || "",
        name: supporter.name || "",
        email: supporter.email || "",
        profileImage: supporter.profileImage || "",
        lookupStatus: "validated",
        lookupMessage: supporter.currentStatus
          ? `Support ${String(supporter.currentStatus).replace(/^\w/, (match) => match.toUpperCase())}`
          : "Eligible",
        supportStatus: supporter.currentStatus || "",
        supportRole: supporter.currentRole || supportType,
      })
    } catch (err) {
      updateSupporterEntry(supportType, index, {
        rollNumber,
        userId: "",
        name: "",
        email: "",
        profileImage: "",
        lookupStatus: "invalid",
        lookupMessage: formatApiErrorMessage(err, "Unable to verify this roll number"),
        supportStatus: "",
        supportRole: "",
      })
    } finally {
      setSupportLookupKey("")
    }
  }

  const openNominationModal = (election, post) => {
    const key = `${election.id}:${post.id}`
    setNominationFormDrafts((current) => ({
      ...current,
      [key]: current[key] ? {
        ...current[key],
        proposerEntries: hydrateSupporterEntries(
          current[key].proposerEntries,
          Math.max(1, Number(post?.requirements?.proposersRequired || 1))
        ),
        seconderEntries: hydrateSupporterEntries(
          current[key].seconderEntries,
          Math.max(1, Number(post?.requirements?.secondersRequired || 1))
        ),
      } : buildNominationDraftFromPost(post),
    }))
    setNominationContext({ election, post })
  }

  const saveNomination = async () => {
    if (!nominationContext) return
    const key = `${nominationContext.election.id}:${nominationContext.post.id}`
    try {
      const validationMessage = validateNominationForm(
        nominationFormDrafts[key] || createBlankNominationForm(),
        nominationContext.post
      )
      if (validationMessage) {
        toast.error(validationMessage)
        return
      }

      setBusyKey(`nomination:${key}`)
      const payload = buildNominationPayload(nominationFormDrafts[key] || createBlankNominationForm())
      const response = await electionsApi.upsertNomination(
        nominationContext.election.id,
        nominationContext.post.id,
        payload
      )
      toast.success(response?.message || "Nomination saved")
      setNominationContext(null)
      await refreshStudentPortal()
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to save nomination"))
    } finally {
      setBusyKey("")
    }
  }

  const withdrawNomination = async (electionId, nominationId) => {
    try {
      setBusyKey(`withdraw:${electionId}:${nominationId}`)
      const response = await electionsApi.withdrawNomination(electionId, nominationId)
      toast.success(response?.message || "Nomination withdrawn")
      await refreshStudentPortal()
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to withdraw nomination"))
    } finally {
      setBusyKey("")
    }
  }

  const submitStudentVotes = async (electionId, posts = []) => {
    const votes = posts.map((post) => ({
      postId: post.id || post.postId,
      candidateNominationId: voteSelections[`${electionId}:${post.id || post.postId}`] || "",
    }))

    if (votes.some((vote) => !vote.candidateNominationId)) {
      toast.error("Select one candidate for every available post before submitting your vote")
      return
    }

    try {
      setBusyKey(`vote:${electionId}`)
      const response = await electionsApi.submitStudentVotes(electionId, { votes })
      toast.success(response?.message || "Vote submitted successfully")
      await refreshStudentPortal()
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to submit vote"))
    } finally {
      setBusyKey("")
    }
  }

  const updateResultsDraft = (postId, patch) => {
    setResultsDrafts((current) => ({
      ...current,
      [postId]: {
        winnerNominationIds: current[postId]?.winnerNominationIds || [],
        winnerNominationId: current[postId]?.winnerNominationId || "",
        winnerIsTie: Boolean(current[postId]?.winnerIsTie),
        notes: current[postId]?.notes || "",
        ...patch,
      },
    }))
  }

  const publishResults = async () => {
    if (!selectedAdminElectionId) return

    try {
      setBusyKey(`results:${selectedAdminElectionId}`)
      const payload = {
        posts: Object.entries(resultsDrafts).map(([postId, draft]) => ({
          postId,
          winnerNominationId:
            !draft?.winnerIsTie && draft?.winnerNominationIds?.[0] && draft.winnerNominationIds[0] !== "nota"
              ? draft.winnerNominationIds[0]
              : !draft?.winnerIsTie && draft?.winnerNominationId && draft.winnerNominationId !== "nota"
                ? draft.winnerNominationId
                : null,
          winnerNominationIds: Array.isArray(draft?.winnerNominationIds) ? draft.winnerNominationIds : [],
          winnerIsNota: (Array.isArray(draft?.winnerNominationIds) ? draft.winnerNominationIds : []).includes("nota"),
          winnerIsTie: Boolean(draft?.winnerIsTie),
          showVoteCountToStudents: draft?.showVoteCountToStudents !== false,
          notes: draft?.notes || "",
        })),
      }
      const response = await electionsApi.publishResults(selectedAdminElectionId, payload)
      toast.success(response?.message || "Results published")
      await refetchAdminDetail()
      setResultsEditorPostId("")
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to publish results"))
    } finally {
      setBusyKey("")
    }
  }

  const exportResultsCsv = (variant = "flat") => {
    if (!selectedAdminElection?.results?.posts?.length) {
      toast.error("No result data available to export")
      return
    }


    const flatRows = (selectedAdminElection.results.posts || []).flatMap((postResult) => {
      const draft = resultsDrafts[String(postResult.postId)] || {}
      return (postResult.candidates || []).map((candidate, index) => {
        const selectedWinnerIds = Array.isArray(draft.winnerNominationIds)
          ? draft.winnerNominationIds
          : draft.winnerNominationId
            ? [draft.winnerNominationId]
            : []
        const isSelectedWinner = selectedWinnerIds.includes(String(candidate.nominationId || ""))
        const previewWinnerIds = Array.isArray(postResult.previewWinnerNominationIds)
          ? postResult.previewWinnerNominationIds.map((value) => String(value))
          : []
        const isPreviewWinner = previewWinnerIds.includes(String(candidate.nominationId || ""))

        return [
          selectedAdminElection.title,
          selectedAdminElection.academicYear,
          postResult.postTitle,
          index + 1,
          candidate.candidateName,
          candidate.candidateRollNumber || "",
          candidate.isNota ? "YES" : "NO",
          candidate.voteCount || 0,
          formatVotePercentage(candidate.voteCount, postResult.totalVotes),
          postResult.totalVotes || 0,
          isPreviewWinner ? "YES" : "NO",
          isSelectedWinner ? "YES" : "NO",
          draft?.winnerIsTie ? "TIE" : "SINGLE",
          draft.notes || "",
        ]
      })
    })

    const headers = [
      "Election",
      "Academic Year",
      "Post",
      "Rank",
      "Candidate",
      "Roll Number",
      "Is NOTA",
      "Votes",
      "Percentage",
      "Total Votes",
      "Preview Winner",
      "Selected Winner",
      "Selected Result Mode",
      "Notes",
    ]

    const groupedRows = [
      ["Election", selectedAdminElection.title],
      ["Academic Year", selectedAdminElection.academicYear],
      [],
      ...(selectedAdminElection.results.posts || []).flatMap((postResult) => {
        const draft = resultsDrafts[String(postResult.postId)] || {}
        const selectedWinnerIds = Array.isArray(draft.winnerNominationIds)
          ? draft.winnerNominationIds.map((value) => String(value))
          : draft.winnerNominationId
            ? [String(draft.winnerNominationId)]
            : []

        return [
          [postResult.postTitle],
          ["", "Candidate", "Votes", "Percentage", "Is NOTA", "Selected Result"],
          ...(postResult.candidates || []).map((candidate) => [
            "",
            candidate.candidateName,
            candidate.voteCount || 0,
            formatVotePercentage(candidate.voteCount, postResult.totalVotes),
            candidate.isNota ? "YES" : "NO",
            selectedWinnerIds.includes(String(candidate.nominationId || ""))
              ? draft?.winnerIsTie
                ? "TIE WINNER"
                : "WINNER"
              : "",
          ]),
          [],
        ]
      }),
    ]

    const rows = variant === "grouped" ? groupedRows : [headers, ...flatRows]
    const csvContent = rows.map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `election_results_${variant}_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
    setShowResultsExportModal(false)
  }

  const exportNominationsCsv = () => {
    if (!selectedAdminElection) {
      toast.error("No election selected")
      return
    }

    if (!filteredNominations.length) {
      toast.error("No nominations available to export in this view")
      return
    }


    const countByStatus = (entries = [], status) =>
      (Array.isArray(entries) ? entries : []).filter((entry) => entry?.status === status).length

    const rows = filteredNominations.map((nomination) => {
      const proposerEntries = Array.isArray(nomination?.proposerEntries) ? nomination.proposerEntries : []
      const seconderEntries = Array.isArray(nomination?.seconderEntries) ? nomination.seconderEntries : []

      return [
        selectedAdminElection.title,
        selectedAdminElection.academicYear,
        nomination.postTitle || "",
        nomination.candidateName || nomination.candidateRollNumber || "",
        nomination.candidateRollNumber || "",
        nomination.candidateEmail || "",
        formatDateTime(nomination.submittedAt),
        formatStageLabel(nomination.status),
        proposerEntries.length,
        countByStatus(proposerEntries, "accepted"),
        countByStatus(proposerEntries, "pending"),
        countByStatus(proposerEntries, "rejected"),
        seconderEntries.length,
        countByStatus(seconderEntries, "accepted"),
        countByStatus(seconderEntries, "pending"),
        countByStatus(seconderEntries, "rejected"),
        nomination.supporterSummary?.total || 0,
        nomination.supporterSummary?.accepted || 0,
        nomination.supporterSummary?.pending || 0,
        nomination.supporterSummary?.rejected || 0,
        nomination.review?.notes || "",
      ]
    })

    const headers = [
      "Election",
      "Academic Year",
      "Post",
      "Candidate Name",
      "Roll Number",
      "Email",
      "Submitted At",
      "Nomination Status",
      "Proposer Total",
      "Proposer Accepted",
      "Proposer Pending",
      "Proposer Rejected",
      "Seconder Total",
      "Seconder Accepted",
      "Seconder Pending",
      "Seconder Rejected",
      "Supporter Total",
      "Supporter Accepted",
      "Supporter Pending",
      "Supporter Rejected",
      "Review Comment",
    ]

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `election_nominations_${nominationTab}_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const sendVotingEmails = async () => {
    if (!selectedAdminElectionId) return

    try {
      setBusyKey(`voting-email:${selectedAdminElectionId}`)
      const response = await electionsApi.sendVotingEmails(selectedAdminElectionId, {
        resendMode: sendVotingEmailMode,
        reminder: sendVotingEmailReminder,
        targetRollNumbers: sendVotingEmailRollNumbers,
      })
      setLiveVotingStatsCache((current) =>
        current
          ? {
              ...current,
              dispatch: {
                ...current.dispatch,
                status: "queued",
                lastTriggeredAt: new Date().toISOString(),
              },
            }
          : current
      )
      toast.success(response?.message || "Voting emails queued")
      setShowSendVotingEmailsConfirm(false)
      setSendVotingEmailRollNumbers([])
      setSendVotingEmailReminder(false)

      window.setTimeout(() => {
        refetchLiveVotingStats().catch(() => {})
        refetchAdminDetail().catch(() => {})
      }, 1500)
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to send voting emails"))
    } finally {
      setBusyKey("")
    }
  }

  const openVotingEmailRecipientsModal = async () => {
    if (!selectedAdminElectionId) return

    setShowVotingEmailRecipientsModal(true)
    // the recipients query fetches itself once the modal flag enables it
  }

  const exportVotingEmailRecipientsCsv = () => {
    const sentRecipients = votingEmailRecipientsData?.sentRecipients || []
    const notSentRecipients = votingEmailRecipientsData?.notSentRecipients || []
    const rows = [...sentRecipients, ...notSentRecipients].map((entry) => [
      entry.name || "",
      entry.rollNumber || "",
      entry.email || "",
      entry.status || "",
      entry.sentAt ? formatDateTime(entry.sentAt) : "",
      entry.lastError || "",
    ])

    const headers = ["Name", "Roll Number", "Email", "Link Status", "Sent At", "Last Error"]
    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `election_voting_link_status_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const getNormalizedTestEmailTargets = () => {
    const manualRollNumber = String(manualTestEmailRollNumber || "").trim().toUpperCase()
    return [...new Set([
      ...sendTestEmailRollNumbers,
      ...(manualRollNumber ? [manualRollNumber] : []),
    ])]
  }

  const sendTestEmails = async () => {
    if (!selectedAdminElectionId) return

    const targetRollNumbers = getNormalizedTestEmailTargets()
    if (targetRollNumbers.length === 0) {
      toast.error("Add at least one student roll number or upload a CSV")
      return
    }

    try {
      setBusyKey(`test-email:${selectedAdminElectionId}`)
      const response = await electionsApi.sendTestEmails(selectedAdminElectionId, {
        targetRollNumbers,
      })
      toast.success(response?.message || "Test emails queued")
      setShowSendTestEmailsConfirm(false)
      setSendTestEmailRollNumbers([])
      setManualTestEmailRollNumber("")

      window.setTimeout(() => {
        refetchAdminDetail().catch(() => {})
      }, 1500)
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to send test emails"))
    } finally {
      setBusyKey("")
    }
  }

  const openTestEmailRecipientsModal = async () => {
    if (!selectedAdminElectionId) return

    setShowTestEmailRecipientsModal(true)
    // the test-recipients query fetches itself once the modal flag enables it
  }

  const runSmtpAccountTest = async () => {
    const receiver = String(smtpTestEmail || "").trim()
    if (!receiver) {
      toast.error("Enter a receiver email first")
      return
    }

    try {
      setBusyKey("smtp-test")
      setSmtpTestResult(null)
      const response = await emailApi.testAllAccounts(receiver)
      // sendRawResponse emits the bare data payload on success (no envelope).
      setSmtpTestResult(response || null)
      toast.success(
        response && typeof response === "object" && "totalAccounts" in response
          ? `SMTP test complete: ${response.workingAccounts}/${response.totalAccounts} account(s) delivered`
          : "SMTP account test complete"
      )
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "SMTP account test failed"))
    } finally {
      setBusyKey("")
    }
  }

  const exportTestEmailRecipientsCsv = () => {
    const sentRecipients = testEmailRecipientsData?.sentRecipients || []
    const notSentRecipients = testEmailRecipientsData?.notSentRecipients || []
    const rows = [...sentRecipients, ...notSentRecipients].map((entry) => [
      entry.name || "",
      entry.rollNumber || "",
      entry.email || "",
      entry.status || "",
      entry.sentAt ? formatDateTime(entry.sentAt) : "",
      entry.lastError || "",
    ])

    const headers = ["Name", "Roll Number", "Email", "Test Email Status", "Sent At", "Last Error"]
    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const date = new Date().toISOString().split("T")[0]
    link.href = URL.createObjectURL(blob)
    link.download = `election_test_email_status_${date}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const cloneElection = async () => {
    if (!selectedAdminElectionId) return

    try {
      setBusyKey(`clone:${selectedAdminElectionId}`)
      const response = await electionsApi.cloneElection(selectedAdminElectionId, {
        title: cloneElectionTitle.trim(),
      })
      toast.success(response?.message || "Election copied")
      setCloneElectionOpen(false)
      await refreshAdminElections()
      if (response?.data?.id) {
        setSelectedAdminElectionId(String(response.data.id))
      }
    } catch (err) {
      toast.error(formatApiErrorMessage(err, "Failed to copy election"))
    } finally {
      setBusyKey("")
    }
  }

  if (loading) {
    return <LoadingState message="Loading elections" description="Preparing the elections workspace..." />
  }

  if (error) {
    return <ErrorState title="Unable to load elections" message={error} onRetry={retryCore} />
  }

  return (
    <div style={pageStyle}>
      <PageHeader
        title="Elections"
        showDate={false}
      >
        {isAdminLikeView ? (
          <>
            <HeaderSelect
              value={selectedAdminElectionId}
              onChange={setSelectedAdminElectionId}
              options={adminSelectableElections}
              placeholder={isGymkhanaElectionOfficerView ? "Select published election" : "Select current or past election"}
              headerSelectStyle={headerSelectStyle}
              formatElectionOptionLabel={formatElectionOptionLabel}
              selectedOption={selectedAdminElectionOption}
            />
            {isAdminView && adminElections.length > 0 ? (
              <Button
                size="md"
                variant="ghost"
                onClick={() => {
                  setShowMockHistoryElections(false)
                  setHistoryModalOpen(true)
                }}
              >
                <History size={16} /> History
              </Button>
            ) : null}
            {isAdminView && selectedAdminElection ? (
              <Button size="md" variant="secondary" onClick={openEditWizard}>
                <FileText size={16} /> Edit Election
              </Button>
            ) : null}
            {isAdminView ? (
              <Button size="md" onClick={openCreateWizard}>
                <Plus size={16} /> Create Election
              </Button>
            ) : null}
          </>
        ) : (
          <>
            {studentElections.length > 1 ? (
              <HeaderSelect
                value={selectedStudentElectionId}
                onChange={setSelectedStudentElectionId}
                options={studentElections}
                placeholder="Select active election"
                headerSelectStyle={headerSelectStyle}
                formatElectionOptionLabel={formatElectionOptionLabel}
              />
            ) : null}
          </>
        )}
      </PageHeader>

      <div style={workspaceStyle}>
        {isAdminLikeView && !selectedAdminElectionId ? (
          <EmptyState
            title="Select an election occurrence"
            message={
              adminElections.length === 0
                ? isGymkhanaElectionOfficerView
                  ? "No published elections are available for review right now."
                  : "Create the first election from the header to begin."
                : isGymkhanaElectionOfficerView
                  ? "Choose one of the published elections from the header to review nominations."
                  : adminSelectableElections.length === 0
                    ? "Only mock elections are available right now. Open History and turn on mock elections to view them."
                    : "No election is auto-selected right now. Choose a current or past occurrence from the header."
            }
          />
        ) : null}

        {isAdminLikeView && selectedAdminElection ? (
          <AdminElectionWorkspace
            selectedAdminElection={selectedAdminElection}
            selectedAdminElectionId={selectedAdminElectionId}
            adminViewTab={adminViewTab}
            setAdminViewTab={setAdminViewTab}
            nominationTab={nominationTab}
            setNominationTab={setNominationTab}
            filteredNominations={filteredNominations}
            adminOverview={adminOverview}
            resultsDrafts={resultsDrafts}
            busyKey={busyKey}
            onPublishResults={() => setShowPublishResultsConfirm(true)}
            onExportResults={() => setShowResultsExportModal(true)}
            onExportNominations={exportNominationsCsv}
            setReviewNomination={setReviewNomination}
            setResultsEditorPostId={setResultsEditorPostId}
            infoBannerStyle={infoBannerStyle}
            badgeRowStyle={badgeRowStyle}
            mutedTextStyle={mutedTextStyle}
            infoGridStyle={infoGridStyle}
            compactStatStyle={compactStatStyle}
            compactStatLabelStyle={compactStatLabelStyle}
            compactStatValueStyle={compactStatValueStyle}
            formatStageLabel={formatStageLabel}
            formatDateTime={formatDateTime}
            getStatusTone={getStatusTone}
            summarizeScope={summarizeScope}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
            nominationTabs={nominationTabs}
            liveVotingStats={liveVotingStats}
            loadingVotingStats={loadingVotingStats}
            onSendVotingEmails={() => {
              setSendVotingEmailMode("reuse_existing")
              setSendVotingEmailReminder(false)
              setSendVotingEmailRollNumbers([])
              setShowSendVotingEmailsConfirm(true)
            }}
            onOpenVotingEmailRecipients={openVotingEmailRecipientsModal}
            onSendTestEmails={() => {
              setSendTestEmailRollNumbers([])
              setManualTestEmailRollNumber("")
              setShowSendTestEmailsConfirm(true)
            }}
            onOpenTestEmailRecipients={openTestEmailRecipientsModal}
            onTestSmtpAccounts={() => {
              setSmtpTestEmail("")
              setSmtpTestResult(null)
              setShowSmtpTestModal(true)
            }}
            socketConnected={isSocketConnected}
            onOpenCloneElection={openCloneElection}
            canCloneElection={canCloneElection}
            cloneDisabledReason={cloneElectionDisabledReason}
            readOnly={isGymkhanaElectionOfficerView}
          />
        ) : null}

        {isStudentView && !selectedStudentElectionId ? (
          <EmptyState
            title="No active election window"
            message="The active election will appear here when participation, voting, or results are available."
          />
        ) : null}

        {isStudentView && selectedStudentElection ? (
          <StudentElectionWorkspace
            selectedStudentElection={selectedStudentElection}
            openNominationModal={openNominationModal}
            withdrawNomination={withdrawNomination}
            busyKey={busyKey}
            voteSelections={voteSelections}
            setVoteSelections={setVoteSelections}
            submitStudentVotes={submitStudentVotes}
            infoBannerStyle={infoBannerStyle}
            detailPanelStyle={detailPanelStyle}
            mutedTextStyle={mutedTextStyle}
            formatStageLabel={formatStageLabel}
            formatDateTime={formatDateTime}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />
        ) : null}
      </div>

      {isAdminView ? (
        <>
          <ElectionWizardModal
            isOpen={wizardOpen}
            mode={wizardMode}
            form={wizardForm}
            setForm={setWizardForm}
            onClose={() => setWizardOpen(false)}
            onSave={saveElection}
            saving={savingElection}
            batchOptions={batchOptions}
            groupOptions={groupOptions}
            hostels={normalizedHostels}
            createBlankPost={createBlankPost}
            buildD15Timeline={buildD15Timeline}
            validateElectionWizard={validateElectionWizard}
            createEmptyWizardErrors={createEmptyWizardErrors}
            wizardSteps={wizardSteps}
            phaseOptions={phaseOptions}
            statusOptions={statusOptions}
            votingAccessOptions={votingAccessOptions}
            postCategoryOptions={postCategoryOptions}
            timelineFieldDefs={timelineFieldDefs}
            requirementFieldDefs={requirementFieldDefs}
            splitListInput={splitListInput}
            formatDateTime={formatDateTime}
            fromDateTimeLocal={fromDateTimeLocal}
            modalBodyStyle={modalBodyStyle}
            labelStyle={labelStyle}
            mutedTextStyle={mutedTextStyle}
            selectStyle={selectStyle}
            textareaStyle={textareaStyle}
            errorTextStyle={errorTextStyle}
            errorBannerStyle={errorBannerStyle}
            timelinePreviewStyle={timelinePreviewStyle}
            timelineCellStyle={timelineCellStyle}
            postTabListStyle={postTabListStyle}
            postTabStyle={postTabStyle}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
            nominationTemplateHeaders={nominationTemplateHeaders}
          />

          <AdminNominationReviewModal
            nomination={reviewNomination}
            electionId={selectedAdminElectionId}
            onClose={() => setReviewNomination(null)}
            onReview={handleReviewNomination}
            busy={busyKey}
            modalBodyStyle={modalBodyStyle}
            badgeRowStyle={badgeRowStyle}
            detailGridStyle={detailGridStyle}
            detailPanelStyle={detailPanelStyle}
            labelStyle={labelStyle}
            mutedTextStyle={mutedTextStyle}
            getStatusTone={getStatusTone}
            formatStageLabel={formatStageLabel}
            formatDateTime={formatDateTime}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
            textareaStyle={textareaStyle}
            readOnly={false}
          />

          <AdminResultsEditModal
            postResult={selectedAdminResultPost}
            draft={selectedAdminResultPost ? resultsDrafts[String(selectedAdminResultPost.postId)] : null}
            onClose={() => setResultsEditorPostId("")}
            onChange={(patch) => {
              if (!selectedAdminResultPost) return
              updateResultsDraft(String(selectedAdminResultPost.postId), patch)
            }}
            modalBodyStyle={modalBodyStyle}
            badgeRowStyle={badgeRowStyle}
            labelStyle={labelStyle}
            textareaStyle={textareaStyle}
            mutedTextStyle={mutedTextStyle}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />

          <ElectionHistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            elections={adminElections}
            selectedElectionId={selectedAdminElectionId}
            onSelect={setSelectedAdminElectionId}
            showMockElections={showMockHistoryElections}
            onToggleShowMockElections={setShowMockHistoryElections}
            modalBodyStyle={modalBodyStyle}
            mutedTextStyle={mutedTextStyle}
            formatStageLabel={formatStageLabel}
            getStatusTone={getStatusTone}
            formatDateTime={formatDateTime}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />

          <CloneElectionModal
            isOpen={cloneElectionOpen}
            onClose={() => setCloneElectionOpen(false)}
            titleValue={cloneElectionTitle}
            onTitleChange={setCloneElectionTitle}
            onSubmit={cloneElection}
            loading={busyKey === `clone:${selectedAdminElectionId}`}
            mutedTextStyle={mutedTextStyle}
            errorTextStyle={errorTextStyle}
          />
        </>
      ) : isGymkhanaElectionOfficerView ? (
        <AdminNominationReviewModal
          nomination={reviewNomination}
          electionId={selectedAdminElectionId}
          onClose={() => setReviewNomination(null)}
          onReview={() => {}}
          busy=""
          modalBodyStyle={modalBodyStyle}
          badgeRowStyle={badgeRowStyle}
          detailGridStyle={detailGridStyle}
          detailPanelStyle={detailPanelStyle}
          labelStyle={labelStyle}
          mutedTextStyle={mutedTextStyle}
          getStatusTone={getStatusTone}
          formatStageLabel={formatStageLabel}
          formatDateTime={formatDateTime}
          pillBaseStyle={pillBaseStyle}
          statusToneStyles={statusToneStyles}
          textareaStyle={textareaStyle}
          readOnly
        />
      ) : null}

      {isStudentView ? (
        <>
          <StudentNominationModal
            election={nominationContext?.election}
            post={nominationContext?.post}
            form={
              nominationContext
                ? nominationFormDrafts[`${nominationContext.election.id}:${nominationContext.post.id}`] ||
                  createBlankNominationForm()
                : createBlankNominationForm()
            }
            setForm={(updater) => {
              if (!nominationContext) return
              const key = `${nominationContext.election.id}:${nominationContext.post.id}`
              updateNominationDraft(key, updater)
            }}
            onSupporterChange={updateSupporterEntry}
            onLookupSupporter={lookupSupporter}
            onAddSupporter={addSupporterEntry}
            onRemoveSupporter={removeSupporterEntry}
            supportLookupKey={supportLookupKey}
            onClose={() => setNominationContext(null)}
            onSave={saveNomination}
            saving={busyKey === `nomination:${nominationContext?.election?.id}:${nominationContext?.post?.id}`}
            currentUserId={user?._id}
            modalBodyStyle={modalBodyStyle}
            badgeRowStyle={badgeRowStyle}
            detailGridStyle={detailGridStyle}
            detailPanelStyle={detailPanelStyle}
            labelStyle={labelStyle}
            mutedTextStyle={mutedTextStyle}
            textareaStyle={textareaStyle}
            pillBaseStyle={pillBaseStyle}
            statusToneStyles={statusToneStyles}
          />
        </>
      ) : null}

      {isAdminView ? (
        <>
          <Modal
            isOpen={showSendVotingEmailsConfirm}
            onClose={() => {
              setShowSendVotingEmailsConfirm(false)
              setSendVotingEmailRollNumbers([])
              setSendVotingEmailReminder(false)
            }}
            title="Send Voting List"
            width={520}
            footer={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowSendVotingEmailsConfirm(false)
                    setSendVotingEmailRollNumbers([])
                    setSendVotingEmailReminder(false)
                  }}
                  disabled={busyKey === `voting-email:${selectedAdminElectionId}`}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={sendVotingEmails}
                  loading={busyKey === `voting-email:${selectedAdminElectionId}`}
                >
                  Queue Email Sending
                </Button>
              </>
            }
          >
            <Grid cols={1} gap={3}>
              <div style={mutedTextStyle}>
                Queue the voting email for students who are still eligible to vote in this election.
              </div>
              {isAdminElectionLiveVotingStage ? (
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "var(--spacing-3)",
                    border: "1px solid var(--color-border-primary)",
                    borderRadius: "var(--radius-card-sm)",
                    backgroundColor: sendVotingEmailReminder
                      ? "var(--color-primary-bg)"
                      : "var(--color-bg-primary)",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={sendVotingEmailReminder}
                    onChange={(event) => setSendVotingEmailReminder(event.target.checked)}
                  />
                  <Grid cols={1} gap="4px">
                    <Text as="span" weight="semibold" color="heading">
                      Send as reminder
                    </Text>
                    <span style={mutedTextStyle}>
                      Adds reminder text with voting end time and current turnout to the email. This is only available while voting is live.
                    </span>
                  </Grid>
                </label>
              ) : null}
              <Grid cols={1} gap={2} style={{ padding: "var(--spacing-3)", border: "1px solid var(--color-border-primary)", borderRadius: "var(--radius-card-sm)", backgroundColor: "var(--color-bg-secondary)" }}>
                <Text as="div" weight="semibold" color="heading">
                  Optional CSV filter
                </Text>
                <div style={mutedTextStyle}>
                  Upload a CSV with a single <code>rollNumber</code> column to send only to those students. Only students who are still valid voters in this election will actually receive the email.
                  {selectedAdminElection?.mockSettings?.enabled
                    ? " Mock election restrictions are also applied."
                    : ""}
                </div>
                <CsvUploader
                  requiredFields={votingListTemplateHeaders}
                  templateHeaders={votingListTemplateHeaders}
                  templateFileName="voting_list_filter.csv"
                  maxRecords={10000}
                  instructionText="Upload a CSV with a single `rollNumber` column. Uploading a new file replaces the previous list."
                  onDataParsed={(rows) => {
                    const nextRollNumbers = rows
                      .map((row) => String(row.rollNumber || "").trim().toUpperCase())
                      .filter(Boolean)
                    setSendVotingEmailRollNumbers([...new Set(nextRollNumbers)])
                  }}
                />
                <div style={mutedTextStyle}>
                  {sendVotingEmailRollNumbers.length > 0
                    ? `${sendVotingEmailRollNumbers.length} uploaded roll number(s) will be checked against the election voter list${selectedAdminElection?.mockSettings?.enabled ? " and the mock voter list" : ""}.`
                    : "No CSV uploaded. Email will be queued for all eligible voters."}
                </div>
              </Grid>
              <Grid cols={1} gap="10px">
                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "var(--spacing-3)",
                    border: "1px solid var(--color-border-primary)",
                    borderRadius: "var(--radius-card-sm)",
                    backgroundColor:
                      sendVotingEmailMode === "reuse_existing"
                        ? "var(--color-primary-bg)"
                        : "var(--color-bg-primary)",
                  }}
                >
                  <input
                    type="radio"
                    name="sendVotingEmailMode"
                    checked={sendVotingEmailMode === "reuse_existing"}
                    onChange={() => setSendVotingEmailMode("reuse_existing")}
                  />
                  <Grid cols={1} gap="4px">
                    <Text as="span" weight="semibold" color="heading">
                      Reuse existing link
                    </Text>
                    <span style={mutedTextStyle}>
                      Resend the same voting link if an active one already exists for that student.
                    </span>
                  </Grid>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "var(--spacing-3)",
                    border: "1px solid var(--color-border-primary)",
                    borderRadius: "var(--radius-card-sm)",
                    backgroundColor:
                      sendVotingEmailMode === "generate_new"
                        ? "var(--color-primary-bg)"
                        : "var(--color-bg-primary)",
                  }}
                >
                  <input
                    type="radio"
                    name="sendVotingEmailMode"
                    checked={sendVotingEmailMode === "generate_new"}
                    onChange={() => setSendVotingEmailMode("generate_new")}
                  />
                  <Grid cols={1} gap="4px">
                    <Text as="span" weight="semibold" color="heading">
                      Generate new link
                    </Text>
                    <span style={mutedTextStyle}>
                      Invalidates the old voting link and sends a new one to the student.
                    </span>
                  </Grid>
                </label>
              </Grid>
            </Grid>
          </Modal>

          <Modal
            isOpen={showVotingEmailRecipientsModal}
            onClose={() => setShowVotingEmailRecipientsModal(false)}
            title="Voting Link Status"
            width={960}
            footer={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowVotingEmailRecipientsModal(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={exportVotingEmailRecipientsCsv}
                  disabled={
                    (votingEmailRecipientsData?.sentRecipients || []).length === 0 &&
                    (votingEmailRecipientsData?.notSentRecipients || []).length === 0
                  }
                >
                  Export CSV
                </Button>
              </>
            }
          >
            <Grid cols={1} gap={4}>
              <div style={infoGridStyle}>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>With Link</span>
                  <span style={compactStatValueStyle}>
                    {(votingEmailRecipientsData?.sentRecipients || []).length}
                  </span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Without Link</span>
                  <span style={compactStatValueStyle}>
                    {(votingEmailRecipientsData?.notSentRecipients || []).length}
                  </span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Dispatch Status</span>
                  <span style={compactStatValueStyle}>
                    {formatStageLabel(votingEmailRecipientsData?.dispatch?.status || "idle")}
                  </span>
                </div>
              </div>

              <Grid min={320} gap={4}>
                <Surface bg="secondary" padding={3} radius="card-sm" border>
                  <Text as="div" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
                    Students With Active Or Used Link
                  </Text>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Roll Number</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {loadingVotingEmailRecipients ? (
                        <Table.Row>
                          <Table.Cell colSpan={2}>Loading...</Table.Cell>
                        </Table.Row>
                      ) : (votingEmailRecipientsData?.sentRecipients || []).length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={2}>No students currently have a usable or already-used voting link.</Table.Cell>
                        </Table.Row>
                      ) : (
                        (votingEmailRecipientsData?.sentRecipients || []).map((entry) => (
                          <Table.Row key={`sent-${entry.rollNumber}`}>
                            <Table.Cell>{entry.name || "—"}</Table.Cell>
                            <Table.Cell>{entry.rollNumber || "—"}</Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </Surface>

                <Surface bg="secondary" padding={3} radius="card-sm" border>
                  <Text as="div" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
                    Students Without Active Link
                  </Text>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Roll Number</Table.Head>
                        <Table.Head>Status</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {loadingVotingEmailRecipients ? (
                        <Table.Row>
                          <Table.Cell colSpan={3}>Loading...</Table.Cell>
                        </Table.Row>
                      ) : (votingEmailRecipientsData?.notSentRecipients || []).length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={3}>Every eligible student currently has a valid or already-used voting link.</Table.Cell>
                        </Table.Row>
                      ) : (
                        (votingEmailRecipientsData?.notSentRecipients || []).map((entry) => (
                          <Table.Row key={`pending-${entry.rollNumber}`}>
                            <Table.Cell>{entry.name || "—"}</Table.Cell>
                            <Table.Cell>{entry.rollNumber || "—"}</Table.Cell>
                            <Table.Cell>{formatStageLabel(entry.status || "pending")}</Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </Surface>
              </Grid>
            </Grid>
          </Modal>

          <Modal
            isOpen={showSmtpTestModal}
            onClose={() => {
              if (busyKey === "smtp-test") return
              setShowSmtpTestModal(false)
              setSmtpTestResult(null)
            }}
            title="Test SMTP Accounts"
            description="Sends one diagnostic email per configured SMTP account so you can confirm every credential works before real dispatch."
            width={620}
            footer={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowSmtpTestModal(false)
                    setSmtpTestResult(null)
                  }}
                  disabled={busyKey === "smtp-test"}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={runSmtpAccountTest}
                  loading={busyKey === "smtp-test"}
                  disabled={!String(smtpTestEmail || "").trim()}
                >
                  Send via All Accounts
                </Button>
              </>
            }
          >
            <Grid cols={1} gap={4}>
              <Text as="div" color="muted" size="sm">
                The receiver gets one email copy per working account. Accounts that fail are
                listed with their error, so broken credentials can't hide in round-robin rotation.
              </Text>
              <Input
                type="email"
                label="Receiver email"
                placeholder="you@example.com"
                value={smtpTestEmail}
                onChange={(event) => setSmtpTestEmail(String(event.target.value || ""))}
                disabled={busyKey === "smtp-test"}
              />
              {smtpTestResult ? (
                <Grid cols={1} gap={2}>
                  {Array.isArray(smtpTestResult.accounts) && smtpTestResult.accounts.length > 0 ? (
                    smtpTestResult.accounts.map((account) => (
                      <Surface
                        key={account.smtpUser}
                        bg={account.success ? "secondary" : "secondary"}
                        padding={3}
                        radius="card-sm"
                        border
                      >
                        <Grid cols={1} gap="4px">
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", flexWrap: "wrap" }}>
                            <Text as="div" weight="medium">{account.smtpUser}</Text>
                            <Badge variant={account.success ? "success" : "danger"}>
                              {account.success ? `Delivered · ${account.durationMs}ms` : "Failed"}
                            </Badge>
                          </div>
                          {!account.success && account.error ? (
                            <Text as="div" size="xs" style={{ color: "var(--color-danger-text)", wordBreak: "break-word" }}>
                              {account.error}
                            </Text>
                          ) : null}
                        </Grid>
                      </Surface>
                    ))
                  ) : (
                    <Text as="div" color="muted">No SMTP accounts reported.</Text>
                  )}
                </Grid>
              ) : null}
            </Grid>
          </Modal>

          <Modal
            isOpen={showSendTestEmailsConfirm}
            onClose={() => {
              setShowSendTestEmailsConfirm(false)
              setSendTestEmailRollNumbers([])
              setManualTestEmailRollNumber("")
            }}
            title="Send Test Email"
            width={560}
            footer={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setShowSendTestEmailsConfirm(false)
                    setSendTestEmailRollNumbers([])
                    setManualTestEmailRollNumber("")
                  }}
                  disabled={busyKey === `test-email:${selectedAdminElectionId}`}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={sendTestEmails}
                  loading={busyKey === `test-email:${selectedAdminElectionId}`}
                >
                  Queue Test Email
                </Button>
              </>
            }
          >
            <Grid cols={1} gap={4}>
              <Surface bg="secondary" padding={3} radius="card-sm" border>
                <Text as="div" weight="semibold" color="heading">
                  Email Preview
                </Text>
                <div style={mutedTextStyle}>Hello {"{Student Name}"},</div>
                <div style={mutedTextStyle}>
                  This is a test email for the election communication system.
                </div>
                <div style={mutedTextStyle}>
                  Please ignore this email. This is only for testing the election email system.
                </div>
              </Surface>

              <Surface bg="secondary" padding={3} radius="card-sm" border>
                <Text as="div" weight="semibold" color="heading">
                  Send To One Student
                </Text>
                <input
                  value={manualTestEmailRollNumber}
                  onChange={(event) => setManualTestEmailRollNumber(String(event.target.value || "").toUpperCase())}
                  placeholder="Enter roll number"
                  style={textareaStyle}
                />
              </Surface>

              <Surface bg="secondary" padding={3} radius="card-sm" border>
                <Text as="div" weight="semibold" color="heading">
                  Or Upload CSV
                </Text>
                <div style={mutedTextStyle}>
                  Upload a CSV with a single <code>rollNumber</code> column. Only students who are part of this election will receive the test email.
                </div>
                <CsvUploader
                  requiredFields={votingListTemplateHeaders}
                  templateHeaders={votingListTemplateHeaders}
                  templateFileName="test_email_students.csv"
                  maxRecords={10000}
                  instructionText="Upload a CSV with a single `rollNumber` column. Uploading a new file replaces the previous list."
                  onDataParsed={(rows) => {
                    const nextRollNumbers = rows
                      .map((row) => String(row.rollNumber || "").trim().toUpperCase())
                      .filter(Boolean)
                    setSendTestEmailRollNumbers([...new Set(nextRollNumbers)])
                  }}
                />
                <div style={mutedTextStyle}>
                  {getNormalizedTestEmailTargets().length > 0
                    ? `${getNormalizedTestEmailTargets().length} selected roll number(s) will be checked against the election student list.`
                    : "Add one student manually or upload a CSV to send a test email."}
                </div>
              </Surface>
            </Grid>
          </Modal>

          <Modal
            isOpen={showTestEmailRecipientsModal}
            onClose={() => setShowTestEmailRecipientsModal(false)}
            title="Test Email Status"
            width={960}
            footer={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowTestEmailRecipientsModal(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={exportTestEmailRecipientsCsv}
                  disabled={
                    (testEmailRecipientsData?.sentRecipients || []).length === 0 &&
                    (testEmailRecipientsData?.notSentRecipients || []).length === 0
                  }
                >
                  Export CSV
                </Button>
              </>
            }
          >
            <Grid cols={1} gap={4}>
              <div style={infoGridStyle}>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Received Test Email</span>
                  <span style={compactStatValueStyle}>
                    {(testEmailRecipientsData?.sentRecipients || []).length}
                  </span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Not Received Yet</span>
                  <span style={compactStatValueStyle}>
                    {(testEmailRecipientsData?.notSentRecipients || []).length}
                  </span>
                </div>
                <div style={compactStatStyle}>
                  <span style={compactStatLabelStyle}>Dispatch Status</span>
                  <span style={compactStatValueStyle}>
                    {formatStageLabel(testEmailRecipientsData?.dispatch?.status || "idle")}
                  </span>
                </div>
              </div>

              <Grid min={320} gap={4}>
                <Surface bg="secondary" padding={3} radius="card-sm" border>
                  <Text as="div" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
                    Students Who Received Test Email
                  </Text>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Roll Number</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {loadingTestEmailRecipients ? (
                        <Table.Row>
                          <Table.Cell colSpan={2}>Loading...</Table.Cell>
                        </Table.Row>
                      ) : (testEmailRecipientsData?.sentRecipients || []).length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={2}>No students have received a test email yet.</Table.Cell>
                        </Table.Row>
                      ) : (
                        (testEmailRecipientsData?.sentRecipients || []).map((entry) => (
                          <Table.Row key={`test-sent-${entry.rollNumber}`}>
                            <Table.Cell>{entry.name || "—"}</Table.Cell>
                            <Table.Cell>{entry.rollNumber || "—"}</Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </Surface>

                <Surface bg="secondary" padding={3} radius="card-sm" border>
                  <Text as="div" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-3)" }}>
                    Students Who Have Not Received Test Email
                  </Text>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.Head>Name</Table.Head>
                        <Table.Head>Roll Number</Table.Head>
                        <Table.Head>Status</Table.Head>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {loadingTestEmailRecipients ? (
                        <Table.Row>
                          <Table.Cell colSpan={3}>Loading...</Table.Cell>
                        </Table.Row>
                      ) : (testEmailRecipientsData?.notSentRecipients || []).length === 0 ? (
                        <Table.Row>
                          <Table.Cell colSpan={3}>Every eligible student has already received a test email.</Table.Cell>
                        </Table.Row>
                      ) : (
                        (testEmailRecipientsData?.notSentRecipients || []).map((entry) => (
                          <Table.Row key={`test-pending-${entry.rollNumber}`}>
                            <Table.Cell>{entry.name || "—"}</Table.Cell>
                            <Table.Cell>{entry.rollNumber || "—"}</Table.Cell>
                            <Table.Cell>{formatStageLabel(entry.status || "pending")}</Table.Cell>
                          </Table.Row>
                        ))
                      )}
                    </Table.Body>
                  </Table>
                </Surface>
              </Grid>
            </Grid>
          </Modal>

          <Modal
            isOpen={showResultsExportModal}
            onClose={() => setShowResultsExportModal(false)}
            title="Export Results"
            width={520}
            footer={
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowResultsExportModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => exportResultsCsv(resultsExportVariant)}
                >
                  Export CSV
                </Button>
              </>
            }
          >
            <Grid cols={1} gap={3}>
              <div style={mutedTextStyle}>
                Choose the CSV format you want to export for this election result.
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "var(--spacing-3)",
                  border: "1px solid var(--color-border-primary)",
                  borderRadius: "var(--radius-card-sm)",
                  backgroundColor:
                    resultsExportVariant === "flat"
                      ? "var(--color-primary-bg)"
                      : "var(--color-bg-primary)",
                }}
              >
                <input
                  type="radio"
                  name="resultsExportVariant"
                  checked={resultsExportVariant === "flat"}
                  onChange={() => setResultsExportVariant("flat")}
                />
                <Grid cols={1} gap="4px">
                  <Text as="span" weight="semibold" color="heading">
                    Flat candidate table
                  </Text>
                  <span style={mutedTextStyle}>
                    One row per candidate with post, votes, percentage, winner flags, and notes.
                  </span>
                </Grid>
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "var(--spacing-3)",
                  border: "1px solid var(--color-border-primary)",
                  borderRadius: "var(--radius-card-sm)",
                  backgroundColor:
                    resultsExportVariant === "grouped"
                      ? "var(--color-primary-bg)"
                      : "var(--color-bg-primary)",
                }}
              >
                <input
                  type="radio"
                  name="resultsExportVariant"
                  checked={resultsExportVariant === "grouped"}
                  onChange={() => setResultsExportVariant("grouped")}
                />
                <Grid cols={1} gap="4px">
                  <Text as="span" weight="semibold" color="heading">
                    Post-wise grouped sheet
                  </Text>
                  <span style={mutedTextStyle}>
                    Election info on top, then each post in creation order with candidate-wise votes, percentage, and NOTA.
                  </span>
                </Grid>
              </label>
            </Grid>
          </Modal>

          <ConfirmationDialog
            isOpen={showPublishResultsConfirm}
            onClose={() => setShowPublishResultsConfirm(false)}
            onConfirm={publishResults}
            title="Publish Results"
            message="This will publish the currently selected winners for all posts and make the results visible to students. Please review the NOTA selections and candidate overrides before continuing."
            confirmText="Publish Now"
            cancelText="Cancel"
          />
        </>
      ) : null}
    </div>
  )
}

export default ElectionsPage
