/**
 * Gymkhana Dashboard Page
 * Overview for GS/President with pending items and quick actions
 */

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "hzero"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/layout"
import { Badge, StatCard, StatCards } from "@/components/ui/data-display"
import { LoadingState, ErrorState, EmptyState } from "@/components/ui/feedback"
import { CalendarDays, FileText, Clock, AlertCircle } from "lucide-react"
import { useAuth } from "@/contexts/AuthProvider"
import gymkhanaEventsApi from "@/service/modules/gymkhanaEvents.api"
import { Heading, HStack, Text } from "@/components/ui"

const DashboardPage = () => {
    const navigate = useNavigate()
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [stats, setStats] = useState({
        totalEvents: 0,
        pendingProposals: 0,
        upcomingEvents: 0,
        currentCalendar: null,
    })

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            setLoading(true)
            setError(null)
            const summaryRes = await gymkhanaEventsApi.getDashboardSummary(60)
            const currentCalendar = summaryRes.currentCalendar || summaryRes.data?.currentCalendar || null
            const totalEvents = summaryRes.totalEvents || summaryRes.data?.totalEvents || 0
            const pendingProposalsCount =
                summaryRes.pendingProposalsCount ||
                summaryRes.data?.pendingProposalsCount ||
                summaryRes.pendingProposals?.length ||
                summaryRes.data?.pendingProposals?.length ||
                0

            setStats({
                totalEvents,
                pendingProposals: pendingProposalsCount,
                upcomingEvents: 0, // Would need events query
                currentCalendar,
            })
        } catch (err) {
            setError(err.message || "Failed to load dashboard data")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <LoadingState message="Loading dashboard..." />
    }

    if (error) {
        return <ErrorState message={error} onRetry={fetchDashboardData} />
    }

    const isGS = user?.subRole === "GS Gymkhana"
    const isPresident = user?.subRole === "President Gymkhana"

    return (
        <div style={{ padding: "var(--spacing-6)" }}>
            {/* Header */}
            <div style={{ marginBottom: "var(--spacing-6)" }}>
                <Heading as="h1" size="2xl" weight="semibold" color="heading" style={{ marginBottom: "var(--spacing-2)" }}>
                    Welcome, {user?.name || "Gymkhana Member"}
                </Heading>
                <Text color="muted">
                    {user?.subRole || "Gymkhana"} Dashboard
                </Text>
            </div>

            {/* Stats */}
            <StatCards
                stats={[
                    {
                        title: "Academic Year",
                        value: stats.currentCalendar?.academicYear || "—",
                        icon: <CalendarDays />,
                        color: "var(--color-primary)",
                    },
                    {
                        title: "Calendar Status",
                        value: stats.currentCalendar?.status?.replace(/_/g, " ") || "No Calendar",
                        icon: <FileText />,
                        color: stats.currentCalendar?.isLocked ? "var(--color-warning)" : "var(--color-success)",
                    },
                    {
                        title: "Pending Proposals",
                        value: stats.pendingProposals,
                        icon: <Clock />,
                        color: stats.pendingProposals > 0 ? "var(--color-warning)" : "var(--color-success)",
                    },
                    {
                        title: "Upcoming Events",
                        value: stats.upcomingEvents,
                        icon: <CalendarDays />,
                        color: "var(--color-info)",
                    },
                ]}
                columns={4}
            />

            {/* Quick Actions */}
            <Card style={{ marginTop: "var(--spacing-6)" }}>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <HStack gap={3} wrap>
                        <Button onClick={() => navigate("/gymkhana/events")}>
                            <CalendarDays size={16} style={{ marginRight: "8px" }} />
                            View Events Calendar
                        </Button>

                        {(isGS || isPresident) && stats.pendingProposals > 0 && (
                            <Button variant="secondary" onClick={() => navigate("/gymkhana/events")}>
                                <AlertCircle size={16} style={{ marginRight: "8px" }} />
                                Pending Proposals ({stats.pendingProposals})
                            </Button>
                        )}
                    </HStack>
                </CardContent>
            </Card>

            {/* Calendar Lock Status */}
            {stats.currentCalendar && (
                <Card style={{ marginTop: "var(--spacing-4)" }}>
                    <CardContent>
                        <HStack gap={3} align="center">
                            <Text as="span" color="body">
                                Calendar {stats.currentCalendar.academicYear}:
                            </Text>
                            <Badge variant={stats.currentCalendar.isLocked ? "warning" : "success"}>
                                {stats.currentCalendar.isLocked ? "Locked" : "Editable"}
                            </Badge>
                            {stats.currentCalendar.isLocked && isGS && (
                                <Text as="span" color="muted" size="sm">
                                    Request amendments through the Events page
                                </Text>
                            )}
                        </HStack>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default DashboardPage
