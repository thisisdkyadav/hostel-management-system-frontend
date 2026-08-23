import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, Check, Clock, FileSignature } from "lucide-react"
import { undertakingApi } from "../../service"
import { queryKeys } from "../../lib/query"
import UndertakingDetailModal from "../../components/student/undertakings/UndertakingDetailModal"
import { Button, EmptyState, ErrorState, Heading, LoadingState, Spinner, Surface, Tabs, Text, useToast } from "hzero"

const LISTS_ERROR_MESSAGE = "Failed to load undertakings. Please try again later."
const DETAILS_ERROR_MESSAGE = "Failed to load undertaking details. Please try again."

const UndertakingsPage = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedUndertakingId, setSelectedUndertakingId] = useState(null)
  const [activeTab, setActiveTab] = useState("pending")

  // Fetch both pending and accepted undertakings in parallel
  const listsQuery = useQuery({
    queryKey: queryKeys.undertakings.studentLists(),
    queryFn: async () => {
      // Fetch both types of undertakings in parallel
      const [pendingResponse, acceptedResponse] = await Promise.all([undertakingApi.getPendingUndertakings(), undertakingApi.getAcceptedUndertakings()])

      return {
        pendingUndertakings: pendingResponse.pendingUndertakings || [],
        acceptedUndertakings: acceptedResponse.acceptedUndertakings || [],
      }
    },
  })

  const pendingUndertakings = listsQuery.data?.pendingUndertakings || []
  const acceptedUndertakings = listsQuery.data?.acceptedUndertakings || []
  const loading = listsQuery.isFetching

  useEffect(() => {
    if (listsQuery.isError) {
      console.error("Error fetching undertakings:", listsQuery.error)
    }
  }, [listsQuery.isError, listsQuery.error])

  // Fetch details for the selected undertaking
  const detailQuery = useQuery({
    queryKey: queryKeys.undertakings.detail(selectedUndertakingId),
    queryFn: () => undertakingApi.getUndertakingDetails(selectedUndertakingId),
    enabled: Boolean(selectedUndertakingId),
  })

  const selectedUndertaking = detailQuery.data?.undertaking || null

  useEffect(() => {
    if (detailQuery.isError) {
      console.error("Error fetching undertaking details:", detailQuery.error)
      toast.error(DETAILS_ERROR_MESSAGE)
    }
  }, [detailQuery.isError, detailQuery.error, toast])

  // Function to view undertaking details
  const handleViewUndertaking = (undertakingId) => {
    // An errored query stays errored while its observer stays mounted, so
    // re-clicking the same item must explicitly retry the request
    if (selectedUndertakingId === undertakingId && detailQuery.isError) {
      detailQuery.refetch()
      return
    }
    setSelectedUndertakingId(undertakingId)
  }

  const handleCloseDetailModal = () => {
    setSelectedUndertakingId(null)
  }

  // Function to accept an undertaking
  const acceptUndertakingMutation = useMutation({
    mutationFn: (undertakingId) => undertakingApi.acceptUndertaking(undertakingId),
    onSuccess: async () => {
      toast.success("Undertaking accepted successfully!")
      setSelectedUndertakingId(null)
      await queryClient.invalidateQueries({ queryKey: queryKeys.undertakings.studentLists() })
    },
    onError: (err) => {
      console.error("Error accepting undertaking:", err)
      toast.error("Failed to accept undertaking. Please try again.")
    },
  })

  const handleAcceptUndertaking = (undertakingId) => {
    acceptUndertakingMutation.mutate(undertakingId)
  }

  // Function to check if deadline is approaching (within 3 days)
  const isDeadlineApproaching = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    const daysRemaining = Math.floor((deadlineDate - now) / (1000 * 60 * 60 * 24))
    return daysRemaining <= 3 && daysRemaining >= 0
  }

  // Function to check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return deadlineDate < now
  }

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    if (!dateString) return "Not specified"
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  }

  if (loading && pendingUndertakings.length === 0 && acceptedUndertakings.length === 0) {
    return <LoadingState message="Loading undertakings..." />
  }

  if (listsQuery.isError) {
    return <ErrorState message={LISTS_ERROR_MESSAGE} />
  }

  return (
    <Surface bg="var(--color-bg-page)" style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' }} className="px-4 sm:px-6 lg:px-8 flex-1">
      <header className="flex justify-between items-center" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-6) var(--spacing-6) var(--spacing-4) var(--spacing-6)', marginBottom: 'var(--spacing-6)' }}>
        <div className="flex items-center">
          <FileSignature size={20} style={{ marginRight: 'var(--spacing-3)' }} color="var(--color-info)" />
          <Heading as="h1" size="2xl" color="secondary" className="font-bold">My Undertakings</Heading>
        </div>
      </header>

      {/* Tabs */}
      <Surface bg="primary" radius="xl" shadow="sm" style={{ marginBottom: 'var(--spacing-6)' }}>
        <Surface padding="0 var(--spacing-4)">
          <Tabs variant="underline"
            tabs={[
              { value: "pending", label: `Pending (${pendingUndertakings.length})` },
              { value: "accepted", label: `Accepted (${acceptedUndertakings.length})` },
            ]}
            value={activeTab}
            onChange={setActiveTab}
            size="md"
          />
        </Surface>
      </Surface>

      {/* Pending Undertakings */}
      {activeTab === "pending" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center" style={{ height: '16rem' }}>
              <Spinner size={48} thickness="thin" color="inherit" className="text-[var(--color-info)]" />
            </div>
          ) : pendingUndertakings.length === 0 ? (
            <EmptyState icon={FileSignature} title="No Pending Undertakings" message="You don't have any undertakings that require your attention." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
              {pendingUndertakings.map((undertaking) => (
                <Surface bg="primary" padding={5} radius="xl" shadow="sm" style={{ borderLeft: 'var(--border-4) solid var(--color-info)' }} key={undertaking.id} className="transition-shadow hover:shadow-[var(--shadow-md)]">
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-3)' }}>
                    <Heading as="h3" size="lg" color="secondary" className="font-semibold">{undertaking.title}</Heading>
                    <Surface as="span" bg={undertaking.status === "not_viewed" ? 'var(--color-info-bg)' : 'var(--color-warning-bg)'} padding="var(--spacing-1) var(--spacing-2)" color={undertaking.status === "not_viewed" ? 'var(--color-info-text)' : 'var(--color-warning-text)'} size="xs" className="rounded-full">{undertaking.status === "not_viewed" ? "New" : "Pending"}</Surface>
                  </div>
                  <Text color="muted" size="sm" style={{ marginBottom: 'var(--spacing-4)' }} className="line-clamp-2">{undertaking.description}</Text>

                  <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
                    <div className="flex items-center">
                      <Clock size="1em" style={{ marginRight: 'var(--spacing-1)' }} color="var(--color-text-placeholder)" />
                      <Text as="span" size="xs" color="muted">Due: {formatDate(undertaking.deadline)}</Text>

                      {isDeadlineApproaching(undertaking.deadline) && (
                        <Text as="span" size="xs" color="warning-text" style={{ marginLeft: 'var(--spacing-2)' }} className="flex items-center">
                          <AlertTriangle size="1em" style={{ marginRight: 'var(--spacing-1)' }} /> Approaching
                        </Text>
                      )}

                      {isDeadlinePassed(undertaking.deadline) && (
                        <Text as="span" size="xs" color="danger-text" style={{ marginLeft: 'var(--spacing-2)' }} className="flex items-center">
                          <AlertTriangle size="1em" style={{ marginRight: 'var(--spacing-1)' }} /> Overdue
                        </Text>
                      )}
                    </div>

                    <Button onClick={() => handleViewUndertaking(undertaking.id)} variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </Surface>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Accepted Undertakings */}
      {activeTab === "accepted" && (
        <div>
          {loading ? (
            <div className="flex justify-center items-center" style={{ height: '16rem' }}>
              <Spinner size={48} thickness="thin" color="inherit" className="text-[var(--color-info)]" />
            </div>
          ) : acceptedUndertakings.length === 0 ? (
            <EmptyState icon={Check} title="No Accepted Undertakings" message="You haven't accepted any undertakings yet." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--spacing-6)' }}>
              {acceptedUndertakings.map((undertaking) => (
                <Surface bg="primary" padding={5} radius="xl" shadow="sm" style={{ borderLeft: 'var(--border-4) solid var(--color-success)' }} key={undertaking.id} className="transition-shadow hover:shadow-[var(--shadow-md)]">
                  <div className="flex justify-between items-start" style={{ marginBottom: 'var(--spacing-3)' }}>
                    <Heading as="h3" size="lg" color="secondary" className="font-semibold">{undertaking.title}</Heading>
                    <Surface as="span" bg="success" padding="var(--spacing-1) var(--spacing-2)" color="success-text" size="xs" className="rounded-full">Accepted</Surface>
                  </div>
                  <Text color="muted" size="sm" style={{ marginBottom: 'var(--spacing-4)' }} className="line-clamp-2">{undertaking.description}</Text>

                  <div className="flex items-center justify-between" style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-3)', borderTop: 'var(--border-1) solid var(--color-border-light)' }}>
                    <div className="flex items-center">
                      <Check size="1em" style={{ marginRight: 'var(--spacing-1)' }} color="var(--color-success)" />
                      <Text as="span" size="xs" color="muted">Accepted on: {formatDate(undertaking.acceptedAt)}</Text>
                    </div>
                  </div>
                </Surface>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Undertaking Detail Modal */}
      {selectedUndertaking && <UndertakingDetailModal show onClose={() => handleCloseDetailModal()} undertaking={selectedUndertaking} onAccept={handleAcceptUndertaking} />}
    </Surface>
  )
}

export default UndertakingsPage
