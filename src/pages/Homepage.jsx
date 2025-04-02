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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <ModernHeader />

      {/* Hero Section - Enhanced */}
      <section className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 pt-24 pb-16 lg:py-28 min-h-[100vh] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Enhanced background elements with animation */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/50 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-indigo-200/30 to-transparent rounded-full transform translate-x-1/4 translate-y-1/4"></div>
          <div className="absolute top-40 left-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full animate-pulse"></div>
          <div className="absolute top-1/4 right-1/4 w-40 h-40 bg-blue-400/5 rounded-full animate-pulse"></div>
          {/* New decorative elements */}
          <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-indigo-300/10 rounded-full animate-bounce"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 bg-blue-300/10 rounded-full animate-pulse"></div>
        </div>

        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 flex flex-col lg:flex-row items-center justify-between mx-auto relative z-10">
          <div className="lg:w-1/2 text-center lg:text-left">
            {/* Enhanced badge with animation */}
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 text-sm font-semibold mb-6 animate-fadeIn backdrop-blur-sm border border-blue-200/50 shadow-sm hover:shadow-md transition-all duration-300">IIT Indore Campus Life</div>

            {/* Enhanced heading with better animation */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 animate-slideUp">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-1 hover:from-indigo-600 hover:to-blue-600 transition-colors duration-500">Hostel Management System</span>
            </h1>

            {/* Enhanced description with better animation */}
            <p className="text-gray-600 text-lg mb-8 max-w-xl mx-auto lg:mx-0 animate-fadeIn leading-relaxed">Access all hostel services and resources in one place. Manage your accommodation, requests, and stay informed about important updates.</p>

            {/* Enhanced CTA button with more interactive hover effect */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 animate-fadeIn">
              {user ? (
                <Link to={getHomeRoute()} className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center">
                  Go to Dashboard
                  <FaArrowRight className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              ) : (
                <Link to="/login" className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center">
                  Login Now
                  <FaArrowRight className="ml-2 transform transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>

          {/* Enhanced Statistics Graphic wrapper with better animations */}
          <div className="lg:w-1/2 mt-12 lg:mt-0 flex justify-center lg:justify-end animate-fadeIn">
            <div className="relative w-full max-w-md">
              {/* Enhanced decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200/50 rounded-full z-0 animate-pulse"></div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-indigo-200/50 rounded-full z-0 animate-pulse"></div>
              <div className="absolute top-1/2 -left-8 w-16 h-16 bg-blue-300/30 rounded-full z-0 animate-bounce"></div>
              <div className="absolute top-1/4 -right-6 w-12 h-12 bg-indigo-300/30 rounded-full z-0 animate-bounce"></div>

              {/* Enhanced card with better hover effect */}
              <div className="rounded-xl overflow-hidden shadow-2xl p-6 backdrop-blur-sm bg-white/90 relative z-10 transition-all duration-500 border border-blue-100/80 hover:border-blue-200/90 hover:shadow-2xl hover:-translate-y-1">
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
