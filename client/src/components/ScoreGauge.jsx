import React from 'react';

const scoreColor = (score) => {
  if (score >= 76) return '#dc2626';
  if (score >= 51) return '#ea580c';
  if (score >= 26) return '#d97706';
  return '#16a34a';
};

export default function ScoreGauge({ score, size = 80, label, invertColor = false }) {
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, score));
  const dashOffset = circ * (1 - pct / 100);
  const color = invertColor
    ? (score >= 76 ? '#16a34a' : score >= 51 ? '#d97706' : score >= 26 ? '#ea580c' : '#dc2626')
    : scoreColor(score);
  const fontSize = size < 70 ? 16 : 22;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={6} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circ} strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%" y="50%"
          dominantBaseline="middle" textAnchor="middle"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center', fill: color, fontSize, fontWeight: 700, fontFamily: 'Inter, sans-serif' }}
        >
          {score}
        </text>
      </svg>
      {label && <p className="text-xs text-center text-slate-500 leading-tight max-w-[80px]">{label}</p>}
    </div>
  );
}
