import React, { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../../Auth/hooks/useAuth";
import useInterview from "../hooks/useInterview";

/* ═══════════════════════════════════════════════════════════════════
   AWWWARDS-LEVEL DARK UI
   Fonts: Clash Display (display) + PP Neue Montreal (body) + Bebas Neue (accent numbers)
   Aesthetic: Raw editorial brutalism × luxury dark — like Linear meets Locomotive
   Features: cursor glow, scrolling marquee, giant outlined type, magnetic CTA,
             staggered mount animations, char-count ring, noise texture
═══════════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800;900&display=swap');

:root {
  --void:    #05050d;
  --surface: #05050d;
  --lift:    #0a0a14;
  --raise:   #0a0a14;
  --stroke:  rgba(255,255,255,.14);
  --strokeh: rgba(255,255,255,.35);
  --fg:      #f5f5fa;
  --muted:   #9d9bb5;
  --dim:     #6e6c8a;
  --ghost:   rgba(255,255,255,.06);

  --acid:    #ffffff;       /* minimalist white accent */
  --acidh:   #cccccc;
  --acidd:   #aaaaaa;
  --red:     #ff6b6b;
  --blue:    #ffffff;
  --purple:  #ffffff;

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

/* ── custom cursor glow ─────────────────────────────── */
.ip-cursor {
  position: fixed; z-index: 9999; pointer-events: none;
  width: 300px; height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,.06) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  transition: opacity .3s var(--ease);
}

/* ── noise overlay ──────────────────────────────────── */
.ip {
  min-height: 100vh;
  background: var(--void);
  display: flex; flex-direction: column;
  position: relative; overflow-x: hidden;
}

.ip::before {
  content: '';
  position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: .032;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 220px;
}

/* grid lines */
.ip-grid {
  position: fixed; inset: 0; z-index: 0; pointer-events: none;
  background-image:
    linear-gradient(var(--stroke) 1px, transparent 1px),
    linear-gradient(90deg, var(--stroke) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 120% 120% at 50% 0%, black 40%, transparent 100%);
}

/* ── NAV ─────────────────────────────────────────────── */
.ip-bar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  height: 62px; padding: 0 40px;
  border-bottom: 1px solid var(--stroke);
  background: rgba(6,6,8,.85);
  backdrop-filter: blur(24px) saturate(160%);
}

.ip-bar__logo {
  display: flex; align-items: center; gap: 10px; cursor: pointer;
}

.ip-bar__mark {
  width: 26px; height: 26px;
  border: 1.5px solid var(--acid);
  display: flex; align-items: center; justify-content: center;
  position: relative;
  transform: rotate(45deg);
}

.ip-bar__mark::after {
  content: '';
  position: absolute;
  width: 8px; height: 8px;
  background: var(--acid);
  transform: rotate(0deg);
}

.ip-bar__wordmark {
  font-family: var(--disp);
  font-size: 19px; font-weight: 600; letter-spacing: -.02em;
  color: var(--fg);
}

.ip-bar__wordmark em {
  font-style: normal; color: var(--acid);
}

.ip-bar__crumb {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--dim);
}

.ip-bar__crumb-link {
  cursor: pointer; transition: color .2s;
}
.ip-bar__crumb-link:hover { color: var(--fg); }
.ip-bar__crumb-sep { opacity: .4; }
.ip-bar__crumb-active { color: var(--acid); }

.ip-bar__right {
  display: flex; align-items: center; gap: 12px; position: relative;
}

.ip-bar__name {
  font-family: var(--mono); font-size: 12px; color: var(--muted); letter-spacing: .08em;
}

.ip-bar__avatar {
  width: 32px; height: 32px;
  background: var(--acid); color: var(--void);
  border: none; cursor: pointer;
  font-family: var(--disp); font-size: 14px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%;
  transition: transform .2s var(--spring), box-shadow .2s;
}
.ip-bar__avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255,255,255,.35);
}

/* dropdown */
.ip-menu {
  position: absolute; top: calc(100% + 10px); right: 0;
  width: 236px;
  background: var(--raise);
  border: 1px solid var(--stroke);
  box-shadow: 0 32px 64px rgba(0,0,0,.6);
  z-index: 100; opacity: 0;
  transform: translateY(-10px) scale(.97);
  pointer-events: none;
  transition: opacity .2s var(--ease), transform .2s var(--ease);
}

