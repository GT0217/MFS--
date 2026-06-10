"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts"
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
          <PolarGrid
            stroke="var(--color-border)"
            strokeOpacity={0.8}
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={({ x, y, payload, textAnchor }) => (
              <text
                x={x}
                y={y}
                textAnchor={textAnchor}
                fontSize={12}
                fontWeight={600}
                fill="var(--color-foreground)"
              >
                {payload.value}
              </text>
            )}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 10]}
            tick={false}
            axisLine={false}
          />
          <Radar
            dataKey="value"
            stroke="var(--color-primary)"
            fill="var(--color-primary)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
