import React from 'react'

const LostAndFoundCard = () => {
  return (
    <div className='relative flex flex-col gap-2  bg-[#1360AB] !p-2 rounded-xl'>
        <div className='flex items-center justify-start flex-row gap-3 '>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="36" height="36" rx="8" fill="#85AED6"/>
                <rect x="4" y="4" width="36" height="36" rx="8" stroke="#85AED6" stroke-width="8"/>
                <path d="M15 12.6667H19.6666M12.6666 19.6667V15M22 15V19.6667M15 22H19.6666M24.3333 22H29M31.3333 24.3333V29M22 24.3333V29M24.3333 31.3333H29" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.6667 15C13.9554 15 15 13.9553 15 12.6667C15 11.378 13.9554 10.3333 12.6667 10.3333C11.378 10.3333 10.3334 11.378 10.3334 12.6667C10.3334 13.9553 11.378 15 12.6667 15Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12.6667 24.3333C13.9554 24.3333 15 23.2887 15 22C15 20.7113 13.9554 19.6667 12.6667 19.6667C11.378 19.6667 10.3334 20.7113 10.3334 22C10.3334 23.2887 11.378 24.3333 12.6667 24.3333Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 15C23.2886 15 24.3333 13.9553 24.3333 12.6667C24.3333 11.378 23.2886 10.3333 22 10.3333C20.7113 10.3333 19.6666 11.378 19.6666 12.6667C19.6666 13.9553 20.7113 15 22 15Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 24.3333C23.2886 24.3333 24.3333 23.2887 24.3333 22C24.3333 20.7113 23.2886 19.6667 22 19.6667C20.7113 19.6667 19.6666 20.7113 19.6666 22C19.6666 23.2887 20.7113 24.3333 22 24.3333Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M31.3333 24.3333C32.622 24.3333 33.6667 23.2887 33.6667 22C33.6667 20.7113 32.622 19.6667 31.3333 19.6667C30.0447 19.6667 29 20.7113 29 22C29 23.2887 30.0447 24.3333 31.3333 24.3333Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M22 33.6667C23.2886 33.6667 24.3333 32.622 24.3333 31.3333C24.3333 30.0447 23.2886 29 22 29C20.7113 29 19.6666 30.0447 19.6666 31.3333C19.6666 32.622 20.7113 33.6667 22 33.6667Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M31.3333 33.6667C32.622 33.6667 33.6667 32.622 33.6667 31.3333C33.6667 30.0447 32.622 29 31.3333 29C30.0447 29 29 30.0447 29 31.3333C29 32.622 30.0447 33.6667 31.3333 33.6667Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p className='text-white'>Lost & Found</p>

        </div>
        <div className='flex flex-row gap-4'>
            <div className='w-[20%]'></div>
            <p className='text-white text-4xl font-bold !pb-2'>0</p>
        </div>
    </div>
  )
}

export default LostAndFoundCard
