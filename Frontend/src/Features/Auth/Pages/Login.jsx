import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from "../hooks/useAuth.jsx"
import Loader from "../../Shared/components/Loader.jsx"
import ErrorPopup from "../../Shared/components/ErrorPopup.jsx"

const Login = () => {
  const [focused, setFocused] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { loading, handleLogin, setError, error } = useAuth()
  const navigate = useNavigate()
  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!username || !password) { setError("Please fill in all fields."); return }
    try {
      const response = await handleLogin(username, password)
      if (response) navigate('/home')
    } catch { setError("Invalid username or password.") }
  }

  if (loading) return <Loader />

  return (
    <div className="lx-root" >
      {error && <ErrorPopup message={error} onClose={() => setError(null)} />}

      {/* BG */}
      <div className="lx-bg">
        <div className="lx-bg__grid" />
        <div className="lx-bg__noise" />
      </div>

      {/* Back button */}
      <Link to="/home" className="lx-back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        BACK TO HOME
      </Link>

      {/* Split layout */}
      <div className="lx-layout">
        {/* Left panel — big brand art */}
        <div className={`lx-panel lx-panel--left ${mounted ? 'lx-panel--in' : ''}`}>
          <div className="lx-panel__content">
            <div className="lx-brand-art">
              <div className="lx-brand-art__rings">
                {[0,1,2,3].map(i => <div key={i} className={`lx-ring lx-ring--${i}`} />)}
              </div>
              <div className="lx-brand-art__core">
                <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="lx-panel__tagline">
              <div className="lx-panel__overline">Interview Intelligence</div>
              <h2 className="lx-panel__headline">
                Your next<br />
                <span>big role</span><br />
                starts here.
              </h2>
              <p className="lx-panel__body">
                Thousands of engineers prepped smarter and landed the jobs they wanted. Your turn.
              </p>
            </div>

            <div className="lx-panel__stats">
              {[['94%','Success rate'],['12k+','Resumes analyzed'],['340+','Companies']].map(([v,l], i) => (
                <div key={i} className="lx-pstat" style={{ '--pi': i }}>
                  <div className="lx-pstat__val">{v}</div>
                  <div className="lx-pstat__label">{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className={`lx-panel lx-panel--right ${mounted ? 'lx-panel--in' : ''}`}>
          <div className="lx-form-wrap">
            <div className="lx-form-wrap__inner">
              {/* Logo */}
              <div className="lx-logo">
                <div className="lx-logo__mark" />
                <span className="lx-logo__name">Prepiq</span>
              </div>

              {/* Heading */}
              <div className="lx-heading">
                <h1 className="lx-heading__title">
                  Welcome<br />
                  <em>back.</em>
                </h1>
                <p className="lx-heading__sub">Sign in to continue your session</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="lx-form">
                {/* Username field */}
                <div className={`lx-field ${focused === 'username' ? 'lx-field--focused' : ''} ${username ? 'lx-field--filled' : ''}`}>
                  <label className="lx-field__label">Username</label>
                  <div className="lx-field__inner">
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      onFocus={() => setFocused('username')}
                      onBlur={() => setFocused(null)}
                      placeholder="Enter your username"
                      className="lx-field__input"
                    />
                    <div className="lx-field__border" />
                    <div className="lx-field__glow" />
                    <span className="lx-field__icon">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                  </div>
                </div>

                {/* Password field */}
                <div className={`lx-field ${focused === 'password' ? 'lx-field--focused' : ''} ${password ? 'lx-field--filled' : ''}`}>
                  <label className="lx-field__label">Password</label>
                  <div className="lx-field__inner">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      placeholder="Enter your password"
                      className="lx-field__input"
                    />
                    <div className="lx-field__border" />
                    <div className="lx-field__glow" />
                    <button type="button" className="lx-field__toggle" onClick={() => setShowPass(!showPass)}>
                      {showPass ? (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="lx-meta">
                  <Link to="/forgot-password" className="lx-forgot">Forgot password?</Link>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="lx-submit"
                  >
                  <span className="lx-submit__text">Sign In</span>
                  <div className="lx-submit__noise" />
                  <div className="lx-submit__shine" />
                  <div className="lx-submit__corners">
                    {['tl','tr','bl','br'].map(c => <div key={c} className={`lx-submit__corner lx-submit__corner--${c}`} />)}
                  </div>
                </button>

                {/* Divider */}
                <div className="lx-divider">
                  <span className="lx-divider__line" />
                  <span className="lx-divider__text">or continue with</span>
                  <span className="lx-divider__line" />
                </div>

                {/* Social */}
                <div className="lx-social">
                  <a href="http://localhost:3000/api/auth/google" className="lx-social-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>Continue with Google</span>
                  </a>
                </div>

                <p className="lx-switch">
                  No account? <Link to="/register" className="lx-switch__link">Create one →</Link>
                </p>
              </form>
            </div>
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
          --s: #888888;
          --border: rgba(255,255,255,0.12);
          --grad: #ffffff;
          --card: rgba(8,7,18,0.97);
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lx-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: 'Inter', sans-serif;
          color: var(--fg);
          overflow: hidden;
          position: relative;
        }
        .lx-back-btn { position:absolute;top:40px;left:40px;z-index:100;display:flex;align-items:center;gap:8px;font-family:'Bebas Neue', sans-serif;font-size:24px;color:var(--muted);text-decoration:none;transition:color .2s;letter-spacing:.05em; }
        .lx-back-btn:hover { color:var(--fg); }

        /* ── CURSOR */
        .lx-cursor-ring {
          position: fixed; width: 40px; height: 40px; border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.5);
          pointer-events: none; z-index: 9999;
          transition: transform 0.15s cubic-bezier(0.4,0,0.2,1), width 0.2s, height 0.2s, border-color 0.2s;
          mix-blend-mode: difference;
        }
        .lx-cursor-dot {
          position: fixed; width: 6px; height: 6px; border-radius: 50%;
          background: var(--p); pointer-events: none; z-index: 9999;
          box-shadow: 0 0 8px var(--p);
        }

        /* ── BG */
        .lx-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
        .lx-bg__grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        .lx-bg__noise { position:absolute;inset:0;opacity:0.04;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:180px; }

        @keyframes orb-drift { 0%,100%{transform:translate(0,0)}33%{transform:translate(40px,-50px)}66%{transform:translate(-30px,30px)} }
        @keyframes orb-pulse { 0%,100%{opacity:.3}50%{opacity:.6} }

        .lx-bg__orb { position:absolute;border-radius:50%;filter:blur(80px); }
        .lx-bg__orb--0 { width:700px;height:700px;top:-200px;left:-100px;background:rgba(255,255,255,0.12);animation:orb-drift 18s ease-in-out infinite,orb-pulse 6s ease-in-out infinite; }
        .lx-bg__orb--1 { width:600px;height:600px;bottom:-200px;right:-100px;background:rgba(43,134,197,0.12);animation:orb-drift 22s ease-in-out infinite reverse,orb-pulse 8s ease-in-out infinite reverse; }
        .lx-bg__orb--2 { width:400px;height:400px;top:40%;left:40%;background:rgba(120,75,160,0.08);animation:orb-pulse 10s ease-in-out infinite; }

        .lx-vline { position:absolute;top:0;bottom:0;width:1px; }
        .lx-vline--0 { left:20%;background:linear-gradient(180deg,transparent,rgba(255,255,255,0.06) 30%,rgba(255,255,255,0.06) 70%,transparent); }
        .lx-vline--1 { left:40%;background:linear-gradient(180deg,transparent,rgba(120,75,160,0.04) 40%,rgba(120,75,160,0.04) 60%,transparent); }
        .lx-vline--2 { left:60%;background:linear-gradient(180deg,transparent,rgba(120,75,160,0.04) 40%,rgba(120,75,160,0.04) 60%,transparent); }
        .lx-vline--3 { left:80%;background:linear-gradient(180deg,transparent,rgba(43,134,197,0.06) 30%,rgba(43,134,197,0.06) 70%,transparent); }
        .lx-vline--4 { right:0;background:none; }

        @keyframes particle-rise { 0%{transform:translateY(100vh);opacity:0}10%{opacity:.5}90%{opacity:.3}100%{transform:translateY(-100px);opacity:0} }
        .lx-particle { position:fixed;border-radius:50%;pointer-events:none;z-index:0; }
        ${[...Array(16)].map((_,i) => `
          .lx-particle--${i} {
            left: ${(i * 6.4 + 3)}%;
            bottom: -8px;
            width: ${1 + (i % 3) * 0.5}px;
            height: ${1 + (i % 3) * 0.5}px;
            background: hsl(${200 + (i * 11) % 100}, 70%, 70%);
            opacity: ${0.1 + (i % 4) * 0.1};
            animation: particle-rise ${12 + (i * 1.3)}s linear infinite ${-i * 2.1}s;
          }
        `).join('')}

        /* ── LAYOUT */
        .lx-layout {
          display: grid; grid-template-columns: 1fr 1fr;
          min-height: 100vh; position: relative; z-index: 1;
        }


        /* ── LEFT PANEL */
        .lx-panel--left {
          background: linear-gradient(160deg, rgba(255,255,255,0.07) 0%, rgba(6,6,14,0.95) 60%);
          border-right: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          padding: 80px 60px; position: relative; overflow: hidden;
          opacity: 1;
        }

        .lx-panel__content { display: flex; flex-direction: column; gap: 60px; max-width: 380px; width: 100%; }

        .lx-brand-art { position: relative; width: 120px; height: 120px; }
        .lx-brand-art__rings { position: absolute; inset: 0; }

        @keyframes ring-spin-0 { to{transform:rotate(360deg)} }
        @keyframes ring-spin-1 { to{transform:rotate(-360deg)} }
        @keyframes ring-spin-2 { to{transform:rotate(180deg)} }
        @keyframes ring-spin-3 { to{transform:rotate(-180deg)} }

        .lx-ring {
          position: absolute; border-radius: 50%;
          border-style: solid;
        }
        .lx-ring--0 { inset:0;border-width:1px;border-color:rgba(255,255,255,0.3) transparent transparent transparent;animation:ring-spin-0 4s linear infinite; }
        .lx-ring--1 { inset:12px;border-width:1px;border-color:transparent rgba(120,75,160,0.4) transparent transparent;animation:ring-spin-1 6s linear infinite; }
        .lx-ring--2 { inset:24px;border-width:1px;border-color:rgba(43,134,197,0.3) transparent rgba(43,134,197,0.3) transparent;animation:ring-spin-2 3s linear infinite; }
        .lx-ring--3 { inset:36px;border-width:1.5px;border-color:transparent rgba(255,255,255,0.5) transparent transparent;animation:ring-spin-3 8s linear infinite; }

        .lx-brand-art__core {
          position: absolute; inset: 44px;
          background: var(--grad);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 30px rgba(255,255,255,0.4);
        }

        .lx-panel__overline { font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:var(--p);margin-bottom:16px; }
        .lx-panel__headline {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 60px; line-height: 0.95; letter-spacing: 0.02em;
          color: var(--fg);
        }
        .lx-panel__headline span { background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .lx-panel__body { font-size:15px;font-weight:300;color:var(--muted);line-height:1.7;margin-top:20px; }

        .lx-panel__stats { display: flex; flex-direction: column; gap: 1px; }

        @keyframes pstat-in { from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:none} }

        .lx-pstat {
          display: flex; align-items: baseline; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid var(--border);
          animation: pstat-in 0.5s ease calc(0.6s + var(--pi) * 0.1s) both;
        }
        .lx-pstat:last-child { border-bottom: none; }
        .lx-pstat__val { font-family:'Bebas Neue',sans-serif;font-size:36px;letter-spacing:0.04em;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;min-width:70px; }
        .lx-pstat__label { font-size:12px;font-weight:400;color:var(--muted);letter-spacing:0.06em;text-transform:uppercase; }

        /* ── RIGHT PANEL */
        .lx-panel--right {
          display: flex; align-items: center; justify-content: center;
          padding: 60px 48px; opacity: 1;
        }

        .lx-form-wrap { width: 100%; max-width: 420px; }
        .lx-form-wrap__inner { display: flex; flex-direction: column; gap: 0; }

        .lx-logo { display:flex;align-items:center;gap:12px;margin-bottom:52px; }
        @keyframes logo-spin { to{transform:rotate(360deg)} }
        .lx-logo__mark {
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--grad); animation: logo-spin 8s linear infinite;
          box-shadow: 0 0 20px rgba(255,255,255,0.4);
          position: relative;
        }
        .lx-logo__mark::after {
          content: ''; position: absolute; inset: 6px; border-radius: 50%;
          background: var(--bg);
        }
        .lx-logo__mark::before {
          content: ''; position: absolute; inset: 10px; border-radius: 50%;
          background: var(--grad); z-index: 1;
        }
        .lx-logo__name { font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:0.1em;color:var(--fg); }

        .lx-heading { margin-bottom: 48px; }
        .lx-heading__title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 64px; letter-spacing: 0.02em; line-height: 0.9;
          color: var(--fg); margin-bottom: 14px;
        }
        .lx-heading__title em { font-style:normal;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text; }
        .lx-heading__sub { font-size:14px;font-weight:400;color:var(--muted);letter-spacing:0.02em; }

        /* ── FIELDS */
        .lx-form { display: flex; flex-direction: column; }

        .lx-field { margin-bottom: 28px; }
        .lx-field__label { display:block;font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:500;letter-spacing:0.14em;text-transform:uppercase;color:var(--muted);margin-bottom:10px;transition:color 0.2s; }
        .lx-field--focused .lx-field__label { color:var(--p); }

        .lx-field__inner { position:relative; }
        .lx-field__input {
          width:100%;padding:16px 48px 16px 20px;
          background:rgba(255,255,255,0.02);
          border:none;border-radius:4px;
          font-size:15px;color:var(--fg);
          font-family:'Epilogue',sans-serif;font-weight:400;
          outline:none;letter-spacing:0.01em;
          transition:background 0.2s;
        }
        .lx-field__input::placeholder { color:rgba(255,255,255,0.15);font-weight:300; }
        .lx-field__input:-webkit-autofill { -webkit-box-shadow:0 0 0 100px #08071a inset;-webkit-text-fill-color:var(--fg); }
        .lx-field--focused .lx-field__input { background:rgba(255,255,255,0.04); }

        .lx-field__border {
          position:absolute;inset:0;border-radius:4px;pointer-events:none;
          border:1px solid rgba(255,255,255,0.07);transition:border-color 0.2s;
        }
        .lx-field--focused .lx-field__border { border-color:rgba(255,255,255,0.4); }
        .lx-field__glow {
          position:absolute;inset:0;border-radius:4px;pointer-events:none;
          box-shadow:0 0 0 0 rgba(255,255,255,0);transition:box-shadow 0.3s;
        }
        .lx-field--focused .lx-field__glow { box-shadow:0 0 0 4px rgba(255,255,255,0.08),0 0 30px rgba(255,255,255,0.08); }

        .lx-field__icon { position:absolute;right:18px;top:50%;transform:translateY(-50%);color:var(--muted);opacity:0.5;pointer-events:none; }
        .lx-field__toggle { position:absolute;right:18px;top:50%;transform:translateY(-50%);background:none;border:none;color:var(--muted);opacity:0.5;cursor:pointer;padding:0;display:flex;transition:opacity 0.2s; }
        .lx-field__toggle:hover { opacity:1; }

        .lx-meta { display:flex;justify-content:flex-end;margin-bottom:32px; }
        .lx-forgot { font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted);text-decoration:none;letter-spacing:0.08em;transition:color 0.2s; }
        .lx-forgot:hover { color:var(--p); }

        /* ── SUBMIT */
        .lx-submit {
          position:relative;width:100%;padding:18px 0;
          background:var(--grad);border:none;border-radius:4px;
          color:#05050d;font-family:'Bebas Neue',sans-serif;font-size:20px;
          letter-spacing:0.12em;cursor:pointer;overflow:hidden;
          box-shadow:0 8px 40px rgba(255,255,255,0.3);
          transition:transform 0.2s,box-shadow 0.3s;
          margin-bottom:32px;
        }
        .lx-submit:hover { transform:translateY(-2px);box-shadow:0 20px 60px rgba(255,255,255,0.5); }
        .lx-submit__text { position:relative;z-index:2; }
        .lx-submit__noise { position:absolute;inset:0;opacity:0.06;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");background-size:120px; }
        @keyframes submit-shine { from{transform:skewX(-20deg) translateX(-200%)}to{transform:skewX(-20deg) translateX(300%)} }
        .lx-submit__shine { position:absolute;top:0;bottom:0;width:50%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);pointer-events:none; }
        .lx-submit:hover .lx-submit__shine { animation:submit-shine 0.5s ease forwards; }
        .lx-submit__corners { position:absolute;inset:0;pointer-events:none;z-index:3; }
        .lx-submit__corner { position:absolute;width:8px;height:8px; }
        .lx-submit__corner--tl { top:4px;left:4px;border-top:1px solid rgba(255,255,255,0.4);border-left:1px solid rgba(255,255,255,0.4); }
        .lx-submit__corner--tr { top:4px;right:4px;border-top:1px solid rgba(255,255,255,0.4);border-right:1px solid rgba(255,255,255,0.4); }
        .lx-submit__corner--bl { bottom:4px;left:4px;border-bottom:1px solid rgba(255,255,255,0.4);border-left:1px solid rgba(255,255,255,0.4); }
        .lx-submit__corner--br { bottom:4px;right:4px;border-bottom:1px solid rgba(255,255,255,0.4);border-right:1px solid rgba(255,255,255,0.4); }

        .lx-divider { display:flex;align-items:center;gap:16px;margin-bottom:24px; }
        .lx-divider__line { flex:1;height:1px;background:var(--border); }
        .lx-divider__text { font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--muted);letter-spacing:0.1em;text-transform:uppercase;white-space:nowrap; }

        .lx-social { display:flex;width:100%;margin-bottom:32px; }
        .lx-social-btn { width:100%;text-decoration:none;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:4px;color:var(--fg);font-size:13px;font-weight:500;cursor:pointer;font-family:'Epilogue',sans-serif;letter-spacing:0.04em;transition:all 0.2s; }
        .lx-social-btn:hover { border-color:rgba(255,255,255,0.3);color:var(--fg);background:rgba(255,255,255,0.04); }

        .lx-switch { text-align:center;font-size:13px;color:var(--muted); }
        .lx-switch__link { color:var(--p);text-decoration:none;font-weight:500;transition:color 0.2s; }
        .lx-switch__link:hover { color:var(--fg); }

        /* ── RESPONSIVE */
        @media (max-width: 900px) {
          .lx-layout { grid-template-columns: 1fr; }
          .lx-panel--left { display: none; }
          .lx-panel--right { padding: 60px 32px; }
        }
      `}</style>
    </div>
  )
}

export default Login