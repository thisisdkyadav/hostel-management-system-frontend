import React from 'react'

const LostAndFoundComplaintCard = () => {
  return (
    <div className='bg-white rounded-xl !p-3'>
        <div className='flex items-center justify-between'>
            <div className='flex !p-1 items-center gap-3 justify-start'>
                <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="4" y="4" width="36" height="36" rx="8" fill="#EFF3F4"/>
                    <rect x="4" y="4" width="36" height="36" rx="8" stroke="#EFF3F4" stroke-width="8"/>
                    <path d="M22.5833 11.5H21.4166C16.1919 11.5 13.5795 11.5 11.9564 13.1231C10.3333 14.7462 10.3333 17.3586 10.3333 22.5833C10.3333 27.808 10.3333 30.4204 11.9564 32.0436C13.5795 33.6667 16.1919 33.6667 21.4166 33.6667C26.6413 33.6667 29.2537 33.6667 30.8769 32.0436C32.4999 30.4204 32.4999 27.808 32.4999 22.5833V21.4167" stroke="black" stroke-width="1.75" stroke-linecap="round"/>
                    <path d="M33.6667 14.4167C33.6667 16.6718 31.8385 18.5 29.5833 18.5C27.3282 18.5 25.5 16.6718 25.5 14.4167C25.5 12.1615 27.3282 10.3333 29.5833 10.3333C31.8385 10.3333 33.6667 12.1615 33.6667 14.4167Z" stroke="black" stroke-width="1.75"/>
                    <path d="M16.1667 20.8333H20.8334" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M16.1667 26.6667H25.5001" stroke="black" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p>dolor sit ametsectetur.</p>

            </div>
            <div className='flex items-center !p-1 justify-start gap-3 cursor-pointer'>
                <p className='text-[#808080] text-sm'>Get more info</p>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.3927 8.03168L18.6457 6.51461C17.3871 5.42153 16.8937 4.83352 16.2121 5.04139C15.3622 5.30059 15.642 6.93609 15.642 7.48824C14.3206 7.48824 12.9468 7.38661 11.6443 7.59836C7.34453 8.29742 6 11.3566 6 14.6525C7.21697 13.9065 8.43274 13.0746 9.8954 12.7289C11.7212 12.2973 13.7603 12.5032 15.642 12.5032C15.642 13.0554 15.3622 14.6909 16.2121 14.9501C16.9844 15.1856 17.3871 14.5699 18.6457 13.4769L20.3927 11.9598C21.4642 11.0293 22 10.564 22 9.99574C22 9.4275 21.4642 8.96223 20.3927 8.03168Z" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M10.5676 3C6.70735 3.00694 4.68594 3.10152 3.39411 4.39073C2 5.78202 2 8.02125 2 12.4997C2 16.9782 2 19.2174 3.3941 20.6087C4.78821 22 7.03198 22 11.5195 22C16.0071 22 18.2509 22 19.645 20.6087C20.6156 19.64 20.9104 18.2603 21 16" stroke="#808080" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
        <div className='h-0.5 w-[100%] bg-neutral-300 !my-3' ></div>
        <div className='!p-2'>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Fuga, quasi? Dolores laudantium placeat dolor voluptas totam ipsum itaque illo praesentium ut aliquid modi sunt fugiat hic, labore dolorum iste architecto possimus corrupti! Quaerat odio saepe a voluptatibus excepturi asperiores? Animi modi asperiores quo expedita nobis, corrupti nostrum quaerat? Accusamus, adipisci!
        </div>
    </div>
  )
}

export default LostAndFoundComplaintCard
