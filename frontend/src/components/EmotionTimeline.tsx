"use client";
import React from "react";

export default function EmotionTimeline({
  timeline,
}: {
  timeline: { dateLabel: string; emotion?: string; emoji?: string }[];
}) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="p-10 bg-white rounded-3xl shadow-xl text-center text-gray-500">
        No timeline data
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-purple-100 p-8 w-full">
      <h3 className="text-lg font-semibold text-gray-800">Emotion Timeline</h3>
      <p className="text-sm text-gray-500 mb-6">
        Most recent → oldest (scroll horizontally)
      </p>

      <div className="overflow-x-auto">
        <div className="flex space-x-4 pb-3">
          {timeline.map((t, i) => (
            <div
              key={i}
              className="min-w-[110px] bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm rounded-xl p-4 text-center"
            >
              <div className="text-3xl mb-2">{t.emoji ?? "—"}</div>
              <div className="text-sm font-semibold text-gray-900">{t.emotion ?? "Unknown"}</div>
              <div className="text-xs text-gray-500 mt-1">{t.dateLabel}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
