import React, { useRef } from 'react'
import user from '../../assets/girlImg.jpeg'
import SideBar from '../../components/Student/Sidebar'
import LostAndFoundCard from '../../components/Student/LostAndFoundCard'
import LostAndFoundComplaintCard from '../../components/Student/LostAndFoundComplaintCard'

const LostAndFound = () => {
    const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger file input click
  };
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
                    <p className='text-2xl font-bold text-black'>Lost and Found</p>
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

        <div className='absolute left-[20%] top-[20%] flex flex-col gap-7 rounded-xl w-[60%] h-[80%]'>
            <div className=' bg-[#1360AB] !p-2 !px-5 rounded-xl flex gap-17 max-h-[45%] w-[40%] items-center justify-between'>
                <div className='flex flex-row gap-3 items-center justify-start'>
                    <svg width="40" height="40" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="36" height="36" rx="8" fill="#85AED6"/>
                        <rect x="4" y="4" width="36" height="36" rx="8" stroke="#85AED6" stroke-width="8"/>
                        <path d="M15.0001 12.6667H19.6667M12.6667 19.6667V15M22.0001 15V19.6667M15.0001 22H19.6667M24.3334 22H29.0001M31.3334 24.3333V29M22.0001 24.3333V29M24.3334 31.3333H29.0001" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.6666 15C13.9552 15 14.9999 13.9553 14.9999 12.6667C14.9999 11.378 13.9552 10.3333 12.6666 10.3333C11.3779 10.3333 10.3333 11.378 10.3333 12.6667C10.3333 13.9553 11.3779 15 12.6666 15Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12.6666 24.3333C13.9552 24.3333 14.9999 23.2887 14.9999 22C14.9999 20.7113 13.9552 19.6667 12.6666 19.6667C11.3779 19.6667 10.3333 20.7113 10.3333 22C10.3333 23.2887 11.3779 24.3333 12.6666 24.3333Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22.0001 15C23.2887 15 24.3334 13.9553 24.3334 12.6667C24.3334 11.378 23.2887 10.3333 22.0001 10.3333C20.7114 10.3333 19.6667 11.378 19.6667 12.6667C19.6667 13.9553 20.7114 15 22.0001 15Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22.0001 24.3333C23.2887 24.3333 24.3334 23.2887 24.3334 22C24.3334 20.7113 23.2887 19.6667 22.0001 19.6667C20.7114 19.6667 19.6667 20.7113 19.6667 22C19.6667 23.2887 20.7114 24.3333 22.0001 24.3333Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M31.3333 24.3333C32.622 24.3333 33.6667 23.2887 33.6667 22C33.6667 20.7113 32.622 19.6667 31.3333 19.6667C30.0447 19.6667 29 20.7113 29 22C29 23.2887 30.0447 24.3333 31.3333 24.3333Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22.0001 33.6667C23.2887 33.6667 24.3334 32.622 24.3334 31.3333C24.3334 30.0447 23.2887 29 22.0001 29C20.7114 29 19.6667 30.0447 19.6667 31.3333C19.6667 32.622 20.7114 33.6667 22.0001 33.6667Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M31.3333 33.6667C32.622 33.6667 33.6667 32.622 33.6667 31.3333C33.6667 30.0447 32.622 29 31.3333 29C30.0447 29 29 30.0447 29 31.3333C29 32.622 30.0447 33.6667 31.3333 33.6667Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <p className='text-white font-semibold text-xl'>Lost and Found</p>
                </div>
                <div>
                    <p className='text-white text-2xl'>5</p>
                </div>
            </div>
            <div className='flex flex-col items-center gap-5 w-[80%] h-[70%] overflow-y-scroll' >
                <LostAndFoundComplaintCard />
                <LostAndFoundComplaintCard />
                <LostAndFoundComplaintCard />
                
            </div>
        </div>

        <div className='absolute flex flex-col gap-3 left-[72%] top-[17%] w-[25%] h-[60%]'>
            <div className='!p-3 flex flex-col items-start justify-start gap-3 bg-white rounded-xl'>
                <div className='flex items-center !p-1 justify-between '>
                    <div className='flex items-center justify-start gap-3'>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="black" stroke-width="1.5"/>
                            <path d="M18 18H10" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18 14H15M12 14H10" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <p className='text-lg text-black text-semibold'>Products submitted by you</p>
                    </div>
                </div>
                <div className='h-0.5 w-[98%] bg-neutral-300 !my-1' ></div>
                <div className='flex flex-col gap-7 items-start h-[68%] overflow-y-scroll !p-1'>
                    <div className='flex !pl-1 items-center justify-start gap-3'>
                        <svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 10.5C8.20914 10.5 10 8.70914 10 6.5C10 4.29086 8.20914 2.5 6 2.5C3.79086 2.5 2 4.29086 2 6.5C2 8.70914 3.79086 10.5 6 10.5Z" stroke="black" stroke-width="1.75" stroke-linejoin="round"/>
                        </svg>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora, sequi.</p>
                    </div>
                    <div className='flex !pl-1 items-center justify-start gap-3'>
                        <svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 10.5C8.20914 10.5 10 8.70914 10 6.5C10 4.29086 8.20914 2.5 6 2.5C3.79086 2.5 2 4.29086 2 6.5C2 8.70914 3.79086 10.5 6 10.5Z" stroke="black" stroke-width="1.75" stroke-linejoin="round"/>
                        </svg>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora, sequi.</p>
                    </div>
                    <div className='flex !pl-1 items-center justify-start gap-3'>
                        <svg width="15" height="15" viewBox="0 0 12 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 10.5C8.20914 10.5 10 8.70914 10 6.5C10 4.29086 8.20914 2.5 6 2.5C3.79086 2.5 2 4.29086 2 6.5C2 8.70914 3.79086 10.5 6 10.5Z" stroke="black" stroke-width="1.75" stroke-linejoin="round"/>
                        </svg>
                        <p>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Tempora, sequi.</p>
                    </div>
                    
                </div>
            </div>

            <div className='!p-3 flex flex-col items-start justify-start gap-3 bg-white rounded-xl'>
                <div className='flex items-center !p-1 justify-between gap-15'>
                    <div className='flex items-center justify-start gap-3'>
                        <svg width="34" height="33" viewBox="0 0 34 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8.5 17.875C8.5 13.3186 12.3056 9.625 17 9.625C21.6944 9.625 25.5 13.3186 25.5 17.875C25.5 22.4313 21.6944 26.125 17 26.125C12.3056 26.125 8.5 22.4313 8.5 17.875Z" stroke="black" stroke-width="1.5"/>
                            <path d="M21.9584 11V7.59087C21.9584 4.91733 19.7385 2.75 17.0001 2.75C14.2617 2.75 12.0417 4.91733 12.0417 7.59087V11" stroke="black" stroke-width="1.5"/>
                            <path d="M16.9998 17.875H17.0125" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M17.0001 26.125V30.25M17.0001 30.25H28.3334M17.0001 30.25H5.66675" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>

                        <p className='text-lg text-black text-semibold'>Write about your lost product</p>
                    </div>
                    <div className='cursor-pointer'>
                        <svg width="40" height="40" viewBox="0 0 59 46" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M51.7422 5.85147C46.3879 1.3558 6.11251 12.3686 6.14577 16.3894C6.18348 20.949 21.8744 22.3516 26.2234 23.303C28.8389 23.875 29.5392 24.4615 30.1423 26.5997C32.8735 36.2835 34.2447 41.1001 37.37 41.2076C42.3516 41.3793 56.9676 10.2389 51.7422 5.85147Z" stroke="black" stroke-width="1.5"/>
                            <path d="M28.271 23.9583L36.8752 17.25" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div className='h-0.5 w-[98%] bg-neutral-300 !my-1' ></div>
                <div className='flex items-center justify-center gap-3'>
                    <div className='inline-block'>
                        <textarea name="lostandfoundcomplaint" id="" placeholder="Type your text here..." className='w-[90%] h-40 p-2'></textarea>
                    </div>
                    <div className='h-40 w-0.5 bg-neutral-300 !my-1' ></div>
                    <div className='w-10'>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => console.log(e.target.files[0])}
                        />
                        <button
                            onClick={handleButtonClick}
                            className=" text-neutral-400 px-4 py-2 rounded-lg"
                        >
                            Upload/Drag and drop image of lost item here
                        </button>
                    </div>
                </div>
                
            </div>
        </div>

    </div>
  )
}

export default LostAndFound
