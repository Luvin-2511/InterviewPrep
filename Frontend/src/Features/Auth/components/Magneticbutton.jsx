import React, { useRef, useState } from 'react'
import '../styles/MagneticButton.scss'

const Magneticbutton = ({
                            children,
                            className = '',
                            strength = 0.4,
                            radius = 120,
                            onClick,
                            ...props
                        }) => {
    const btnRef = useRef(null)
    const [pos, setPos] = useState({ x: 0, y: 0 })
    const [isNear, setIsNear] = useState(false)

    const handleMouseMove = (e) => {
        const btn = btnRef.current
        if (!btn) return

        const rect = btn.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distX = e.clientX - centerX
        const distY = e.clientY - centerY
        const dist = Math.sqrt(distX * distX + distY * distY)

        if (dist < radius) {
            setIsNear(true)
            setPos({
                x: distX * strength,
                y: distY * strength,
            })
        } else {
            setIsNear(false)
            setPos({ x: 0, y: 0 })
        }
    }

    const handleMouseLeave = () => {
        setIsNear(false)
        setPos({ x: 0, y: 0 })
    }

    return (
        <div
            className="magnetic-wrap"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <button
                ref={btnRef}
                className={`magnetic-btn ${isNear ? 'magnetic-btn--near' : ''} ${className}`}
                style={{
                    transform: `translate(${pos.x}px, ${pos.y}px)`,
                    transition: isNear
                        ? 'transform 0.15s cubic-bezier(0.2, 0, 0, 1)'
                        : 'transform 0.6s cubic-bezier(0.2, 0, 0, 1)',
                }}
                onClick={onClick}
                {...props}
            >
                <span
                    className="magnetic-btn__inner"
                    style={{
                        transform: `translate(${pos.x * 0.25}px, ${pos.y * 0.25}px)`,
                        transition: isNear
                            ? 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)'
                            : 'transform 0.6s cubic-bezier(0.2, 0, 0, 1)',
                    }}
                >
                    {children}
                </span>
                <span className="magnetic-btn__shine" />
            </button>
        </div>
    )
}

export default Magneticbutton