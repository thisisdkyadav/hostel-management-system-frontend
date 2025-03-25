import React from 'react';
import { useState } from "react";
import { Link } from 'react-router-dom';
import IITI_Logo from "../assets/logos/IITILogo.png";

import IITI6 from "../assets/hostel6.jpg"
const HomePage = () => {


  const quickLinks = [
    { name: 'How to reach IIT Indore', path: 'https://www.iiti.ac.in/page/how-to-reach-iit-indore' },
    { name: 'Academic Calendar', path: 'https://academic.iiti.ac.in/Document/2025/2024-25_Academic%20Calendar_Updated%20-%2029-1-2025.pdf' },
    
    { name: 'IT Help Dest', path: 'http://ithelpdesk.iiti.ac.in/' },
    { name: 'Library Access', path: 'https://library.iiti.ac.in/' },
  ];

  const adminLinks = [
    
    { name: 'Fee Payment', path: 'https://www.iiti.ac.in/page/e-payments' },
    { name: 'Holiday List', path: '/holiday-list' },
  ];

  const hallCategories = [
    { name: 'Gymkhana', path: 'https://gymkhana.iiti.ac.in/' },
    { name: 'Events and Festivals', path: 'https://gymkhana.iiti.ac.in/eventsgallery/' },
    { name: 'Halls of Residence', path: 'https://hostel.iiti.ac.in/' },
    { name: 'Health and Wellness', path: 'https://healthcenter.iiti.ac.in/' },
    { name: 'Social and Cultural', path: 'https://gymkhana.iiti.ac.in/culturals/clubs/' },
    { name: 'Sports and Games', path: 'https://people.iiti.ac.in/~sports/' },
    { name: 'Student Activity Center', path: 'https://sic.iiti.ac.in/activities/' },
    { name: 'Techno Management', path: 'https://gymkhana.iiti.ac.in/technicals/clubs/' },
  ];

  const boysHostels = [
    'APJ Hostel',
    'C.V.Raman Hostel',
    'Homi Jehangir Bhabha Hostel',
    'Vikram Sarabhai (VSB) Hostel',
    'J.C. Bose Hall of Residence',
    
  ];

  const girlsHostels = [
    'Devi Ahilya Hall of Residence',
   
  ];
   // State for dropdown menus
   const [isRulesOpen, setIsRulesOpen] = useState(false);
  
  
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
    
      <header className="shadow-md bg-neutral-100">
      {/* Top Bar with Institute Name */}
      <div className="py-2 px-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <img src={IITI_Logo} alt="IIT Indore Logo" className="h-12" />
            <div>
              <h1 className="text-lg font-bold">INDIAN INSTITUTE OF TECHNOLOGY INDORE</h1>
              <p className="text-sm">Halls of Residence</p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/login" className="px-4 py-2 shadow bg-neutral-200 text-[#1360AB] rounded-2xl font-semibold hover:bg-opacity-90">
              Login
            </Link>
            <div className="relative bg-neutral-200 shadow-2xl rounded-2xl">
              <input 
                type="text" 
                placeholder="Search..." 
                className="pl-10 pr-4 py-2 rounded text-gray-800 w-64"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-white/10 rounded">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

       {/* Main Navigation Bar */}
       <nav className="bg-[#1360AB] text-white h-[60px] md:py-3">
          <div className="container mx-auto px-4 flex items-center h-full">
            <div className="md:flex justify-between items-center hidden">
              {/* Left Side Navigation */}
              <div className="flex space-x-6">
                <a href="https://www.iiti.ac.in/page/about-us" className="font-medium hover:text-yellow-200 transition-colors">About</a>

              {/* Administration Direct Link */}
<div className="relative">
  <a 
    href="https://www.iiti.ac.in/page/administration" 
    className="font-medium hover:text-yellow-200 transition-colors flex items-center"
  >
    Administration
   
  </a>
</div>


                <a href="https://studentaffairs.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">Students</a>
                <a href="https://facultyaffairs.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">Faculty & Staff</a>
                
              </div>

              {/* Center Navigation */}
              <div className="flex space-x-6 px-5 ">
                <a href="https://academic.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">Academics</a>
                <a href="https://academic.iiti.ac.in/admission.php" className="font-medium hover:text-yellow-200 transition-colors">Admissions</a>
                <a href="https://rnd.iiti.ac.in/" className="font-medium hover:text-yellow-200 transition-colors">Research</a>
               
              </div>

              {/* Right Side Navigation */}
              <div className="flex space-x-6">
              
<div className="relative">
  <a 
    href="https://www.iiti.ac.in/page/campus-facilities" 
    className="font-medium hover:text-yellow-200 transition-colors flex items-center"
  >
    Facilities
   
  </a>
</div>


                {/* Rules Dropdown */}
                <div className="relative" 
                  onMouseEnter={() => setIsRulesOpen(true)} 
                  onMouseLeave={() => setIsRulesOpen(false)}>
                  <button 
                    className="font-medium hover:text-yellow-200 transition-colors flex items-center"
                    onClick={() => setIsRulesOpen(!isRulesOpen)}>
                    Rules
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isRulesOpen && (
                    <div className="absolute right-0 bg-white text-gray-800 min-w-[200px] rounded-md shadow-lg z-10">
                      <div className="py-1">
                      <a href="https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-blue-50">
  Hostel Rules
</a>
<a href="https://hostel.iiti.ac.in/docs/Hostel%20Policies%20New%20Jan%2023.pdf" target="_blank" rel="noopener noreferrer" className="block px-4 py-2 hover:bg-blue-50">
  Hostel Policies
</a>

                        
                      </div>
                    </div>
                  )}
                </div>

                
              </div>
              </div>
            </div>
   {/* Mobile Navigation */}
   {isOpen && (
  <div className="md:hidden flex flex-col space-y-4 pt-4 pb-4 bg-[#1360AB]">
    {/* About */}
    <a href="https://www.iiti.ac.in/page/about-us" className="block text-center py-2 hover:text-yellow-200">About</a>
    
    <div className="text-center">
  <a 
    href="https://www.iiti.ac.in/page/administration" 
    className="w-full py-2 hover:text-yellow-200 flex items-center justify-center"
  >
    Administration
   
  </a>
</div>

    {/* Students */}
    <a href="https://studentaffairs.iiti.ac.in/" className="block text-center py-2 hover:text-yellow-200">Students</a>
    
    {/* Faculty & Staff */}
    <a href="https://facultyaffairs.iiti.ac.in/" className="block text-center py-2 hover:text-yellow-200">Faculty & Staff</a>
    
    
    {/* Academics */}
    <a href="https://academic.iiti.ac.in/" className="block text-center py-2 hover:text-yellow-200">Academics</a>
    
    {/* Admissions */}
    <a href="https://academic.iiti.ac.in/admission.php" className="block text-center py-2 hover:text-yellow-200">Admissions</a>
    
    {/* Research */}
    <a href="https://rnd.iiti.ac.in/" className="block text-center py-2 hover:text-yellow-200">Research</a>
    
    
    {/* Facilities Direct Link - Mobile */}
<div className="text-center">
  <a 
    href="https://www.iiti.ac.in/page/campus-facilities" 
    className="w-full py-2 hover:text-yellow-200 flex items-center justify-center"
  >
    Facilities
   
  </a>
</div>


    {/* Rules Dropdown - Mobile */}
    <div className="text-center">
      <button 
        onClick={() => setIsRulesOpen(!isRulesOpen)}
        className="w-full py-2 hover:text-yellow-200 flex items-center justify-center"
      >
        Rules
        <svg 
          className={`w-4 h-4 ml-1 transition-transform ${isRulesOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isRulesOpen && (
        <div className=" text-white mt-2 rounded-md">
          <a href="https://academic.iiti.ac.in/New_student/Hall%20of%20Residence%20Rules%20&%20Decl.pdf" className="block px-4 py-2 hover:text-yellow-200">Hostel Rules</a>
          <a href="https://hostel.iiti.ac.in/docs/Hostel%20Policies%20New%20Jan%2023.pdf" className="block px-4 py-2 hover:text-yellow-200">Hostel Policies</a>
        
        </div>
      )}
    </div>

    {/* Download Forms Dropdown - Mobile */}
    
  </div>
)}
        
      </nav>


    </header>


      <section className="relative bg-blue-900 text-white py-20">
        <div className="absolute inset-0  bg-black/50">
          <img src={IITI6} alt="Hostel Campus" className="w-full h-[320px]  object-cover" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl font-bold py-4 mb-6">Halls of Residence</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto font-bold">
            WELCOME TO INDIAN INSTITUTE OF TECHNOLOGY INDORE
          </p>
          
        </div>
      </section>

      {/* Hall Categories */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Hall Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hallCategories.map((category, index) => (
         <a 
         key={index} 
         href={category.path} 
         target="_blank" 
         rel="noopener noreferrer"
         className="group bg-blue-200 hover:bg-[#1360AB] border border-gray-200 rounded-lg p-4 text-center transition-colors"
       >
         <h3 className="font-medium text-gray-800 group-hover:text-white">{category.name}</h3>
       </a>
       
         
            ))}
          </div>
        </div>
      </section>

      {/* Halls of Residence */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Halls of Residence</h2>
          <div className="max-w-4xl mx-auto mb-8 text-center">
            <p className="text-lg text-gray-600">
              IIT Indore provides excellent residential facilities spread across the campus. 
              There are currently 4 Halls of Residence (2 for boys, 2 for girls) with modern amenities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className=" p-6 rounded-lg shadow-lg bg-blue-50">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Boys Hostels</h3>
              <ul className="space-y-2">
                {boysHostels.slice(0, 4).map((hostel, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    {hostel}
                  </li>
                ))}
              </ul>
             
            </div>
            
            <div className=" p-6 rounded-lg shadow-lg bg-blue-50">
              <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Girls Hostels</h3>
              <ul className="space-y-2">
                {girlsHostels.slice(0, 4).map((hostel, index) => (
                  <li key={index} className="flex items-center">
                    <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                    {hostel}
                  </li>
                ))}
              </ul>
             
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-12  bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Quick Links Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#1360AB] border-b-2 border-[#1360AB] pb-2">Quick Links</h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-[#1360AB] hover:text-orange-500 transition-colors duration-200 flex items-start"
                  >
                    <span className="inline-block w-1.5 h-1.5 bg-[#1360AB] rounded-full mt-2 mr-2"></span>
                    <span className="hover:underline">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Administration Links Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#1360AB] border-b-2 border-[#1360AB] pb-2">Administration</h3>
            <ul className="space-y-3">
              {adminLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-[#1360AB] hover:text-orange-500 transition-colors duration-200 flex items-start"
                  >
                    <span className="inline-block w-1.5 h-1.5 bg-[#1360AB] rounded-full mt-2 mr-2"></span>
                    <span className="hover:underline ">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information Column */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#1360AB] border-b-2 border-[#1360AB] pb-2">Contact Information</h3>
            <address className="not-italic text-[#1360AB]">
              <div className='flex space-x-14'>
                <div>
              <div className="mb-4 flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 text-[#1360AB] " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p>Indian Institute of Technology Indore</p>
                  <p>Simrol, Indore, MP - 453552</p>
                </div>
              </div>
              
              
              <div className="mb-4 flex items-center">
                <svg className="w-5 h-5 mr-3 text-[#1360AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href="mailto:hostel@iiti.ac.in" className="hover:text-orange-500 hover:underline transition-colors duration-200">
                hostel@iiti.ac.in
                </a>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-[#1360AB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href="tel:+917316602000" className="hover:text-orange-500 hover:underline transition-colors duration-200">
                +91-6265224771
                </a>
              </div>
              </div>
              
              <div>
              <img src={IITI_Logo} alt="IIT Indore Logo" className="h-24" />
              </div>
              </div>
            </address>
            
          </div>
          
        </div>

        
      </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1360AB] text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p>© {new Date().getFullYear()} IIT Indore - Halls of Residence. All rights reserved.</p>
              
            </div>
            <div className="flex space-x-6">
              <a href="https://www.facebook.com/p/IIT-Indore-100064798209779/" className="hover:text-blue-200 transition-colors" aria-label="Facebook">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a href="https://x.com/IITIOfficial" className="hover:text-blue-200 transition-colors" aria-label="Twitter">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="https://www.instagram.com/iitindoreofficial/?hl=en" className="hover:text-blue-200 transition-colors" aria-label="Instagram">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="https://in.linkedin.com/school/iit-indore/" className="hover:text-blue-200 transition-colors" aria-label="LinkedIn">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;