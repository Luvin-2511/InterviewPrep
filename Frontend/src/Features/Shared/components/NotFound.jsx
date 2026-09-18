import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const NotFound = () => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const WIDTH = (canvas.width = 700)
    const HEIGHT = (canvas.height = 500)

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fill()

    const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
    const pix = imgData.data

    const flickering = () => {
      for (let i = 0; i < pix.length; i += 4) {
        const color = Math.random() * 255 + 50
        pix[i] = color
        pix[i + 1] = color
        pix[i + 2] = color
      }
      ctx.putImageData(imgData, 0, 0)
    }

    const intervalId = setInterval(flickering, 30)

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="nf-root">
      {/* Dynamic TV Static Canvas */}
      <canvas ref={canvasRef} className="nf-canvas" />

      {/* Frame Vignette with Moving Scanlines */}
      <div className="nf-frame">
        <div />
        <div />
        <div />
      </div>

      {/* Glitch Overlay Cap */}
      <div className="nf-caps">
        <img src="http://ademilter.com/caps.png" alt="" />
      </div>

      {/* Central Content */}
      <div className="nf-content">
        <h1 className="nf-title">404</h1>
        <p className="nf-desc">SIGNAL LOST // PAGE NOT FOUND</p>
        <Link to="/home" className="nf-back-btn">
          <span>← Back to Safety</span>
        </Link>
      </div>

      {/* Embedded Component Styles */}
      <style>{`
        .nf-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background: #000;
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 99999;
        }

        .nf-canvas {
          z-index: 1;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .nf-caps {
          z-index: 2;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          pointer-events: none;
          animation: nf-caps-anim 8s linear infinite;
        }

        .nf-caps img {
          display: block;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        @keyframes nf-caps-anim {
          0% { opacity: 0; }
          10% { opacity: 0.3; }
          20% { opacity: 0.1; }
          30% { opacity: 0.5; }
          40% { opacity: 0; }
          50% { opacity: 0.8; }
          55% { opacity: 0; }
          100% { opacity: 0; }
        }

        .nf-frame {
          z-index: 3;
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 19%, rgba(0, 0, 0, 0.92) 100%);
        }

        .nf-frame div {
          position: absolute;
          left: 0;
          top: -20%;
          width: 100%;
          height: 20%;
          background-color: rgba(0, 0, 0, 0.15);
          box-shadow: 0 0 14px rgba(0, 0, 0, 0.4);
          animation: nf-scanline 12s linear infinite;
        }

        .nf-frame div:nth-child(1) {
          animation-delay: 0s;
        }

        .nf-frame div:nth-child(2) {
          animation-delay: 4s;
        }

        .nf-frame div:nth-child(3) {
          animation-delay: 8s;
        }

        @keyframes nf-scanline {
          0% { top: -20%; }
          100% { top: 100%; }
        }

        .nf-content {
          z-index: 10;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          pointer-events: auto;
        }

        .nf-title {
          font-family: 'Clash Display', 'Arial', sans-serif;
          font-size: clamp(100px, 20vw, 220px);
          font-weight: 900;
          line-height: 1;
          margin: 0;
          color: transparent;
          text-shadow: 0 0 30px rgba(0, 0, 0, 0.6);
          animation: nf-shadow-flicker 2s linear infinite;
          user-select: none;
        }

        @keyframes nf-shadow-flicker {
          0% { text-shadow: 0 0 30px rgba(0, 0, 0, 0.6); }
          33% { text-shadow: 0 0 10px rgba(0, 0, 0, 0.4); }
          66% { text-shadow: 0 0 20px rgba(0, 0, 0, 0.2); }
          100% { text-shadow: 0 0 40px rgba(0, 0, 0, 0.9); }
        }

        .nf-desc {
          font-family: 'JetBrains Mono', monospace;
          font-size: clamp(12px, 1.5vw, 16px);
          letter-spacing: 0.25em;
          color: rgba(255, 255, 255, 0.85);
          text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
          margin-top: 10px;
          margin-bottom: 32px;
          text-transform: uppercase;
        }

        .nf-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 28px;
          background: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          color: #ffffff;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          text-decoration: none;
          backdrop-filter: blur(10px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          transition: all 0.25s ease;
          cursor: pointer;
        }

        .nf-back-btn:hover {
          background: #ffffff;
          color: #000000;
          border-color: #ffffff;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  )
}

export default NotFound