.ip-menu::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--acid), transparent);
  opacity: .6;
}

.ip-menu--open { opacity: 1; transform: none; pointer-events: auto; }

.ip-menu__header {
  display: flex; align-items: center; gap: 10px; padding: 14px 14px 12px;
}

.ip-menu__avatar {
  width: 32px; height: 32px; background: var(--acid); flex-shrink: 0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--disp); font-size: 13px; font-weight: 700; color: var(--void);
}

.ip-menu__name {
  font-family: var(--disp); font-size: 14px; font-weight: 600;
  color: var(--fg); letter-spacing: -.01em;
}

.ip-menu__email {
  font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: .04em; margin-top: 1px;
}

.ip-menu__divider { height: 1px; background: var(--stroke); margin: 0 10px; }

.ip-menu__section { padding: 4px; display: flex; flex-direction: column; gap: 1px; }

.ip-menu__item {
  display: flex; align-items: center; gap: 9px;
  padding: 9px 10px; border: none; background: transparent;
  color: var(--muted); font-family: var(--body); font-size: 13px; font-weight: 400;
  cursor: pointer; text-align: left; width: 100%;
  transition: all .15s var(--ease); border-radius: 3px;
}

.ip-menu__item svg { flex-shrink: 0; opacity: .6; transition: opacity .15s; }
.ip-menu__item:hover { background: var(--ghost); color: var(--fg); }
.ip-menu__item:hover svg { opacity: 1; }
.ip-menu__item--danger { color: rgba(255,107,107,.85); }
.ip-menu__item--danger svg { color: var(--red); }
.ip-menu__item--danger:hover { background: rgba(255,77,77,.08); color: var(--red); }

/* ── MARQUEE ────────────────────────────────────────── */
.ip-marquee-wrap {
  position: relative; z-index: 2;
  border-top: 1px solid var(--stroke);
  border-bottom: 1px solid var(--stroke);
  background: var(--surface);
  overflow: hidden;
  height: 38px; display: flex; align-items: center;
}

.ip-marquee {
  display: flex; gap: 0;
  animation: marquee-scroll 20s linear infinite;
  white-space: nowrap;
}

.ip-marquee__item {
  display: flex; align-items: center; gap: 16px;
  padding: 0 32px;
  font-family: var(--mono); font-size: 11px; letter-spacing: .16em;
  text-transform: uppercase; color: var(--dim);
  flex-shrink: 0;
}

.ip-marquee__dot {
  width: 3px; height: 3px; border-radius: 50%;
  background: var(--acid); flex-shrink: 0;
}

.ip-marquee__hot {
  color: var(--acid);
}

@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ── HERO ───────────────────────────────────────────── */
.ip-hero {
  position: relative; z-index: 2;
  padding: 64px 40px 48px;
  display: grid;
  grid-template-columns: 1fr max-content;
  gap: 0 60px; align-items: end;
}

.ip-hero__kicker {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.ip-hero__kicker-tag {
  font-family: var(--mono); font-size: 10px; letter-spacing: .2em;
  text-transform: uppercase; color: var(--void);
  background: var(--acid); padding: 5px 11px;
  font-weight: 600;
}

.ip-hero__kicker-text {
  font-family: var(--mono); font-size: 11px; letter-spacing: .12em;
  text-transform: uppercase; color: var(--muted);
}

.ip-hero__h1 {
  font-family: var(--disp);
  font-size: clamp(52px, 6.5vw, 92px);
  font-weight: 700; letter-spacing: -.04em; line-height: .92;
  color: var(--fg); margin-bottom: 24px;
}

/* huge outlined text */
.ip-hero__h1-outline {
  display: block;
  -webkit-text-stroke: 1.5px rgba(240,239,245,.3);
  color: transparent;
  font-size: clamp(56px, 7vw, 100px);
  letter-spacing: -.05em; line-height: .88;
}

.ip-hero__h1-solid {
  display: block;
  color: var(--fg);
}

.ip-hero__h1-em {
  display: block;
  color: var(--acid);
}

.ip-hero__sub {
  font-size: 16px; font-weight: 400; color: var(--muted);
  line-height: 1.75; max-width: 480px;
  font-family: var(--body);
}

/* right side counter tower */
.ip-hero__right {
  display: flex; flex-direction: column; gap: 0;
  padding-bottom: 8px;
}

.ip-hero__counter {
  padding: 18px 24px;
  border: 1px solid var(--stroke);
  border-bottom: none;
  background: var(--surface);
  position: relative;
  overflow: hidden;
}

.ip-hero__counter:last-child { border-bottom: 1px solid var(--stroke); }

.ip-hero__counter::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0; width: 2px;
  background: var(--acid); opacity: 0;
  transition: opacity .3s var(--ease);
}

