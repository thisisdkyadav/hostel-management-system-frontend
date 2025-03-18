import React from 'react'
import SideBar from '../../components/Student/Sidebar'
import user from '../../assets/girlImg.jpeg'
import { BsDoorOpen, BsDoorOpenFill } from "react-icons/bs";
import CourseComponent from '../../components/Student/CourseComponent';
import ContactCard from '../../components/Student/ContactCard';

const Profile = () => {
    return (
        <div className='bg-neutral-100'>
            <SideBar />
            <div className='absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw] [@media(max-width:900px)]:hidden'>
                <div className='flex flex-row gap-1'>
                    <div>
                        <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.9167 15H35.8333" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M9.48956 17.0033L11.2211 17.9549C14.0265 19.4968 15.4292 20.2676 16.5675 19.916C17.7058 19.5644 17.7058 18.3601 17.7058 15.9516V14.0484C17.7058 11.6399 17.7058 10.4357 16.5675 10.084C15.4292 9.73238 14.0265 10.5033 11.2211 12.0452L9.48956 12.9968C7.80043 13.9251 6.95587 14.3894 6.95587 15C6.95587 15.6106 7.80043 16.0749 9.48956 17.0033Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </div>
                    <div className='flex flex-col '>
                        <p className='text-2xl font-bold text-black'>Profile</p>
                        <p className='text-sm text-neutral-600'>17th March 2025</p>
                    </div>
                    <div>
                        <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.0833 15L7.16665 15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M33.5104 12.9967L31.7789 12.0451C28.9735 10.5032 27.5708 9.73237 26.4325 10.084C25.2942 10.4356 25.2942 11.6399 25.2942 14.0484V15.9516C25.2942 18.3601 25.2942 19.5643 26.4325 19.916C27.5708 20.2676 28.9735 19.4967 31.7789 17.9548L33.5104 17.0032C35.1996 16.0749 36.0441 15.6106 36.0441 15C36.0441 14.3894 35.1996 13.9251 33.5104 12.9967Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>

                    </div>
                </div>
                <div className='flex items-center justify-center gap-15'>
                    <div className='bg-white flex items-center justify-center gap-3 !p-2 rounded-lg'>
                        <div className=''>
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 18.6667H14.0105" stroke="#FF0000" stroke-width="2.33333" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M14 15.1666V9.33331" stroke="#FF0000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                                <path d="M17.6782 4.99804C16.3086 4.48977 15.7006 2.4555 14.1397 2.33853C14.0469 2.33157 13.9536 2.33157 13.8609 2.33853C12.3 2.45551 11.6919 4.48965 10.3224 4.99804C8.87221 5.53609 6.88933 4.43317 5.66142 5.6611C4.47953 6.84297 5.5254 8.90156 4.99836 10.322C4.45957 11.7734 2.20648 12.3738 2.33885 14.1394C2.45582 15.7003 4.49009 16.3083 4.99836 17.6779C5.52543 19.0983 4.47947 21.157 5.66142 22.3388C6.88915 23.5668 8.87216 22.4643 10.3224 23.0019C11.6916 23.5109 12.3002 25.5446 13.8609 25.6614C13.9536 25.6684 14.0469 25.6684 14.1397 25.6614C15.7003 25.5446 16.3091 23.5108 17.6782 23.0019C19.0987 22.4752 21.1575 23.5208 22.3391 22.3388C23.6077 21.0706 22.3855 19.0144 23.0556 17.549C23.675 16.1997 25.7906 15.5679 25.6617 13.8606C25.5449 12.2999 23.5112 11.6911 23.0022 10.322C22.4646 8.87184 23.5671 6.88883 22.3391 5.6611C21.1113 4.43311 19.1284 5.53613 17.6782 4.99804Z" stroke="#FF0000" stroke-width="1.75" />
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
                                    <path d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2C13.1046 2 14 2.89543 14 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M16 12.5C16 10.6144 16 9.67157 15.4142 9.08579C14.8284 8.5 13.8856 8.5 12 8.5C10.1144 8.5 9.17157 8.5 8.58579 9.08579C8 9.67157 8 10.6144 8 12.5V14C8 14.9428 8 15.4142 8.29289 15.7071C8.58579 16 9.05719 16 10 16V20C10 20.9428 10 21.4142 10.2929 21.7071C10.5858 22 11.0572 22 12 22C12.9428 22 13.4142 22 13.7071 21.7071C14 21.4142 14 20.9428 14 20V16C14.9428 16 15.4142 16 15.7071 15.7071C16 15.4142 16 14.9428 16 14V12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                    <path d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2C13.1046 2 14 2.89543 14 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M16 12.5C16 10.6144 16 9.67157 15.4142 9.08579C14.8284 8.5 13.8856 8.5 12 8.5C10.1144 8.5 9.17157 8.5 8.58579 9.08579C8 9.67157 8 10.6144 8 12.5V14C8 14.9428 8 15.4142 8.29289 15.7071C8.58579 16 9.05719 16 10 16V20C10 20.9428 10 21.4142 10.2929 21.7071C10.5858 22 11.0572 22 12 22C12.9428 22 13.4142 22 13.7071 21.7071C14 21.4142 14 20.9428 14 20V16C14.9428 16 15.4142 16 15.7071 15.7071C16 15.4142 16 14.9428 16 14V12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                    <path d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2C13.1046 2 14 2.89543 14 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M16 12.5C16 10.6144 16 9.67157 15.4142 9.08579C14.8284 8.5 13.8856 8.5 12 8.5C10.1144 8.5 9.17157 8.5 8.58579 9.08579C8 9.67157 8 10.6144 8 12.5V14C8 14.9428 8 15.4142 8.29289 15.7071C8.58579 16 9.05719 16 10 16V20C10 20.9428 10 21.4142 10.2929 21.7071C10.5858 22 11.0572 22 12 22C12.9428 22 13.4142 22 13.7071 21.7071C14 21.4142 14 20.9428 14 20V16C14.9428 16 15.4142 16 15.7071 15.7071C16 15.4142 16 14.9428 16 14V12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                </svg>
                                <p className='text-xl'>Name: Vaibhav Ojha</p>
                            </div>
                            <div className='flex flex-row items-center justify-start !pl-1 gap-3'>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="35" height="35" color="#000000" fill="none">
                                    <path d="M14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2C13.1046 2 14 2.89543 14 4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                    <path d="M16 12.5C16 10.6144 16 9.67157 15.4142 9.08579C14.8284 8.5 13.8856 8.5 12 8.5C10.1144 8.5 9.17157 8.5 8.58579 9.08579C8 9.67157 8 10.6144 8 12.5V14C8 14.9428 8 15.4142 8.29289 15.7071C8.58579 16 9.05719 16 10 16V20C10 20.9428 10 21.4142 10.2929 21.7071C10.5858 22 11.0572 22 12 22C12.9428 22 13.4142 22 13.7071 21.7071C14 21.4142 14 20.9428 14 20V16C14.9428 16 15.4142 16 15.7071 15.7071C16 15.4142 16 14.9428 16 14V12.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
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
                            <path d="M20.5 16.9286V10C20.5 6.22876 20.5 4.34315 19.3284 3.17157C18.1569 2 16.2712 2 12.5 2H11.5C7.72876 2 5.84315 2 4.67157 3.17157C3.5 4.34315 3.5 6.22876 3.5 10V19.5" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M20.5 17H6C4.61929 17 3.5 18.1193 3.5 19.5C3.5 20.8807 4.61929 22 6 22H20.5" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M20.5 22C19.1193 22 18 20.8807 18 19.5C18 18.1193 19.1193 17 20.5 17" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M15 7H9" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 11H9" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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
                                <path d="M5 8.33337C6.65685 8.33337 8 7.21409 8 5.83337C8 4.45266 6.65685 3.33337 5 3.33337C3.34315 3.33337 2 4.45266 2 5.83337C2 7.21409 3.34315 8.33337 5 8.33337Z" stroke="#808080" stroke-width="1.5"/>
                                <path d="M8 18.3333C10.2091 18.3333 12 16.8409 12 15C12 13.159 10.2091 11.6666 8 11.6666C5.79086 11.6666 4 13.159 4 15C4 16.8409 5.79086 18.3333 8 18.3333Z" stroke="#808080" stroke-width="1.5"/>
                                <path d="M17 9.99996C19.7614 9.99996 22 8.13448 22 5.83329C22 3.53211 19.7614 1.66663 17 1.66663C14.2386 1.66663 12 3.53211 12 5.83329C12 8.13448 14.2386 9.99996 17 9.99996Z" stroke="#808080" stroke-width="1.5"/>
                            </svg>
                            <p className='text-[#808080]'>Add/remove course</p>

                        </div>
                    </div>
                </div> 
            </div>

            <div className='absolute flex flex-col items-center justify-start left-[80%] top-[20%] bg-white rounded-2xl h-[50vh] w-[18vw]' >
                <div className='!p-5 flex items-center justify-start gap-3'>
                    <svg width="37" height="33" viewBox="0 0 37 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18.5 19.25C20.2029 19.25 21.5833 18.0188 21.5833 16.5C21.5833 14.9812 20.2029 13.75 18.5 13.75C16.797 13.75 15.4166 14.9812 15.4166 16.5C15.4166 18.0188 16.797 19.25 18.5 19.25Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M30.8333 24.75C32.5363 24.75 33.9167 23.5188 33.9167 22C33.9167 20.4812 32.5363 19.25 30.8333 19.25C29.1304 19.25 27.75 20.4812 27.75 22C27.75 23.5188 29.1304 24.75 30.8333 24.75Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16.9583 30.25C18.6613 30.25 20.0417 29.0188 20.0417 27.5C20.0417 25.9812 18.6613 24.75 16.9583 24.75C15.2555 24.75 13.875 25.9812 13.875 27.5C13.875 29.0188 15.2555 30.25 16.9583 30.25Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M23.125 8.25C24.8279 8.25 26.2083 7.01878 26.2083 5.5C26.2083 3.98122 24.8279 2.75 23.125 2.75C21.422 2.75 20.0416 3.98122 20.0416 5.5C20.0416 7.01878 21.422 8.25 23.125 8.25Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6.16671 13.75C7.86959 13.75 9.25004 12.5188 9.25004 11C9.25004 9.48122 7.86959 8.25 6.16671 8.25C4.46383 8.25 3.08337 9.48122 3.08337 11C3.08337 12.5188 4.46383 13.75 6.16671 13.75Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22.0432 8.0755L19.5841 13.9244M20.2277 6.43994L9.06628 10.0598M18.1187 19.229L17.342 24.7709M21.2595 17.7299L28.076 20.7698M28.0162 23.1171L19.7777 26.3827" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
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

        </div>
    )
}

export default Profile
