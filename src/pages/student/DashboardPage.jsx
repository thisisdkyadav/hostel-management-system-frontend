import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi, authApi } from "../../service"
import { BiError } from "react-icons/bi"
import { FaQrcode } from "react-icons/fa"
import OfflineBanner from "../../components/common/OfflineBanner"
import StudentProfile from "../../components/student/StudentProfile"
import RoomInfoCard from "../../components/student/RoomInfoCard"
import ComplaintsSummary from "../../components/student/ComplaintsSummary"
import LostFoundSummary from "../../components/student/LostFoundSummary"
import EventsCalendar from "../../components/student/EventsCalendar"
import DashboardStats from "../../components/student/DashboardStats"
import QRCodeGenerator from "../../components/QRCodeGenerator"
import { Modal } from "@/components/ui"
import { Button } from "czero/react"
import usePwaMobile from "../../hooks/usePwaMobile"
import UndertakingsBanner from "../../components/student/UndertakingsBanner"
import ComplaintFeedbackPopup from "../../components/student/ComplaintFeedbackPopup"

const DASHBOARD_CACHE_KEY = "student_dashboard_data"
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-[var(--skeleton-base)] via-[var(--skeleton-highlight)] to-[var(--skeleton-base)] ${className}`} style={{ height, width, borderRadius: 'var(--radius-md)' }}></div>

// Shimmer with blurred preview for cards
const CardShimmer = ({ height, className = "" }) => (
  <div className={`relative overflow-hidden ${className}`} style={{ height, borderRadius: 'var(--radius-lg)' }}>
    <div className="absolute inset-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--color-bg-muted)' }}></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <ShimmerLoader height="70%" width="90%" />
    </div>
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent" style={{ height: 'var(--spacing-8)', backgroundColor: 'var(--skeleton-base)' }}></div>
    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[var(--skeleton-base)] via-[var(--skeleton-highlight)] to-[var(--skeleton-base)]" style={{ opacity: 'var(--opacity-20)' }}></div>
  </div>
)

// Shimmer for profile card
const ProfileShimmer = () => (
  <div style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
    <div className="flex flex-col md:flex-row" style={{ gap: 'var(--gap-md)' }}>
      <ShimmerLoader height="120px" width="120px" className="rounded-full" />
      <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
        <ShimmerLoader height="2rem" width="60%" />
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--gap-md)' }}>
          <ShimmerLoader height="1.5rem" width="80%" />
          <ShimmerLoader height="1.5rem" width="70%" />
          <ShimmerLoader height="1.5rem" width="60%" />
          <ShimmerLoader height="1.5rem" width="75%" />
        </div>
      </div>
    </div>
  </div>
)

// Shimmer for stats cards
const StatsShimmer = () => (
  <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: 'var(--gap-md)', marginBottom: 'var(--spacing-6)' }}>
    {[...Array(4)].map((_, i) => (
      <div key={i} style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-4)' }}>
        <ShimmerLoader height="1rem" width="60%" className="mb-2" />
        <ShimmerLoader height="2rem" width="40%" />
      </div>
    ))}
  </div>
)

const DashboardPage = () => {
  const { user, isOnline } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOfflineData, setIsOfflineData] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showBirthday, setShowBirthday] = useState(false)
  const [showFeedbackPopup, setShowFeedbackPopup] = useState(false)
  const [currentFeedbackComplaint, setCurrentFeedbackComplaint] = useState(null)
  const [feedbackComplaintIndex, setFeedbackComplaintIndex] = useState(0)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      if (isOnline) {
        try {
          const response = await studentApi.getStudentDashboard()
          const data = response.data

          // Store in cache with timestamp
          localStorage.setItem(
            DASHBOARD_CACHE_KEY,
            JSON.stringify({
              data,
              timestamp: new Date().toISOString(),
            })
          )

          setDashboardData(data)
          setIsOfflineData(false)
          setError(null)
        } catch (err) {
          console.error("Error fetching dashboard data:", err)
          const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY)

          if (cachedData) {
            const { data } = JSON.parse(cachedData)
            setDashboardData(data)
            setIsOfflineData(true)
          } else {
            setError("Failed to load dashboard data")
          }
        }
      } else {
        const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY)

        if (cachedData) {
          const { data } = JSON.parse(cachedData)
          setDashboardData(data)
          setIsOfflineData(true)
        } else {
          setError("You are offline and no cached data is available")
        }
      }
    } catch (err) {
      console.error("Error in dashboard data handling:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Check if cache is expired
  const isCacheExpired = (timestamp) => {
    if (!timestamp) return true
    const cachedTime = new Date(timestamp).getTime()
    const currentTime = new Date().getTime()
    return currentTime - cachedTime > CACHE_EXPIRY_TIME
  }

  // Helper to compare month and day of DOB with today
  const isBirthdayToday = (dobValue) => {
    if (!dobValue) return false

    console.log("Checking birthday for DOB value:", dobValue)

    // Try to parse common formats; prefer ISO-like strings
    let dob = new Date(dobValue)
    if (isNaN(dob.getTime())) {
      // Try to handle dd/mm/yyyy or dd-mm-yyyy
      const parts = String(dobValue).split(/[\/\-]/)
      if (parts.length >= 3) {
        // try formats: yyyy-mm-dd or dd-mm-yyyy
        let day, month
        if (parts[0].length === 4) {
          // yyyy-mm-dd
          month = parseInt(parts[1], 10) - 1
          day = parseInt(parts[2], 10)
        } else {
          // dd-mm-yyyy
          day = parseInt(parts[0], 10)
          month = parseInt(parts[1], 10) - 1
        }

        if (!isNaN(day) && !isNaN(month)) {
          dob = new Date(2000, month, day) // year doesn't matter
        } else {
          return false
        }
      } else {
        return false
      }
    }

    const today = new Date()
    const isBD = dob.getDate() === today.getDate() && dob.getMonth() === today.getMonth()
    console.log(`Birthday check: DOB=${dob.toDateString()}, Today=${today.toDateString()}, isBirthday=${isBD}`)

    return isBD
  }

  useEffect(() => {
    // New behavior:
    // - When online: always fetch fresh data (do not use cache as primary source)
    // - When offline: use cached data if available, otherwise show an error
    const cachedData = localStorage.getItem(DASHBOARD_CACHE_KEY)

    if (isOnline) {
      // Always fetch fresh data when online
      fetchDashboardData()
    } else {
      // Offline: try to use cached data
      if (cachedData) {
        try {
          const { data } = JSON.parse(cachedData)
          setDashboardData(data)
          setIsOfflineData(true)
          setError(null)
        } catch (e) {
          console.error("Failed to parse cached dashboard data:", e)
          setError("You are offline and no cached data is available")
        }
      } else {
        setError("You are offline and no cached data is available")
      }

      setLoading(false)
    }
  }, [isOnline])

  // Birthday display: check when dashboardData/profile becomes available
  useEffect(() => {
    if (!dashboardData || !dashboardData.profile) return

    const dob = dashboardData.profile.dateOfBirth || dashboardData.profile.dob || dashboardData.profile.DOB
    if (!isBirthdayToday(dob)) {
      // No birthday, check for feedback complaints
      checkForFeedbackComplaints()
      return
    }

    // Use localStorage to show birthday overlay only once per user per year
    const userId = dashboardData.profile.id || (user && user.uid) || user?.id || "unknown_user"
    const key = `birthday_shown_${userId}`
    const currentYear = String(new Date().getFullYear())
    const shownYear = localStorage.getItem(key)

    if (shownYear !== currentYear) {
      // not shown this year yet
      setShowBirthday(true)
      try {
        localStorage.setItem(key, currentYear)
      } catch (e) {
        // ignore storage errors
      }
    } else {
      // Birthday already shown, check for feedback complaints
      checkForFeedbackComplaints()
    }
  }, [dashboardData, user])

  // Check and show feedback popup for resolved complaints without feedback
  const checkForFeedbackComplaints = () => {
    if (!dashboardData?.resolvedComplaintsWithoutFeedback?.length) return

    const complaints = dashboardData.resolvedComplaintsWithoutFeedback
    const userId = user?._id || user?.id || "unknown_user"
    const key = `feedback_snoozed_${userId}`
    const today = new Date().toDateString()

    try {
      const snoozedData = JSON.parse(localStorage.getItem(key) || "{}")

      // Find first complaint that hasn't been snoozed today
      const complaintToShow = complaints.find((c) => {
        const snoozedDate = snoozedData[c.id]
        // Show if never snoozed or snoozed on a different day
        return !snoozedDate || snoozedDate !== today
      })

      if (complaintToShow) {
        const index = complaints.findIndex((c) => c.id === complaintToShow.id)
        setCurrentFeedbackComplaint(complaintToShow)
        setFeedbackComplaintIndex(index)
        setShowFeedbackPopup(true)
      }
    } catch (e) {
      console.error("Error checking feedback complaints:", e)
    }
  }

  // Handle birthday overlay close
  const handleBirthdayClose = () => {
    setShowBirthday(false)
    // After birthday, check for feedback complaints
    checkForFeedbackComplaints()
  }

  // Handle feedback popup close (dismissed without submitting)
  const handleFeedbackDismiss = () => {
    if (!currentFeedbackComplaint) return

    const userId = user?._id || user?.id || "unknown_user"
    const key = `feedback_snoozed_${userId}`
    const today = new Date().toDateString()

    try {
      const snoozedData = JSON.parse(localStorage.getItem(key) || "{}")
      // Store the complaint ID with today's date
      snoozedData[currentFeedbackComplaint.id] = today
      localStorage.setItem(key, JSON.stringify(snoozedData))
    } catch (e) {
      console.error("Error saving snoozed complaint:", e)
    }

    setShowFeedbackPopup(false)
    setCurrentFeedbackComplaint(null)

    // Check if there are more complaints to show
    const nextIndex = feedbackComplaintIndex + 1
    if (dashboardData?.resolvedComplaintsWithoutFeedback?.[nextIndex]) {
      const nextComplaint = dashboardData.resolvedComplaintsWithoutFeedback[nextIndex]
      const snoozedData = JSON.parse(localStorage.getItem(key) || "{}")
      const today = new Date().toDateString()

      // Only show next complaint if it hasn't been snoozed today
      if (!snoozedData[nextComplaint.id] || snoozedData[nextComplaint.id] !== today) {
        setCurrentFeedbackComplaint(nextComplaint)
        setFeedbackComplaintIndex(nextIndex)
        setTimeout(() => setShowFeedbackPopup(true), 500)
      }
    }
  }

  // Handle feedback submission
  const handleFeedbackSubmitted = () => {
    setShowFeedbackPopup(false)
    setCurrentFeedbackComplaint(null)

    // Refresh dashboard data to update the complaints list
    fetchDashboardData()
  }

  // Birthday overlay component with canvas-based confetti
  const BirthdayOverlay = ({ name, onClose }) => {
    const canvasRef = useRef(null)
    const rafRef = useRef(null)
    const particlesRef = useRef([])
    const stopTimeoutRef = useRef(null)

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")

      let width = (canvas.width = window.innerWidth)
      let height = (canvas.height = window.innerHeight)

      const colors = [
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary-dark').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary-light').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--color-white').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--color-primary-bg').trim()
      ]

      const createParticle = () => {
        return {
          x: Math.random() * width,
          y: Math.random() * -height * 0.5,
          w: 6 + Math.random() * 10,
          h: 8 + Math.random() * 10,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 6,
          angle: Math.random() * Math.PI * 2,
          va: (Math.random() - 0.5) * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotate: Math.random() * 360,
        }
      }

      const initParticles = (count = 120) => {
        particlesRef.current = []
        for (let i = 0; i < count; i++) particlesRef.current.push(createParticle())
      }

      const resize = () => {
        width = canvas.width = window.innerWidth
        height = canvas.height = window.innerHeight
      }

      const gravity = 0.15

      const render = () => {
        ctx.clearRect(0, 0, width, height)

        const particles = particlesRef.current
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i]
          p.vy += gravity
          p.x += p.vx
          p.y += p.vy
          p.angle += p.va

          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate(p.angle)
          ctx.fillStyle = p.color
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
          ctx.restore()

          // recycle if out of bounds
          if (p.y > height + 50 || p.x < -50 || p.x > width + 50) {
            particles[i] = createParticle()
            particles[i].y = Math.random() * -80
          }
        }

        rafRef.current = requestAnimationFrame(render)
      }

      initParticles(140)
      render()
      window.addEventListener("resize", resize)

      // stop confetti after 6 seconds
      stopTimeoutRef.current = setTimeout(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        particlesRef.current = []
        ctx.clearRect(0, 0, width, height)
      }, 6000)

      return () => {
        window.removeEventListener("resize", resize)
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current)
        try {
          ctx.clearRect(0, 0, width, height)
        } catch (e) { }
      }
    }, [])

    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 'var(--z-modal)' }}>
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--color-bg-modal-overlay)', opacity: 'var(--opacity-overlay)' }} onClick={onClose}></div>

        {/* full-screen canvas for confetti */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="relative text-white overflow-hidden" style={{ background: 'var(--gradient-primary)', borderRadius: 'var(--radius-2xl)', padding: 'var(--spacing-6)', width: 'min(95%, 720px)', margin: '0 var(--spacing-4)', boxShadow: 'var(--shadow-xl)' }}>
          <button onClick={onClose} className="absolute rounded-full transition-colors" style={{ top: 'var(--spacing-4)', right: 'var(--spacing-4)', color: 'var(--color-white)', backgroundColor: 'rgba(255, 255, 255, 0.1)', padding: 'var(--spacing-2)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}>
            ✕
          </button>
          <div className="flex flex-col items-center text-center" style={{ gap: 'var(--gap-md)' }}>
            <h2 className="font-extrabold" style={{ fontSize: 'clamp(var(--font-size-3xl), 5vw, var(--font-size-4xl))' }}>Happy Birthday{name ? `, ${name.split(" ")[0]}` : "!"}</h2>
            <p className="max-w-md" style={{ fontSize: 'clamp(var(--font-size-sm), 2vw, var(--font-size-base))' }}>Wishing you a day filled with joy, success and unforgettable moments. Have a fantastic year ahead!</p>

            <div className="w-full flex items-center justify-center" style={{ marginTop: 'var(--spacing-2)' }}>
              <div className="rounded-full backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: 'var(--spacing-2) var(--spacing-4)', fontSize: 'var(--font-size-sm)' }}>Enjoy your special day 🎉</div>
            </div>

            <div className="w-full grid grid-cols-2" style={{ marginTop: 'var(--spacing-4)', gap: 'var(--gap-sm)' }}>
              <button onClick={onClose} className="font-semibold transition-colors" style={{ padding: 'var(--spacing-2)', backgroundColor: 'var(--color-white)', color: 'var(--color-primary)', borderRadius: 'var(--radius-lg)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}>
                Thanks!
              </button>
              <button onClick={() => {
                onClose()
              }}
                className="transition-colors"
                style={{ padding: 'var(--spacing-2)', backgroundColor: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: 'var(--radius-lg)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              >
                Celebrate
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 flex-1" style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--spacing-6)' }}>
          <ShimmerLoader height="2rem" width="12rem" />
          <ShimmerLoader height="2.5rem" width="8rem" className="md:hidden" />
        </div>

        <ProfileShimmer />
        <StatsShimmer />

        <div className="grid grid-cols-1 lg:grid-cols-6" style={{ gap: 'var(--gap-md)' }}>
          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
            <CardShimmer height="12rem" style={{ marginBottom: 'var(--spacing-4)' }} />
            <CardShimmer height="12rem" />
          </div>

          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
            <CardShimmer height="24rem" />
          </div>

          <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
            <CardShimmer height="24rem" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full" style={{ padding: 'var(--spacing-6)' }}>
        <div className="max-w-md w-full text-center" style={{ backgroundColor: 'var(--color-bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-6)' }}>
          <BiError className="mx-auto" style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-5xl)', marginBottom: 'var(--spacing-4)' }} />
          <h2 className="font-semibold" style={{ fontSize: 'var(--font-size-xl)', color: 'var(--color-text-secondary)', marginBottom: 'var(--spacing-2)' }}>Unable to Load Dashboard</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-6)' }}>{error}</p>
          <Button onClick={fetchDashboardData} variant="primary" size="md">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 flex-1 relative" style={{ paddingTop: 'var(--spacing-6)', paddingBottom: 'var(--spacing-6)' }}>
      {/* <button onClick={() => authApi.redirectToWellness()}>wellness</button> */}
      {/* Offline notification banner */}
      {isOfflineData && <OfflineBanner message="You're offline. Viewing cached dashboard data." className="mb-4" showDismiss={true} />}

      {/* Undertakings Banner */}
      <UndertakingsBanner />

      <section style={{ marginBottom: 'var(--spacing-6)' }}>
        <StudentProfile profile={dashboardData.profile} />
      </section>

      <section style={{ marginBottom: 'var(--spacing-6)' }}>
        <DashboardStats stats={dashboardData.stats} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-6" style={{ gap: 'var(--gap-md)' }}>
        {/* Left sidebar - takes 2 columns */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <RoomInfoCard roomData={dashboardData.roomInfo} />
          <LostFoundSummary lostAndFoundStats={dashboardData.stats.lostAndFound} />
        </div>

        {/* Middle section - Complaints takes 2 columns */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <ComplaintsSummary complaints={dashboardData.activeComplaints} />
        </div>

        {/* Right section - Events takes 2 columns */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--gap-md)' }}>
          <EventsCalendar events={dashboardData.upcomingEvents} />
        </div>
      </div>

      {/* Only keep the mobile QR button and modal */}
      <Button onClick={() => setShowQRModal(true)}
        className={`fixed md:hidden rounded-full ${isPwaMobile ? "bottom-20" : ""}`}
        variant="primary"
        icon={<FaQrcode style={{ fontSize: 'var(--font-size-2xl)' }} />}
        style={{
          padding: 'var(--spacing-4)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 'var(--z-dropdown)',
          bottom: isPwaMobile ? '5rem' : 'var(--spacing-6)',
          right: 'var(--spacing-6)',
        }}
        aria-label="Show QR Code"
      />

      {/* QR Code Modal */}
      {showQRModal && (
        <Modal title="Campus Access QR" onClose={() => setShowQRModal(false)} width={480}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
            <QRCodeGenerator />
            <Button onClick={() => setShowQRModal(false)} fullWidth variant="secondary" size="md">
              Close
            </Button>
          </div>
        </Modal>
      )}

      {/* Birthday overlay (appears once per user per year) */}
      {showBirthday && <BirthdayOverlay name={dashboardData?.profile?.name || dashboardData?.profile?.fullName || dashboardData?.profile?.displayName} onClose={handleBirthdayClose} />}

      {/* Feedback popup for resolved complaints without feedback */}
      {showFeedbackPopup && currentFeedbackComplaint && <ComplaintFeedbackPopup complaint={currentFeedbackComplaint} onClose={handleFeedbackDismiss} onFeedbackSubmitted={handleFeedbackSubmitted} />}
    </div>
  )
}

export default DashboardPage

