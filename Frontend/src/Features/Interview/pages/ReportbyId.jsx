import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useInterview from "../hooks/useInterview";
import useAuth from "../../Auth/hooks/useAuth";

/* ═══════════════════════════════════════════════════════════════
   REPORT PAGE — matches InterviewPage design system exactly
   Fonts: Clash Display · Cabinet Grotesk · DM Mono · Bebas Neue
   Accent: #ff6b35 electric orange
   Features: cursor glow · grid bg · noise · stagger anims · tabs
═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --void:    #05050d;
  --surface: #0a0a14;
  --lift:    #0f0e1a;
  --raise:   #12111e;
  --stroke:  rgba(255,255,255,.1);
  --strokeh: rgba(255,107,53,.5);
  --fg:      #ededf5;
  --muted:   #6b6880;
  --dim:     #8886a0;
  --ghost:   rgba(255,255,255,.04);

  --acid:    #ff6b35;
  --acidh:   #ff8255;
  --acidd:   #cc4e1e;
  --red:     #ff4d6a;
  --green:   #34d399;
  --yellow:  #fbbf24;

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
body, #root {
  background: var(--void);
  color: var(--fg);
  font-family: var(--body);
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* ── RESUME DOWNLOAD BUTTON ── */

/* cursor glow */
.rp-cursor {
  position: fixed; z-index: 9999; pointer-events: none;
  width: 320px; height: 320px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,107,53,.09) 0%, transparent 70%);
  transform: translate(-50%,-50%);
  transition: left .08s, top .08s;
}

/* root */
.rp {
  min-height: 100vh;
  background: var(--void);
  display: flex; flex-direction: column;
  position: relative; overflow-x: hidden;
}

/* grain */
.rp::before {
  content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 220px;
}

/* grid */
.rp-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(var(--stroke) 1px, transparent 1px),
    linear-gradient(90deg, var(--stroke) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 120% 120% at 50% 0%, black 40%, transparent 100%);
}

/* huge deco */
.rp-deco {
  position: fixed; bottom: -40px; right: -15px;
  font-family: var(--accent); font-size: 220px; line-height: 1;
  color: transparent; -webkit-text-stroke: 1px rgba(255,255,255,.04);
  pointer-events: none; z-index: 0; user-select: none; letter-spacing: -.02em;
}

/* ── NAV ── */
.rp-bar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  height: 58px; padding: 0 40px;
  border-bottom: 1px solid var(--stroke);
  background: rgba(6,6,8,.78);
  backdrop-filter: blur(24px) saturate(160%);
}

.rp-bar__logo { display: flex; align-items: center; gap: 10px; cursor: pointer; }

.rp-bar__mark {
  width: 26px; height: 26px; border: 1.5px solid var(--acid);
  display: flex; align-items: center; justify-content: center;
  transform: rotate(45deg); position: relative;
  box-shadow: 0 0 12px rgba(255,107,53,.4);
}
.rp-bar__mark::after {
  content: ''; position: absolute; width: 8px; height: 8px; background: var(--acid);
}

.rp-bar__wordmark {
  font-family: var(--disp); font-size: 17px; font-weight: 600;
  letter-spacing: -.02em; color: var(--fg);
}
.rp-bar__wordmark em { font-style: normal; color: var(--acid); }

.rp-bar__crumb {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 10px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--dim);
}
.rp-bar__crumb-link { cursor: pointer; transition: color .2s; }
.rp-bar__crumb-link:hover { color: var(--fg); }
.rp-bar__crumb-sep { opacity: .3; }
.rp-bar__crumb-active { color: var(--acid); max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.rp-bar__right { display: flex; align-items: center; gap: 12px; position: relative; }
.rp-bar__name  { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: .08em; }

.rp-bar__avatar {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--acid); color: var(--void);
  border: none; cursor: pointer;
  font-family: var(--disp); font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  transition: transform .2s var(--spring), box-shadow .2s;
}
.rp-bar__avatar:hover { transform: scale(1.1); box-shadow: 0 0 20px rgba(255,107,53,.5); }

/* dropdown */
.rp-menu {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 236px; background: var(--raise);
  border: 1px solid var(--stroke);
  box-shadow: 0 32px 64px rgba(0,0,0,.6);
  z-index: 100; opacity: 0;
  transform: translateY(-10px) scale(.97); pointer-events: none;
  transition: opacity .2s var(--ease), transform .2s var(--ease);
}
.rp-menu::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--acid), transparent); opacity: .8;
}
.rp-menu--open { opacity: 1; transform: none; pointer-events: auto; }

