"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, setDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RadioButton from "@/components/ui/RadioButton";
import { Heart } from "lucide-react";
import { Navbar } from "@/components/Navbar";

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


  // handle form submit by sending data to backend, then storing everything in Firestore
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to submit.");
    router.push("/SignUp");
    return;
  }

  try {
    // Convert "Yes"/"No" to 1/0 for backend compatibility
    const formattedData = {
      sleep_hours: parseFloat(formData.sleepHours) || 0,
      caffeine_intake: parseFloat(formData.caffeineCups) || 0,
      physical_activity_hours: parseFloat(formData.physicalActivity) || 0,
      screen_time: parseFloat(formData.screenTime) || 0,
      work_hours: parseFloat(formData.workStudyHours) || 0,
      smoking: formData.smokingHabit === "Yes" ? 1 : 0,
    };

    // Send data to FastAPI backend for stress prediction
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    });

    if (!response.ok) throw new Error("Backend request failed");

    const result = await response.json();
    const predictedStress = result.predicted_stress_level;

    // Store everything in Firestore under the user's subcollection
    await addDoc(collection(db, "users", user.uid, "checkins"), {
      ...formData,
      predictedStress,
      createdAt: serverTimestamp(),
    });

    alert(`Survey submitted! Predicted stress level: ${predictedStress}`);

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
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100">
      <Navbar />
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
                placeholder="e.g., 30"
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
                <Label className="text-gray-700 text-base">Are you a smoker?</Label>
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
                placeholder="Share as much detail as you'd like about how you're feeling, what happened today, and anything else on your mind..."
                rows={6}
                className="w-full text-gray-900 bg-white placeholder:text-gray-500 rounded-md border border-purple-200 px-3 py-3 text-base transition-[color,box-shadow] outline-none resize-none focus:border-purple-600 focus:ring-purple-600/50 focus:ring-[3px]"
              />
            </div>

            <div className="pt-6">
              <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-black hover:shadow-xl hover:shadow-purple-600 text-white text-lg py-6 transition-all"
              >
                Submit Check-In
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
