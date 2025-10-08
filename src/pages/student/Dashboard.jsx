import { useState, useEffect, useRef } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi, authApi } from "../../services/apiService"
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
import Modal from "../../components/common/Modal"
import usePwaMobile from "../../hooks/usePwaMobile"
import UndertakingsBanner from "../../components/student/UndertakingsBanner"

const DASHBOARD_CACHE_KEY = "student_dashboard_data"
const CACHE_EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

// Enhanced shimmer loader components
const ShimmerLoader = ({ height, width = "100%", className = "" }) => <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg ${className}`} style={{ height, width }}></div>

// Shimmer with blurred preview for cards
const CardShimmer = ({ height, className = "" }) => (
  <div className={`relative overflow-hidden rounded-lg ${className}`} style={{ height }}>
    <div className="absolute inset-0 bg-gray-100 backdrop-blur-sm"></div>
    <div className="absolute inset-0 flex items-center justify-center">
      <ShimmerLoader height="70%" width="90%" className="rounded-lg" />
    </div>
    <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-gray-200 to-transparent"></div>
    <div className="absolute inset-0 animate-pulse opacity-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
  </div>
)

// Shimmer for profile card
const ProfileShimmer = () => (
  <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
    <div className="flex flex-col md:flex-row gap-4">
      <ShimmerLoader height="120px" width="120px" className="rounded-full" />
      <div className="flex-1 space-y-4">
        <ShimmerLoader height="2rem" width="60%" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm p-4">
        <ShimmerLoader height="1rem" width="60%" className="mb-2" />
        <ShimmerLoader height="2rem" width="40%" />
      </div>
    ))}
  </div>
)

const Dashboard = () => {
  const { user, isOnline } = useAuth()
  const { isPwaMobile } = usePwaMobile()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isOfflineData, setIsOfflineData] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [showBirthday, setShowBirthday] = useState(false)

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
    if (!isBirthdayToday(dob)) return

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
    }
  }, [dashboardData, user])

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

      const colors = ["#1360AB", "#0d4b86", "#1a5fb8", "#ffffff", "#e0f2fe"]

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
        } catch (e) {}
      }
    }, [])

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>

        {/* full-screen canvas for confetti */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        <div className="relative bg-gradient-to-br from-[#1360AB] via-[#0d4b86] to-[#1a5fb8] text-white rounded-2xl p-6 w-[min(95%,720px)] mx-4 shadow-2xl overflow-hidden">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/90 bg-white/10 rounded-full p-2 hover:bg-white/20 transition-colors">
            ✕
          </button>
          <div className="flex flex-col items-center text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold">Happy Birthday{name ? `, ${name.split(" ")[0]}` : "!"}</h2>
            <p className="text-sm md:text-base max-w-md">Wishing you a day filled with joy, success and unforgettable moments. Have a fantastic year ahead!</p>

            <div className="mt-2 w-full flex items-center justify-center">
              <div className="bg-white/20 rounded-full px-4 py-2 text-sm backdrop-blur-sm">Enjoy your special day 🎉</div>
            </div>

            <div className="w-full mt-4 grid grid-cols-2 gap-3">
              <button onClick={onClose} className="py-2 bg-white text-[#1360AB] rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Thanks!
              </button>
              <button
                onClick={() => {
                  onClose()
                }}
                className="py-2 bg-white/20 border border-white/30 rounded-lg hover:bg-white/30 transition-colors"
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
      <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <ShimmerLoader height="2rem" width="12rem" />
          <ShimmerLoader height="2.5rem" width="8rem" className="rounded-lg md:hidden" />
        </div>

        <ProfileShimmer />
        <StatsShimmer />

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <CardShimmer height="12rem" className="mb-4" />
            <CardShimmer height="12rem" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <CardShimmer height="24rem" />
          </div>

          <div className="lg:col-span-2 space-y-4">
            <CardShimmer height="24rem" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-full">
        <div className="bg-white rounded-xl shadow-sm p-6 max-w-md w-full text-center">
          <BiError className="mx-auto text-red-500 text-5xl mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button onClick={fetchDashboardData} className="bg-[#1360AB] text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1 relative">
      {/* <button onClick={() => authApi.redirectToWellness()}>wellness</button> */}
      {/* Offline notification banner */}
      {isOfflineData && <OfflineBanner message="You're offline. Viewing cached dashboard data." className="mb-4" showDismiss={true} />}

      {/* Undertakings Banner */}
      <UndertakingsBanner />

      <section className="mb-6">
        <StudentProfile profile={dashboardData.profile} />
      </section>

      <section className="mb-6">
        <DashboardStats stats={dashboardData.stats} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Left sidebar - takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <RoomInfoCard roomData={dashboardData.roomInfo} />
          <LostFoundSummary lostAndFoundStats={dashboardData.stats.lostAndFound} />
        </div>

        {/* Middle section - Complaints takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <ComplaintsSummary complaints={dashboardData.activeComplaints} />
        </div>

        {/* Right section - Events takes 2 columns */}
        <div className="lg:col-span-2 space-y-4">
          <EventsCalendar events={dashboardData.upcomingEvents} />
        </div>
      </div>

      {/* Only keep the mobile QR button and modal */}
      <button
        onClick={() => setShowQRModal(true)}
        className={`
          fixed md:hidden bg-[#1360AB] rounded-full p-4 shadow-lg hover:bg-[#0d4b86] transition-all duration-300 z-10
          ${isPwaMobile ? "bottom-20" : "bottom-6"} right-6
        `}
      >
        <FaQrcode className="text-white text-2xl" />
      </button>

      {/* QR Code Modal */}
      {showQRModal && (
        <Modal title="Campus Access QR" onClose={() => setShowQRModal(false)} width={480}>
          <div className="space-y-6">
            <QRCodeGenerator />
            <button onClick={() => setShowQRModal(false)} className="w-full py-2 bg-gray-200 rounded-lg text-gray-800 font-medium hover:bg-gray-300 transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Birthday overlay (appears once per user per year) */}
      {showBirthday && <BirthdayOverlay name={dashboardData?.profile?.name || dashboardData?.profile?.fullName || dashboardData?.profile?.displayName} onClose={() => setShowBirthday(false)} />}
    </div>
  )
}

export default Dashboard
