import { FaRegFileAlt, FaCheckCircle } from "react-icons/fa"

const Card = ({ type = "pending", count = 5 }) => {
  const isPending = type === "pending"

  return (
    <div className="bg-[#1360AB] text-white rounded-md p-2.5 w-[140px]">
      <div className="flex items-center mb-1.5">
        <div className="bg-[#5B8CC1] p-1.5 rounded-full flex items-center justify-center">{isPending ? <FaRegFileAlt className="w-3 h-3 text-white" /> : <FaCheckCircle className="w-3 h-3 text-white" />}</div>
        <span className="ml-1.5 text-xs font-medium">{isPending ? "Pending Complaints" : "Resolved Complaints"}</span>
      </div>
      <div className="text-xl font-bold">{count}</div>
    </div>
  )
}

export default Card