.rp-menu__header { display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px; }
.rp-menu__avatar {
  width: 32px; height: 32px; border-radius: 50%; background: var(--acid); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--disp); font-size: 13px; font-weight: 700; color: var(--void);
}
.rp-menu__name  { font-family: var(--disp); font-size: 13px; font-weight: 600; color: var(--fg); }
.rp-menu__email { font-family: var(--mono); font-size: 10px; color: var(--muted); letter-spacing: .04em; margin-top: 1px; }
.rp-menu__divider { height: 1px; background: var(--stroke); margin: 0 10px; }
.rp-menu__section { padding: 4px; display: flex; flex-direction: column; gap: 1px; }
.rp-menu__item {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border: none; background: transparent;
  color: var(--muted); font-family: var(--body); font-size: 12px;
  cursor: pointer; text-align: left; width: 100%; border-radius: 3px;
  transition: all .15s var(--ease);
}
.rp-menu__item svg { flex-shrink: 0; opacity: .4; transition: opacity .15s; }
.rp-menu__item:hover { background: var(--ghost); color: var(--fg); }
.rp-menu__item:hover svg { opacity: 1; }
.rp-menu__item--danger { color: rgba(255,77,77,.7); }
.rp-menu__item--danger:hover { background: rgba(255,77,77,.06); color: var(--red); }

/* ── MARQUEE ── */
.rp-marquee-wrap {
  position: relative; z-index: 2;
  border-top: 1px solid var(--stroke); border-bottom: 1px solid var(--stroke);
  background: var(--surface); overflow: hidden;
  height: 34px; display: flex; align-items: center;
}
.rp-marquee {
  display: flex; animation: marquee 24s linear infinite; white-space: nowrap;
}
.rp-marquee__item {
  display: flex; align-items: center; gap: 14px; padding: 0 28px;
  font-family: var(--mono); font-size: 9px; letter-spacing: .18em;
  text-transform: uppercase; color: var(--dim); flex-shrink: 0;
}
.rp-marquee__dot { width: 3px; height: 3px; border-radius: 50%; background: var(--acid); flex-shrink: 0; }
.rp-marquee__hot { color: var(--acid); }
@keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

/* ── RESUME DOWNLOAD BUTTON ── */
.resume-download-button {
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; gap: 10px;
  padding: 11px 22px; margin-top: 16px; 
  border: 1px solid rgba(255,255,255,.45);
  background: transparent;
  color: var(--acid);
  font-family: var(--mono); font-size: 10px; letter-spacing: .16em; text-transform: uppercase;
  font-weight: 500; cursor: pointer;
  transition: color .25s var(--ease), border-color .25s var(--ease), background .25s var(--ease);
  white-space: nowrap;
}
.resume-download-button::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,.12) 0%, rgba(255,255,255,.04) 100%);
  opacity: 0; transition: opacity .25s var(--ease);
}
.resume-download-button::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 100%; height: 1.5px;
  background: var(--acid); transition: right .3s var(--ease);
}
.resume-download-button:hover { border-color: var(--acid); color: var(--fg); background: rgba(255,255,255,.06); }
.resume-download-button:hover::before { opacity: 1; }
.resume-download-button:hover::after { right: 0; }
.resume-download-button:active { transform: scale(.975); }
.resume-download-button svg { flex-shrink: 0; transition: transform .25s var(--spring); }
.resume-download-button:hover svg { transform: translateY(2px); }
.resume-download-button .btn-corner {
  position: absolute; top: -1px; right: -1px;
  width: 6px; height: 6px;
  border-top: 1.5px solid var(--acid); border-right: 1.5px solid var(--acid); opacity: .7;
}

/* ── HERO ── */
.rp-hero {
  position: relative; z-index: 2;
  padding: 40px 40px 0;
  animation: fadeUp .6s var(--expo) both; animation-delay: .05s;
}

.rp-back {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 9px; letter-spacing: .16em; text-transform: uppercase;
  color: var(--dim); background: transparent;
  border: 1px solid var(--stroke); padding: 7px 14px; cursor: pointer;
  margin-bottom: 32px; transition: all .2s var(--ease);
}
.rp-back:hover { color: var(--fg); border-color: var(--strokeh); background: var(--ghost); }

.rp-hero__row {
  display: grid; grid-template-columns: 1fr auto;
  gap: 40px; align-items: start;
  padding-bottom: 32px; border-bottom: 1px solid var(--stroke);
}

.rp-hero__kicker {
  display: flex; align-items: center; gap: 10px; margin-bottom: 16px;
}
.rp-hero__kicker-tag {
  font-family: var(--mono); font-size: 9px; letter-spacing: .22em; text-transform: uppercase;
  color: #fff; background: var(--acid); padding: 3px 8px; font-weight: 600;
  box-shadow: 0 0 16px rgba(255,107,53,.3);
}
.rp-hero__kicker-date {
  font-family: var(--mono); font-size: 10px; letter-spacing: .1em; color: var(--dim);
}

