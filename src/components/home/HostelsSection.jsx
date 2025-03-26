import React from "react"

const HostelsSection = ({ boysHostels, girlsHostels }) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Halls of Residence</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">IIT Indore provides excellent residential facilities spread across the campus with modern amenities for students</p>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 mr-3 rounded-xl bg-blue-100 text-[#1360AB]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Boys Hostels</h3>
            </div>
            <ul className="space-y-3 pl-2">
              {boysHostels.map((hostel, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-[#1360AB] rounded-full mr-3"></div>
                  <span className="text-gray-700">{hostel}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="p-3 mr-3 rounded-xl bg-pink-100 text-pink-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Girls Hostels</h3>
            </div>
            <ul className="space-y-3 pl-2">
              {girlsHostels.map((hostel, index) => (
                <li key={index} className="flex items-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{hostel}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HostelsSection
