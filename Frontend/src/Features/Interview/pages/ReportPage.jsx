import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useInterview from "../hooks/useInterview";
import useAuth from '../../Auth/hooks/useAuth'

/* ═══════════════════════════════════════════════════════════════
   REPORTS LIST PAGE — same design system as Interview + Report
   Fonts: Clash Display · Cabinet Grotesk · DM Mono · Bebas Neue
   Accent: #ff6b35 electric orange
   Features: cursor glow · grid bg · noise · marquee · stagger
═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --void:    #05050d;
  --surface: #05050d;
  --lift:    #05050d;
  --raise:   #05050d;
  --stroke:  rgba(255,255,255,.12);
  --strokeh: rgba(255,255,255,.3);
  --fg:      #ededf5;
  --muted:   #4a4862;
  --dim:     #16141f;
  --ghost:   rgba(255,255,255,.04);

  --acid:    #ffffff;
  --acidh:   #cccccc;
  --acidd:   #aaaaaa;
  --green:   #ffffff;
  --yellow:  #ffffff;
  --red:     #ffffff;

  --disp:   'Bebas Neue', sans-serif;
  --body:   'Inter', sans-serif;
  --mono:   'Inter', sans-serif;
  --accent: 'Bebas Neue', sans-serif;
  --ease:   cubic-bezier(.4,0,.2,1);
  --spring: cubic-bezier(.34,1.56,.64,1);
  --expo:   cubic-bezier(.76,0,.24,1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body, #root { background: var(--void); color: var(--fg); font-family: var(--body); -webkit-font-smoothing: antialiased; }

/* cursor glow */
.rps-cursor {
  position: fixed; z-index: 9999; pointer-events: none;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%);
  transform: translate(-50%,-50%);
}

/* root */
.rps { min-height: 100vh; background: var(--void); display: flex; flex-direction: column; position: relative; overflow-x: hidden; }

/* grain */
.rps::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 220px;
}

/* grid bg */
.rps-grid-bg {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image: linear-gradient(var(--stroke) 1px, transparent 1px), linear-gradient(90deg, var(--stroke) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 120% 120% at 50% 0%, black 40%, transparent 100%);
}

/* deco */
.rps-deco {
  position: fixed; bottom: -40px; right: -15px;
  font-family: var(--accent); font-size: 220px; line-height: 1;
  color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.04);
  pointer-events: none; z-index: 0; user-select: none;
}

/* ── NAV ── */
.rps-bar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  height: 58px; padding: 0 40px;
  border-bottom: 1px solid var(--stroke);
  background: rgba(6,6,8,.78);
  backdrop-filter: blur(24px) saturate(160%);
}
.rps-bar__logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }
.rps-bar__mark {
  width: 26px; height: 26px; border: 1.5px solid var(--acid);
  display: flex; align-items: center; justify-content: center;
  transform: rotate(45deg); position: relative;
}
.rps-bar__mark::after { content: ''; position: absolute; width: 8px; height: 8px; background: var(--acid); }
.rps-bar__wordmark { font-family: var(--disp); font-size: 17px; font-weight: 600; letter-spacing: -.02em; color: var(--fg); }
.rps-bar__wordmark em { font-style: normal; color: var(--acid); }
.rps-bar__crumb { display: flex; align-items: center; gap: 8px; font-family: var(--mono); font-size: 10px; letter-spacing: .12em; text-transform: uppercase; color: var(--dim); }
.rps-bar__crumb-link { cursor: pointer; color: var(--muted); transition: color .2s; }
.rps-bar__crumb-link:hover { color: var(--fg); }
.rps-bar__crumb-sep { opacity: .3; }
.rps-bar__crumb-active { color: var(--acid); }
.rps-bar__right { display: flex; align-items: center; gap: 12px; position: relative; }
.rps-bar__name { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: .08em; }
.rps-bar__avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--acid); color: var(--void); border: none; cursor: pointer;
  font-family: var(--disp); font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s var(--spring), box-shadow .2s;
}
.rps-bar__avatar:hover { transform: scale(1.1); box-shadow: 0 0 20px rgba(255,255,255,.35); }

