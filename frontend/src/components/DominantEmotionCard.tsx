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

export default function DominantEmotionCard({
  dominant,
  total,
}: {
  dominant?: { label: string; count: number } | null;
  total: number;
}) {
  if (!dominant) {
    return (
      <div className="p-10 bg-transparent rounded-3xl shadow-xl border border-purple-100 text-center">
        <div className="text-gray-500 text-sm">No dominant emotion yet</div>
      </div>
    );
  }

  const percent = total > 0 ? Math.round((dominant.count / total) * 100) : 0;
  const emoji = EMOJI_MAP[dominant.label] ?? "❓";

  return (
    <div className="bg-transparent rounded-3xl shadow-xl border border-purple-100 p-8 flex items-center gap-6">
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 flex items-center justify-center text-5xl shadow-inner">
        {emoji}
      </div>

      {/* Text */}
      <div className="flex-1">
        <p className="text-sm text-gray-500">Dominant Emotion</p>
        <p className="text-3xl font-bold text-gray-900">{dominant.label}</p>
        <p className="text-sm text-gray-500 mt-2">
          {dominant.count} / {total} entries ({percent}%)
        </p>
      </div>
    </div>
  );
}
