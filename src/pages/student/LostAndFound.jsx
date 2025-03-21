import React, { useRef, useState } from "react";
import user from "../../assets/girlImg.jpeg";
import SideBar from "../../components/Student/Sidebar";
import LostAndFoundComplaintCard from "../../components/Student/LostAndFoundComplaintCard";

const LostAndFound = () => {
    const fileInputRef = useRef(null);

    // State for complaints list
    const [complaints, setComplaints] = useState([
        { id: 1, text: "Lost black wallet near cafeteria." },
        { id: 2, text: "Found silver bracelet in library." },
        { id: 3, text: "Lost blue water bottle in sports ground." },
    ]);

    // State for new complaint input
    const [newComplaint, setNewComplaint] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // Handle text area input change
    const handleInputChange = (e) => {
        setNewComplaint(e.target.value);
    };

    // Handle file selection
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]); // Store file in state
    };

    // Handle file input click
    const handleButtonClick = () => {
        fileInputRef.current.click();
    };

    // Handle complaint submission
    const handleSubmit = () => {
        if (newComplaint.trim() === "") {
            alert("Please enter a description for your lost product.");
            return;
        }

        // Create new complaint object
        const newComplaintObj = {
            id: complaints.length + 1,
            text: newComplaint,
        };

        // Update state with new complaint
        setComplaints([...complaints, newComplaintObj]);
        setNewComplaint(""); // Clear input field
        setSelectedFile(null); // Reset file input
    };

    return (
        <div className="bg-neutral-100 h-screen flex overflow-hidden">
            <SideBar />

            {/* Header Section */}
            <div className="absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw]">
                <div>
                    <p className="text-2xl font-bold text-black">Lost and Found</p>
                    <p className="text-sm text-neutral-600">17th March 2025</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-3 py-2 rounded-lg shadow-md">
                        <p className="text-red-500 font-semibold">Alert</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <img src={user} className="w-12 h-12 rounded-full" alt="User" />
                        <p className="font-semibold">Vaibhav Ojha</p>
                    </div>
                </div>
            </div>

            {/* Lost and Found Section (Scrollable) */}
            <div className="absolute left-[17%] top-[19%] flex flex-col gap-7 w-[60%] h-[75vh]">
                <div className="bg-[#1360AB] p-3 rounded-xl flex justify-between w-[40%] items-center">
                    <p className="text-white font-semibold text-xl">Lost and Found</p>
                    <p className="text-white text-2xl">{complaints.length}</p>
                </div>

                {/* Lost & Found Complaints List */}
                <div className="flex flex-col items-center gap-5 w-[80%] overflow-y-auto">
                    {complaints.map((complaint) => (
                        <LostAndFoundComplaintCard key={complaint.id} complaint={complaint} />
                    ))}
                </div>
            </div>

            {/* Right Sidebar (Scrollable) */}
            <div className="absolute left-[72%] top-[19%] w-[25%] h-[75vh] flex flex-col gap-4">
                {/* Submitted Items Section */}
                <div className="p-4 bg-white rounded-xl shadow-md">
                    <p className="text-lg font-semibold">Products submitted by you</p>
                    <hr className="my-2 border-neutral-300" />
                    <div className="flex flex-col gap-4 h-[150px] overflow-y-auto">
                        {complaints.map((complaint) => (
                            <p key={complaint.id} className="text-sm">{complaint.text}</p>
                        ))}
                    </div>
                </div>

                {/* Lost Product Submission */}
                <div className="p-4 bg-white rounded-xl shadow-md">
                    <p className="text-lg font-semibold">Write about your lost product</p>
                    <hr className="my-2 border-neutral-300" />
                    <textarea
                        value={newComplaint}
                        onChange={handleInputChange}
                        placeholder="Type your text here..."
                        className="w-full h-32 p-2 border overflow-y-auto rounded-md"
                    ></textarea>
                    <div className="flex items-center gap-3 mt-3">
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={handleButtonClick}
                            className="text-neutral-500 px-4 py-2 border rounded-md"
                        >
                            Upload/Drag and drop image
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-green-400 rounded-md"
                        >
                            Submit
                        </button>
                    </div>

                    {/* Display selected file name */}
                    {selectedFile && <p className="text-sm text-neutral-500 mt-2">File: {selectedFile.name}</p>}
                </div>
            </div>
        </div>
    );
};

export default LostAndFound;
