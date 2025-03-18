import React from 'react'

const CourseComponent = () => {
  return (
    <div className='flex flex-row items-center hover:bg-gray-200 !p-2 rounded-xl transition-all gap-10'>
        <div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.83152 21.3478L7.31312 20.6576C6.85764 20.0511 5.89044 20.1 5.50569 20.7488C4.96572 21.6595 3.5 21.2966 3.5 20.2523V3.74775C3.5 2.7034 4.96572 2.3405 5.50569 3.25115C5.89044 3.90003 6.85764 3.94888 7.31312 3.34244L7.83152 2.65222C8.48467 1.78259 9.84866 1.78259 10.5018 2.65222L10.5833 2.76076C11.2764 3.68348 12.7236 3.68348 13.4167 2.76076L13.4982 2.65222C14.1513 1.78259 15.5153 1.78259 16.1685 2.65222L16.6869 3.34244C17.1424 3.94888 18.1096 3.90003 18.4943 3.25115C19.0343 2.3405 20.5 2.7034 20.5 3.74774V20.2523C20.5 21.2966 19.0343 21.6595 18.4943 20.7488C18.1096 20.1 17.1424 20.0511 16.6869 20.6576L16.1685 21.3478C15.5153 22.2174 14.1513 22.2174 13.4982 21.3478L13.4167 21.2392C12.7236 20.3165 11.2764 20.3165 10.5833 21.2392L10.5018 21.3478C9.84866 22.2174 8.48467 22.2174 7.83152 21.3478Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M15 9L9 15" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M15 15H14.991M9.00897 9H9" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </div>
        <div className='flex flex-row gap-3 items-center justify-between w-[50vw]'>
            <div>
                <p className='font-bold text-xl text-black' >Fluids Mechanics</p>
                <p className='text-neutral-500'>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eaque, accusamus.</p>
            </div>
            <div className='flex flex-row items-center'>
                <div className='bg-[#F1F3FF] rounded-2xl !p-2 w-[5.5vw] flex items-center justify-center'>
                    <p className='text-blue-500 text-sm cursor-pointer'>18th March</p>
                </div>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 12H21.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M13.5 12H16" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 12H10.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M2.5 12H5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div className='bg-[#F1F3FF] rounded-2xl !p-2 w-[5.5vw] flex items-center justify-center'>
                    <p className='text-blue-500 text-sm cursor-pointer'>Present</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default CourseComponent
