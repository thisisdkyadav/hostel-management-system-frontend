import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Modal from "../common/Modal";
import { studentApi } from "../../services/apiService";

const VisitorRequestForm = ({ student }) => {
  const [formData, setFormData] = useState({
    numberOfVisitors: 1,
    visitorNames: [""],
    visitorContact: "",
    visitorEmail: "",
    relationWithStudent: "",
    visitReason: "",
    visitDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVisitorNameChange = (index, value) => {
    const updatedNames = [...formData.visitorNames];
    updatedNames[index] = value;
    setFormData((prev) => ({
      ...prev,
      visitorNames: updatedNames,
    }));
  };

  const handleNumberOfVisitorsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({
      ...prev,
      numberOfVisitors: value,
      visitorNames: Array(value).fill(""),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await studentApi.submitVisitorRequest({ ...formData, studentId: student._id });
      alert("Visitor request submitted successfully!");
      setIsOpen(false);
      setFormData({
        numberOfVisitors: 1,
        visitorNames: [""],
        visitorContact: "",
        visitorEmail: "",
        relationWithStudent: "",
        visitReason: "",
        visitDate: "",
      });
    } catch (err) {
      setError(err.message || "Failed to submit visitor request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="px-4 py-2 bg-[#1360AB] text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center" onClick={() => setIsOpen(true)}>
        Request Visitor Entry
      </button>
      {isOpen && (
        <Modal title="Visitor Request Form" onClose={() => setIsOpen(false)} width={550}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 p-4 rounded-lg flex items-start">
                <FaExclamationTriangle className="text-red-500 mt-1 mr-3 flex-shrink-0" />
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Number of Visitors</label>
                <input
                  type="number"
                  name="numberOfVisitors"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.numberOfVisitors}
                  onChange={handleNumberOfVisitorsChange}
                  required
                />
              </div>

              {formData.visitorNames.map((name, index) => (
                <div key={index}>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Visitor Name {index + 1}</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={name}
                    onChange={(e) => handleVisitorNameChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Visitor Contact</label>
                <input
                  type="text"
                  name="visitorContact"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.visitorContact}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Visitor Email</label>
                <input
                  type="email"
                  name="visitorEmail"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.visitorEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Relation with Student</label>
                <input
                  type="text"
                  name="relationWithStudent"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.relationWithStudent}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Visit Reason</label>
                <textarea
                  name="visitReason"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32"
                  value={formData.visitReason}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Visit Date</label>
                <input
                  type="date"
                  name="visitDate"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  value={formData.visitDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end pt-5 mt-6 border-t border-gray-100 space-y-3 sm:space-y-0 sm:space-x-3">
              <button type="button" className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0F4C81] transition-all" disabled={loading}>
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
};

export default VisitorRequestForm;
