import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"
import { useAuth } from "../contexts/AuthProvider"
import ModernHeader from "../components/home/ModernHeader"
import StatisticsGraphic from "../components/home/StatisticsGraphic"
import LoadingScreen from "../components/common/LoadingScreen"

const HomePage = () => {
  const { user, getHomeRoute, isStandalone } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isStandalone) {
      if (user) {
        navigate(getHomeRoute())
      } else {
        navigate("/login")
      }
    }
  }, [isStandalone, navigate])

  if (isStandalone) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-blue-50 overflow-hidden">
      <ModernHeader />

      {/* Hero Section - Enhanced */}
      <section className="relative bg-blue-50 pt-24 pb-16 lg:py-32 min-h-[100vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">

          {/* Large background blobs - spread across the page */}
          <div className="absolute -top-40 left-20 w-[50rem] h-[50rem] bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-[45rem] h-[45rem] bg-blue-200/25 rounded-full animate-[pulse_18s_ease-in-out_infinite] blur-3xl"></div>
          <div className="absolute top-1/4 left-0 w-[35rem] h-[35rem] bg-blue-200/15 rounded-full animate-[pulse_22s_ease-in-out_infinite_2s] blur-2xl"></div>
          <div className="absolute bottom-1/3 -right-10 w-[38rem] h-[38rem] bg-blue-200/15 rounded-full animate-[pulse_25s_ease-in-out_infinite_4s] blur-3xl"></div>

          {/* Medium size floating elements - distributed evenly */}
          <div className="absolute top-20 left-1/4 w-56 h-56 bg-blue-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite] blur-lg"></div>
          <div className="absolute bottom-1/5 right-1/5 w-60 h-60 bg-blue-300/18 rounded-full animate-[pulse_15s_ease-in-out_infinite_1s] blur-xl"></div>
          <div className="absolute top-1/3 left-40 w-48 h-48 bg-blue-200/20 rounded-full animate-[pulse_10s_ease-in-out_infinite_2s] blur-lg"></div>
          <div className="absolute bottom-1/4 right-1/3 w-52 h-52 bg-blue-300/15 rounded-full animate-[pulse_14s_ease-in-out_infinite_3s] blur-lg"></div>
          <div className="absolute top-2/3 right-20 w-44 h-44 bg-blue-300/18 rounded-full animate-[pulse_11s_ease-in-out_infinite_4s] blur-lg"></div>

          {/* Smaller dynamic elements - spread throughout */}
          <div className="absolute bottom-40 left-1/4 w-20 h-20 bg-blue-400/25 rounded-full animate-bounce blur-sm"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-blue-400/20 rounded-full animate-[ping_5s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-1/2 left-80 w-12 h-12 bg-blue-500/18 rounded-full animate-[ping_6s_ease-in-out_infinite_0.5s] blur-sm"></div>
          <div className="absolute bottom-1/5 right-60 w-24 h-24 bg-blue-300/20 rounded-full animate-[bounce_7s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-60 left-60 w-18 h-18 bg-blue-300/25 rounded-full animate-[bounce_8s_ease-in-out_infinite_1.5s] blur-sm"></div>

          {/* Fast moving tiny elements - wider distribution */}
          <div className="absolute top-20 right-1/3 w-8 h-8 bg-blue-400/25 rounded-full animate-[ping_4s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-blue-500/18 rounded-full animate-[bounce_5s_ease-in-out_infinite] blur-sm"></div>
          <div className="absolute top-3/5 left-1/3 w-6 h-6 bg-blue-400/22 rounded-full animate-[ping_3s_ease-in-out_infinite_1s] blur-sm"></div>
          <div className="absolute bottom-80 right-80 w-7 h-7 bg-blue-400/20 rounded-full animate-[ping_3.5s_ease-in-out_infinite_0.7s] blur-sm"></div>
          <div className="absolute top-1/3 left-2/3 w-9 h-9 bg-blue-400/18 rounded-full animate-[bounce_4.5s_ease-in-out_infinite_1.2s] blur-sm"></div>

          {/* Floating elements with custom float animation - balanced positioning */}
          <div className="absolute top-1/4 right-1/5 w-14 h-14 bg-blue-300/22 rounded-full blur-sm animate-[float_8s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-1/3 left-1/5 w-18 h-18 bg-blue-300/18 rounded-full blur-sm animate-[float_12s_ease-in-out_infinite_2s]"></div>
          <div className="absolute top-3/4 right-1/3 w-12 h-12 bg-blue-400/20 rounded-full blur-sm animate-[float_9s_ease-in-out_infinite_1.5s]"></div>
          <div className="absolute bottom-20 left-1/3 w-16 h-16 bg-blue-400/18 rounded-full blur-sm animate-[float_10s_ease-in-out_infinite_3s]"></div>
          <div className="absolute top-40 right-2/5 w-15 h-15 bg-blue-300/18 rounded-full blur-sm animate-[float_11s_ease-in-out_infinite_1s]"></div>
        </div>

        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between mx-auto relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Enhanced heading with better animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 animate-slideUp tracking-tight leading-tight">
              Welcome to
              <span className="block text-blue-600 mt-2 transition-all duration-500">Hostel Management System</span>
            </h1>

            {/* Enhanced description with better animation */}
            <p className="text-gray-600/90 text-lg md:text-xl mb-10 max-w-xl mx-auto lg:mx-0 animate-fadeIn leading-relaxed tracking-wide">Access all hostel services and resources in one place. Manage your accommodation, requests, and stay informed about important updates.</p>

            {/* Enhanced CTA button with more interactive hover effect */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fadeIn">
              {user ? (
                <Link
                  to={getHomeRoute()}
                  className="group px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-2xl hover:bg-blue-700 transform hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative">Go to Dashboard</span>
                  <FaArrowRight className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1.5 relative" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="group px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-2xl hover:bg-blue-700 transform hover:scale-[1.03] transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 flex items-center relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative">Login Now</span>
                  <FaArrowRight className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1.5 relative" />
                </Link>
              )}
            </div>
          </div>

          {/* Enhanced Statistics Graphic wrapper with better animations */}
          <div className="lg:w-1/2 mt-16 lg:mt-0 flex justify-center lg:justify-end animate-fadeIn">
            <div className="relative w-full max-w-md">
              {/* Enhanced decorative elements */}
              <div className="absolute -top-8 -left-8 w-36 h-36 bg-blue-200/60 rounded-full z-0 animate-[pulse_4s_ease-in-out_infinite] blur-lg"></div>
              <div className="absolute -bottom-8 -right-8 w-44 h-44 bg-blue-200/55 rounded-full z-0 animate-[pulse_5s_ease-in-out_infinite_1s] blur-lg"></div>
              <div className="absolute top-1/2 -left-12 w-28 h-28 bg-blue-300/45 rounded-full z-0 animate-[bounce_6s_ease-in-out_infinite] blur-md"></div>
              <div className="absolute top-1/4 -right-10 w-24 h-24 bg-blue-300/40 rounded-full z-0 animate-[bounce_7s_ease-in-out_infinite_0.5s] blur-md"></div>

              {/* Card with hover effects that don't affect the graphic content */}
              <div className="rounded-3xl overflow-hidden shadow-xl shadow-blue-900/8 p-8 backdrop-blur-lg bg-white/95 relative z-10 transition-all duration-500 border border-blue-100/60 hover:border-blue-200/80 hover:shadow-2xl hover:shadow-blue-900/12 hover:bg-white ring-1 ring-white/50">
                <StatisticsGraphic />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
