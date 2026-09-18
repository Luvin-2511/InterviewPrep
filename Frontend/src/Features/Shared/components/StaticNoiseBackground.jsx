import React, { useEffect, useRef } from 'react'

const StaticNoiseBackground = ({ opacity = 0.045 }) => {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Low resolution buffer for high-performance 60fps noise rendering
    const WIDTH = (canvas.width = 256)
    const HEIGHT = (canvas.height = 256)

    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.fill()

    const imgData = ctx.getImageData(0, 0, WIDTH, HEIGHT)
    const pix = imgData.data

    let animId
    let lastTime = 0

    const render = (time) => {
      // Throttle to ~24fps for classic film grain / TV static feel and low CPU
      if (time - lastTime > 42) {
        lastTime = time
        for (let i = 0; i < pix.length; i += 4) {
          const color = (Math.random() * 255) | 0
          pix[i] = color
          pix[i + 1] = color
          pix[i + 2] = color
          pix[i + 3] = 255
        }
        ctx.putImageData(imgData, 0, 0)
      }
      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <div className="gn-wrap" aria-hidden="true">
      {/* 1. Global Subtle TV Static Canvas */}
      <canvas ref={canvasRef} className="gn-canvas" style={{ opacity }} />

      {/* 2. Global Vignette & Scanlines Frame */}
      <div className="gn-frame">
        <div />
        <div />
        <div />
      </div>

      <style>{`
        .gn-wrap {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          pointer-events: none;
          z-index: 1;
          overflow: hidden;
        }

        .gn-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          image-rendering: pixelated;
          mix-blend-mode: screen;
        }

        .gn-frame {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 30%, rgba(0, 0, 0, 0.4) 100%);
        }

        .gn-frame div {
          position: absolute;
          left: 0;
          top: -20%;
          width: 100%;
          height: 20%;
          background-color: rgba(0, 0, 0, 0.04);
          box-shadow: 0 0 16px rgba(0, 0, 0, 0.1);
          animation: gn-scanline 14s linear infinite;
        }

        .gn-frame div:nth-child(1) {
          animation-delay: 0s;
        }

        .gn-frame div:nth-child(2) {
          animation-delay: 4.6s;
        }

        .gn-frame div:nth-child(3) {
          animation-delay: 9.3s;
        }

        @keyframes gn-scanline {
          0% { top: -20%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  )
}

export default StaticNoiseBackground
