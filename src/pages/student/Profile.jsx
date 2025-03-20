import React, { useState, useEffect } from 'react';
import SideBar from '../../components/Student/Sidebar';
import { BsDoorOpenFill } from "react-icons/bs";
import userImg from '../../assets/girlImg.jpeg'; 
import { fetchStudentProfile } from '../../services/studentService';
import { useAuth } from "../../context/AuthProvider";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState(null); // Handle errors

  const { user } = useAuth();
  const userId = user?._id;

  useEffect(() => {
    if (userId) {
      fetchStudentProfile(userId).then((data) => {
        if (data.error) {
          setError(data.message);
        } else {
          setStudent(data);
        }
      });
    }
  }, [userId]);

  if (error) {
    return (
      <div className="text-red-500 text-center mt-10">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center mt-10">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 h-screen flex overflow-hidden">
      <SideBar />

      <div className="absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw]">
        <div className="flex flex-row gap-2">
          <p className="text-2xl font-bold text-black">Profile</p>
        </div>
      </div>

      <div className="absolute left-[17%] top-[17%] flex flex-row gap-8 w-[75%]">
        <div className="flex flex-col gap-8 bg-white shadow-lg p-6 rounded-xl w-[60%]">
          <div className="flex items-center gap-5">
            <img 
              src={student.profilePic || userImg} 
              className="rounded-full w-32 h-32 object-cover border-2 border-gray-300" 
              alt="Profile" 
              onError={(e) => e.target.src = userImg} 
            />
            <div className="text-black flex flex-col gap-2">
              <p className="text-2xl font-bold">Name: {student.userId.name}</p>
              <p className="text-md">Email: {student.userId.email}</p>
              <p className="text-md">Roll No: {student.rollNumber}</p>
              <p className="text-md">Department: {student.department}</p>
              <p className="text-md">Degree: {student.degree}</p>
              <p className="text-md">Admission Year: {student.admissionYear}</p>
              <p className="text-md">Graduation Year: {student.graduationYear}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <p><strong>DOB:</strong> {student.dob}</p>
              <p><strong>Gender:</strong> {student.gender}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p><strong>Address:</strong> {student.address}</p>
              <p><strong>Room:</strong> {student.roomNumber}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 bg-white shadow-lg p-6 rounded-xl h-[50%] w-[40%]">
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
              {student.roomNumber} <span className="text-2xl font-bold">E2</span>
            </p>
          </div>
        </div>
      </div>

      <button
        className="fixed left-[80%] top-[90%] w-[14%] py-2 bg-[#1360AB] text-white rounded-lg shadow-md hover:bg-[#a79edb] transition"
        onClick={() => setIsOpen(true)}
      >
        Apply for Room Change
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-opacity-20 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

          <div className="relative bg-[#1360AB] w-[40%] p-6 rounded-[12px] shadow-lg">
            <button className="absolute top-3 right-3 text-white text-xl" onClick={() => setIsOpen(false)}>
              &times;
            </button>

            <h2 className="text-white text-xl font-semibold mb-4">Apply for Room Change</h2>

            <div className="flex flex-col gap-3">
              <input type="text" placeholder="Preferred Room No.-" className="p-2 rounded-[12px] bg-gray-200 w-full" />
              <textarea placeholder="Reason For Room Change-" className="p-2 bg-gray-200 rounded-lg w-full h-[100px]" />

              <button className="bg-green-500 text-black px-6 py-2 rounded-md hover:bg-green-600"
                onClick={() => alert("Room change request submitted")}>
                SUBMIT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
