import React, { useState } from 'react'
import SideBar from '../../components/Student/Sidebar'
import user from '../../assets/girlImg.jpeg'
import { BsDoorOpen, BsDoorOpenFill } from "react-icons/bs";
import CourseComponent from '../../components/Student/CourseComponent';
import ContactCard from '../../components/Student/ContactCard';

const Profile = () => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className='bg-neutral-100'>
            <SideBar />
            <div className='absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw] [@media(max-width:900px)]:hidden'>
                <div className='flex flex-row gap-1'>
                    <div>
                        <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                           
                        </svg>

                    </div>
                    <div className='flex flex-col '>
                        <p className='text-2xl font-bold text-black'>Profile</p>
                        <p className='text-sm text-neutral-600'>17th March 2025</p>
                    </div>
                    <div>
                        <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                           
                        </svg>

                    </div>
                </div>
                <div className='flex items-center justify-center gap-15'>
                    <div className='bg-white flex items-center justify-center gap-3 !p-2 rounded-lg'>
                        <div className=''>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                               
                            </svg>
                        </div>
                        <p className='text-[#FF0000]'> Alert </p>
                    </div>
                    <div className='flex items-center justify-center gap-1'>
                        <div>
                            <img src={user} className='w-12 h-12 rounded-full' alt="userImg" />
                        </div>
                        <p className='!px-2 font-semibold'>Vaibhav Ojha</p>

                    </div>
                </div>
            </div>

            <div className='absolute left-[17%] top-[15%] flex flex-col gap-8 rounded-xl w-[60%]'>
                <div>
                    <div className='flex flex-row gap-5 items-center justify-between'>
                        <img src={user} className='rounded-full w-50 h-50 !pl-2' alt="" />
                        <div className='flex text-black flex-col gap-2 items-center'>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                  
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                    
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                    
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                   
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                        </div>
                        <div className=" shadow-[0px_1px_20px_rgba(0,0,0,0.06)] p-6 rounded-[20px] h-[220px]">
                            {/* Title */}
                            <div className="flex items-center space-x-2">
                                <BsDoorOpenFill className="text-[#1360AB] text-xl" />
                                <h3 className="text-gray-600">Your Room</h3>
                            </div>


                            <div className="flex items-center gap-6 mt-5">

                                <div className="bg-[#E4F1FF] shadow-[0px_1px_20px_rgba(0,0,0,0.05)] p-4 rounded-2xl flex flex-wrap justify-end items-start gap-2 w-[142px]">
                                    <div className="bed bg-green-700 text-white w-9 h-[72px] flex justify-center items-center rounded-md text-sm font-bold">
                                        E1
                                    </div>
                                    <div className="table w-[22px] h-[20px] bg-green-700 rounded-md"></div>
                                    <div className="bed bg-[#1360AB] text-white w-9 h-[72px] flex justify-center items-center rounded-md text-sm font-bold shadow-lg">
                                        E2
                                    </div>
                                    <div className="table w-[22px] h-[20px] bg-[#1360AB] rounded-md shadow-lg"></div>
                                </div>

                                <p className="text-6xl font-medium text-[#1360AB]">
                                    207 <span className="text-2xl font-bold">E2</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='bg-white rounded-xl flex flex-col gap-3 h-[50vh] !pt-5 !pl-5'>
                    <div className='flex flex-row items-center justify-start gap-5 !pl-3'>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           
                        </svg>
                        <p className='text-xl'>Your Courses</p>
                    </div>
                    <div className='z-10 bg-neutral-300 h-0.5 w-[55vw]'></div>
                    <div className='flex flex-col overflow-y-scroll gap-4'>
                        <CourseComponent />
                        <CourseComponent />
                        <CourseComponent />
                        <CourseComponent />
                        <CourseComponent />
                    </div>
                    <div className='flex items-center justify-center !mb-3 gap-120'>
                        <div className='bg-gray-300 rounded-2xl cursor-pointer hover:bg-gray-400 transition-colors ease-in-out duration-300'>
                            <p className='text-xl !px-7 !py-3'>Show More</p>
                        </div>
                        <div className='flex flex-row gap-3 cursor-pointer !p-2 rounded-2xl hover:bg-gray-200 transition-colors ease-in-out duration-300'>
                            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                
                            </svg>
                            <p className='text-[#808080]'>Add/remove course</p>

                        </div>
                    </div>
                </div> 
            </div>

            <div className='absolute flex flex-col items-center justify-start left-[80%] top-[20%] bg-white rounded-2xl h-[50vh] w-[18vw]' >
                <div className='!p-5 flex items-center justify-start gap-3'>
                    <svg width="37" height="33" viewBox="0 0 37 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                       
                    </svg>
                    <p className='text-black text-xl '>Your Contacts</p>
                    <div className='w-[2.80vw]'></div>
                </div>
                <div className='!pl-5 z-10 bg-neutral-300 h-0.5 w-[15vw]'></div>
                <div className='flex !mt-3 flex-col gap-3 overflow-y-scroll'>
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                    <ContactCard />
                </div>
            </div> 
            <div className="bg-neutral-100 min-h-screen relative">
      
      <button
        className="fixed left-[80%] top-[90%] w-[14%] py-2 bg-[#1360AB] text-white rounded-lg shadow-md hover:bg-[#a79edb] transition"
        onClick={() => setIsOpen(true)}
      >
        Apply for Room Change
      </button>

      
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
         
          <div
            className="absolute inset-0 bg-opacity-20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          ></div>

         
          <div className="relative bg-[#1360AB] w-[40%] p-6 rounded-[12px] shadow-lg">
           
            <button
              className="absolute top-3 right-3 text-white text-xl"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>

            
            <h2 className="text-white text-xl font-semibold mb-4">Apply for Room Change</h2>

            
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Preferred Room No.-"
                className="p-2 rounded-[12px] bg-gray-200 w-full"
              />
              <textarea placeholder="Reason For Room Change-" className="p-2 bg-gray-200 rounded-lg w-full h-[100px]" />

              <button className="bg-green-500 text-black px-6 py-2 rounded-md hover:bg-green-600">
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
        </div>
    )
}

export default Profile
