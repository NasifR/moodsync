"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../../lib/firebaseConfig";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const navItems = [
    { label: "Features", href: "/#features" },
    { label: "Survey", href: "/SurveyPage" },
    { label: "Dashboard", href: "/Dashboard" },
  ];

  useEffect(() => {
    // Track authentication state
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/SignUp");
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-purple-600" />
          <span className="text-xl font-semibold text-gray-900">MoodSync</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition-colors ${
                pathname === item.href
                  ? "text-purple-600 font-medium border-b-2 border-purple-600 pb-1"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right-side button */}
        {user ? (
          <Button
            onClick={handleLogout}
            className="bg-black hover:bg-red-600 text-white"
          >
            Log Out
          </Button>
        ) : (
          <Link href="/SignUp">
            <Button className="bg-purple-600 hover:bg-purple-700">
              Get Started
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