/* dropdown */
.rps-menu {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 236px; background: var(--raise); border: 1px solid var(--stroke);
  box-shadow: 0 32px 64px rgba(0,0,0,.6);
  z-index: 100; opacity: 0; transform: translateY(-10px) scale(.97);
  pointer-events: none; transition: opacity .2s var(--ease), transform .2s var(--ease);
}
.rps-menu::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--acid), transparent); opacity: .6; }
.rps-menu--open { opacity: 1; transform: none; pointer-events: auto; }
.rps-menu__header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px; }
.rps-menu__avatar { width: 32px; height: 32px; border-radius: 50%; background: var(--acid); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-family: var(--disp); font-size: 13px; font-weight: 700; color: var(--void); }
.rps-menu__name  { font-family: var(--disp); font-size: 13px; font-weight: 600; color: var(--fg); }
.rps-menu__email { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: .04em; margin-top: 1px; }
.rps-menu__divider { height: 1px; background: var(--stroke); margin: 0 10px; }
.rps-menu__section { padding: 4px; display: flex; flex-direction: column; gap: 1px; }
.rps-menu__item { display: flex; align-items: center; gap: 9px; padding: 8px 10px; border: none; background: transparent; color: var(--muted); font-family: var(--body); font-size: 12px; cursor: pointer; text-align: left; width: 100%; border-radius: 3px; transition: all .15s var(--ease); }
.rps-menu__item svg { flex-shrink: 0; opacity: .4; transition: opacity .15s; }
.rps-menu__item:hover { background: var(--ghost); color: var(--fg); }
.rps-menu__item:hover svg { opacity: 1; }
.rps-menu__item--danger { color: rgba(255,77,77,.7); }
.rps-menu__item--danger:hover { background: rgba(255,77,77,.06); color: var(--red); }

/* ── MARQUEE ── */
.rps-marquee-wrap {
  position: relative; z-index: 2;
  border-top: 1px solid var(--stroke); border-bottom: 1px solid var(--stroke);
  background: var(--surface); overflow: hidden;
  height: 34px; display: flex; align-items: center;
}
.rps-marquee { display: flex; animation: marquee 24s linear infinite; white-space: nowrap; }
.rps-marquee__item { display: flex; align-items: center; gap: 14px; padding: 0 28px; font-family: var(--mono); font-size: 9px; letter-spacing: .18em; text-transform: uppercase; color: var(--dim); flex-shrink: 0; }
.rps-marquee__dot { width: 3px; height: 3px; border-radius: 50%; background: var(--acid); flex-shrink: 0; }
.rps-marquee__hot { color: var(--acid); }
@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* ── HERO ── */
.rps-hero {
  position: relative; z-index: 2;
  padding: 60px 40px 44px;
  display: grid; grid-template-columns: 1fr auto;
  gap: 0 60px; align-items: end;
  animation: fadeUp .6s var(--expo) both; animation-delay: .05s;
}
.rps-hero__left {}
.rps-hero__kicker { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.rps-hero__kicker-tag { font-family: var(--mono); font-size: 9px; letter-spacing: .22em; text-transform: uppercase; color: var(--void); background: var(--acid); padding: 3px 8px; font-weight: 500; }
.rps-hero__kicker-text { font-family: var(--mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--dim); }

.rps-hero__h1 { font-family: var(--disp); font-size: clamp(48px, 6vw, 84px); font-weight: 700; letter-spacing: -.04em; line-height: .92; color: var(--fg); margin-bottom: 22px; }
.rps-hero__h1-outline { display: block; -webkit-text-stroke: 1.5px rgba(240,239,245,.2); color: transparent; font-size: clamp(52px, 6.5vw, 92px); letter-spacing: -.05em; line-height: .88; }
.rps-hero__h1-solid { display: block; color: var(--fg); }
.rps-hero__h1-em { display: block; color: var(--acid); }

.rps-hero__sub { font-size: 14px; font-weight: 300; color: var(--muted); line-height: 1.8; max-width: 460px; }

/* hero right — stat tower */
.rps-hero__right { display: flex; flex-direction: column; gap: 0; padding-bottom: 6px; animation: fadeUp .7s var(--expo) both; animation-delay: .15s; }
.rps-hero__counter { padding: 16px 22px; border: 1px solid var(--stroke); border-bottom: none; background: var(--surface); position: relative; overflow: hidden; cursor: default; }
.rps-hero__counter:last-child { border-bottom: 1px solid var(--stroke); }
.rps-hero__counter::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: var(--acid); opacity: 0; transition: opacity .3s; }
.rps-hero__counter:hover::before { opacity: 1; }
.rps-hero__counter-n { font-family: var(--accent); font-size: 36px; line-height: 1; color: var(--fg); display: flex; align-items: flex-end; gap: 2px; }
.rps-hero__counter-n sup { font-family: var(--disp); font-size: 13px; font-weight: 600; color: var(--acid); margin-bottom: 6px; }
.rps-hero__counter-label { font-family: var(--mono); font-size: 13px; text-transform: uppercase; letter-spacing: .08em; color: rgba(255,255,255,.5); margin-top: 3px; }

