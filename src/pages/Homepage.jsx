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
    <div className="homepage">
      <ModernHeader />

      {/* Hero Section */}
      <section className="homepage-hero">
        <div className="homepage-bg-container">
          {/* Large background blobs */}
          <div className="homepage-blob-1"></div>
          <div className="homepage-blob-2"></div>
          <div className="homepage-blob-3"></div>
          <div className="homepage-blob-4"></div>

          {/* Medium size floating elements */}
          <div className="homepage-blob-5"></div>
          <div className="homepage-blob-6"></div>
          <div className="homepage-blob-7"></div>
          <div className="homepage-blob-8"></div>
          <div className="homepage-blob-9"></div>

          {/* Smaller dynamic elements */}
          <div className="homepage-blob-10"></div>
          <div className="homepage-blob-11"></div>
          <div className="homepage-blob-12"></div>
          <div className="homepage-blob-13"></div>
          <div className="homepage-blob-14"></div>

          {/* Fast moving tiny elements */}
          <div className="homepage-blob-15"></div>
          <div className="homepage-blob-16"></div>
          <div className="homepage-blob-17"></div>
          <div className="homepage-blob-18"></div>
          <div className="homepage-blob-19"></div>

          {/* Floating elements with float animation */}
          <div className="homepage-blob-20"></div>
          <div className="homepage-blob-21"></div>
          <div className="homepage-blob-22"></div>
          <div className="homepage-blob-23"></div>
          <div className="homepage-blob-24"></div>
        </div>

        <div className="homepage-content">
          <div className="homepage-text-section">
            {/* Heading */}
            <h1 className="homepage-heading">
              Welcome to
              <span className="homepage-heading-highlight">Hostel Management System</span>
            </h1>

            {/* Description */}
            <p className="homepage-description">
              Access all hostel services and resources in one place. Manage your accommodation, requests, and stay informed about important updates.
            </p>

            {/* CTA Button */}
            <div className="homepage-cta-container">
              {user ? (
                <Link to={getHomeRoute()} className="homepage-cta-button">
                  <span className="homepage-cta-button-overlay"></span>
                  <span className="homepage-cta-button-text">Go to Dashboard</span>
                  <FaArrowRight className="homepage-cta-button-icon" />
                </Link>
              ) : (
                <Link to="/login" className="homepage-cta-button">
                  <span className="homepage-cta-button-overlay"></span>
                  <span className="homepage-cta-button-text">Login Now</span>
                  <FaArrowRight className="homepage-cta-button-icon" />
                </Link>
              )}
            </div>
          </div>

          {/* Statistics Graphic Section */}
          <div className="homepage-stats-section">
            <div className="homepage-stats-wrapper">
              {/* Decorative blobs */}
              <div className="homepage-stats-blob-1"></div>
              <div className="homepage-stats-blob-2"></div>
              <div className="homepage-stats-blob-3"></div>
              <div className="homepage-stats-blob-4"></div>

              {/* Stats Card */}
              <div className="homepage-stats-card">
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
