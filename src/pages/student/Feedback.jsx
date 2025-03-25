import { useState } from "react"
import { HiAnnotation } from "react-icons/hi"
import FeedbackForm from "../../components/student/feedback/FeedbackForm"
import { useAuth } from "../../contexts/AuthProvider"
import { studentApi } from "../../services/apiService"
import CommonSuccessModal from "../../components/common/CommonSuccessModal"

const Feedback = () => {
  const { user } = useAuth()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [feedbackTitle, setFeedbackTitle] = useState("")

  const handleFeedbackSubmit = async (title, description) => {
    try {
      const response = await studentApi.submitFeedback(title, description)
      if (response.success) {
        setFeedbackTitle(title)
        setShowSuccessModal(true)
        return true
      } else {
        alert("Failed to submit feedback. Please try again.")
        return false
      }
    } catch (error) {
      console.error("Error submitting feedback:", error)
      alert("An error occurred while submitting feedback. Please try again.")
    }
  }

  if (user?.role !== "Student") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 max-w-md w-full border border-red-100">
          <div className="flex items-center justify-center bg-red-100 text-red-600 w-14 h-14 rounded-full mb-6 mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-10v4m6 6a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 text-center mb-6">You do not have permission to access this page. This page is only for students.</p>
          <div className="flex justify-center">
            <a href="/" className="px-5 py-2.5 bg-[#1360AB] text-white rounded-lg hover:bg-[#0d4b86] transition-colors shadow-sm">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex-1">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-3 mr-4 rounded-xl bg-blue-100 text-[#1360AB] flex-shrink-0">
            <HiAnnotation size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Submit Feedback</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">Share your thoughts, suggestions, or concerns with the hostel management.</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <HiAnnotation className="mr-2 text-[#1360AB]" size={20} />
              Feedback Form
            </h2>
          </div>

          <div className="p-6">
            <div className="bg-blue-50 text-blue-700 rounded-lg p-4 mb-6 flex items-start">
              <div className="flex-shrink-0 mt-0.5 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm">Your feedback is important to us. It helps us improve the hostel services and address any issues you may be facing.</p>
            </div>

            <FeedbackForm onSubmit={handleFeedbackSubmit} />
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <CommonSuccessModal
          show={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          title="Feedback Submitted Successfully"
          message="Thank you for your feedback. The hostel management will review it and take appropriate action if necessary."
          infoText={feedbackTitle}
          infoIcon={HiAnnotation}
          buttonText="Done"
        />
      )}
    </div>
  )
}

export default Feedback
