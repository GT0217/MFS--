"use client"

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import type { AppWithScore } from "@/lib/types"

export function ScoreRadar({ app }: { app: AppWithScore }) {
  const data = [
    { axis: "편의성", value: app.score_convenience },
    { axis: "다양성", value: app.score_variety },
    { axis: "신속성", value: app.score_speed },
    { axis: "가독성", value: app.score_readability },
    { axis: "보안성", value: app.score_security },
  ]

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#e4eaf3" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "#0b1b3b", fontSize: 13, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            domain={[0, 10]}
            tickCount={4}
            tick={{ fill: "#94a3b8", fontSize: 10 }}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="#2563eb"
            fill="#2563eb"
            fillOpacity={0.35}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
