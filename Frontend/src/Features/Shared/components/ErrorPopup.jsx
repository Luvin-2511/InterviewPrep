import React from 'react'
import '../styles/ErrorPopup.scss'

const ErrorPopup = ({ message = 'Something went wrong.', onClose }) => {
    return (
        <div className="error-overlay" onClick={onClose}>
            <div className="error-popup" onClick={e => e.stopPropagation()}>

                {/* Top accent bar */}
                <div className="error-bar" />

                {/* Icon */}
                <div className="error-icon-wrap">
                    <div className="error-icon-ring" />
                    <div className="error-icon-ring error-icon-ring--2" />
                    <div className="error-icon">
                        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <div className="error-content">
                    <h4 className="error-title">Error</h4>
                    <p className="error-message">{message}</p>
                </div>

                {/* Close button */}
                <button className="error-close" onClick={onClose}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

            </div>
        </div>
    )
}

export default ErrorPopup