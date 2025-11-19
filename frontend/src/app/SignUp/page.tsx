"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../lib/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ArrowLeft } from "lucide-react";

export default function Signup() {
  const router = useRouter();

  // Redirect if user already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.push("/SurveyPage");
    });
    return () => unsubscribe();
  }, [router]);

  type FormData = {
    email: string;
    password: string;
    fullName: string;
  };

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    fullName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const { email, password, fullName } = formData;

    if (!email || !password || !fullName) {
      alert("Please fill in all fields.");
      return;
    }

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        createdAt: new Date(),
      });

      await sendEmailVerification(user);
      alert(
        "A verification link was sent to your email. Please check your inbox."
      );

      router.push("/SurveyPage");
    } catch (error: any) {
      console.error("Signup failed:", error);
      alert("Signup failed. Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/SurveyPage");
    } catch (error: any) {
      console.log(error);
      alert("Login failed. Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-200 via-white to-blue-100 min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Button
            variant="ghost"
            className="absolute left-6 top-6 text-black hover:bg-purple-300"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">MindSight</span>
          </div>
        </div>

        <Card className="border-purple-200 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-black">Welcome</CardTitle>
            <CardDescription className="text-gray-600">
              Sign in to your account or create a new one to start tracking your
              emotional wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-black"
                >
                  Sign In
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-black"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <form className="space-y-4 mt-4" onSubmit={handleLogin}>
                  <div className="space-y-2">
                    <Label className="text-gray-600" htmlFor="email">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      required
                      onChange={handleChange}
                      className="border-purple-200 focus:border-purple-500 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600" htmlFor="password">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      onChange={handleChange}
                      required
                      className="border-purple-200 focus:border-purple-500 text-gray-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-black hover:cursor-pointer hover:text-white hover:shadow-lg hover:shadow-purple-600 transition-all"
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <a
                      href="#"
                      className="text-sm text-purple-600 hover:text-purple-700"
                    >
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </TabsContent>

              {/* Signup Tab */}
              <TabsContent value="signup">
                <form className="space-y-4 mt-4" onSubmit={handleSignup}>
                  <div className="space-y-2">
                    <Label className="text-gray-600" htmlFor="fullName">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      required
                      onChange={handleChange}
                      className="border-purple-200 focus:border-purple-500 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600" htmlFor="signup-email">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      onChange={handleChange}
                      required
                      className="border-purple-200 focus:border-purple-500 text-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-600" htmlFor="signup-password">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      onChange={handleChange}
                      className="border-purple-200 focus:border-purple-500 text-gray-500"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-purple-600 hover:bg-black hover:cursor-pointer hover:text-white hover:shadow-lg hover:shadow-purple-600 transition-all"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy
              Policy
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@MindSight.com"
              className="text-purple-600 hover:text-purple-700"
            >
              support@MindSight.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
