"use client";

import { useEffect, useState } from "react";

export function ChainLogo({ className = "", size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="chainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b35" />
          <stop offset="50%" stopColor="#20b2aa" />
          <stop offset="100%" stopColor="#ff6b35" />
        </linearGradient>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#glow)">
        <path
          d="M15 50 C15 35, 30 25, 45 25 C55 25, 60 30, 60 40 C60 50, 50 55, 40 55 C30 55, 25 50, 25 45"
          stroke="url(#chainGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M85 50 C85 65, 70 75, 55 75 C45 75, 40 70, 40 60 C40 50, 50 45, 60 45 C70 45, 75 50, 75 55"
          stroke="url(#chainGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="50" cy="50" r="8" fill="url(#chainGradient)" />
        <circle cx="50" cy="50" r="4" fill="var(--background, #0d1f1c)" />
      </g>
    </svg>
  );
}

const FIXED_PARTICLES = [
  { left: 5, top: 10, delay: 0, duration: 3 },
  { left: 15, top: 30, delay: 1.2, duration: 3.5 },
  { left: 25, top: 50, delay: 2.4, duration: 2.8 },
  { left: 35, top: 70, delay: 0.8, duration: 4 },
  { left: 45, top: 20, delay: 3.1, duration: 3.2 },
  { left: 55, top: 40, delay: 1.5, duration: 2.5 },
  { left: 65, top: 60, delay: 2.8, duration: 3.8 },
  { left: 75, top: 80, delay: 0.3, duration: 4.2 },
  { left: 85, top: 25, delay: 1.8, duration: 3.1 },
  { left: 95, top: 45, delay: 2.1, duration: 2.9 },
  { left: 10, top: 65, delay: 3.5, duration: 3.6 },
  { left: 20, top: 85, delay: 0.6, duration: 4.5 },
  { left: 30, top: 15, delay: 1.9, duration: 2.7 },
  { left: 40, top: 35, delay: 2.7, duration: 3.3 },
  { left: 50, top: 55, delay: 0.9, duration: 4.1 },
  { left: 60, top: 75, delay: 3.3, duration: 2.6 },
  { left: 70, top: 5, delay: 1.1, duration: 3.9 },
  { left: 80, top: 90, delay: 2.5, duration: 3.4 },
  { left: 90, top: 35, delay: 0.4, duration: 4.3 },
  { left: 8, top: 55, delay: 1.7, duration: 2.8 },
];

export function ChainBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="chain-bg">
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="fireGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="0" />
            <stop offset="20%" stopColor="#ff6b35" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ff8c00" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#ff6b35" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff4500" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="fireGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff8c00" stopOpacity="0" />
            <stop offset="30%" stopColor="#ffa500" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ff6347" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#ffa500" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff8c00" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="50%" stopColor="#718096" />
            <stop offset="100%" stopColor="#4a5568" />
          </linearGradient>
          <filter id="fireBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="chainShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>

        <g className="chain-snake chain-1">
          <path
            d="M-100,50 Q200,100 400,200 T800,350 T1200,250 T1600,400 T2000,300"
            stroke="url(#steelGrad)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            filter="url(#chainShadow)"
          />
          <path
            d="M-100,50 Q200,100 400,200 T800,350 T1200,250 T1600,400 T2000,300"
            stroke="url(#fireGrad1)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            filter="url(#fireBlur)"
            className="fire-glow"
          />
        </g>

        <g className="chain-snake chain-2">
          <path
            d="M2000,100 Q1600,200 1200,150 T600,300 T200,200 T-200,350"
            stroke="url(#steelGrad)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            filter="url(#chainShadow)"
          />
          <path
            d="M2000,100 Q1600,200 1200,150 T600,300 T200,200 T-200,350"
            stroke="url(#fireGrad2)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            filter="url(#fireBlur)"
            className="fire-glow"
          />
        </g>

        <g className="chain-snake chain-3">
          <path
            d="M-100,400 Q300,350 600,450 T1000,380 T1400,500 T1800,420 T2200,480"
            stroke="url(#steelGrad)"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            filter="url(#chainShadow)"
          />
          <path
            d="M-100,400 Q300,350 600,450 T1000,380 T1400,500 T1800,420 T2200,480"
            stroke="url(#fireGrad1)"
            strokeWidth="11"
            fill="none"
            strokeLinecap="round"
            filter="url(#fireBlur)"
            className="fire-glow"
          />
        </g>

        <g className="chain-snake chain-4">
          <path
            d="M-50,600 Q400,500 700,650 T1100,550 T1500,700 T1900,580 T2100,650"
            stroke="url(#steelGrad)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            filter="url(#chainShadow)"
          />
          <path
            d="M-50,600 Q400,500 700,650 T1100,550 T1500,700 T1900,580 T2100,650"
            stroke="url(#fireGrad2)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            filter="url(#fireBlur)"
            className="fire-glow"
          />
        </g>

        <g className="chain-snake chain-5">
          <path
            d="M-100,700 Q300,500 500,600 T900,400 T1300,550 T1700,350 T2100,500"
            stroke="url(#steelGrad)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            filter="url(#chainShadow)"
          />
          <path
            d="M-100,700 Q300,500 500,600 T900,400 T1300,550 T1700,350 T2100,500"
            stroke="url(#fireGrad1)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            filter="url(#fireBlur)"
            className="fire-glow"
          />
        </g>

        <g className="chain-snake chain-6">
          <path
            d="M2100,50 Q1700,150 1400,80 T900,180 T500,100 T100,200 T-100,120"
            stroke="url(#steelGrad)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            filter="url(#chainShadow)"
          />
          <path
            d="M2100,50 Q1700,150 1400,80 T900,180 T500,100 T100,200 T-100,120"
            stroke="url(#fireGrad2)"
            strokeWidth="9"
            fill="none"
            strokeLinecap="round"
            filter="url(#fireBlur)"
            className="fire-glow"
          />
        </g>
      </svg>

      {mounted && (
        <div className="fire-particles">
          {FIXED_PARTICLES.map((particle, i) => (
            <div
              key={i}
              className="fire-particle"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
