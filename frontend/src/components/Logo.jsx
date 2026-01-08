import React from "react";

export default function Logo({width, height}) {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
      <rect width="200" height="200" fill="#000000" />

      <defs>
        <radialGradient id="centerGlow">
          <stop offset="0%" style={{ stopColor: "#ff00ff", stopOpacity: 0.8 }} />
          <stop offset="50%" style={{ stopColor: "#00f5ff", stopOpacity: 0.6 }} />
          <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 0 }} />
        </radialGradient>

        <linearGradient id="neonPurple" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ff00ff", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#bd00ff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#7000ff", stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00f5ff", stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: "#00d4ff", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#0084ff", stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="neonOrange" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#ff6b00", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#ff0080", stopOpacity: 1 }} />
        </linearGradient>

        <linearGradient id="neonGreen" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: "#00ff88", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "#00ffea", stopOpacity: 1 }} />
        </linearGradient>

        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="strongGlow">
          <feGaussianBlur stdDeviation="5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <circle cx="100" cy="100" r="90" fill="url(#centerGlow)" opacity="0.3" />

      <circle
        cx="100"
        cy="100"
        r="85"
        fill="none"
        stroke="url(#neonPurple)"
        strokeWidth="1.5"
        opacity="0.4"
        strokeDasharray="10 5"
        filter="url(#glow)"
      />
      <circle
        cx="100"
        cy="100"
        r="80"
        fill="none"
        stroke="url(#neonCyan)"
        strokeWidth="1"
        opacity="0.5"
        strokeDasharray="15 8"
      />
      <circle
        cx="100"
        cy="100"
        r="75"
        fill="none"
        stroke="url(#neonOrange)"
        strokeWidth="2"
        opacity="0.3"
        strokeDasharray="5 10"
        filter="url(#glow)"
      />

      <g opacity="0.6" filter="url(#glow)">
        <path d="M 100 30 L 108 45 L 92 45 Z" fill="url(#neonCyan)" opacity="0.8" />
        <path d="M 170 100 L 155 108 L 155 92 Z" fill="url(#neonPurple)" opacity="0.8" />
        <path d="M 100 170 L 92 155 L 108 155 Z" fill="url(#neonOrange)" opacity="0.8" />
        <path d="M 30 100 L 45 92 L 45 108 Z" fill="url(#neonGreen)" opacity="0.8" />
      </g>

      <g transform="translate(100,100)" opacity="0.7">
        <path
          d="M 0,-50 L 43.3,-25 L 43.3,25 L 0,50 L -43.3,25 L -43.3,-25 Z"
          fill="none"
          stroke="url(#neonCyan)"
          strokeWidth="2"
          filter="url(#glow)"
        />
        <path
          d="M 0,-40 L 34.6,-20 L 34.6,20 L 0,40 L -34.6,20 L -34.6,-20 Z"
          fill="none"
          stroke="url(#neonPurple)"
          strokeWidth="1.5"
          opacity="0.6"
        />
      </g>

      <g transform="translate(100,100)">
        <circle
          r="35"
          fill="none"
          stroke="url(#neonOrange)"
          strokeWidth="3"
          opacity="0.5"
          filter="url(#glow)"
        />
        <circle r="30" fill="none" stroke="url(#neonCyan)" strokeWidth="2" opacity="0.7" />

        <g opacity="0.8">
          <line x1="0" y1="-35" x2="0" y2="-28" stroke="url(#neonPurple)" strokeWidth="2" strokeLinecap="round" />
          <line x1="30.3" y1="-17.5" x2="24.2" y2="-14" stroke="url(#neonCyan)" strokeWidth="2" strokeLinecap="round" />
          <line x1="30.3" y1="17.5" x2="24.2" y2="14" stroke="url(#neonGreen)" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="35" x2="0" y2="28" stroke="url(#neonOrange)" strokeWidth="2" strokeLinecap="round" />
          <line x1="-30.3" y1="17.5" x2="-24.2" y2="14" stroke="url(#neonPurple)" strokeWidth="2" strokeLinecap="round" />
          <line x1="-30.3" y1="-17.5" x2="-24.2" y2="-14" stroke="url(#neonCyan)" strokeWidth="2" strokeLinecap="round" />
        </g>
      </g>

      <g filter="url(#strongGlow)">
        <circle cx="145" cy="70" r="3" fill="#00f5ff" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="55" cy="130" r="2.5" fill="#ff00ff" opacity="0.8">
          <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="130" cy="145" r="2" fill="#00ff88" opacity="0.85">
          <animate attributeName="opacity" values="0.85;0.3;0.85" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="70" cy="55" r="2.5" fill="#ff6b00" opacity="0.9">
          <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </g>

      <g transform="translate(100,100)" filter="url(#strongGlow)">
        <line x1="0" y1="0" x2="0" y2="-35" stroke="url(#neonPurple)" strokeWidth="4" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="0" y2="-35" stroke="#ff00ff" strokeWidth="2" strokeLinecap="round" />
        <line x1="0" y1="0" x2="25" y2="-25" stroke="url(#neonCyan)" strokeWidth="3" strokeLinecap="round" opacity="0.9" />
        <line x1="0" y1="0" x2="25" y2="-25" stroke="#00f5ff" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="0" y1="0" x2="20" y2="20" stroke="url(#neonOrange)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </g>

      <circle cx="100" cy="100" r="8" fill="url(#neonPurple)" opacity="0.8" filter="url(#strongGlow)" />
      <circle cx="100" cy="100" r="5" fill="#ff00ff" filter="url(#strongGlow)" />
      <circle cx="100" cy="100" r="2" fill="#ffffff" />

      <g opacity="0.7" filter="url(#glow)">
        <path d="M 100 30 A 65 65 0 0 1 156 75" fill="none" stroke="url(#neonCyan)" strokeWidth="3" strokeLinecap="round" />
        <path d="M 125 144 A 65 65 0 0 1 44 125" fill="none" stroke="url(#neonOrange)" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      </g>

      <g opacity="0.5">
        <circle cx="100" cy="20" r="1.5" fill="#00f5ff" />
        <circle cx="140" cy="40" r="1" fill="#ff00ff" />
        <circle cx="160" cy="80" r="1.5" fill="#00ff88" />
        <circle cx="180" cy="100" r="1" fill="#ff6b00" />
        <circle cx="160" cy="120" r="1.5" fill="#00f5ff" />
        <circle cx="140" cy="160" r="1" fill="#bd00ff" />
        <circle cx="100" cy="180" r="1.5" fill="#ff0080" />
        <circle cx="60" cy="160" r="1" fill="#00ffea" />
        <circle cx="40" cy="120" r="1.5" fill="#ff6b00" />
        <circle cx="20" cy="100" r="1" fill="#00f5ff" />
        <circle cx="40" cy="80" r="1.5" fill="#ff00ff" />
        <circle cx="60" cy="40" r="1" fill="#00ff88" />
      </g>
    </svg>
  );
}
