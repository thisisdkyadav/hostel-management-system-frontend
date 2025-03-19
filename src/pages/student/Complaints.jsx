import React, { useState } from 'react';
import user from '../../assets/girlImg.jpeg';
import SideBar from '../../components/Student/Sidebar';
import ComplaintsCard from '../../components/Student/ComplaintsCard';
import PendingComplaintsCard from '../../components/Student/PendingComplaintsCard';
import ComplaintForm from '../../components/Student/ComplaintForm';

const Complaints = () => {
    const [isOpen, setIsOpen] = useState(false); 

    return (
        <div className="bg-neutral-100 min-h-screen relative">
            <SideBar />

            <div className={`${isOpen ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className='absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw] [@media(max-width:900px)]:hidden'>
                    <div className='flex flex-row gap-1'>
                        <p className='text-2xl font-bold text-black'>Complaints</p>
                        <p className='text-sm text-neutral-600'>17th March 2025</p>
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

               
                <button
                    className="absolute left-[80%] top-[90%] w-[14%] py-2 bg-[#1360AB] text-white rounded-lg shadow-md hover:bg-[#7c82bd] transition"
                    onClick={() => setIsOpen(true)}
                >
                    Craft a Complaint
                </button>
            </div>

            
            {isOpen && <ComplaintForm isOpen={isOpen} setIsOpen={setIsOpen} />}
        </div>
    );
};

export default Complaints;
