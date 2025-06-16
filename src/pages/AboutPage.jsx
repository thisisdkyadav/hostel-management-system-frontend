import React from "react"
import { Link } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import ModernHeader from "../components/home/ModernHeader"

const AboutPage = () => {
  return (
    <div className="h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <ModernHeader />

      {/* About Hero Section - Exactly 100vh */}
      <section className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 h-[calc(100vh-0px)] flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Background effects similar to homepage */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/60 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>

          {/* Large background blobs - slightly reduced size */}
          <div className="absolute -top-40 left-20 w-[45rem] h-[45rem] bg-gradient-to-tr from-indigo-300/15 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-[40rem] h-[40rem] bg-gradient-to-br from-blue-200/20 to-transparent rounded-full animate-[pulse_15s_ease-in-out_infinite] blur-2xl"></div>

          {/* Medium size floating elements - reduced */}
          <div className="absolute top-20 left-1/4 w-48 h-48 bg-blue-400/10 rounded-full animate-[pulse_10s_ease-in-out_infinite] blur-md"></div>
          <div className="absolute bottom-1/5 right-1/5 w-52 h-52 bg-indigo-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite_0.5s] blur-lg"></div>
        </div>

        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-10 mx-auto relative z-10">
          <div className="text-center mb-6 pt-20">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-800 mb-4 animate-slideUp tracking-tight">
              About
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 ml-3 hover:from-indigo-600 hover:to-blue-600 transition-colors duration-500">HMS Portal</span>
            </h1>
            <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto animate-fadeIn leading-relaxed">Quick guide for students and staff using the Hostel Management System</p>
          </div>

          {/* Content Cards - More concise with reduced padding */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            {/* System Overview Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-5 md:p-6 shadow-lg border border-blue-100/80 hover:border-blue-200/90 hover:shadow-xl hover:bg-white/95 transition-all duration-300 animate-fadeIn">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Portal Overview</h3>
              <p className="text-gray-600 text-sm">The HMS Portal enables students to submit complaints, request visitor passes, and access important hostel services online. Staff can manage rooms, track maintenance, and oversee hostel operations.</p>
            </div>

            {/* Role-Based Access Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-5 md:p-6 shadow-lg border border-blue-100/80 hover:border-blue-200/90 hover:shadow-xl hover:bg-white/95 transition-all duration-300 animate-fadeIn delay-100">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Role-Based Access</h3>
              <p className="text-gray-600 text-sm">Students, wardens, supervisors, security, and admin staff each have customized dashboards with appropriate permissions for their responsibilities within the hostel system.</p>
            </div>

            {/* Key Features Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-5 md:p-6 shadow-lg border border-blue-100/80 hover:border-blue-200/90 hover:shadow-xl hover:bg-white/95 transition-all duration-300 animate-fadeIn delay-200">
              <div className="w-12 h-12 mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Key Features</h3>
              <p className="text-gray-600 text-sm">Real-time complaint tracking, digital visitor management, room allocation, maintenance scheduling, attendance monitoring, and notification system for important announcements.</p>
            </div>
          </div>

          {/* Back to Home button - Reduced top margin */}
          <div className="text-center mt-4">
            <Link
              to="/"
              className="group px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-medium rounded-lg hover:from-blue-700 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-400/20 flex items-center relative overflow-hidden mx-auto inline-flex"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <FaArrowLeft className="mr-2 transform transition-transform duration-300 group-hover:-translate-x-1.5 relative" />
              <span className="relative">Back to Home</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
