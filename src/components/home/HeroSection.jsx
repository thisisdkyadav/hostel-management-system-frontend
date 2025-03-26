import React from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthProvider"
import IITI6 from "../../assets/hostel6.jpg"

const HeroSection = () => {
  const { user, getHomeRoute } = useAuth()

  return (
    <section className="relative text-white h-[390px] py-20">
      <div className="absolute inset-0">
        <img src={IITI6} alt="Hostel Campus" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black opacity-20" /> {/* Added blackish layer */}
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <div className="bg-opacity-50 p-8 rounded-lg inline-block max-w-3xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6">Halls of Residence</h1>
          <p className="text-xl sm:text-2xl mb-8 mx-auto font-semibold">WELCOME TO INDIAN INSTITUTE OF TECHNOLOGY INDORE</p>
         
        </div>
      </div>
    </section>
  )
}

export default HeroSection
