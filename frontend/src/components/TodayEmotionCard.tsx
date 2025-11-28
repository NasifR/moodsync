"use client";
import React from "react";

const EMOJI_MAP: Record<string, string> = {
  Sadness: "😢",
  Anger: "😠",
  Love: "❤️",
  Surprise: "😲",
  Fear: "😱",
  Happiness: "😄",
  Neutral: "😐",
  Disgust: "🤢",
  Shame: "🙈",
  Guilt: "😔",
  Confusion: "😕",
  Desire: "🔥",
  Sarcasm: "😏",
};

export default function TodayEmotionCard({
  emotion,
  className = "",
}: {
  emotion?: string | null;
  className?: string;
}) {
  const todayLabel = new Date().toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  // If no emotion for today, show "no entry"
  if (!emotion) {
    return (
      <div
        className={`bg-transparent rounded-3xl shadow-xl border border-purple-100 p-8 flex items-center gap-6 ${className}`}
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 via-blue-200 to-purple-200 flex items-center justify-center text-5xl">
          ❓
        </div>

        <div className="flex-1">
          <p className="text-sm text-gray-500">{todayLabel}</p>
          <p className="text-3xl font-bold text-gray-900">No entry today</p>
          <p className="text-sm text-gray-500 mt-2">
            Take today's survey first
          </p>
        </div>
      </div>
    );
  }

  const emoji = EMOJI_MAP[emotion] ?? "❓";

  return (
    <div
      className={`bg-transparent rounded-3xl shadow-xl border border-purple-100 p-8 flex items-center gap-6 ${className}`}
    >
      {/* Big emoji bubble */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 flex items-center justify-center text-5xl shadow-inner">
        {emoji}
      </div>

      {/* Text info */}
      <div className="flex-1">
        <p className="text-sm text-gray-500">{todayLabel}</p>
        <p className="text-3xl font-bold text-gray-900">{emotion}</p>
      </div>
    </div>
  );
}
