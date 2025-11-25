"use client";
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DominantEmotionCard({
  emotion,
  count,
  total,
  emoji,
}: {
  emotion: string;
  count: number;
  total: number;
  emoji: string;
}) {
  if (!emotion) {
    return (
      <Card className="border-purple-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-700">Dominant Emotion</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-500">No emotion data available yet.</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-purple-100 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-700">Dominant Emotion</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="text-center space-y-2">
          <p className="text-4xl">{emoji}</p>
          <p className="text-xl font-semibold text-purple-700">{emotion}</p>
          <p className="text-gray-500 text-sm">
            Detected {count} out of {total} check-ins
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
