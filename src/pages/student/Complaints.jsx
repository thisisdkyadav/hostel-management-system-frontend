import React, { useState, useEffect } from "react"
import SideBar from "../../components/Student/Sidebar"
import ComplaintsCard from "../../components/Student/ComplaintsCard"
import PendingComplaintsCard from "../../components/Student/PendingComplaintsCard"
import ComplaintForm from "../../components/Student/ComplaintForm"

const Complaints = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [pendingComplaints, setPendingComplaints] = useState([])
  const pendingCount = complaints.filter((c) => c.status === "Pending").length
  // useEffect(() => {
  //     const fetchComplaints = async () => {
  //       try {
  //         const data = await studentApi.getAllComplaints(userId)
  //         setComplaints(data.filter((c) => c.status !== "Pending"))
  //         setPendingComplaints(data.filter((c) => c.status === "Pending"))
  //       } catch (error) {
  //         setError("Failed to fetch complaints")
  //       } finally {
  //         setLoading(false)
  //       }
  //     }
  //     fetchComplaints()
  //   }, [])

  //   const handleNewComplaint = async (complaintText) => {
  //     try {
  //       const newComplaint = await studentApi.fileComplaint(userId, { text: complaintText })
  //       setComplaints([newComplaint, ...complaints])
  //       setIsOpen(false) // Close the form after submission
  //     } catch (error) {
  //       console.error("Error filing complaint:", error.message)
  //     }
  //   }
  useEffect(() => {
    const generateRandomComplaints = () => {
      const randomComplaints = Array.from({ length: 5 }, (_, i) => ({
        _id: i + 1,
        text: `Complaint ${i + 1}: Issue in Room ${100 + i}`,
        status: i % 2 === 0 ? "Pending" : "Resolved",
        createdAt: new Date().toISOString(),
      }))

      setComplaints(randomComplaints.filter((c) => c.status !== "Pending"))
      setPendingComplaints(randomComplaints.filter((c) => c.status === "Pending"))
    }

    generateRandomComplaints()
  }, [])

  return (
    <>
      <div className={`${isOpen ? "opacity-40 pointer-events-none" : ""}`}>
        <div className="absolute top-[6%] left-[17%] flex items-center justify-between w-[80vw] [@media(max-width:900px)]:hidden">
          <div className="flex flex-row gap-1">
            <p className="text-2xl font-bold text-black">Complaints</p>
            <p className="text-sm px-1 py-2 text-neutral-600">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="absolute left-[17%] top-[22%] w-[60%] h-[70vh] overflow-y-scroll flex flex-col gap-3">
          {complaints.map((complaint) => (
            <ComplaintsCard key={complaint._id} complaint={complaint} />
          ))}
        </div>

        <div className="absolute left-[80%] top-[22%] w-[15%] h-[70vh]">
          <PendingComplaintsCard count={pendingCount} />
        </div>

        <button className="absolute left-[80%] top-[90%] w-[14%] py-2 bg-[#1360AB] text-white rounded-lg shadow-md hover:bg-[#7c82bd] transition" onClick={() => setIsOpen(true)}>
          Craft a Complaint
        </button>
      </div>

      {isOpen && <ComplaintForm isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  )
}

export default Complaints
