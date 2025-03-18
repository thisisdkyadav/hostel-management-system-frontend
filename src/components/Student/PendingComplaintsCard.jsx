import React from 'react'

const PendingComplaintsCard = () => {
  return (
    <div className='relative flex flex-col gap-2  bg-[#1360AB] !p-2 rounded-xl'>
        <div className='flex items-center justify-start flex-row gap-3 '>
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="36" height="36" rx="8" fill="#85AED6"/>
                <rect x="4" y="4" width="36" height="36" rx="8" stroke="#85AED6" stroke-width="8"/>
                <path d="M17.3334 16.1667H26.6667" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M17.3334 20.8333H22" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M23.1666 33.0833V32.5C23.1666 29.2002 23.1666 27.5503 24.1918 26.5252C25.2169 25.5 26.8668 25.5 30.1666 25.5H30.75M31.3333 23.567V19.6667C31.3333 15.2669 31.3333 13.067 29.9664 11.7002C28.5997 10.3333 26.3997 10.3333 22 10.3333C17.6002 10.3333 15.4003 10.3333 14.0335 11.7002C12.6666 13.067 12.6666 15.2669 12.6666 19.6667V24.9682C12.6666 28.7541 12.6666 30.647 13.7004 31.9292C13.9092 32.1882 14.1452 32.4241 14.4042 32.6329C15.6863 33.6667 17.5792 33.6667 21.3651 33.6667C22.1883 33.6667 22.5997 33.6667 22.9767 33.5337C23.0551 33.506 23.1319 33.4742 23.2069 33.4384C23.5675 33.2658 23.8585 32.9748 24.4405 32.3928L29.9664 26.8669C30.6409 26.1924 30.978 25.8553 31.1557 25.4264C31.3333 24.9976 31.3333 24.5207 31.3333 23.567Z" stroke="white" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p className='text-white'>Pending Complaints</p>
        </div>
        <div className='flex flex-row gap-4'>
            <div className='w-[20%]'></div>
            <p className='text-white text-4xl font-bold'>5</p>
        </div>
    </div>
  )
}

export default PendingComplaintsCard
