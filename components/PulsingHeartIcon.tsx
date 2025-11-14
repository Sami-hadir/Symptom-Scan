import React from 'react';

export const PulsingHeartIcon = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div className="relative w-24 h-24" {...props}>
    <style>{`
      @keyframes professional-heart-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }
      @keyframes professional-blood-flow-start {
        0%, 100% { stop-color: #fca5a5; } /* danger-light */
        50% { stop-color: #ef4444; } /* danger-DEFAULT */
      }
      @keyframes professional-blood-flow-end {
        0%, 100% { stop-color: #ef4444; } /* danger-DEFAULT */
        50% { stop-color: #b91c1c; } /* danger-dark */
      }
      .professional-heart-pulse {
        animation: professional-heart-pulse 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
        transform-origin: center center;
      }
      .gradient-start {
        animation: professional-blood-flow-start 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
      }
      .gradient-end {
        animation: professional-blood-flow-end 1.5s cubic-bezier(0.455, 0.03, 0.515, 0.955) infinite;
      }
    `}</style>
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
      <defs>
        <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" className="gradient-start" />
          <stop offset="100%" className="gradient-end" />
        </linearGradient>
      </defs>
      <g className="professional-heart-pulse">
        <path
          fill="url(#heartGradient)"
          stroke="#991b1b"
          strokeWidth="1.5"
          d="M 50,25 C 20,0 0,25 0,45 C 0,70 30,95 50,95 C 70,95 100,70 100,45 C 100,25 80,0 50,25 Z M 42,22 C 42,18 45,15 50,15 C 55,15 58,18 58,22 C 65,22 70,15 78,15 C 85,15 90,20 90,28 C 90,35 85,40 80,42 V 42 C 85,45 90,50 90,58 C 90,65 85,70 78,70 C 70,70 65,62 58,62 C 58,68 55,72 50,72 C 45,72 42,68 42,62 C 35,62 30,70 22,70 C 15,70 10,65 10,58 C 10,50 15,45 20,42 V 42 C 15,40 10,35 10,28 C 10,20 15,15 22,15 C 30,15 35,22 42,22 Z"
        />
      </g>
    </svg>
  </div>
);