/* ── NEW ANALYSIS BUTTON ── */
.rps-new-btn {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 13px 28px; margin-top: 28px; align-self: flex-start;
  background: var(--acid); color: var(--void);
  border: none; cursor: pointer;
  font-family: var(--disp); font-size: 22px; font-weight: 500; letter-spacing: .02em;
  position: relative; overflow: hidden; transition: all .3s var(--ease);
  clip-path: polygon(0 0,100% 0,100% 72%,96% 100%,0 100%);
}
.rps-new-btn::before { content: ''; position: absolute; top: 0; left: -100%; width: 60%; height: 100%; z-index: 1; background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent); transform: skewX(-20deg); transition: left .5s var(--ease); }
.rps-new-btn:hover::before { left: 150%; }
.rps-new-btn:hover { background: var(--acidh); box-shadow: 0 0 36px rgba(255,255,255,.3); transform: translateY(-2px); }
.rps-new-btn span { position: relative; z-index: 2; display: flex; align-items: center; gap: 8px; }
.rps-new-btn svg { transition: transform .2s; }
.rps-new-btn:hover svg { transform: translateX(3px); }

/* ── STATS ROW ── */
.rps-stats {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: repeat(4, 1fr);
  margin: 0 40px;
  border: 1px solid var(--stroke); border-bottom: none;
  background: var(--surface);
  animation: fadeUp .6s var(--expo) both; animation-delay: .2s;
}
.rps-stat {
  display: flex; flex-direction: column; gap: 5px;
  padding: 22px 26px; border-right: 1px solid var(--stroke);
  position: relative; overflow: hidden;
}
.rps-stat:last-child { border-right: none; }
.rps-stat::after { content: ''; position: absolute; top: 0; left: 0; right: 100%; height: 1px; background: var(--acid); transition: right .35s var(--ease); }
.rps-stat:hover::after { right: 0; }
.rps-stat__val { font-family: var(--accent); font-size: 48px; font-weight: 400; letter-spacing: .02em; line-height: 1; color: var(--fg); }
.rps-stat__label { font-family: var(--mono); font-size: 12px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }

/* ── REPORTS GRID ── */
.rps-grid {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  margin: 0 40px 60px;
  border: 1px solid var(--stroke);
  animation: fadeUp .6s var(--expo) both; animation-delay: .28s;
}