.ip-hero__counter:hover::before { opacity: 1; }

.ip-hero__counter-n {
  font-family: var(--accent);
  font-size: 40px; line-height: 1; letter-spacing: .02em;
  color: var(--fg); display: flex; align-items: flex-end; gap: 2px;
}

.ip-hero__counter-n sup {
  font-family: var(--disp); font-size: 16px; font-weight: 600;
  color: var(--acid); margin-bottom: 8px;
}

.ip-hero__counter-label {
  font-family: var(--mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: .16em; color: var(--muted); margin-top: 4px;
}

/* ── 3-COLUMN LAYOUT ────────────────────────────────── */
.ip-layout {
  position: relative; z-index: 2;
  display: grid; grid-template-columns: 1fr 48px 1fr;
  margin: 0 40px;
  border: 1px solid var(--stroke);
  background: var(--surface);
  flex: 1;
}

/* ── COLUMN ─────────────────────────────────────────── */
.ip-col {
  display: flex; flex-direction: column;
  background: transparent;
  transition: background .3s var(--ease);
  position: relative;
}

.ip-col:focus-within {
  background: rgba(255,255,255,.02);
}

.ip-col__head {
  display: flex; align-items: flex-start; gap: 14px;
  padding: 20px 24px 16px; border-bottom: 1px solid var(--stroke);
  flex-shrink: 0;
}

.ip-col__num {
  font-family: var(--mono); font-size: 12px; letter-spacing: .12em;
  color: var(--acid); padding: 4px 10px;
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.08);
  margin-top: 3px; flex-shrink: 0;
  font-weight: 600;
}

.ip-col__title {
  font-family: var(--disp); font-size: 32px; font-weight: 500;
  letter-spacing: .02em; color: var(--fg); line-height: 1.1;
}

.ip-col__sub {
  font-size: 14px; font-weight: 400; color: var(--muted); margin-top: 3px;
  font-family: var(--mono); letter-spacing: .03em;
}

.ip-col__tag {
  margin-left: auto; flex-shrink: 0;
  font-family: var(--mono); font-size: 11px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted);
  border: 1px solid rgba(255,255,255,.2); padding: 4px 10px;
}

.ip-col__tag--done {
  color: var(--acid) !important;
  border-color: rgba(255,255,255,.4) !important;
  background: rgba(255,255,255,.09) !important;
}

.ip-col__body {
  flex: 1; display: flex; flex-direction: column;
  position: relative; min-height: 0;
}

.ip-col__body--drop { min-height: 160px; }

.ip-col__foot {
  flex-shrink: 0; display: flex; align-items: center; gap: 12px;
  padding: 12px 24px; border-top: 1px solid var(--stroke);
  background: rgba(255,255,255,.015);
}

.ip-col__section--top { flex-shrink: 0; border-bottom: 1px solid var(--stroke); }
.ip-col__section--bottom { flex: 1; display: flex; flex-direction: column; min-height: 0; }

.ip-col__rule {
  display: flex; align-items: center; gap: 12px;
  padding: 0 20px; flex-shrink: 0; height: 36px;
  background: rgba(255,255,255,.02); border-bottom: 1px solid var(--stroke);
}

.ip-col__rule-line { flex: 1; height: 1px; background: var(--stroke); }

.ip-col__rule-label {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 12px; letter-spacing: .1em;
  text-transform: uppercase; color: var(--muted); white-space: nowrap;
}