.rp-hero__title {
  font-family: var(--disp);
  font-size: clamp(48px, 5vw, 72px);
  font-weight: 500; letter-spacing: .02em; line-height: .95;
  color: var(--fg); margin-bottom: 14px;
}

.rp-hero__jd {
  font-size: 13px; font-weight: 300; color: var(--muted); line-height: 1.75;
  max-width: 600px; margin-bottom: 20px;
}

.rp-hero__pills { display: flex; flex-wrap: wrap; gap: 8px; }

.rp-pill {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 9px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--dim); border: 1px solid var(--stroke); padding: 4px 10px;
  background: var(--ghost); transition: border-color .2s, color .2s;
}
.rp-pill:hover { border-color: rgba(255,255,255,.3); color: var(--acid); }
.rp-pill svg { flex-shrink: 0; }

/* ── SCORE ARC ── */
.rp-arc {
  position: relative; width: 140px; height: 140px; flex-shrink: 0;
}
.rp-arc svg { width: 140px; height: 140px; }
.rp-arc__path { animation: arc-draw 1.4s var(--expo) .4s both; }
@keyframes arc-draw { from { stroke-dasharray: 0 9999; } }

.rp-arc__inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.rp-arc__num {
  font-family: var(--accent); font-size: 64px; line-height: 1; color: var(--acid);
  letter-spacing: .02em;
}
.rp-arc__den { font-family: var(--mono); font-size: 12px; color: var(--muted); margin-top: -2px; }
.rp-arc__label {
  font-family: var(--mono); font-size: 8px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--dim); margin-top: 3px;
}

/* ── SUBNAV ── */
.rp-subnav {
  position: sticky; top: 58px; z-index: 30;
  display: flex; padding: 0 40px;
  border-bottom: 1px solid var(--stroke);
  background: rgba(6,6,8,.85);
  backdrop-filter: blur(24px);
  overflow-x: auto;
  animation: fadeUp .5s var(--expo) both; animation-delay: .15s;
}
.rp-subnav::-webkit-scrollbar { display: none; }

.rp-subnav__item {
  padding: 14px 20px; border: none; background: transparent;
  font-family: var(--mono); font-size: 10px; letter-spacing: .14em; text-transform: uppercase;
  color: var(--dim); cursor: pointer; position: relative; white-space: nowrap;
  transition: color .2s var(--ease);
}
.rp-subnav__item::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 100%;
  height: 2px; background: var(--acid); transition: right .25s var(--ease);
}
.rp-subnav__item:hover { color: var(--fg); }
.rp-subnav__item--on { color: var(--acid); }
.rp-subnav__item--on::after { right: 0; box-shadow: 0 0 8px rgba(255,107,53,.5); }

/* ── CONTENT ── */
.rp-content {
  position: relative; z-index: 2;
  padding: 36px 40px 100px; flex: 1;
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

.rp-fade {
  animation: fadeUp .35s var(--expo) both;
}

.rp-section-head { margin-bottom: 28px; }
.rp-section-title {
  font-family: var(--disp); font-size: 32px; font-weight: 500;
  letter-spacing: .02em; color: var(--fg); margin-bottom: 5px;
}
.rp-section-sub {
  font-size: 13px; font-weight: 300; color: var(--muted);
  font-family: var(--mono); letter-spacing: .04em;
}

/* ── OVERVIEW GRID ── */
.rp-ov-grid {
  display: grid;
  grid-template-columns: 220px 1fr 1fr;
  gap: 12px; align-items: start;
}

/* ── CARD ── */
.rp-card {
  position: relative; overflow: hidden;
  border: 1px solid var(--stroke); background: var(--surface);
  backdrop-filter: blur(20px); padding: 24px;
  transition: border-color .3s var(--ease);
}
.rp-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
  background: linear-gradient(90deg, var(--acid), transparent); opacity: .6;
}
.rp-card:hover { border-color: rgba(255,107,53,.3); }

.rp-card__label {
  display: block; font-family: var(--mono); font-size: 9px;
  letter-spacing: .18em; text-transform: uppercase; color: var(--acid); margin-bottom: 16px;
}

/* score card */
.rp-card__score { display: flex; align-items: baseline; gap: 4px; margin-bottom: 14px; }
.rp-card__score-num {
  font-family: var(--accent); font-size: 64px; line-height: 1; color: var(--acid);
}
.rp-card__score-den { font-family: var(--mono); font-size: 16px; color: var(--muted); }

.rp-card__bar {
  height: 1.5px; background: var(--stroke); overflow: hidden; margin-bottom: 12px;
}
.rp-card__bar-fill {
  height: 100%; background: linear-gradient(90deg, var(--acid), var(--acidd));
  animation: bar-fill 1.2s var(--expo) .3s both;
}
@keyframes bar-fill { from { width: 0 !important; } }

