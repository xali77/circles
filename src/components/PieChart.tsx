'use client';

import { motion } from 'framer-motion';

interface Props {
  yesPercent: number; // 0-100
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
}

export default function PieChart({ yesPercent, size = 80, strokeWidth = 10, children }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const yesLength = (yesPercent / 100) * circumference;
  const noLength = circumference - yesLength;
  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* No (red) - background full circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#ff5252"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity={0.9}
        />
        {/* Yes (green) - overlay arc */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#4caf50"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${yesLength} ${noLength}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          opacity={0.9}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
