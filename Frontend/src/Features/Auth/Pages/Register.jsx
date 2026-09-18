import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from "../hooks/useAuth.jsx"
import Loader from "../../Shared/components/Loader.jsx"
import ErrorPopup from "../../Shared/components/ErrorPopup.jsx"

// Step indicator
const StepDot = ({ active, done, label, num }) => (
  <div className="rx-step-dot">
    <div className={`rx-step-dot__circle ${active ? 'rx-step-dot__circle--active' : ''} ${done ? 'rx-step-dot__circle--done' : ''}`}>
      {done ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <span>{num}</span>
      )}
    </div>
    <span className="rx-step-dot__label">{label}</span>
  </div>
)

const Register = () => {
  const [focused, setFocused] = useState(null)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0) // 0=all, track progress by fill
  const { loading, handleRegister, error, setError } = useAuth()
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  const filledCount = [username, email, password].filter(Boolean).length
  const progress = filledCount / 3

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)

    // Canvas particle field
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.3 + 0.05,
    }))
    let animId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 60, 172, ${p.alpha})`
        ctx.fill()
      })
      // Draw connections
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < 80) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(255, 60, 172, ${0.06 * (1 - d / 80)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !email || !password) { setError("Please fill in all fields."); return }
    try {
      const success = await handleRegister(username, email, password)
      if (success) navigate('/home')
    } catch (err) { setError(err.response?.data?.message || "Something went wrong.") }
  }

  if (loading) return <Loader />

  return (
    <div className="rx-root" >
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}

      {/* Back to Home */}
      <a href="/" className="rx-back-btn">
        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Home
      </a>

      {/* BG */}
      <div className="rx-bg">
        <div className="rx-bg__grid" />
      </div>

      {/* Main */}
      <div className="rx-main">
        {/* Left: progress art + info */}
        <div className="rx-left rx-left--in">
          {/* Progress circle */}
          <div className="rx-progress-art">
            <svg className="rx-progress-svg" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />
              <circle
                cx="100" cy="100" r="80" fill="none"
                stroke="url(#prog-grad)" strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - progress)}`}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)' }}
              />
              <defs>
                <linearGradient id="prog-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#cccccc" />
                  <stop offset="100%" stopColor="#aaaaaa" />
                </linearGradient>
              </defs>
              {/* Dots at equal intervals */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                const angle = (i * 45 - 90) * Math.PI / 180
                const x = 100 + 80 * Math.cos(angle)
                const y = 100 + 80 * Math.sin(angle)
                return <circle key={i} cx={x} cy={y} r="2" fill="rgba(255,255,255,0.25)" />
              })}
            </svg>
            <div className="rx-progress-art__inner">
              <div className="rx-progress-art__pct">{Math.round(progress * 100)}<span>%</span></div>
              <div className="rx-progress-art__label">Complete</div>
            </div>
          </div>

          {/* Steps */}
          <div className="rx-steps-list">
            <StepDot num="1" active={!username} done={!!username} label="Choose username" />
            <div className="rx-steps-connector" />
            <StepDot num="2" active={username && !email} done={!!email} label="Add your email" />
            <div className="rx-steps-connector" />
            <StepDot num="3" active={email && !password} done={!!password} label="Secure password" />
          </div>

          <div className="rx-left__tagline">
            <div className="rx-left__overline">Join 12,000+ engineers</div>
            <h2 className="rx-left__headline">
              Start your<br />
              <em>journey.</em>
            </h2>
            <p className="rx-left__body">Create your account and start prepping smarter with AI-powered interview intelligence.</p>
          </div>
        </div>

        {/* Right: form */}
        <div className="rx-right rx-right--in">
          <div className="rx-form-container">
            {/* Logo */}
            <div className="rx-logo">
              <div className="rx-logo__orbit">
                <div className="rx-logo__planet" />
              </div>
              <span className="rx-logo__name">Prepiq</span>
            </div>

            <div className="rx-heading">
              <h1 className="rx-heading__title">
                Create<br />
                <em>account.</em>
              </h1>
              <p className="rx-heading__sub">Free forever. No credit card required.</p>
            </div>

            {/* Progress bar */}
            <div className="rx-form-progress">
              <div className="rx-form-progress__track">
                <div className="rx-form-progress__fill" style={{ width: `${progress * 100}%` }} />
              </div>
              <span className="rx-form-progress__label">{['Start filling in', 'Almost there', 'Ready to go!'][filledCount] || 'Fill in details'}</span>
            </div>

            <form onSubmit={handleSubmit} className="rx-form">
              {/* Username */}
              <div className={`rx-field ${focused === 'u' ? 'rx-field--on' : ''} ${username ? 'rx-field--ok' : ''}`}>
                <div className="rx-field__label-row">
                  <label className="rx-field__label">Username</label>
                  {username && <span className="rx-field__ok">✓</span>}
                </div>
                <div className="rx-field__wrap">
                  <input
                    type="text" value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocused('u')}
                    onBlur={() => setFocused(null)}
                    placeholder="Choose a username"
                    className="rx-field__input"
                  />
                  <div className="rx-field__line" />
                  <span className="rx-field__ico">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className={`rx-field ${focused === 'e' ? 'rx-field--on' : ''} ${email ? 'rx-field--ok' : ''}`}>
                <div className="rx-field__label-row">
                  <label className="rx-field__label">Email address</label>
                  {email && <span className="rx-field__ok">✓</span>}
                </div>
                <div className="rx-field__wrap">
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('e')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className="rx-field__input"
                  />
                  <div className="rx-field__line" />
                  <span className="rx-field__ico">
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                </div>
              </div>

              {/* Password */}
              <div className={`rx-field ${focused === 'p' ? 'rx-field--on' : ''} ${password ? 'rx-field--ok' : ''}`}>
                <div className="rx-field__label-row">
                  <label className="rx-field__label">Password</label>
                  {password && <span className="rx-field__ok">✓</span>}
                </div>
                <div className="rx-field__wrap">
                  <input
                    type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('p')}
                    onBlur={() => setFocused(null)}
                    placeholder="Min. 8 characters"
                    className="rx-field__input"
                  />
                  <div className="rx-field__line" />
                  <button type="button" className="rx-field__toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? (
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {/* Password strength bar */}
                  {password && (
                    <div className="rx-field__strength">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className={`rx-field__strength-seg ${password.length > i * 2 ? 'rx-field__strength-seg--filled' : ''}`} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <button type="submit" className="rx-submit">
                <div className="rx-submit__bg" />
                <span className="rx-submit__label">Create Account</span>
                <div className="rx-submit__arrow">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#05050d" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="rx-submit__scanline" />
              </button>

              {/* Divider */}
              <div className="rx-divider">
                <span className="rx-divider__line" />
                <span className="rx-divider__text">or</span>
                <span className="rx-divider__line" />
              </div>

              {/* Social */}
              <div className="rx-social">
                <a href="http://localhost:3000/api/auth/google" className="rx-social-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                  <span>Continue with Google</span>
                </a>
              </div>

              <p className="rx-switch">
                Already have an account?{' '}
                <Link to="/login" className="rx-switch__link">Sign in →</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Epilogue:ital,wght@0,300;0,400;0,500;0,700;0,900;1,700;1,900&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --bg: #04040c;
          --fg: #f0eeff;
          --muted: #5a5878;
          --dim: #1e1c2c;
          --p: #ffffff;
          --q: #cccccc;
          --r: #aaaaaa;
          --border: rgba(255,255,255,0.12);
          --grad: #ffffff;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .rx-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          overflow: hidden;
          position: relative;
        }
        .rx-back-btn { position:absolute;top:40px;left:40px;z-index:100;display:flex;align-items:center;gap:8px;font-family:'Bebas Neue', sans-serif;font-size:24px;color:var(--muted);text-decoration:none;transition:color .2s;letter-spacing:.05em; }
        .rx-back-btn:hover { color:var(--fg); }

        /* ── CURSOR */
        .rx-cursor-ring {
          position: fixed; width: 44px; height: 44px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.5);
          pointer-events: none; z-index: 9999;
          mix-blend-mode: difference;
        }
        .rx-cursor-dot {
          position: fixed; width: 6px; height: 6px; border-radius: 50%;
          background: var(--p); pointer-events: none; z-index: 9999;
          box-shadow: 0 0 8px var(--p);
        }

        /* ── CANVAS */
        .rx-canvas {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          width: 100%; height: 100%;
        }

        /* ── BG */
        .rx-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .rx-bg__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @keyframes orb-drift { 0%,100%{transform:translate(0,0)}33%{transform:translate(40px,-50px)}66%{transform:translate(-30px,30px)} }
        @keyframes orb-pulse { 0%,100%{opacity:.3}50%{opacity:.6} }
        .rx-bg__orb { position:absolute;border-radius:50%;filter:blur(90px); }
        .rx-bg__orb--0 { width:700px;height:700px;top:-250px;left:-150px;background:rgba(255,255,255,0.1);animation:orb-drift 20s ease-in-out infinite,orb-pulse 7s ease-in-out infinite; }
        .rx-bg__orb--1 { width:600px;height:600px;bottom:-200px;right:-100px;background:rgba(43,134,197,0.1);animation:orb-drift 24s ease-in-out infinite reverse,orb-pulse 9s ease-in-out infinite reverse; }
        .rx-bg__orb--2 { width:400px;height:400px;top:50%;left:50%;background:rgba(120,75,160,0.07);animation:orb-pulse 11s ease-in-out infinite; }

        /* ── LAYOUT */
        .rx-main {
          min-height: 100vh;
          display: grid; grid-template-columns: 420px 1fr;
          position: relative; z-index: 1;
        }



        /* ── LEFT */
        .rx-left {
          background: rgba(255,255,255,0.03);
          border-right: 1px solid var(--border);
          padding: 60px 48px;
          display: flex; flex-direction: column; justify-content: center; gap: 56px;
          opacity: 1;
        }
        .rx-left--in { }

        /* ── PROGRESS ART */
        .rx-progress-art { position: relative; width: 200px; height: 200px; }
        .rx-progress-svg { width: 200px; height: 200px; }
        .rx-progress-art__inner {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .rx-progress-art__pct { font-family:'Bebas Neue',sans-serif;font-size:52px;letter-spacing:0.04em;line-height:1;color:var(--fg); }
        .rx-progress-art__pct span { font-size:24px;color:var(--p); }
        .rx-progress-art__label { font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:0.14em;color:var(--muted);text-transform:uppercase;margin-top:4px; }

        /* ── STEPS LIST */
        .rx-steps-list { display: flex; flex-direction: column; gap: 0; }
        .rx-steps-connector { width: 1px; height: 24px; background: var(--border); margin-left: 15px; }

        .rx-step-dot { display: flex; align-items: center; gap: 14px; }
        .rx-step-dot__circle {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.1);
          display: flex; align-items: center; justify-content: center;
          font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;color:var(--muted);
          flex-shrink: 0;
          transition: all 0.3s;
        }
        .rx-step-dot__circle--active { border-color:var(--p);color:var(--p);box-shadow:0 0 12px rgba(255,255,255,0.3); }
        .rx-step-dot__circle--done { background:var(--p);border-color:var(--p);box-shadow:0 0 16px rgba(255,255,255,0.4); }
        .rx-step-dot__label { font-size:13px;font-weight:400;color:var(--muted);letter-spacing:0.02em; }

        .rx-left__overline { font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--p);margin-bottom:16px; }
        .rx-left__headline {
          font-family:'Bebas Neue',sans-serif;font-size:60px;letter-spacing:0.02em;line-height:0.95;color:var(--fg);
        }
        .rx-left__headline em { font-style:normal;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .rx-left__body { font-size:14px;font-weight:300;color:var(--muted);line-height:1.7;margin-top:16px; }

        /* ── RIGHT */
        .rx-right {
          padding: 60px 64px;
          display: flex; align-items: center; justify-content: center;
          opacity: 1;
        }
        .rx-right--in { }

        .rx-form-container { width: 100%; max-width: 440px; }

        /* ── LOGO */
        @keyframes orbit { to{transform:rotate(360deg)} }
        .rx-logo { display:flex;align-items:center;gap:14px;margin-bottom:48px; }
        .rx-logo__orbit {
          width: 40px; height: 40px; border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: 1.5px solid rgba(255,255,255,0.3);
          position: relative;
          animation: orbit 6s linear infinite;
        }
        .rx-logo__planet {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          background: var(--p); top: -4px; left: 50%; transform: translateX(-50%);
          box-shadow: 0 0 12px var(--p);
        }
        .rx-logo__name { font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:0.1em; }

        /* ── HEADING */
        .rx-heading { margin-bottom: 36px; }
        .rx-heading__title {
          font-family:'Bebas Neue',sans-serif;font-size:72px;letter-spacing:0.02em;line-height:0.9;color:var(--fg);margin-bottom:12px;
        }
        .rx-heading__title em { font-style:normal;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .rx-heading__sub { font-size:14px;color:var(--muted);font-weight:400; }

        /* ── FORM PROGRESS */
        .rx-form-progress { margin-bottom:36px; }
        .rx-form-progress__track { height:2px;background:rgba(255,255,255,0.06);border-radius:1px;overflow:hidden;margin-bottom:8px; }
        .rx-form-progress__fill { height:100%;background:var(--grad);border-radius:1px;transition:width 0.5s cubic-bezier(0.4,0,0.2,1);box-shadow:0 0 8px rgba(255,255,255,0.5); }
        .rx-form-progress__label { font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase; }

        /* ── FIELDS */
        .rx-form { display:flex;flex-direction:column; }
        .rx-field { margin-bottom:28px; }
        .rx-field__label-row { display:flex;align-items:center;justify-content:space-between;margin-bottom:10px; }
        .rx-field__label { font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);transition:color 0.2s; }
        .rx-field--on .rx-field__label { color:var(--p); }
        .rx-field__ok { font-size:11px;color:#34d399;font-family:'JetBrains Mono',monospace; }

        .rx-field__wrap { position:relative; }
        .rx-field__input {
          width:100%;padding:16px 44px 16px 20px;
          background:rgba(255,255,255,0.02);border:1px solid var(--border);
          border-radius:3px;font-size:15px;color:var(--fg);
          font-family:'Epilogue',sans-serif;font-weight:400;
          outline:none;letter-spacing:0.01em;
          transition:background 0.2s,border-color 0.2s,box-shadow 0.2s;
        }
        .rx-field__input::placeholder { color:rgba(255,255,255,0.13);font-weight:300; }
        .rx-field__input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px #08071a inset;-webkit-text-fill-color:var(--fg); }
        .rx-field--on .rx-field__input { border-color:rgba(255,255,255,0.4);background:rgba(255,255,255,0.03);box-shadow:0 0 0 4px rgba(255,255,255,0.06); }
        .rx-field--ok .rx-field__input { border-color:rgba(52,211,153,0.2); }

        .rx-field__line { position:absolute;bottom:-1px;left:0;right:100%;height:1.5px;background:var(--p);transition:right 0.4s cubic-bezier(0.4,0,0.2,1);border-radius:0 0 3px 3px; }
        .rx-field--on .rx-field__line { right:0; }

        .rx-field__ico { position:absolute;right:16px;top:50%;transform:translateY(-50%);color:var(--muted);opacity:0.4;pointer-events:none; }
        .rx-field__toggle { position:absolute;right:16px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);opacity:0.4;cursor:pointer;padding:0;display:flex;transition:opacity 0.2s; }
        .rx-field__toggle:hover { opacity:1; }

        .rx-field__strength { display:flex;gap:3px;margin-top:8px; }
        .rx-field__strength-seg { height:2px;flex:1;border-radius:1px;background:rgba(255,255,255,0.08);transition:background 0.3s; }
        .rx-field__strength-seg--filled { background:var(--p); }

        /* ── SUBMIT */
        .rx-submit {
          position:relative;width:100%;padding:20px;border:none;border-radius:3px;
          background:transparent;cursor:pointer;color:#05050d;overflow:hidden;
          display:flex;align-items:center;justify-content:center;gap:12px;
          font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.12em;
          margin-bottom:32px;
          box-shadow:0 8px 40px rgba(255,255,255,0.3);
          transition:transform 0.2s,box-shadow 0.3s;
        }
        .rx-submit:hover { transform:translateY(-2px);box-shadow:0 20px 60px rgba(255,255,255,0.5); }
        .rx-submit__bg { position:absolute;inset:0;background:var(--grad); }
        .rx-submit__label { position:relative;z-index:1; }
        .rx-submit__arrow { position:relative;z-index:1;display:flex;align-items:center;transition:transform 0.2s; }
        .rx-submit:hover .rx-submit__arrow { transform:translateX(6px); }
        .rx-submit__scanline { position:absolute;inset:0;z-index:2;pointer-events:none;background:repeating-linear-gradient(0deg,transparent 0px,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px); }

        .rx-divider { display:flex;align-items:center;gap:16px;margin-bottom:24px; }
        .rx-divider__line { flex:1;height:1px;background:var(--border); }
        .rx-divider__text { font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.12em;text-transform:uppercase; }

        .rx-social { display:flex;width:100%;margin-bottom:28px; }
        .rx-social-btn { width:100%;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:13px;font-weight:500;cursor:pointer;font-family:'Epilogue',sans-serif;letter-spacing:0.04em;transition:all 0.2s; }
        .rx-social-btn:hover { border-color:rgba(255,255,255,0.3);color:var(--fg);background:rgba(255,255,255,0.04); }

        .rx-switch { text-align:center;font-size:13px;color:var(--muted); }
        .rx-switch__link { color:var(--p);text-decoration:none;font-weight:500;transition:color 0.2s; }
        .rx-switch__link:hover { color:var(--fg); }

        @media (max-width: 900px) {
          .rx-main { grid-template-columns: 1fr; }
          .rx-left { display: none; }
          .rx-right { padding: 60px 32px; }
        }
      `}</style>
    </div>
  )
}

export default Register