import React from "react"

const HallCategoriesSection = ({ categories }) => {
  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-3 text-gray-800">Hall Categories</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">Explore the various categories of facilities and services available at IIT Indore</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <a key={index} href={category.path} target="_blank" rel="noopener noreferrer" className="group bg-white border border-gray-200 hover:border-[#1360AB] rounded-xl p-5 text-center transition-all duration-200 hover:shadow-md flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-[#E4F1FF] text-[#1360AB] rounded-full flex items-center justify-center mb-3 group-hover:bg-[#1360AB] group-hover:text-white transition-colors">
                {category.icon || (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
              </div>
              <h3 className="font-medium text-gray-800 group-hover:text-[#1360AB]">{category.name}</h3>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HallCategoriesSection
