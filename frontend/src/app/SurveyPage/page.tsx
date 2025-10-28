"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../../lib/firebaseConfig";
import { Button } from "@/components/ui/button";

export default function SurveyPage() {
  const router = useRouter();

  // Redirect to signup if not logged in
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-200">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Welcome to the Survey Page 🎉
      </h1>
      <p className="text-gray-700 mb-8">
        You’re now logged in. Soon you’ll see your survey questions here.
      </p>
      <Button
        onClick={handleLogout}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl"
      >
        Log Out
      </Button>
    </div>
  );
}
