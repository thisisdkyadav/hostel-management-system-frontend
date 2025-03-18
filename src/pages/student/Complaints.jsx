import React from 'react'
import user from '../../assets/girlImg.jpeg'
import SideBar from '../../components/Student/Sidebar'
import ComplaintsCard from '../../components/Student/ComplaintsCard'
import PendingComplaintsCard from '../../components/Student/PendingComplaintsCard'



const Complaints = () => {
  return (
    <div className='bg-neutral-100'>
        <SideBar />
        <div className='absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw] [@media(max-width:900px)]:hidden'>
            <div className='flex flex-row gap-1'>
                <div>
                    <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.9167 15H35.8333" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M9.48956 17.0033L11.2211 17.9549C14.0265 19.4968 15.4292 20.2676 16.5675 19.916C17.7058 19.5644 17.7058 18.3601 17.7058 15.9516V14.0484C17.7058 11.6399 17.7058 10.4357 16.5675 10.084C15.4292 9.73238 14.0265 10.5033 11.2211 12.0452L9.48956 12.9968C7.80043 13.9251 6.95587 14.3894 6.95587 15C6.95587 15.6106 7.80043 16.0749 9.48956 17.0033Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                </div>
                <div className='flex flex-col '>
                    <p className='text-2xl font-bold text-black'>Complaints</p>
                    <p className='text-sm text-neutral-600'>17th March 2025</p>
                </div>
                <div>
                    <svg width="43" height="30" viewBox="0 0 43 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.0833 15L7.16665 15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M33.5104 12.9967L31.7789 12.0451C28.9735 10.5032 27.5708 9.73237 26.4325 10.084C25.2942 10.4356 25.2942 11.6399 25.2942 14.0484V15.9516C25.2942 18.3601 25.2942 19.5643 26.4325 19.916C27.5708 20.2676 28.9735 19.4967 31.7789 17.9548L33.5104 17.0032C35.1996 16.0749 36.0441 15.6106 36.0441 15C36.0441 14.3894 35.1996 13.9251 33.5104 12.9967Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>

                </div>
            </div>
            <div className='flex items-center justify-center gap-15'>   
                <div className='bg-white flex items-center justify-center gap-3 !p-2 rounded-lg'>
                    <div className=''>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 18.6667H14.0105" stroke="#FF0000" stroke-width="2.33333" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M14 15.1666V9.33331" stroke="#FF0000" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17.6782 4.99804C16.3086 4.48977 15.7006 2.4555 14.1397 2.33853C14.0469 2.33157 13.9536 2.33157 13.8609 2.33853C12.3 2.45551 11.6919 4.48965 10.3224 4.99804C8.87221 5.53609 6.88933 4.43317 5.66142 5.6611C4.47953 6.84297 5.5254 8.90156 4.99836 10.322C4.45957 11.7734 2.20648 12.3738 2.33885 14.1394C2.45582 15.7003 4.49009 16.3083 4.99836 17.6779C5.52543 19.0983 4.47947 21.157 5.66142 22.3388C6.88915 23.5668 8.87216 22.4643 10.3224 23.0019C11.6916 23.5109 12.3002 25.5446 13.8609 25.6614C13.9536 25.6684 14.0469 25.6684 14.1397 25.6614C15.7003 25.5446 16.3091 23.5108 17.6782 23.0019C19.0987 22.4752 21.1575 23.5208 22.3391 22.3388C23.6077 21.0706 22.3855 19.0144 23.0556 17.549C23.675 16.1997 25.7906 15.5679 25.6617 13.8606C25.5449 12.2999 23.5112 11.6911 23.0022 10.322C22.4646 8.87184 23.5671 6.88883 22.3391 5.6611C21.1113 4.43311 19.1284 5.53613 17.6782 4.99804Z" stroke="#FF0000" stroke-width="1.75"/>
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

        <div className='absolute left-[17%] top-[22%] w-[60%] h-[70vh] overflow-y-scroll flex flex-col gap-3'>
            <ComplaintsCard />
            <ComplaintsCard />
            <ComplaintsCard />
            <ComplaintsCard />
        </div>

        <div className='absolute left-[80%] top-[22%] w-[15%] h-[70vh]'>
            <PendingComplaintsCard />
        </div>
        
    </div>
  )
}

export default Complaints
