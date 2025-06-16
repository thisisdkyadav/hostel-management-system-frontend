import React from "react"
import { Link } from "react-router-dom"
import { FaArrowLeft } from "react-icons/fa"
import ModernHeader from "../components/home/ModernHeader"

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white overflow-hidden">
      <ModernHeader />

      {/* Contact Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-100 pt-24 pb-16 lg:py-32 flex items-center">
        <div className="absolute inset-0 overflow-hidden">
          {/* Background effects similar to homepage */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-100/60 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-64 bg-gradient-to-t from-indigo-100/50 to-transparent"></div>

          {/* Large background blobs */}
          <div className="absolute -top-40 left-20 w-[50rem] h-[50rem] bg-gradient-to-tr from-indigo-300/15 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-20 w-[45rem] h-[45rem] bg-gradient-to-br from-blue-200/20 to-transparent rounded-full animate-[pulse_15s_ease-in-out_infinite] blur-2xl"></div>

          {/* Medium size floating elements */}
          <div className="absolute top-20 left-1/4 w-56 h-56 bg-blue-400/10 rounded-full animate-[pulse_10s_ease-in-out_infinite] blur-md"></div>
          <div className="absolute bottom-1/5 right-1/5 w-60 h-60 bg-indigo-300/15 rounded-full animate-[pulse_12s_ease-in-out_infinite_0.5s] blur-lg"></div>
        </div>

        <div className="w-full max-w-screen-xl px-6 md:px-8 lg:px-12 mx-auto relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-800 mb-6 animate-slideUp tracking-tight">
              Contact
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 ml-3 hover:from-indigo-600 hover:to-blue-600 transition-colors duration-500">IIT Indore Hostels</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto animate-fadeIn leading-relaxed">Get in touch with the hostel management team</p>
          </div>

          {/* Contact Info Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-blue-100/80 hover:border-blue-200/90 hover:shadow-2xl hover:bg-white/95 transition-all duration-300 animate-fadeIn max-w-3xl mx-auto mb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Hostel Management Office</h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">Address</p>
                      <p className="text-gray-600">
                        Hostel Management Office,
                        <br />
                        IIT Indore, Simrol Campus,
                        <br />
                        Indore, MP 453552
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">Email</p>
                      <p className="text-gray-600">hostel@iiti.ac.in</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-gray-700 font-medium">Phone</p>
                      <p className="text-gray-600">0731-6603468, Ext. 3468</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Office Hours</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-medium">9:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Saturday</span>
                    <span className="font-medium">9:00 AM - 1:00 PM</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Sunday & Holidays</span>
                    <span className="font-medium">Closed</span>
                  </li>
                </ul>
                <div className="mt-8">
                  <h4 className="font-bold text-gray-700 mb-2">Emergency Contact</h4>
                  <p className="text-gray-600">For emergencies outside office hours:</p>
                  <ul className="space-y-2 mt-1">
                    <li className="text-gray-700">
                      <span className="font-medium">Security Supervisor:</span> +91-6265224771
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">Ambulance:</span> 7509062832
                    </li>
                    <li className="text-gray-700">
                      <span className="font-medium">Medical:</span> 0731-6603571 Ext. No. 3571 / 3187 / 3433
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back to Home button */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-lg font-medium rounded-xl hover:from-blue-700 hover:to-indigo-600 transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-blue-400/20 flex items-center relative overflow-hidden mx-auto inline-flex"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
              <FaArrowLeft className="mr-3 transform transition-transform duration-300 group-hover:-translate-x-1.5 relative" />
              <span className="relative">Back to Home</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ContactPage