/* ── DIVIDER ────────────────────────────────────────── */
.ip-div {
  display: flex; flex-direction: column; align-items: center;
  background: rgba(255,255,255,.025);
  border-left: 1px solid var(--stroke); border-right: 1px solid var(--stroke);
}

.ip-div__line {
  flex: 1; width: 1px;
  background: linear-gradient(to bottom, transparent, var(--acid) 40%, var(--acid) 60%, transparent);
  opacity: .2;
}

.ip-div__node {
  width: 28px; height: 28px; flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.3);
  background: rgba(255,255,255,.09);
  display: flex; align-items: center; justify-content: center;
  color: var(--acid); transform: rotate(45deg);
}

.ip-div__node svg { transform: rotate(-45deg); }

/* ── TEXTAREA ───────────────────────────────────────── */
.ip-ta {
  flex: 1; width: calc(100% - 48px); margin: 0 24px 24px;
  resize: none; outline: none;
  border: 1.5px solid rgba(255,255,255,.22);
  background: rgba(255,255,255,.055); color: var(--fg);
  font-family: var(--body); font-size: 16px; font-weight: 400; line-height: 1.75;
  padding: 22px 24px; min-height: 280px;
  caret-color: var(--acid);
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,.3) transparent;
  transition: all .2s var(--ease);
  border-radius: 2px;
}
.ip-ta::-webkit-scrollbar { width: 6px; }
.ip-ta::-webkit-scrollbar-thumb { background: rgba(255,255,255,.25); border-radius: 4px; }

.ip-ta::placeholder { color: rgba(255,255,255,.4); font-style: normal; line-height: 1.75; }
.ip-ta:hover { border-color: rgba(255,255,255,.32); }
.ip-ta:focus { outline: none; border-color: var(--acid); background: rgba(255,255,255,.07); box-shadow: 0 0 0 3px rgba(255,255,255,.06); }
.ip-ta--sm { min-height: 150px; font-size: 16px; }

/* acid corner brackets on focus */
.ip-ta__c {
  position: absolute; width: 10px; height: 10px;
  z-index: 3; pointer-events: none;
  opacity: 0; transition: opacity .25s var(--ease);
}

.ip-col:focus-within .ip-ta__c { opacity: 1; }

.ip-ta__c--tl { top: 0; left: 0; border-top: 1.5px solid var(--acid); border-left: 1.5px solid var(--acid); }
.ip-ta__c--br { bottom: 0; right: 0; border-bottom: 1.5px solid var(--acid); border-right: 1.5px solid var(--acid); }

/* ── CHAR BAR ───────────────────────────────────────── */
.ip-cbar {
  flex: 1; height: 2px; background: var(--stroke); overflow: hidden;
  border-radius: 2px;
}

.ip-cbar__fill {
  height: 100%;
  background: linear-gradient(90deg, var(--acid), var(--acidd));
  transition: width .3s var(--ease);
}

.ip-cbar__label {
  font-family: var(--mono); font-size: 11px; color: var(--muted); white-space: nowrap;
}
.ip-cbar__label em { font-style: normal; opacity: .6; }

/* ── DROPZONE ───────────────────────────────────────── */
.ip-drop {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 12px; padding: 28px 20px;
  cursor: pointer; text-align: center; position: relative; z-index: 1;
  border: 1.5px dashed rgba(255,255,255,.32); margin: 24px;
  border-radius: 3px;
  transition: all .25s var(--ease); background: rgba(255,255,255,.05);
}

.ip-drop::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: repeating-linear-gradient(
    -45deg, transparent 0, transparent 5px,
    rgba(255,255,255,.02) 5px, rgba(255,255,255,.02) 6px
  );
}

.ip-drop:hover { border-color: var(--acid); background: rgba(255,255,255,.09); }

.ip-drop__icon {
  width: 48px; height: 48px;
  border: 1px solid var(--stroke); background: var(--lift);
  display: flex; align-items: center; justify-content: center;
  color: var(--muted); transition: all .25s var(--ease);
  position: relative;
}

.ip-drop:hover .ip-drop__icon { border-color: var(--acid); color: var(--acid); }

.ip-drop__label {
  font-family: var(--disp); font-size: 27px; font-weight: 500;
  color: var(--fg); transition: color .2s; letter-spacing: .04em;
}

.ip-drop:hover .ip-drop__label { color: var(--acid); }
.ip-drop__hint { font-family: var(--mono); font-size: 13px; color: var(--muted); letter-spacing: .05em; }

.ip-drop__loaded { display: flex; align-items: center; gap: 14px; padding: 24px; width: 100%; }

.ip-drop__loaded-icon {
  width: 42px; height: 42px; flex-shrink: 0; background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.3);
  display: flex; align-items: center; justify-content: center; color: var(--acid);
}

.ip-drop__loaded-name { font-size: 14px; font-weight: 500; color: var(--fg); margin-bottom: 3px; }
.ip-drop__loaded-size { font-family: var(--mono); font-size: 11px; color: var(--muted); letter-spacing: .05em; }

/* ── CTA BAND ───────────────────────────────────────── */
.ip-cta {
  position: relative; z-index: 2;
  display: flex; align-items: center; justify-content: space-between;
  margin: 0 40px 40px; padding: 0;
  border: 1px solid var(--stroke); border-top: none;
  background: var(--surface);
  overflow: hidden; gap: 0;
  flex-wrap: wrap;
}

.ip-cta__left {
  display: flex; align-items: center; gap: 24px;
  padding: 20px 28px; flex: 1;
  flex-wrap: wrap;
}

.ip-cta__status {
  display: flex; align-items: center; gap: 8px;
}

.ip-cta__status-dot {
  width: 6px; height: 6px; border-radius: 50%; background: var(--acid);
  box-shadow: 0 0 8px rgba(255,255,255,.6);
  animation: dot-pulse 2s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%,100% { opacity: 1; transform: scale(1); }
  50% { opacity: .5; transform: scale(.7); }
}

.ip-cta__status-text {
  font-family: var(--mono); font-size: 13px; letter-spacing: .06em;
  text-transform: uppercase; color: var(--fg);
}

.ip-cta__trust {
  font-family: var(--mono); font-size: 13px; color: var(--muted);
  letter-spacing: .03em;
}

/* ── SUBMIT BUTTON ──────────────────────────────────── */
.ip-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 20px 48px; height: 100%;
  background: var(--acid); color: var(--void);
  border: none; cursor: pointer;
  font-family: var(--disp); font-size: 26px; font-weight: 500;
  letter-spacing: .02em; white-space: nowrap;
  position: relative; overflow: hidden;
  transition: all .3s var(--ease);
  border-left: 1px solid rgba(255,255,255,.3);
}

.ip-btn:disabled { cursor: not-allowed; opacity: .75; }

.ip-btn::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 60%;
  height: 100%; z-index: 1;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
  transform: skewX(-20deg);
  transition: left .5s var(--ease);
}

.ip-btn:hover::before { left: 150%; }

.ip-btn:hover {
  background: var(--acidh);
  box-shadow: 0 0 40px rgba(255,255,255,.25);
}

.ip-btn:active { transform: scaleX(.98); }

.ip-btn__label {
  position: relative; z-index: 2;
  display: flex; align-items: center; gap: 10px;
}

.ip-btn svg { transition: transform .2s var(--ease); }
.ip-btn:hover svg { transform: translateX(4px); }

/* ── HUGE DECORATIVE NUMBER ─────────────────────────── */
.ip-deco {
  position: fixed; bottom: -30px; left: -20px;
  font-family: var(--accent);
  font-size: 260px; line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,.05);
  pointer-events: none; z-index: 0;
  user-select: none; letter-spacing: -.02em;
}

/* ── SPINNER ────────────────────────────────────────── */
@keyframes spin { to { transform: rotate(360deg); } }
.ip-btn__spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(6,6,8,.3); border-top-color: var(--void);
  border-radius: 50%; animation: spin .7s linear infinite;
}

/* ── MOUNT ANIMATIONS ───────────────────────────────── */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
}

.ip-hero__kicker  { animation: fade-up .6s var(--expo) both; animation-delay: .05s; }
.ip-hero__h1      { animation: fade-up .7s var(--expo) both; animation-delay: .12s; }
.ip-hero__sub     { animation: fade-up .7s var(--expo) both; animation-delay: .2s; }
.ip-hero__right   { animation: fade-up .7s var(--expo) both; animation-delay: .25s; }
.ip-layout        { animation: fade-up .7s var(--expo) both; animation-delay: .3s; }
.ip-cta           { animation: fade-up .6s var(--expo) both; animation-delay: .38s; }
.ip-marquee-wrap  { animation: fade-up .5s var(--expo) both; animation-delay: .02s; }

/* ── RESPONSIVE ─────────────────────────────────────── */
@media (max-width: 900px) {
  .ip-hero { grid-template-columns: 1fr; padding: 40px 22px 28px; }
  .ip-hero__right { flex-direction: row; gap: 1px; }
  .ip-hero__counter { flex: 1; }
  .ip-layout { grid-template-columns: 1fr; margin: 0 22px; }
  .ip-div { flex-direction: row; height: 44px; }
  .ip-div__line { flex: 1; height: 1px; width: auto; }
  .ip-cta { margin: 0 22px 28px; flex-direction: column; }
  .ip-btn { width: 100%; justify-content: center; border-left: none; border-top: 1px solid rgba(255,255,255,.3); }
  .ip-bar { padding: 0 22px; }
  .ip-bar__crumb, .ip-bar__name { display: none; }
  .ip-deco { display: none; }
}
`;

/* ═══════════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════════ */
export default function InterviewPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [resume, setResume] = useState(null);
  const [selfDesc, setSelfDesc] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const { handleInterviewReport, loading } = useInterview();

  const menuRef = useRef(null);
  const cursorRef = useRef(null);
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth()
  console.log(user)

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

  /* click-outside menu */
  useEffect(() => {
    const h = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  /* inject CSS */
  useEffect(() => {
    const id = "ip-v2-css";
    const existing = document.getElementById(id);
    if (existing) existing.remove();
    const s = document.createElement("style");
    s.id = id; s.textContent = CSS;
    document.head.appendChild(s);
  }, []);

  const nav = (p) => navigate(p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDesc || !resume || !selfDesc) return;

    const response = await handleInterviewReport({
      jobDescription: jobDesc,
      resume: resume,
      selfDescription: selfDesc,
    });

    if (response?.interviewReport?._id) {
      nav(`/report/${response.interviewReport._id}`);
    }
  };

  const menuItems = [
    { icon: <GridI />, label: "Reports", onClick: () => { nav("/reports"); setMenuOpen(false); } },
    { icon: <DocI />, label: "New Analysis", onClick: () => { nav("/interview"); setMenuOpen(false); } },
    { icon: <PersonI />, label: "Profile", onClick: () => setMenuOpen(false) },
    { icon: <GearI />, label: "Settings", onClick: () => setMenuOpen(false) },
    { icon: <CardI />, label: "Billing & Plan", onClick: () => setMenuOpen(false) },
  ];

  const marqueeItems = [
    { text: "AI-Powered Analysis", hot: true },
    { text: "Gap Detection" },
    { text: "~15s Turnaround", hot: true },
    { text: "12,000+ Engineers" },
    { text: "FAANG Ready", hot: true },
    { text: "Big 4 Optimized" },
    { text: "Real-time Scoring", hot: true },
    { text: "Interview Prep" },
  ];

  return (
    <div className="ip">
      {/* cursor glow */}
      <div ref={cursorRef} className="ip-cursor" />

      {/* bg layers */}
      <div className="ip-grid" />
      <div className="ip-deco">IQ</div>

      {/* ── NAV ── */}
      <header className="ip-bar">
        <div className="ip-bar__logo" onClick={() => nav("/reports")}>
          <div className="ip-bar__mark" />
          <span className="ip-bar__wordmark">Prep<em>IQ</em></span>
        </div>

        <div className="ip-bar__crumb">
          <span className="ip-bar__crumb-active">New Analysis</span>
          <span className="ip-bar__crumb-sep">/</span>
          <span className="ip-bar__crumb-link" onClick={() => nav("/reports")}>Reports</span>
        </div>

        <div className="ip-bar__right" ref={menuRef}>
          <span className="ip-bar__name">{user.username}</span>
          <button className="ip-bar__avatar" onClick={() => setMenuOpen(v => !v)}>A</button>

          <div className={`ip-menu${menuOpen ? " ip-menu--open" : ""}`}>
            <div className="ip-menu__header">
              <div className="ip-menu__avatar">A</div>
              <div>
                <p className="ip-menu__name">{user.username}</p>
                <p className="ip-menu__email">{user.email}</p>
              </div>
            </div>
            <div className="ip-menu__divider" />
            <div className="ip-menu__section">
              {menuItems.map((it, i) => (
                <button key={i} className="ip-menu__item" onClick={it.onClick}>
                  {it.icon}{it.label}
                </button>
              ))}
            </div>
            <div className="ip-menu__divider" />
            <div className="ip-menu__section">
              <button className="ip-menu__item" onClick={() => setMenuOpen(false)}>
                <HelpI />Help & Support
              </button>
              <button className="ip-menu__item ip-menu__item--danger" onClick={onSignOut}>
                <ExitI />Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MARQUEE ── */}
      <div className="ip-marquee-wrap">
        <div className="ip-marquee">
          {[...marqueeItems, ...marqueeItems].map((it, i) => (
            <span key={i} className="ip-marquee__item">
              <span className="ip-marquee__dot" />
              <span className={it.hot ? "ip-marquee__hot" : ""}>{it.text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <div className="ip-hero">
        <div className="ip-hero__left">
          <div className="ip-hero__kicker">
            <span className="ip-hero__kicker-tag">AI — Powered</span>
            <span className="ip-hero__kicker-text">~15 second analysis · 12k+ engineers prepared</span>
          </div>
          <h1 className="ip-hero__h1">
            <span className="ip-hero__h1-outline">NAIL</span>
            <span className="ip-hero__h1-solid">your next</span>
            <span className="ip-hero__h1-em">interview.</span>
          </h1>
          <p className="ip-hero__sub">
            Drop the job description, upload your resume, add context — we'll map every gap and craft exact questions you need to demolish.
          </p>
        </div>

        <div className="ip-hero__right">
          {[
            { n: "12", sup: "K+", label: "Engineers prepared" },
            { n: "94", sup: "%", label: "Success rate" },
            { n: "15", sup: "s", label: "Avg. analysis time" },
          ].map((s, i) => (
            <div key={i} className="ip-hero__counter">
              <div className="ip-hero__counter-n">
                {s.n}<sup>{s.sup}</sup>
              </div>
              <div className="ip-hero__counter-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-INPUT LAYOUT ── */}
      <div className="ip-layout">

        {/* COL 1 — Job Description */}
        <div className="ip-col">
          <div className="ip-col__head">
            <span className="ip-col__num">01</span>
            <div>
              <h2 className="ip-col__title">Job Description</h2>
              <p className="ip-col__sub">Paste the full job posting</p>
            </div>
            <span className="ip-col__tag">Required</span>
          </div>
          <div className="ip-col__body">
            <textarea
              className="ip-ta"
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder={"Senior Backend Engineer @ Stripe\n\nWe're looking for engineers who thrive in ambiguity and own their work end-to-end...\n\nWhat you'll do:\n— Design distributed systems at scale\n— Own critical payment infrastructure\n— Collaborate with product & design\n\nWhat we need:\n— 5+ years backend experience\n— Strong distributed systems knowledge\n— Go, Java, or Python expertise"}
            />
            <span className="ip-ta__c ip-ta__c--tl" />
            <span className="ip-ta__c ip-ta__c--br" />
          </div>
          <div className="ip-col__foot">
            <div className="ip-cbar">
              <div className="ip-cbar__fill" style={{ width: `${Math.min((jobDesc.length / 5000) * 100, 100)}%` }} />
            </div>
            <span className="ip-cbar__label">
              {jobDesc.length.toLocaleString()} <em>/ 5,000</em>
            </span>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="ip-div">
          <div className="ip-div__line" />
          <div className="ip-div__node">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 5h8M5.5 2l3 3-3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="ip-div__line" />
        </div>

        {/* COL 2 — Resume + Self Desc */}
        <div className="ip-col ip-col--right">
          <div className="ip-col__section ip-col__section--top">
            <div className="ip-col__head">
              <span className="ip-col__num">02</span>
              <div>
                <h2 className="ip-col__title">Resume</h2>
                <p className="ip-col__sub">PDF · Max 5 MB</p>
              </div>
              {resume && <span className="ip-col__tag ip-col__tag--done">✓ Loaded</span>}
            </div>
            <div className="ip-col__body ip-col__body--drop">
              <label className="ip-drop">
                <input type="file" accept=".pdf" hidden onInput={e => setResume(e.target.files[0])} />
                {resume ? (
                  <div className="ip-drop__loaded">
                    <div className="ip-drop__loaded-icon">
                      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
                        <path d="M13 2H5a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7l-6-5z" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M13 2v5h6M7 14l2.5 2.5L16 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="ip-drop__loaded-name">{resume.name}</p>
                      <p className="ip-drop__loaded-size">{(resume.size / 1024).toFixed(0)} KB · Click to replace</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ip-drop__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 17V9M12 9L8 13M12 9l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4.5 19a4 4 0 01-.5-7.9A7 7 0 0118.9 11H19a5 5 0 010 10H4.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                    </div>
                    <p className="ip-drop__label">Drop your resume here</p>
                    <p className="ip-drop__hint">or click to browse · PDF only</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="ip-col__rule">
            <div className="ip-col__rule-line" />
            <span className="ip-col__rule-label">
              <span className="ip-col__num">03</span>
              Self-Description
            </span>
            <div className="ip-col__rule-line" />
          </div>

          <div className="ip-col__section ip-col__section--bottom">
            <div className="ip-col__body">
              <textarea
                className="ip-ta ip-ta--sm"
                value={selfDesc}
                onChange={e => setSelfDesc(e.target.value)}
                placeholder={"Add extra context about yourself...\n\n3+ years backend with Node.js & PostgreSQL. Led a team of 4, built APIs handling 2M+ req/day. Prepping for staff-level roles."}
              />
              <span className="ip-ta__c ip-ta__c--tl" />
              <span className="ip-ta__c ip-ta__c--br" />
            </div>
          </div>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="ip-cta">
        <div className="ip-cta__left">
          <div className="ip-cta__status">
            <span className="ip-cta__status-dot" />
            <span className="ip-cta__status-text">Fill all fields to generate</span>
          </div>
          <span className="ip-cta__trust">12,000+ engineers · FAANG · Big 4 · Staff-level</span>
        </div>
        <button onClick={handleSubmit} className="ip-btn" disabled={loading}>
          <span className="ip-btn__label">
            {loading ? (
              <><span className="ip-btn__spinner" /> Analyzing…</>
            ) : (
              <>
                Generate Interview Plan
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 7h10M7.5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}

const GridI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="1" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /><rect x="7.5" y="1" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /><rect x="1" y="7.5" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /><rect x="7.5" y="7.5" width="4.5" height="4.5" rx=".5" stroke="currentColor" strokeWidth="1" /></svg>;
const DocI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 2h9v9H2z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" /><path d="M5 5h3M5 7h2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const PersonI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="4" r="2.5" stroke="currentColor" strokeWidth="1" /><path d="M1.5 11.5c0-2.485 2.239-4.5 5-4.5s5 2.015 5 4.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const GearI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="2" stroke="currentColor" strokeWidth="1" /><path d="M6.5 1v1.5M6.5 10.5V12M12 6.5h-1.5M2.5 6.5H1M10.3 2.7l-1.06 1.06M3.76 9.24L2.7 10.3M10.3 10.3l-1.06-1.06M3.76 3.76L2.7 2.7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const CardI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="3" width="11" height="7" rx="1" stroke="currentColor" strokeWidth="1" /><path d="M1 6h11" stroke="currentColor" strokeWidth="1" /></svg>;
const HelpI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" strokeWidth="1" /><path d="M6.5 4v3M6.5 8.5v.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>;
const ExitI = () => <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 4H10A1.5 1.5 0 0111.5 5.5v3A1.5 1.5 0 0110 10H8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /><path d="M5 9L1.5 6.5 5 4M1.5 6.5H8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" /></svg>;