.rp-card__hint { font-size: 11px; font-weight: 300; color: var(--muted); font-style: italic; font-family: var(--mono); }

/* summary */
.rp-summary { display: flex; flex-direction: column; gap: 0; }
.rp-summary__row {
  display: flex; align-items: center; gap: 16px;
  padding: 12px 0; border-bottom: 1px solid var(--stroke);
}
.rp-summary__row:last-child { border-bottom: none; }
.rp-summary__num {
  font-family: var(--accent); font-size: 48px; line-height: 1; color: var(--fg);
  min-width: 48px; letter-spacing: .02em;
}
.rp-summary__label { font-size: 12px; font-weight: 300; color: var(--muted); font-family: var(--mono); letter-spacing: .04em; }

/* gaps list overview */
.rp-gaps-list { display: flex; flex-direction: column; gap: 6px; }
.rp-gaps-list__row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 10px 14px; background: var(--ghost); border: 1px solid var(--stroke);
  transition: border-color .2s;
}
.rp-gaps-list__row:hover { border-color: var(--strokeh); }
.rp-gaps-list__skill { font-size: 12px; font-weight: 300; color: var(--fg); line-height: 1.4; }
.rp-gaps-list__sev {
  font-family: var(--mono); font-size: 8px; letter-spacing: .12em; text-transform: uppercase;
  color: var(--sc); border: 1px solid var(--sc); padding: 2px 8px; flex-shrink: 0; opacity: .85;
}

/* ── Q CARDS ── */
.rp-qlist { display: flex; flex-direction: column; gap: 6px; }

.rp-qcard {
  border: 1px solid var(--stroke); background: var(--surface);
  overflow: hidden; position: relative;
  transition: border-color .2s var(--ease);
}
.rp-qcard:hover { border-color: var(--strokeh); }
.rp-qcard--open { border-color: rgba(255,255,255,.25); }
.rp-qcard--open::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: var(--ac, var(--acid)); opacity: .5;
}

.rp-qcard__trigger {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 16px 20px; border: none; background: transparent; width: 100%;
  cursor: pointer; text-align: left; transition: background .15s;
}
.rp-qcard__trigger:hover { background: var(--ghost); }

.rp-qcard__idx {
  font-family: var(--mono); font-size: 13px; letter-spacing: .1em;
  color: var(--ac, var(--acid)); padding: 4px 8px;
  border: 1px solid var(--ac, var(--acid)); opacity: .9;
  flex-shrink: 0; margin-top: 2px;
}

.right-part {display:flex;flex-direction:column;align-items:center}
.rp-qcard__q { flex: 1; font-size: 16px; font-weight: 500; color: var(--fg); line-height: 1.5; }
.rp-qcard__chevron {
  color: var(--muted); flex-shrink: 0; margin-top: 2px;
  transition: transform .25s var(--ease);
}
.rp-qcard--open .rp-qcard__chevron { transform: rotate(180deg); }

.rp-qcard__body {
  padding: 0 20px 20px;
  display: flex; flex-direction: column; gap: 10px;
  animation: fadeUp .25s var(--ease) both;
}
.rp-qcard__block {
  padding: 14px 16px; background: var(--ghost); border: 1px solid var(--stroke);
}
.rp-qcard__block p { font-size: 15px; font-weight: 300; color: rgba(255,255,255,.7); line-height: 1.7; }
.rp-qcard__block-label {
  display: block; font-family: var(--mono); font-size: 12px; letter-spacing: .1em;
  text-transform: uppercase; margin-bottom: 8px;
}
.rp-qcard__block--intent .rp-qcard__block-label { color: var(--acid); }
.rp-qcard__block--answer .rp-qcard__block-label { color: rgba(255,255,255,.5); }

/* ── SKILL GAP CARDS ── */
.rp-gaps-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}

.rp-gcard {
  position: relative; overflow: hidden;
  border: 1px solid var(--stroke); background: var(--surface);
  padding: 22px;
  animation: fadeUp .4s var(--ease) calc(var(--gi, 0) * .06s) both;
  transition: border-color .2s var(--ease);
}
.rp-gcard::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1.5px;
  background: var(--sc); opacity: .5;
}
.rp-gcard:hover { border-color: var(--sc); }
.rp-gcard:hover .rp-gcard__glow { opacity: 1; }

.rp-gcard__glow {
  position: absolute; top: -50px; left: -50px;
  width: 140px; height: 140px; border-radius: 50%;
  background: var(--sc); filter: blur(50px); opacity: 0;
  pointer-events: none; transition: opacity .3s var(--ease);
}

