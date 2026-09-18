import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

const DURATION = 400

export default function PageTransition({ children }) {
  const location = useLocation()
  const [outgoing, setOutgoing] = useState(null)
  const [incoming, setIncoming] = useState(children)
  const [transitioning, setTransitioning] = useState(false)
  const prevKey = useRef(location.key)
  const timer = useRef(null)

  useEffect(() => {
    if (location.key === prevKey.current) return

    setOutgoing(incoming)
    setIncoming(children)
    setTransitioning(true)
    prevKey.current = location.key

    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setOutgoing(null)
      setTransitioning(false)
    }, DURATION + 50)

    return () => clearTimeout(timer.current)
  }, [location.key]) // eslint-disable-line

  // Not transitioning — just render normally, full scroll works
  if (!transitioning) {
    return <>{incoming}</>
  }

  // During transition — render both pages side by side in a fixed viewport clip
  return (
    <>
      <style>{`
        .pt-clip {
          position: fixed;
          inset: 0;
          overflow: hidden;
          z-index: 9990;
        }
        .pt-out {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          animation: pt-slide-out ${DURATION}ms cubic-bezier(0.76,0,0.24,1) forwards;
        }
        .pt-in {
          position: absolute;
          inset: 0;
          overflow: hidden;
          animation: pt-slide-in ${DURATION}ms cubic-bezier(0.76,0,0.24,1) forwards;
        }
        @keyframes pt-slide-out {
          from { transform: translateX(0); }
          to   { transform: translateX(-100%); }
        }
        @keyframes pt-slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>

      <div className="pt-clip">
        {outgoing && (
          <div className="pt-out">{outgoing}</div>
        )}
        <div className="pt-in">{incoming}</div>
      </div>
    </>
  )
}
