import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaArrowRight, FaClipboardCheck, FaTools, FaCalendarAlt, FaFileAlt, FaUtensils } from "react-icons/fa"
import { MdMeetingRoom, MdOutlineNotificationsActive, MdSecurity, MdPeople, MdDashboard } from "react-icons/md"
import { HiOutlineDocumentReport } from "react-icons/hi"
import { useAuth } from "../contexts/AuthProvider"
import ModernHeader from "../components/home/ModernHeader"
import QuickAccessCard from "../components/home/QuickAccessCard"
import StatisticsGraphic from "../components/home/StatisticsGraphic" // New component
import LoadingScreen from "../components/common/LoadingScreen"

const HomePage = () => {
  const { user, getHomeRoute, isStandalone } = useAuth()
  const navigate = useNavigate()

  // Use useEffect to handle navigation
  useEffect(() => {
    if (isStandalone) {
      navigate("/login")
    }
  }, [isStandalone, navigate])

  // Show loading or message while redirecting
  if (isStandalone) {
    return <LoadingScreen />
  }

  const getQuickAccessLinks = () => {
    if (!user) {
      return [
        {
          title: "Login",
          description: "Access your account",
          icon: <MdDashboard className="w-6 h-6" />,
          link: "/login",
          color: "bg-sky-100 text-sky-600",
        },
        {
          title: "Contact Support",
          description: "Get help with your account",
          icon: <FaTools className="w-6 h-6" />,
          link: "/contact",
          color: "bg-purple-100 text-purple-600",
        },
      ]
    }

    switch (user.role) {
      case "Student":
        return [
          {
            title: "Dashboard",
            description: "View your dashboard details",
            icon: <MdDashboard className="w-6 h-6" />,
            link: "/student/dashboard",
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Complaints",
            description: "Submit and track complaints",
            icon: <HiOutlineDocumentReport className="w-6 h-6" />,
            link: "/student/complaints",
            color: "bg-rose-100 text-rose-600",
          },
        ]
      case "Admin":
        return [
          {
            title: "Dashboard",
            description: "Administrative overview",
            icon: <MdDashboard className="w-6 h-6" />,
            link: "/admin/dashboard",
            color: "bg-indigo-100 text-indigo-600",
          },
          {
            title: "Students Management",
            description: "Manage system users",
            icon: <MdPeople className="w-6 h-6" />,
            link: "/admin/students",
            color: "bg-purple-100 text-purple-600",
          },
        ]
      case "Warden":
        return [
          {
            title: "Dashboard",
            description: "Warden overview",
            icon: <MdDashboard className="w-6 h-6" />,
            link: "/warden",
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Student Management",
            description: "View and manage students",
            icon: <MdPeople className="w-6 h-6" />,
            link: "/warden/students",
            color: "bg-indigo-100 text-indigo-600",
          },
          {
            title: "Complaints",
            description: "Submit and track complaints",
            icon: <HiOutlineDocumentReport className="w-6 h-6" />,
            link: "/warden/complaints",
            color: "bg-rose-100 text-rose-600",
          },
          {
            title: "Approve Requests",
            description: "Review pending requests",
            icon: <FaClipboardCheck className="w-6 h-6" />,
            link: "/warden/room-change-requests",
            color: "bg-green-100 text-green-600",
          },
        ]
      case "Maintenance Staff":
        return [
          {
            title: "Dashboard",
            description: "View maintenance tasks",
            icon: <FaTools className="w-6 h-6" />,
            link: "/maintenance",
            color: "bg-blue-100 text-blue-600",
          },
        ]
      case "Security":
        return [
          {
            title: "Dashboard",
            description: "Security overview",
            icon: <MdDashboard className="w-6 h-6" />,
            link: "/guard",
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Check-in/out Logs",
            description: "View entry and exit records",
            icon: <MdSecurity className="w-6 h-6" />,
            link: "/guard/entries",
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Visitor Management",
            description: "Record and track visitors",
            icon: <MdPeople className="w-6 h-6" />,
            link: "/guard/visitors",
            color: "bg-purple-100 text-purple-600",
          },
          {
            title: "Lost and Found",
            description: "Report lost items",
            icon: <FaClipboardCheck className="w-6 h-6" />,
            link: "/guard/lost-and-found",
            color: "bg-rose-100 text-rose-600",
          },
        ]
      default:
        return [
          {
            title: "Dashboard",
            description: "Go to your dashboard",
            icon: <MdDashboard className="w-6 h-6" />,
            link: getHomeRoute(),
            color: "bg-blue-100 text-blue-600",
          },
          {
            title: "Profile",
            description: "Manage your profile",
            icon: <MdPeople className="w-6 h-6" />,
            link: `${getHomeRoute()}/profile`,
            color: "bg-indigo-100 text-indigo-600",
          },
        ]
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader />

      <section className="relative bg-gradient-to-r from-sky-50 to-blue-100 py-16 lg:py-20">
        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between pt-8 mx-auto" style={{ margin: "0 auto" }}>
          <div className="lg:w-1/2 text-center lg:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              IIT Indore
              <span className="block text-blue-600 mt-2">Hostel Management System</span>
            </h1>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto lg:mx-0">Access all hostel services and resources in one place. Manage your accommodation, requests, and stay informed about important updates.</p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              {user ? (
                <Link to={getHomeRoute()} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center">
                  Go to Dashboard
                  <FaArrowRight className="ml-2" />
                </Link>
              ) : (
                <Link to="/login" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md flex items-center">
                  Login
                  <FaArrowRight className="ml-2" />
                </Link>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md">
              <div className="rounded-xl overflow-hidden shadow-lg bg-white p-6 backdrop-blur-sm bg-white/90">
                <StatisticsGraphic />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 mx-auto" style={{ margin: "0 auto" }}>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quick Access</h2>
            <p className="text-gray-600">Shortcuts to frequently used services</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {getQuickAccessLinks().map((link, index) => (
              <QuickAccessCard key={index} {...link} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
