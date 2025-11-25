"use client";
import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = [
  "#A78BFA", // purple
  "#60A5FA", // blue
  "#F472B6", // pink
  "#FBBF24", // amber
  "#34D399", // green
  "#F87171", // red
  "#38BDF8", // sky
  "#C084FC", // violet
];

export default function EmotionWheel({ data }: { data: { name: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No emotion data yet.</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={80}
            label
          >
            {data.map((e, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