.rp-gcard__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.rp-gcard__sev {
  font-family: var(--mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--sc); border: 1px solid var(--sc); padding: 4px 10px;
}
.rp-gcard__idx { font-family: var(--mono); font-size: 12px; letter-spacing: .1em; color: rgba(255,255,255,.5); }
.rp-gcard__skill { font-size: 16px; font-weight: 400; color: var(--fg); line-height: 1.5; margin-bottom: 18px; }
.rp-gcard__bar { height: 1.5px; background: var(--stroke); overflow: hidden; }
.rp-gcard__bar-fill {
  height: 100%; background: var(--sc); opacity: .65;
  animation: bar-fill .8s var(--ease) calc(var(--gi, 0) * .06s + .2s) both;
}

/* ── PREP PLAN ── */
.rp-plan { display: flex; flex-direction: column; }

.rp-day {
  display: flex; align-items: stretch; gap: 0;
  animation: fadeUp .4s var(--ease) calc(var(--di, 0) * .08s) both;
}

.rp-day__left {
  display: flex; flex-direction: column; align-items: center;
  width: 88px; flex-shrink: 0; padding-top: 22px;
}
.rp-day__num {
  font-family: var(--mono); font-size: 12px; letter-spacing: .1em; text-transform: uppercase;
  color: var(--acid); padding: 4px 10px;
  border: 1px solid rgba(255,255,255,.25); background: rgba(255,255,255,.07);
  white-space: nowrap;
}
.rp-day__line {
  flex: 1; width: 1px; margin-top: 10px;
  background: linear-gradient(to bottom, rgba(255,255,255,.3), rgba(255,255,255,.04));
}

.rp-day__card {
  flex: 1; position: relative; overflow: hidden;
  border: 1px solid var(--stroke); background: var(--surface);
  padding: 22px 26px; margin: 0 0 10px 24px;
  transition: border-color .2s var(--ease);
}
.rp-day__card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, var(--acid), transparent); opacity: .25;
}
.rp-day__card:hover { border-color: rgba(255,255,255,.2); }
.rp-day__card:hover .rp-day__card-glow { opacity: 1; }

.rp-day__card-glow {
  position: absolute; top: -60px; left: -60px;
  width: 160px; height: 160px; border-radius: 50%;
  background: rgba(255,255,255,.05); filter: blur(40px);
  pointer-events: none; opacity: 0; transition: opacity .3s var(--ease);
}

.rp-day__focus {
  font-family: var(--disp); font-size: 24px; font-weight: 500;
  letter-spacing: .02em; color: var(--fg); margin-bottom: 14px;
  position: relative; z-index: 1;
}
.rp-day__tasks { list-style: none; display: flex; flex-direction: column; gap: 9px; position: relative; z-index: 1; }
.rp-day__task { display: flex; align-items: flex-start; gap: 10px; font-size: 15px; font-weight: 300; color: rgba(255,255,255,.7); line-height: 1.6; }
.rp-day__task-dot {
  width: 4px; height: 4px; border-radius: 50%; background: var(--acid);
  flex-shrink: 0; margin-top: 8px; opacity: .6;
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .rp-bar, .rp-hero, .rp-content, .rp-subnav { padding-left: 22px; padding-right: 22px; }
  .rp-hero__row { grid-template-columns: 1fr; }
  .rp-arc { display: none; }
  .rp-ov-grid { grid-template-columns: 1fr; }
  .rp-gaps-grid { grid-template-columns: repeat(2,1fr); }
  .rp-bar__crumb, .rp-bar__name { display: none; }
  .rp-deco { display: none; }
  .rp-day__left { width: 56px; }
}
@media (max-width: 560px) {
  .rp-gaps-grid { grid-template-columns: 1fr; }
}

.loader {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(255,107,53,.3);
  border-top-color: var(--acid);
  animation: spin .7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* score color helpers */
.score-strong { color: var(--green) !important; }
.score-good   { color: var(--yellow) !important; }
.score-weak   { color: var(--red) !important; }
.arc-strong   { stroke: var(--green) !important; }
.arc-good     { stroke: var(--yellow) !important; }
.arc-weak     { stroke: var(--red) !important; }
`;

/* ── helpers ── */
const SEV_COLOR = { High: "#ff4d4d", Medium: "#fbbf24", Low: "#34d399" };
const fmt = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ── Score Arc ── */
const ScoreArc = ({ score }) => {
  const r = 54,
    circ = 2 * Math.PI * r;
  return (
    <div className="rp-arc">
      <svg viewBox="0 0 140 140" fill="none">
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke="rgba(255,255,255,.1)"
          strokeWidth="5"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          stroke="var(--acid)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${circ * (score / 100)} ${circ}`}
          strokeDashoffset="0"
          transform="rotate(-90 70 70)"
          className="rp-arc__path"
        />
      </svg>
      <div className="rp-arc__inner">
        <span className="rp-arc__num">{score}</span>
        <span className="rp-arc__den">/100</span>
        <span className="rp-arc__label">Fit Score</span>
      </div>
    </div>
  );
};

