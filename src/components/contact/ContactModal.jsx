import React, { useEffect } from "react"
import { X } from "lucide-react"

const ContactModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="contactmodal-overlay" onClick={onClose}>
      <div className="contactmodal-container" onClick={(e) => e.stopPropagation()}>
        <div className="contactmodal-bg-container">
          <div className="contactmodal-blob-1"></div>
          <div className="contactmodal-blob-2"></div>
          <div className="contactmodal-blob-3"></div>
          <div className="contactmodal-blob-4"></div>
        </div>

        <div className="contactmodal-content">
          <button className="contactmodal-close" onClick={onClose} aria-label="Close contact modal">
            <X size={24} />
          </button>

          <div className="contactmodal-title-section">
            <h1 className="contactmodal-heading">
              Contact
              <span className="contactmodal-heading-highlight">IIT Indore Hostels</span>
            </h1>
            <p className="contactmodal-description">
              Get in touch with the hostel management team
            </p>
          </div>

          <div className="contactmodal-info-card">
            <div className="contactmodal-info-grid">
              <div>
                <h3 className="contactmodal-section-title">Hostel Management Office</h3>
                <ul className="contactmodal-contact-list">
                  <li className="contactmodal-contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="contactmodal-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <span className="contactmodal-contact-label">Address</span>
                      <p className="contactmodal-contact-text">
                        Hostel Management Office,
                        <br />
                        IIT Indore, Simrol Campus,
                        <br />
                        Indore, MP 453552
                      </p>
                    </div>
                  </li>
                  <li className="contactmodal-contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="contactmodal-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <span className="contactmodal-contact-label">Email</span>
                      <p className="contactmodal-contact-text">hostel@iiti.ac.in</p>
                    </div>
                  </li>
                  <li className="contactmodal-contact-item">
                    <svg xmlns="http://www.w3.org/2000/svg" className="contactmodal-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <span className="contactmodal-contact-label">Phone</span>
                      <p className="contactmodal-contact-text">0731-6603468, Ext. 3468</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="contactmodal-section-title">Office Hours</h3>
                <ul className="contactmodal-hours-list">
                  <li className="contactmodal-hours-item">
                    <span className="contactmodal-hours-day">Monday - Friday</span>
                    <span className="contactmodal-hours-time">9:00 AM - 5:00 PM</span>
                  </li>
                  <li className="contactmodal-hours-item">
                    <span className="contactmodal-hours-day">Saturday</span>
                    <span className="contactmodal-hours-time">9:00 AM - 1:00 PM</span>
                  </li>
                  <li className="contactmodal-hours-item">
                    <span className="contactmodal-hours-day">Sunday & Holidays</span>
                    <span className="contactmodal-hours-time">Closed</span>
                  </li>
                </ul>
                <div className="contactmodal-emergency-section">
                  <h4 className="contactmodal-emergency-title">Emergency Contact</h4>
                  <p className="contactmodal-emergency-subtitle">For emergencies outside office hours:</p>
                  <ul className="contactmodal-emergency-list">
                    <li className="contactmodal-emergency-item">
                      <span className="contactmodal-emergency-label">Security Supervisor:</span> +91-6265224771
                    </li>
                    <li className="contactmodal-emergency-item">
                      <span className="contactmodal-emergency-label">Ambulance:</span> 7509062832
                    </li>
                    <li className="contactmodal-emergency-item">
                      <span className="contactmodal-emergency-label">Medical:</span> 0731-6603571 Ext. No. 3571 / 3187 / 3433
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactModal
