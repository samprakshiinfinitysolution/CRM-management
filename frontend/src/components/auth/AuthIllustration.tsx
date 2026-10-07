import React from "react";

export default function AuthIllustration() {
  return (
    <div className="w-full h-full flex items-center justify-center p-4 select-none">
      <svg
        viewBox="0 0 520 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-[420px] h-auto drop-shadow-xs"
      >
        <defs>
          {/* Subtle drop shadows for isometric elements */}
          <filter id="iso-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#94a3b8" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* ------------------------------------------------------------- */}
        {/* BACKGROUND PLATFORM TIERS & SHADOWS */}
        {/* ------------------------------------------------------------- */}
        {/* Ground Base Shadow */}
        <ellipse cx="260" cy="330" rx="200" ry="60" fill="#e2e8f0" fillOpacity="0.6" />

        {/* Right Platform Stack (Stepped Plinths) */}
        <g filter="url(#iso-shadow)">
          {/* Bottom slab */}
          <path d="M330 355 L450 285 L350 230 L230 300 Z" fill="#cbd5e1" />
          <path d="M230 300 L330 355 L330 370 L230 315 Z" fill="#94a3b8" />
          <path d="M330 355 L450 285 L450 300 L330 370 Z" fill="#64748b" />

          {/* Middle slab */}
          <path d="M330 340 L450 270 L350 215 L230 285 Z" fill="#e2e8f0" />
          <path d="M230 285 L330 340 L330 355 L230 300 Z" fill="#cbd5e1" />
          <path d="M330 340 L450 270 L450 285 L330 355 Z" fill="#94a3b8" />

          {/* Top slab */}
          <path d="M330 325 L450 255 L350 200 L230 270 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M230 270 L330 325 L330 340 L230 285 Z" fill="#f1f5f9" />
          <path d="M330 325 L450 255 L450 270 L330 340 Z" fill="#cbd5e1" />
        </g>

        {/* Left Platform Tier */}
        <g filter="url(#iso-shadow)">
          <path d="M190 320 L270 275 L200 235 L120 280 Z" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
          <path d="M120 280 L190 320 L190 332 L120 292 Z" fill="#e2e8f0" />
          <path d="M190 320 L270 275 L270 287 L190 332 Z" fill="#cbd5e1" />
        </g>

        {/* Center Back Platform Tier */}
        <g filter="url(#iso-shadow)">
          <path d="M255 270 L330 228 L275 195 L200 237 Z" fill="#ffffff" stroke="#f1f5f9" strokeWidth="1.5" />
          <path d="M200 237 L255 270 L255 278 L200 245 Z" fill="#e2e8f0" />
          <path d="M255 270 L330 228 L330 236 L255 278 Z" fill="#cbd5e1" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* ISOMETRIC MOBILE PHONE DISPLAY */}
        {/* ------------------------------------------------------------- */}
        <g filter="url(#iso-shadow)">
          {/* Phone body */}
          <path
            d="M130 195 L175 168 L175 305 L130 332 Z"
            fill="#ffffff"
            stroke="#94a3b8"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Phone Screen Side Panel */}
          <path
            d="M135 200 L170 178 L170 298 L135 320 Z"
            fill="#4f46e5"
            fillOpacity="0.85"
          />
          {/* Screen Content Bar & Graph lines */}
          <path d="M142 215 L163 202" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <path d="M142 225 L158 215" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M142 238 L165 224" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          {/* Mini chart bars on screen */}
          <path d="M143 285 L143 270" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M150 280 L150 260" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
          <path d="M157 276 L157 250" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
          <path d="M164 272 L164 262" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* FLOATING ANALYTICS BOARD / CHARTS (TOP CENTER) */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Floating board */}
          <path
            d="M230 185 L310 140 L310 205 L230 250 Z"
            fill="#ffffff"
            fillOpacity="0.8"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            strokeDasharray="3 3"
          />
          {/* Bar charts on board */}
          <path d="M245 225 L245 195" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
          <path d="M255 218 L255 180" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          <path d="M265 212 L265 170" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
          <path d="M275 206 L275 160" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
          <path d="M285 200 L285 175" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />

          {/* Line Chart trajectory */}
          <path
            d="M240 215 Q260 190 275 185 T300 160"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* Floating Message / Mail Bubble */}
        <g filter="url(#iso-shadow)">
          <path
            d="M295 240 L320 225 L345 240 L320 255 Z"
            fill="#4f46e5"
          />
          <path d="M305 235 L320 245 L335 235" stroke="#ffffff" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 1: TEAM LEADER (Standing at center board) */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Head */}
          <circle cx="280" cy="170" r="10" fill="#334155" />
          {/* Hair bun/style */}
          <path d="M272 166 C274 158 288 158 290 168 C290 178 284 180 278 180 Z" fill="#1e293b" />
          {/* Face highlight */}
          <circle cx="277" cy="172" r="3.5" fill="#fbcfe8" />
          {/* Dress / Body */}
          <path d="M272 182 L290 182 L296 235 L268 235 Z" fill="#0d9488" />
          {/* Arm pointing to board */}
          <path d="M272 188 L255 175 L252 170" stroke="#0d9488" strokeWidth="4" strokeLinecap="round" />
          <circle cx="250" cy="168" r="3" fill="#fbcfe8" />
          {/* Legs */}
          <path d="M276 235 L276 258" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M288 235 L288 258" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
          {/* Shoes */}
          <ellipse cx="275" cy="258" rx="4" ry="2" fill="#0f172a" />
          <ellipse cx="289" cy="258" rx="4" ry="2" fill="#0f172a" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 2: EXECUTIVE (Sitting on Left Platform) */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Head */}
          <circle cx="152" cy="235" r="9" fill="#1e293b" />
          <circle cx="155" cy="236" r="3" fill="#fed7aa" />
          {/* Body/Shirt */}
          <path d="M144 245 L162 245 L160 275 L144 275 Z" fill="#38bdf8" />
          {/* Arm / VR / Phone interaction */}
          <path d="M156 250 L168 260 L162 268" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          {/* Legs seated */}
          <path d="M144 275 L144 290 L135 305" stroke="#475569" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M158 275 L168 290 L172 315" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Shoes */}
          <ellipse cx="132" cy="307" rx="4" ry="2.5" fill="#4f46e5" />
          <ellipse cx="174" cy="317" rx="4" ry="2.5" fill="#4f46e5" />
        </g>

        {/* ------------------------------------------------------------- */}
        {/* CHARACTER 3: SALES REP WITH LAPTOP (Sitting on Right Slab Stack) */}
        {/* ------------------------------------------------------------- */}
        <g>
          {/* Head & Long Hair */}
          <circle cx="365" cy="245" r="9" fill="#1e293b" />
          <path d="M358 245 C355 260 365 275 378 270 C382 255 376 240 365 240 Z" fill="#312e81" />
          <circle cx="362" cy="246" r="3" fill="#fed7aa" />
          {/* Top / Blouse */}
          <path d="M356 255 L372 255 L368 285 L354 285 Z" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
          {/* Arms holding laptop */}
          <path d="M356 262 L345 272" stroke="#fed7aa" strokeWidth="3.5" strokeLinecap="round" />
          {/* Minimalist Isometric Laptop */}
          <path d="M332 270 L348 260 L354 266 L338 276 Z" fill="#94a3b8" />
          <path d="M332 270 L332 258 L348 248 L348 260 Z" fill="#4f46e5" />
          {/* Legs */}
          <path d="M354 285 L340 300 L328 322" stroke="#475569" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M365 285 L356 302 L350 324" stroke="#334155" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Shoes */}
          <ellipse cx="325" cy="325" rx="4.5" ry="2.5" fill="#4f46e5" />
          <ellipse cx="348" cy="327" rx="4.5" ry="2.5" fill="#4f46e5" />
        </g>
      </svg>
    </div>
  );
}
