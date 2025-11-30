"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RadioButton from "@/components/ui/RadioButton";
import { Navbar } from "@/components/Navbar";
import EmotionModal from "@/components/EmotionModal";

export default function SurveyPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    sleepHours: "",
    caffeineCups: "",
    physicalActivity: "",
    screenTime: "",
    workStudyHours: "",
    smokingHabit: "No",
    dayDescription: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [predictedStress, setPredictedStress] = useState("");
  const [emotion, setEmotion] = useState("");
  const [emoji, setEmoji] = useState("");
  const [moodScore, setMoodScore] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/SignUp");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/SignUp");
  };

  const handleNumberChange = (field: string, value: string) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // SUBMIT LOGIC (same as your old one, just added Emotion API)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to submit.");
      router.push("/SignUp");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare stress input
      const formattedData = {
        sleep_hours: parseFloat(formData.sleepHours) || 0,
        caffeine_intake: parseFloat(formData.caffeineCups) || 0,
        physical_activity_hours: parseFloat(formData.physicalActivity) || 0,
        screen_time: parseFloat(formData.screenTime) || 0,
        work_hours: parseFloat(formData.workStudyHours) || 0,
        smoking: formData.smokingHabit === "Yes" ? 1 : 0,
      };

      const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

      // 1️⃣ CALL STRESS BACKEND
      const stressResp = await fetch(`${API_URL}/predict-stress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedData),
      });

      if (!stressResp.ok) throw new Error("Stress API failed");

      const stressData = await stressResp.json();
      const detectedStress = stressData.predicted_stress_level;

      // 2️⃣ CALL EMOTION BACKEND
      const emotionResp = await fetch(`${API_URL}/analyze-emotion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formData.dayDescription }),
      });

      if (!emotionResp.ok) throw new Error("Emotion API failed");

      const emotionData = await emotionResp.json();
      const detectedEmotion = emotionData.emotion;
      const detectedEmoji = emotionData.emoji;

      const sentimentResp = await fetch(`${API_URL}/analyze-sentiment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: formData.dayDescription }),
      });

      if (!sentimentResp.ok) throw new Error("Sentiment API failed");

      const sentimentData = await sentimentResp.json();
      const moodScore = sentimentData.valence;

      // Store in Firestore
      await addDoc(collection(db, "users", user.uid, "checkins"), {
        ...formData,
        predictedStress: detectedStress,
        detectedEmotion,
        moodScore,
        createdAt: serverTimestamp(),
      });

      // Set modal states
      setPredictedStress(detectedStress);
      setEmotion(detectedEmotion);
      setEmoji(detectedEmoji);
      setMoodScore(moodScore);

      // Show modal
      setModalOpen(true);

      // Clear form
      setFormData({
        sleepHours: "",
        caffeineCups: "",
        physicalActivity: "",
        screenTime: "",
        workStudyHours: "",
        dayDescription: "",
        smokingHabit: "No",
      });
    } catch (error) {
      console.error("Error submitting survey:", error);
      alert("Failed to submit survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100">
      <Navbar />

      <EmotionModal
        isOpen={modalOpen}
        onClose={() => router.push("/Dashboard")}
        stressLevel={predictedStress}
        emotion={emotion}
        emoji={emoji}
        moodScore={moodScore}
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 mt-10">
            Daily Check-In
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us understand your day better by sharing a few details about
            your activities and feelings.
          </p>
        </div>

        <Card className="p-8 md:p-10 shadow-2xl border-purple-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="sleepHours" className="text-gray-700 text-base">
                How many hours did you sleep last night?
              </Label>
              <Input
                id="sleepHours"
                type="text"
                inputMode="decimal"
                value={formData.sleepHours}
                onChange={(e) =>
                  handleNumberChange("sleepHours", e.target.value)
                }
                placeholder="e.g., 7.5"
                className="py-5 text-gray-900 placeholder:text-gray-500 bg-white border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caffeineCups" className="text-gray-700 text-base">
                How much caffeine (in cups) did you consume today?
              </Label>
              <Input
                id="caffeineCups"
                type="text"
                inputMode="decimal"
                value={formData.caffeineCups}
                onChange={(e) =>
                  handleNumberChange("caffeineCups", e.target.value)
                }
                placeholder="e.g., 2"
                className="py-5 text-gray-900 placeholder:text-gray-500 bg-white border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="physicalActivity"
                className="text-gray-700 text-base"
              >
                Physical activity today (in hours)
              </Label>
              <Input
                id="physicalActivity"
                type="text"
                inputMode="numeric"
                value={formData.physicalActivity}
                onChange={(e) =>
                  handleNumberChange("physicalActivity", e.target.value)
                }
                placeholder="e.g., 2"
                className="py-5 text-gray-900 placeholder:text-gray-500 bg-white border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenTime" className="text-gray-700 text-base">
                Screen time today (in hours)
              </Label>
              <Input
                id="screenTime"
                type="text"
                inputMode="decimal"
                value={formData.screenTime}
                onChange={(e) =>
                  handleNumberChange("screenTime", e.target.value)
                }
                placeholder="e.g., 6"
                className="py-5 text-gray-900 placeholder:text-gray-500 bg-white border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="workStudyHours"
                className="text-gray-700 text-base"
              >
                Work/study load today (in hours)
              </Label>
              <Input
                id="workStudyHours"
                type="text"
                inputMode="decimal"
                value={formData.workStudyHours}
                onChange={(e) =>
                  handleNumberChange("workStudyHours", e.target.value)
                }
                placeholder="e.g., 8"
                className="py-5 text-gray-900 placeholder:text-gray-500 bg-white border border-purple-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700 text-base">
                Are you a smoker?
              </Label>
              <div className="flex items-center space-x-6">
                <RadioButton
                  label="Yes"
                  name="smokingHabit"
                  value="Yes"
                  checked={formData.smokingHabit === "Yes"}
                  onChange={(value) => handleChange("smokingHabit", value)}
                />
                <RadioButton
                  label="No"
                  name="smokingHabit"
                  value="No"
                  checked={formData.smokingHabit === "No"}
                  onChange={(value) => handleChange("smokingHabit", value)}
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Label
                htmlFor="dayDescription"
                className="text-gray-700 text-base"
              >
                Tell us about your day
              </Label>
              <textarea
                id="dayDescription"
                value={formData.dayDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    dayDescription: e.target.value,
                  }))
                }
                placeholder="Help us understand your day better by sharing a few details about your activities and feelings."
                rows={6}
                className="w-full text-gray-900 bg-white placeholder:text-gray-500 rounded-md border border-purple-200 px-3 py-3 text-base transition-[color,box-shadow] outline-none resize-none focus:border-purple-600 focus:ring-purple-600/50 focus:ring-[3px]"
              />
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-purple-600 hover:bg-black hover:shadow-xl hover:shadow-purple-600 text-white text-lg py-6 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
              >
                {isSubmitting ? "Submitting..." : "Submit Check-In"}
              </Button>
            </div>
          </form>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            Your responses help us provide personalized insights about your
            emotional wellbeing.
          </p>
        </div>
      </div>
    </div>
  );
}
