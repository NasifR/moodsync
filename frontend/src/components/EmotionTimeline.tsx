"use client";
import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export default function EmotionTimeline({
  data,
}: {
  data: { dateLabel: string; emotion: string }[];
}) {
  if (!data || data.length === 0) {
    return <div className="text-center text-gray-500 py-8">No emotion timeline yet.</div>;
  }

  // Map emotion → numeric axis for charting
  const emotionMap: any = {};
  const unique = [...new Set(data.map((d) => d.emotion))];
  unique.forEach((e, idx) => (emotionMap[e] = idx + 1));

  const chartData = data.map((d) => ({
    dateLabel: d.dateLabel,
    emotionValue: emotionMap[d.emotion],
    emotion: d.emotion,
  }));

  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
          <XAxis dataKey="dateLabel" tick={{ fill: "#6B7280", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#6B7280", fontSize: 12 }}
            domain={[1, unique.length]}
            tickFormatter={(v) => unique[v - 1]}
          />
          <Tooltip formatter={(v, _, e) => unique[v - 1]} />
          <Line type="monotone" dataKey="emotionValue" stroke="#A855F7" strokeWidth={3} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