/* ── REPORT CARD ── */
.rps-card {
  display: flex; flex-direction: column;
  padding: 26px 26px 22px;
  border-right: 1px solid var(--stroke);
  border-bottom: 1px solid var(--stroke);
  background: var(--surface);
  position: relative; overflow: hidden;
  transition: background .25s var(--ease);
  animation: cardIn .4s var(--ease) calc(var(--ci) * .06s) both;
}
.rps-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, var(--cc, var(--acid)), transparent); opacity: 0; transition: opacity .25s; }
.rps-card:hover { background: rgba(255,255,255,.02); }
.rps-card:hover::before { opacity: .6; }
.rps-card:hover .rps-card__glow { opacity: 1; }
.rps-card:hover .rps-card__cta { opacity: 1; transform: translateY(0); }

.rps-card__glow { position: absolute; top: -40px; left: -40px; width: 150px; height: 150px; border-radius: 50%; background: var(--cc, var(--acid)); filter: blur(48px); opacity: 0; transition: opacity .3s var(--ease); pointer-events: none; }

.rps-card__top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.rps-card__score { display: flex; align-items: baseline; gap: 2px; }
.rps-card__score-num { font-family: var(--accent); font-size: 60px; line-height: 1; color: var(--cc, var(--acid)); letter-spacing: .02em; }
.rps-card__score-den { font-family: var(--mono); font-size: 15px; color: var(--muted); }
.rps-card__badge { font-family: var(--mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--cc, var(--acid)); border: 1px solid var(--cc, var(--acid)); padding: 3px 9px; opacity: .8; margin-top: 6px; }

.rps-card__body { flex: 1; margin-bottom: 14px; }
.rps-card__company { font-family: var(--mono); font-size: 13px; letter-spacing: .12em; text-transform: uppercase; color: var(--acid); margin-bottom: 6px; opacity: .7; }
.rps-card__title { font-family: var(--disp); font-size: 32px; font-weight: 500; letter-spacing: .02em; color: var(--fg); line-height: 1.1; margin-bottom: 7px; }
.rps-card__date { font-family: var(--mono); font-size: 14px; color: rgba(255,255,255,.5); letter-spacing: .04em; }

.rps-card__bar { height: 1.5px; background: var(--stroke); overflow: hidden; margin-bottom: 16px; }
.rps-card__bar-fill { height: 100%; background: var(--cc, var(--acid)); opacity: .6; animation: barGrow .8s var(--ease) calc(var(--ci) * .06s + .2s) both; }

.rps-card__chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 18px; }
.rps-card__chip { display: inline-flex; align-items: center; gap: 5px; font-family: var(--mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--dim); border: 1px solid var(--stroke); padding: 3px 8px; }
.rps-card__chip svg { flex-shrink: 0; }
.rps-card__chip--gap { color: rgba(255,77,77,.55); border-color: rgba(255,77,77,.18); }

.rps-card__cta { display: inline-flex; align-items: center; gap: 7px; align-self: flex-start; font-family: var(--disp); font-size: 22px; font-weight: 500; color: var(--void); background: var(--acid); border: none; padding: 10px 20px; cursor: pointer; opacity: 0; transform: translateY(5px); transition: opacity .2s var(--ease), transform .2s var(--ease), background .15s; letter-spacing: .02em; }
.rps-card__cta:hover { background: var(--acidh); }

/* ── NEW CARD ── */
.rps-card--new {
  border: 1px dashed rgba(255,255,255,.3); background: rgba(255,255,255,.04);
  cursor: pointer; min-height: 220px;
  transition: all .25s var(--ease);
}
.rps-card--new:hover { background: rgba(255,255,255,.08); border-color: rgba(255,255,255,.6); }
.rps-card--new:hover::before { opacity: .4; }
.rps-card--new:hover .rps-card__new-icon { border-color: var(--acid); color: var(--acid); }
.rps-card--new:hover .rps-card__new-label { color: var(--fg); }

.rps-card--new::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: var(--acid); opacity: 0; transition: opacity .25s;
}

.rps-card--new::after {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(-45deg, transparent 0, transparent 5px, rgba(255,255,255,.012) 5px, rgba(255,255,255,.012) 6px);
}

