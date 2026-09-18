import React from 'react'
import '../styles/Loader.scss'

const Loader = ({ text = 'Analyzing...' }) => {
    return (
        <div className="loader-overlay">
            <div className="loader-wrap">

                {/* DNA Helix strands */}
                <div className="helix">
                    {[...Array(10)].map((_, i) => (
                        <div key={i} className="helix-row" style={{ '--i': i }}>
                            <div className="helix-dot helix-dot--left" />
                            <div className="helix-bar" />
                            <div className="helix-dot helix-dot--right" />
                        </div>
                    ))}
                </div>

                {/* Scanning line */}
                <div className="helix-scanner" />

                {/* Glitch text */}
                <div className="loader-text-wrap">
                    <span className="loader-text" data-text={text}>{text}</span>
                    <span className="loader-cursor" />
                </div>

                {/* Progress dots */}
                <div className="loader-dots">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="loader-dot" style={{ '--i': i }} />
                    ))}
                </div>

            </div>
        </div>
    )
}

export default Loader