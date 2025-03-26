import React from "react"
import { Link } from "react-router-dom"
import IITI_Logo from "../../assets/logos/IITILogo.png"

const InfoSection = ({ quickLinks, adminLinks }) => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-[#1360AB] border-b border-gray-100 pb-2">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.path} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-[#1360AB] transition-colors duration-200 flex items-start">
                    <div className="w-5 h-5 bg-[#E4F1FF] text-[#1360AB] rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <span className="hover:underline">{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-[#1360AB] border-b border-gray-100 pb-2">Administration</h3>
            <ul className="space-y-3">
              {adminLinks.map((link, index) => (
                <li key={index}>
                  <Link to={link.path} className="text-gray-700 hover:text-[#1360AB] transition-colors duration-200 flex items-start">
                    <div className="w-5 h-5 bg-[#E4F1FF] text-[#1360AB] rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <span className="hover:underline">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <h3 className="text-xl font-semibold mb-4 text-[#1360AB] border-b border-gray-100 pb-2">Contact Information</h3>
            <address className="not-italic text-gray-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-4 flex items-start">
                    <div className="p-2 mr-3 rounded-lg bg-[#E4F1FF] text-[#1360AB] flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p>Indian Institute of Technology Indore</p>
                      <p>Simrol, Indore, MP - 453552</p>
                    </div>
                  </div>

                  <div className="mb-4 flex items-center">
                    <div className="p-2 mr-3 rounded-lg bg-[#E4F1FF] text-[#1360AB] flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <a href="mailto:hostel@iiti.ac.in" className="hover:text-[#1360AB] hover:underline transition-colors duration-200">
                      hostel@iiti.ac.in
                    </a>
                  </div>

                  <div className="flex items-center">
                    <div className="p-2 mr-3 rounded-lg bg-[#E4F1FF] text-[#1360AB] flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <a href="tel:+916265224771" className="hover:text-[#1360AB] hover:underline transition-colors duration-200">
                      +91-6265224771
                    </a>
                  </div>
                </div>
                <div className="ml-4 flex items-center justify-center">
                  <img src={IITI_Logo} alt="IIT Indore Logo" className="h-20" />
                </div>
              </div>
            </address>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InfoSection
