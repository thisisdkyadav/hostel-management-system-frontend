import React from "react"
import { FaBuilding, FaCalendarAlt, FaHome, FaHeartbeat, FaGuitar, FaRunning, FaUsers, FaLaptopCode } from "react-icons/fa"
import Header from "../components/home/Header"
import HeroSection from "../components/home/HeroSection"
import HallCategoriesSection from "../components/home/HallCategoriesSection"
import HostelsSection from "../components/home/HostelsSection"
import InfoSection from "../components/home/InfoSection"
import Footer from "../components/home/Footer"

const HomePage = () => {
  const quickLinks = [
    { name: "How to reach IIT Indore", path: "https://www.iiti.ac.in/page/how-to-reach-iit-indore" },
    { name: "Academic Calendar", path: "https://academic.iiti.ac.in/Document/2025/2024-25_Academic%20Calendar_Updated%20-%2029-1-2025.pdf" },
    { name: "IT Help Desk", path: "http://ithelpdesk.iiti.ac.in/" },
    { name: "Library Access", path: "https://library.iiti.ac.in/" },
  ]

  const adminLinks = [
    { name: "Fee Payment", path: "https://www.iiti.ac.in/page/e-payments" },
    { name: "Holiday List", path: "/holiday-list" },
  ]

  const hallCategories = [
    { name: "Gymkhana", path: "https://gymkhana.iiti.ac.in/", icon: <FaBuilding /> },
    { name: "Events and Festivals", path: "https://gymkhana.iiti.ac.in/eventsgallery/", icon: <FaCalendarAlt /> },
    { name: "Halls of Residence", path: "https://hostel.iiti.ac.in/", icon: <FaHome /> },
    { name: "Health and Wellness", path: "https://healthcenter.iiti.ac.in/", icon: <FaHeartbeat /> },
    { name: "Social and Cultural", path: "https://gymkhana.iiti.ac.in/culturals/clubs/", icon: <FaGuitar /> },
    { name: "Sports and Games", path: "https://people.iiti.ac.in/~sports/", icon: <FaRunning /> },
    { name: "Student Activity Center", path: "https://sic.iiti.ac.in/activities/", icon: <FaUsers /> },
    { name: "Techno Management", path: "https://gymkhana.iiti.ac.in/technicals/clubs/", icon: <FaLaptopCode /> },
  ]

  const boysHostels = ["APJ Hostel", "C.V.Raman Hostel", "Homi Jehangir Bhabha Hostel", "Vikram Sarabhai (VSB) Hostel", "J.C. Bose Hall of Residence"]

  const girlsHostels = ["Devi Ahilya Hall of Residence"]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
      <HallCategoriesSection categories={hallCategories} />
      <HostelsSection boysHostels={boysHostels} girlsHostels={girlsHostels} />
      <InfoSection quickLinks={quickLinks} adminLinks={adminLinks} />
      <Footer />
    </div>
  )
}

export default HomePage
