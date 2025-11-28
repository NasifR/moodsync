"use client";
import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const EMOTION_COLORS: Record<string, string> = {
  Happiness: "#0AC434",   // Green
  Anger: "#EF4444",       // Red
  Sadness: "#60A5FA",     // Soft blue
  Surprise: "#FDE047",    // Bright yellow
  Fear: "#7F1D1D",        // Dark red / fear tone
  Love: "#FB7185",        // Soft pink/red
  Neutral: "#9CA3AF",     // Gray
  Disgust: "#84CC16",     // Lime green
  Shame: "#C084FC",       // Purple
  Guilt: "#F59E0B",       // Orange
  Confusion: "#6366F1",   // Indigo/blue
  Desire: "#F43F5E",      // Deep pink
  Sarcasm: "#94A3B8",     // Slate gray
};


export default function EmotionWheel({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  const data = Object.entries(counts ?? {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  if (!data.length) {
    return (
      <div className="p-10 bg-transparent rounded-3xl shadow-xl text-gray-500 text-center">
        No emotion data yet
      </div>
    );
  }

  return (
    <div className="bg-transparent  rounded-3xl shadow-xl border border-purple-100 p-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Emotion Distribution</h3>
      <p className="text-sm text-gray-500 mb-6">Based on your last {total} entries</p>

      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={EMOTION_COLORS[entry.name] ?? "#CBD5E1"}
                />
              ))}
            </Pie>

            <Tooltip />
            <Legend verticalAlign="bottom" height={40} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
