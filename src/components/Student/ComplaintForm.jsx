import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthProvider"; 
import { submitComplaint } from "../../services/studentService"; 
import { adminApi } from "../../services/apiService"; 

const ComplaintForm = ({ isOpen, setIsOpen }) => {
  const { user } = useAuth();
  const [hostelList, setHostelList] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    hostel: "",
    hostelId: "",
    room: "",
    unit:"",
    attachments: "",
    priority: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const data = await adminApi.getHostelList();
        setHostelList(data);
      } catch (error) {
        console.error("Error fetching hostel list:", error);
      }
    };
    fetchHostels();
  }, []);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "hostel") {
      // Find the corresponding hostel ID when a hostel is selected
      const selectedHostel = hostelList.find((h) => h.name === value);
      setFormData((prev) => ({
        ...prev,
        hostel: value,
        hostelId: selectedHostel ? selectedHostel._id : "", // Store hostelId automatically
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const complaintData = {
        userId: user._id,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        hostelId: formData.hostelId,
        room: formData.room,
        unit: formData.unit,
        attachments: formData.attachments,
        priority: formData.priority,
      };

      await submitComplaint(complaintData);
      alert("Complaint submitted successfully!");
      setIsOpen(false);
      setFormData({
        title: "",
        description: "",
        category: "",
        hostel: "",
        hostelId: "",
        room: "",
        attachments: "",
        priority: "",
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#1360AB] w-[40%] h-[90vh] p-6 rounded-lg shadow-lg relative">
        <button
          className="absolute top-3 right-3 text-white text-2xl"
          onClick={() => setIsOpen(false)}
        >
          &times;
        </button>
        <h2 className="text-white text-xl font-bold">FILL THE FORM</h2>
        {error && <p className="text-red-500">{error}</p>}

        <form className="flex flex-col gap-3 mt-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Complaint Title"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Complaint Description"
            className="p-2 bg-gray-200 rounded-lg w-full h-[100px]"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <select
            name="category"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Complaint Type
            </option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="Internet">Internet</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Civil">Civil</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="hostel"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.hostel}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select Hostel
            </option>
            {hostelList.map((hostel) => (
              <option key={hostel._id} value={hostel.name}>
                {hostel.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="room"
            placeholder="Room ID"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.room}
            onChange={handleChange}
          />
          <input
            type="text"
            name="unit"
            placeholder="Unit"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.unit}
            onChange={handleChange}
          />

          <input
            type="text"
            name="attachments"
            placeholder="Attachment URL"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.attachments}
            onChange={handleChange}
          />

          <select
            name="priority"
            className="p-2 bg-gray-200 rounded-lg w-full"
            value={formData.priority}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Severity
            </option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <button
            type="submit"
            className="bg-green-500 text-white px-6 py-2 rounded-md mt-2 hover:bg-green-600"
            disabled={loading}
          >
            {loading ? "Submitting..." : "SUBMIT"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
