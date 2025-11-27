import React from 'react'

export default function PieChart({ value = 32, max = 100, color = '#FBBD08' }) {
  const percentage = (value / max) * 100

  return (
    <div className="relative size-40">
      {/* Pie Chart */}
      <div
        className="w-full h-full rounded-full"
        style={{
          background: `conic-gradient(${color} ${percentage}%, #e5e7eb ${percentage}%)`
        }}
      />
      {/* Centered Value */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  )
}