.rps-card__new-inner { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; height: 100%; padding: 40px; text-align: center; }
.rps-card__new-icon { width: 50px; height: 50px; border: 1px solid var(--stroke); background: var(--lift); display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .25s; }
.rps-card__new-label { font-family: var(--disp); font-size: 28px; font-weight: 500; color: rgba(255,255,255,.7); transition: color .2s; letter-spacing: .02em; }
.rps-card__new-hint { font-family: var(--mono); font-size: 14px; color: rgba(255,255,255,.4); letter-spacing: .06em; }

/* ── EMPTY STATE ── */
.rps-empty {
  position: relative; z-index: 2;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 40px; gap: 16px; text-align: center;
  margin: 0 40px; border: 1px solid var(--stroke); border-top: none;
  background: var(--surface);
}
.rps-empty__icon { width: 56px; height: 56px; border: 1px solid var(--stroke); background: var(--lift); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,.4); margin-bottom: 8px; }
.rps-empty__title { font-family: var(--disp); font-size: 36px; font-weight: 500; color: var(--fg); letter-spacing: .02em; }
.rps-empty__sub { font-family: var(--mono); font-size: 15px; color: rgba(255,255,255,.5); letter-spacing: .04em; }

/* ── ANIMATIONS ── */
@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cardIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
@keyframes barGrow { from { width: 0 !important; } }

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .rps-bar, .rps-hero, .rps-stats, .rps-grid, .rps-empty { padding-left: 22px; padding-right: 22px; }
  .rps-stats, .rps-grid, .rps-empty { margin-left: 22px; margin-right: 22px; }
  .rps-stats { grid-template-columns: repeat(2, 1fr); }
  .rps-grid  { grid-template-columns: 1fr 1fr; }
  .rps-hero  { grid-template-columns: 1fr; padding-top: 40px; }
  .rps-hero__right { flex-direction: row; gap: 1px; }
  .rps-hero__counter { flex: 1; }
  .rps-bar__crumb, .rps-bar__name { display: none; }
  .rps-deco { display: none; }
}
@media (max-width: 560px) {
  .rps-grid  { grid-template-columns: 1fr; }
}
`;

const scoreColor = (s) => s >= 85 ? "#34d399" : s >= 65 ? "#fbbf24" : "#ff4d4d";
const scoreLabel = (s) => s >= 85 ? "Strong" : s >= 65 ? "Good" : "Needs Work";
const fmtDate = (iso) => new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

export default function ReportsPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cursorRef = useRef(null);
  const navigate = useNavigate();
  const { allreports, handleReports } = useInterview();
  const { user, handleLogout } = useAuth()

  const nav = (p) => navigate(p);

  const onSignOut = async () => {
    try {
      await handleLogout();
      nav('/login');
    } catch (e) {
      console.log(e);
    }
  }


  /* cursor glow */
  useEffect(() => {
    const move = (e) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = e.clientX + "px";
      cursorRef.current.style.top = e.clientY + "px";
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => window.removeEventListener("mousemove", move);
  }, []);

  /* click-outside */
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* inject CSS */
  useEffect(() => {
    const id = "rps-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  /* fetch */
  useEffect(() => { handleReports(); }, []);

  const avgScore = allreports?.length
    ? Math.round(allreports.reduce((a, r) => a + r.score, 0) / allreports.length)
    : 0;

  const marqueeItems = [
    { text: "Your Reports", hot: true },
    { text: "Fit Score Analysis" },
    { text: "Gap Tracking", hot: true },
    { text: "Prep History" },
    { text: "FAANG Ready", hot: true },
    { text: "AI-Powered" },
    { text: "Staff-Level Prep", hot: true },
    { text: "Interview Intel" },
  ];

  const menuItems = [
    { icon: <DocI />, label: "New Analysis", onClick: () => { nav("/interview"); setMenuOpen(false); } },
    { icon: <GridI />, label: "Reports", onClick: () => { nav("/reports"); setMenuOpen(false); } },
    { icon: <PersonI />, label: "Profile", onClick: () => setMenuOpen(false) },
    { icon: <GearI />, label: "Settings", onClick: () => setMenuOpen(false) },
  ];



  return (
    <div className="rps">
      <div ref={cursorRef} className="rps-cursor" />
      <div className="rps-grid-bg" />
      <div className="rps-deco">IQ</div>

      {/* ── NAV ── */}
      <header className="rps-bar">
        <div className="rps-bar__logo" onClick={() => nav("/reports")}>
          <div className="rps-bar__mark" />
          <span className="rps-bar__wordmark">Prep<em>IQ</em></span>
        </div>
        <div className="rps-bar__crumb">
          <span className="rps-bar__crumb-link" onClick={() => nav("/")}>New Analysis</span>
          <span className="rps-bar__crumb-sep">/</span>
          <span className="rps-bar__crumb-active">Reports</span>
        </div>
        <div className="rps-bar__right" ref={menuRef}>
          <span className="rps-bar__name">{user.username}</span>
          <button className="rps-bar__avatar" onClick={() => setMenuOpen(v => !v)}>A</button>
          <div className={`rps-menu${menuOpen ? " rps-menu--open" : ""}`}>
            <div className="rps-menu__header">
              <div className="rps-menu__avatar">A</div>
              <div>
                <p className="rps-menu__name">{user.username}</p>
                <p className="rps-menu__email">{user.email}</p>
              </div>
            </div>
            <div className="rps-menu__divider" />
            <div className="rps-menu__section">
              {menuItems.map((it, i) => (
                <button key={i} className="rps-menu__item" onClick={it.onClick}>
                  {it.icon}{it.label}
                </button>
              ))}
            </div>
            <div className="rps-menu__divider" />
            <div className="rps-menu__section">
              <button className="rps-menu__item" onClick={() => setMenuOpen(false)}><HelpI />Help & Support</button>
              <button className="rps-menu__item rps-menu__item--danger" onClick={onSignOut}><ExitI />Sign out</button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div className="rps-marquee-wrap">
        <div className="rps-marquee">
          {[...marqueeItems, ...marqueeItems].map((it, i) => (
            <span key={i} className="rps-marquee__item">
              <span className="rps-marquee__dot" />
              <span className={it.hot ? "rps-marquee__hot" : ""}>{it.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="rps-hero">
        <div className="rps-hero__left">
          <div className="rps-hero__kicker">
            <span className="rps-hero__kicker-tag">Dashboard</span>
            <span className="rps-hero__kicker-text">Your analysis history</span>
          </div>
          <h1 className="rps-hero__h1">
            <span className="rps-hero__h1-outline">ALL</span>
            <span className="rps-hero__h1-solid">your</span>
            <span className="rps-hero__h1-em">reports.</span>
          </h1>
          <p className="rps-hero__sub">
            Every generated interview plan in one place. Click any card to review gaps, questions, and your prep plan.
          </p>
          <button className="rps-new-btn" onClick={() => nav("/interview")}>
            <span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New Analysis
            </span>
          </button>
        </div>

        <div className="rps-hero__right">
          {[
            { n: allreports?.length ?? 0, sup: "", label: "Total Reports" },
            { n: avgScore, sup: "", label: "Avg. Fit Score" },
            { n: allreports?.filter(r => r.score >= 85).length ?? 0, sup: "", label: "Strong Matches" },
          ].map((s, i) => (
            <div key={i} className="rps-hero__counter">
              <div className="rps-hero__counter-n">{s.n}<sup>{s.sup}</sup></div>
              <div className="rps-hero__counter-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── STATS ROW ── */}
      <div className="rps-stats">
        {[
          { val: allreports?.length ?? 0, label: "Total Reports" },
          { val: avgScore, label: "Avg. Fit Score" },
          { val: allreports?.filter(r => r.score >= 85).length ?? 0, label: "Strong Matches" },
          { val: allreports?.reduce((a, r) => a + (r.skillGap?.length ?? 0), 0) ?? 0, label: "Gaps Identified" },
        ].map((s, i) => (
          <div key={i} className="rps-stat">
            <span className="rps-stat__val">{s.val}</span>
            <span className="rps-stat__label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── GRID ── */}
      {(!allreports || allreports.length === 0) ? (
        <div className="rps-empty">
          <div className="rps-empty__icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.3" />
              <path d="M7 11h8M7 7h5M7 15h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <p className="rps-empty__title">No reports yet</p>
          <p className="rps-empty__sub">Generate your first interview plan to see it here</p>
          <button className="rps-new-btn" style={{ marginTop: 16 }} onClick={() => nav("/interview")}>
            <span>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Start First Analysis
            </span>
          </button>
        </div>
      ) : (
        <div className="rps-grid">
          {allreports.map((r, i) => {
            const cc = scoreColor(r.score);
            return (
              <div key={r._id} className="rps-card" style={{ "--ci": i, "--cc": cc }}>
                <div className="rps-card__glow" style={{ background: cc }} />
                <div className="rps-card__top">
                  <div className="rps-card__score" style={{ "--cc": cc }}>
                    <span className="rps-card__score-num">{r.score}</span>
                    <span className="rps-card__score-den">/100</span>
                  </div>
                  <span className="rps-card__badge" style={{ "--cc": cc }}>{scoreLabel(r.score)}</span>
                </div>
                <div className="rps-card__body">
                  <p className="rps-card__company">{r.company || "Unknown Company"}</p>
                  <h3 className="rps-card__title">{r.title}</h3>
                  <p className="rps-card__date">{fmtDate(r.createdAt)}</p>
                </div>
                <div className="rps-card__bar">
                  <div className="rps-card__bar-fill" style={{ width: `${r.score}%`, "--cc": cc }} />
                </div>
                <div className="rps-card__chips">
                  <span className="rps-card__chip">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1 5h8M5 1l4 4-4 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {r.technicalQuestions?.length ?? 0} Technical
                  </span>
                  <span className="rps-card__chip">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><path d="M1.5 2.5h7M1.5 5h5M1.5 7.5h6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>
                    {r.behavioralQuestions?.length ?? 0} Behavioral
                  </span>
                  <span className="rps-card__chip rps-card__chip--gap">
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><circle cx="5" cy="5" r="4" stroke="currentColor" strokeWidth="1.1" /><path d="M5 3v2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /><circle cx="5" cy="7" r=".5" fill="currentColor" /></svg>
                    {r.skillGap?.length ?? 0} Gaps
                  </span>
                </div>
                <button className="rps-card__cta" onClick={() => nav(`/report/${r._id}`)}>
                  View Report
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6.5 2.5l4 3.5-4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            );
          })}

          {/* new card slot */}
          <div className="rps-card rps-card--new" onClick={() => nav("/interview")}>
            <div className="rps-card__new-inner">
              <div className="rps-card__new-icon">
                <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                  <path d="M11 4v14M4 11h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <p className="rps-card__new-label">Start New Analysis</p>
              <p className="rps-card__new-hint">Add a job description + resume</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Icons ── */
const GridI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /><rect x="7.5" y="1" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /><rect x="1" y="7.5" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /><rect x="7.5" y="7.5" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /></svg>;
const DocI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h9v9H2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" /><path d="M5 5h3M5 7h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const PersonI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1" /><path d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const GearI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1" /><path d="M6.5 1v1.5M6.5 10.5V12M12 6.5h-1.5M2.5 6.5H1M10.3 2.7l-1.06 1.06M3.76 9.24L2.7 10.3M10.3 10.3l-1.06-1.06M3.76 3.76L2.7 2.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const HelpI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" /><path d="M6.5 4v3M6.5 8.5v.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const ExitI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 4H10A1.5 1.5 0 0111.5 5.5v3A1.5 1.5 0 0110 10H8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><path d="M5 9L1.5 6.5 5 4M1.5 6.5H8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>;