/* ── Q Card ── */
const QCard = ({ item, index, accentColor }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rp-qcard${open ? " rp-qcard--open" : ""}`}
      style={{ "--ac": accentColor }}
    >
      <button className="rp-qcard__trigger" onClick={() => setOpen((v) => !v)}>
        <span className="rp-qcard__idx">
          Q{String(index + 1).padStart(2, "0")}
        </span>
        <span className="rp-qcard__q">{item.question}</span>
        <span className="rp-qcard__chevron">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2.5 4.5l3.5 4 3.5-4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      {open && (
        <div className="rp-qcard__body">
          <div className="rp-qcard__block rp-qcard__block--intent">
            <span className="rp-qcard__block-label">Interviewer Intent</span>
            <p>{item.intention}</p>
          </div>
          <div className="rp-qcard__block rp-qcard__block--answer">
            <span className="rp-qcard__block-label">Model Answer</span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── MAIN PAGE ── */
export default function ReportByIdPage() {
  const [active, setActive] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const cursorRef = useRef(null);
  const navigate = useNavigate();
  const { reportId } = useParams();
  const { handleReportById, loading, report, handleResumePdf } = useInterview();
  const { user, handleLogout } = useAuth();

  const onSignOut = async () => {
    await handleLogout();
    navigate("/login");
  };

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
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* inject CSS */
  useEffect(() => {
    const id = "rp-css";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id;
      s.textContent = CSS;
      document.head.appendChild(s);
    }
  }, []);

  /* fetch report */
  useEffect(() => {
    handleReportById(reportId);
  }, [reportId]);

  const downloadResume = async (e) => {
    e.preventDefault();
    await handleResumePdf({ reportId });
  };

  const nav = (p) => navigate(p);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "behavioral", label: "Behavioral" },
    { id: "technical", label: "Technical" },
    { id: "gaps", label: "Skill Gaps" },
    { id: "plan", label: "Prep Plan" },
  ];

  const marqueeItems = [
    { text: "Interview Analysis", hot: true },
    { text: "Skill Gap Report" },
    { text: "Technical Q&As", hot: true },
    { text: "Behavioral Q&As" },
    { text: "5-Day Prep Plan", hot: true },
    { text: "Fit Score" },
    { text: "AI-Powered", hot: true },
    { text: "Personalized" },
  ];

  const menuItems = [
    {
      icon: <GridI />,
      label: "Reports",
      onClick: () => {
        nav("/reports");
        setMenuOpen(false);
      },
    },
    {
      icon: <DocI />,
      label: "New Analysis",
      onClick: () => {
        nav("/interview");
        setMenuOpen(false);
      },
    },
    { icon: <PersonI />, label: "Profile", onClick: () => setMenuOpen(false) },
    { icon: <GearI />, label: "Settings", onClick: () => setMenuOpen(false) },
  ];

  if (!report) {
    return (
      <div
        className="rp"
        style={{
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          minHeight: "100vh",
        }}
      >
        <div className="rp-grid" />
        <span
          style={{
            fontFamily: "var(--mono, monospace)",
            fontSize: 11,
            letterSpacing: ".14em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,.6)",
            animation: "fadeUp .5s ease both",
          }}
        >
          Loading report…
        </span>
      </div>
    );
  }

  return (
    <div className="rp">
      <div ref={cursorRef} className="rp-cursor" />
      <div className="rp-grid" />
      <div className="rp-deco">IQ</div>

      {/* ── NAV ── */}
      <header className="rp-bar">
        <div className="rp-bar__logo" onClick={() => nav("/reports")}>
          <div className="rp-bar__mark" />
          <span className="rp-bar__wordmark">
            Prep<em>IQ</em>
          </span>
        </div>
        <div className="rp-bar__crumb">
          <span className="rp-bar__crumb-link" onClick={() => nav("/reports")}>
            Reports
          </span>
          <span className="rp-bar__crumb-sep">/</span>
          <span className="rp-bar__crumb-active">{report.title}</span>
        </div>
        <div className="rp-bar__right" ref={menuRef}>
          <span className="rp-bar__name">Alex Johnson</span>
          <button
            className="rp-bar__avatar"
            onClick={() => setMenuOpen((v) => !v)}
          >
            A
          </button>
          <div className={`rp-menu${menuOpen ? " rp-menu--open" : ""}`}>
            <div className="rp-menu__header">
              <div className="rp-menu__avatar">A</div>
              <div>
                <p className="rp-menu__name">{user?.username}</p>
                <p className="rp-menu__email">{user?.email}</p>
              </div>
            </div>
            <div className="rp-menu__divider" />
            <div className="rp-menu__section">
              {menuItems.map((it, i) => (
                <button key={i} className="rp-menu__item" onClick={it.onClick}>
                  {it.icon}
                  {it.label}
                </button>
              ))}
            </div>
            <div className="rp-menu__divider" />
            <div className="rp-menu__section">
              <button
                className="rp-menu__item"
                onClick={() => setMenuOpen(false)}
              >
                <HelpI />
                Help & Support
              </button>
              <button
                className="rp-menu__item rp-menu__item--danger"
                onClick={onSignOut}
              >
                <ExitI />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div className="rp-marquee-wrap">
        <div className="rp-marquee">
          {[...marqueeItems, ...marqueeItems].map((it, i) => (
            <span key={i} className="rp-marquee__item">
              <span className="rp-marquee__dot" />
              <span className={it.hot ? "rp-marquee__hot" : ""}>{it.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="rp-hero">
        <button className="rp-back" onClick={() => nav("/reports")}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M8 2L3 6l5 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to Reports
        </button>

        <div className="rp-hero__row">
          <div className="rp-hero__left">
            <div className="rp-hero__kicker">
              <span className="rp-hero__kicker-tag">Report</span>
              <span className="rp-hero__kicker-date">
                {fmt(report.createdAt)}
              </span>
            </div>
            <h1 className="rp-hero__title">{report.title}</h1>
            <p className="rp-hero__jd">{report.jobDescription}</p>
            <div className="rp-hero__pills">
              <span className="rp-pill">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <circle
                    cx="5"
                    cy="5"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <path
                    d="M5 3v2l1.5 1.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
                5-day prep plan
              </span>
              <span className="rp-pill">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 5h8M5 2l3 3-3 3"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {report.technicalQuestions?.length ?? 0} technical Q&amp;As
              </span>
              <span className="rp-pill">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1.5 2.5h7M1.5 5h5M1.5 7.5h6"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                </svg>
                {report.behavioralQuestions?.length ?? 0} behavioral Q&amp;As
              </span>
              <span className="rp-pill">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <circle
                    cx="5"
                    cy="5"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                  <path
                    d="M5 3v2.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                  />
                  <circle cx="5" cy="7" r=".5" fill="currentColor" />
                </svg>
                {report.skillGap?.length ?? 0} skill gaps
              </span>
            </div>
          </div>
          <div className="right-part">
            <ScoreArc score={report.score ?? 0} />
            <button onClick={downloadResume} className="resume-download-button">
              <span className="btn-corner" />
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path
                  d="M6.5 1v8M3 7l3.5 3.5L10 7"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M1.5 12h10"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              {loading ? (
                <div className="loader"></div>
              ) : (
                "Download Updated Resume"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── SUBNAV ── */}
      <div className="rp-subnav">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`rp-subnav__item${active === t.id ? " rp-subnav__item--on" : ""}`}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div className="rp-content">
        {/* OVERVIEW */}
        {active === "overview" && (
          <div className="rp-fade">
            <div className="rp-ov-grid">
              {/* Score */}
              <div className="rp-card">
                <span className="rp-card__label">Fit Score</span>
                <div className="rp-card__score">
                  <span className="rp-card__score-num">{report.score}</span>
                  <span className="rp-card__score-den">/100</span>
                </div>
                <div className="rp-card__bar">
                  <div
                    className="rp-card__bar-fill"
                    style={{ width: `${report.score}%` }}
                  />
                </div>
                <p className="rp-card__hint">
                  Strong candidate — a few gaps to address
                </p>
              </div>

              {/* Summary */}
              <div className="rp-card">
                <span className="rp-card__label">Report Summary</span>
                <div className="rp-summary">
                  {[
                    {
                      n: report.behavioralQuestions?.length ?? 0,
                      l: "Behavioral Questions",
                    },
                    {
                      n: report.technicalQuestions?.length ?? 0,
                      l: "Technical Questions",
                    },
                    {
                      n: report.skillGap?.length ?? 0,
                      l: "Skill Gaps Identified",
                    },
                    {
                      n: report.preparationPlan?.length ?? 0,
                      l: "Day Preparation Plan",
                    },
                  ].map((s, i) => (
                    <div key={i} className="rp-summary__row">
                      <span className="rp-summary__num">{s.n}</span>
                      <span className="rp-summary__label">{s.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps glance */}
              <div className="rp-card">
                <span className="rp-card__label">Skill Gaps at a Glance</span>
                <div className="rp-gaps-list">
                  {report.skillGap?.map((g, i) => (
                    <div
                      key={i}
                      className="rp-gaps-list__row"
                      style={{ "--sc": SEV_COLOR[g.severity] }}
                    >
                      <span className="rp-gaps-list__skill">{g.skill}</span>
                      <span className="rp-gaps-list__sev">{g.severity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BEHAVIORAL */}
        {active === "behavioral" && (
          <div className="rp-fade">
            <div className="rp-section-head">
              <h2 className="rp-section-title">Behavioral Questions</h2>
              <p className="rp-section-sub">
                Click any question to reveal the intent and a model answer
              </p>
            </div>
            <div className="rp-qlist">
              {report.behavioralQuestions?.map((q, i) => (
                <QCard key={i} item={q} index={i} accentColor="var(--acid)" />
              ))}
            </div>
          </div>
        )}

        {/* TECHNICAL */}
        {active === "technical" && (
          <div className="rp-fade">
            <div className="rp-section-head">
              <h2 className="rp-section-title">Technical Questions</h2>
              <p className="rp-section-sub">
                Role-specific technical questions with model answers
              </p>
            </div>
            <div className="rp-qlist">
              {report.technicalQuestions?.map((q, i) => (
                <QCard
                  key={i}
                  item={q}
                  index={i}
                  accentColor="rgba(255,255,255,.5)"
                />
              ))}
            </div>
          </div>
        )}

        {/* SKILL GAPS */}
        {active === "gaps" && (
          <div className="rp-fade">
            <div className="rp-section-head">
              <h2 className="rp-section-title">Skill Gaps</h2>
              <p className="rp-section-sub">
                Areas to strengthen before your interview
              </p>
            </div>
            <div className="rp-gaps-grid">
              {report.skillGap?.map((g, i) => (
                <div
                  key={i}
                  className="rp-gcard"
                  style={{ "--sc": SEV_COLOR[g.severity], "--gi": i }}
                >
                  <div className="rp-gcard__glow" />
                  <div className="rp-gcard__top">
                    <span className="rp-gcard__sev">{g.severity}</span>
                    <span className="rp-gcard__idx">
                      G{String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="rp-gcard__skill">{g.skill}</p>
                  <div className="rp-gcard__bar">
                    <div
                      className="rp-gcard__bar-fill"
                      style={{
                        width:
                          g.severity === "High"
                            ? "85%"
                            : g.severity === "Medium"
                              ? "55%"
                              : "28%",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREP PLAN */}
        {active === "plan" && (
          <div className="rp-fade">
            <div className="rp-section-head">
              <h2 className="rp-section-title">5-Day Preparation Plan</h2>
              <p className="rp-section-sub">
                Your structured roadmap to interview readiness
              </p>
            </div>
            <div className="rp-plan">
              {report.preparationPlan?.map((day, i) => (
                <div key={i} className="rp-day" style={{ "--di": i }}>
                  <div className="rp-day__left">
                    <div className="rp-day__num">{day.day}</div>
                    {i < report.preparationPlan.length - 1 && (
                      <div className="rp-day__line" />
                    )}
                  </div>
                  <div className="rp-day__card">
                    <div className="rp-day__card-glow" />
                    <h3 className="rp-day__focus">{day.focus}</h3>
                    <ul className="rp-day__tasks">
                      {day.tasks?.map((task, j) => (
                        <li key={j} className="rp-day__task">
                          <span className="rp-day__task-dot" />
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Icons ── */
const GridI = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <rect
      x="1"
      y="1"
      width="4.5"
      height="4.5"
      rx=".5"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect
      x="7.5"
      y="1"
      width="4.5"
      height="4.5"
      rx=".5"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect
      x="1"
      y="7.5"
      width="4.5"
      height="4.5"
      rx=".5"
      stroke="currentColor"
      strokeWidth="1"
    />
    <rect
      x="7.5"
      y="7.5"
      width="4.5"
      height="4.5"
      rx=".5"
      stroke="currentColor"
      strokeWidth="1"
    />
  </svg>
);
const DocI = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path
      d="M2 2h9v9H2z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
    <path
      d="M5 5h3M5 7h2"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);
const PersonI = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1" />
    <path
      d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);
const GearI = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1" />
    <path
      d="M6.5 1v1.5M6.5 10.5V12M12 6.5h-1.5M2.5 6.5H1M10.3 2.7l-1.06 1.06M3.76 9.24L2.7 10.3M10.3 10.3l-1.06-1.06M3.76 3.76L2.7 2.7"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);
const HelpI = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" />
    <path
      d="M6.5 4v3M6.5 8.5v.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);
const ExitI = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <path
      d="M8.5 4H10A1.5 1.5 0 0111.5 5.5v3A1.5 1.5 0 0110 10H8.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
    />
    <path
      d="M5 9L1.5 6.5 5 4M1.5 6.5H8.5"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
