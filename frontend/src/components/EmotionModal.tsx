"use client";
import React from "react";
import { Button } from "./ui/button";

export default function EmotionModal({
  isOpen,
  onClose,
  stressLevel,
  emotion,
  emoji,
}: {
  isOpen: boolean;
  onClose: () => void;
  stressLevel: any;
  emotion: string;
  emoji: string;
}) {
  if (!isOpen) return null;

  // 🎨 Stress Color Mapping
  const stressColors: Record<string, string> = {
    Low: "text-green-600",
    Medium: "text-yellow-600",
    High: "text-red-600",
  };

  // 🎨 Emotion Color Mapping
  const emotionColors: Record<string, string> = {
    Happiness: "text-green-600",
    Sadness: "text-blue-600",
    Anger: "text-red-600",
    Fear: "text-purple-600",
    Neutral: "text-gray-600",
  };

  const stressClass = stressColors[stressLevel] || "text-gray-700";
  const emotionClass = emotionColors[emotion] || "text-gray-700";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8 animate-fadeIn">
        <h2 className="text-2xl font-bold text-center mb-4 text-black">
          Your Daily Results
        </h2>

        <div className="space-y-4 text-center text-lg">
          <p>
            <span className="font-semibold text-gray-700">Stress Level: </span>
            <span className={`${stressClass} font-bold`}>
              {stressLevel}
            </span>
          </p>

          <p>
            <span className="font-semibold text-gray-700">
              Detected Emotion:
            </span>{" "}
            <span className={`${emotionClass} font-bold`}>
              {emotion} {emoji}
            </span>
          </p>
        </div>

        <div className="mt-8">
          <Button
            className="w-full bg-purple-600 hover:bg-black hover:shadow-lg hover:shadow-purple-600 text-white py-4 text-lg"
            onClick={onClose}
          >
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
