"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          setUser({
            id: currentUser.uid,
            email: currentUser.email,
            name:
              userData.fullName ||
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "User",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            id: currentUser.uid,
            email: currentUser.email,
            name:
              currentUser.displayName ||
              currentUser.email?.split("@")[0] ||
              "User",
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setDropdownOpen(false);
    router.push("/");
  };

  const unauthenticatedNavItems = [
    { label: "Features", href: "#features" },
    { label: "Our Mission", href: "#mission-vision" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-sm border-b border-purple-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="w-8 h-8 text-purple-600" />
          <span className="text-xl font-semibold text-gray-900">MindSight</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-8">
          {mounted &&
            !user &&
            unauthenticatedNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 py-2 transition-all text-gray-600 hover:text-white hover:bg-black hover:shadow-lg hover:shadow-purple-600 rounded-lg"
              >
                {item.label}
              </Link>
            ))}
        </nav>

        {mounted && user ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-2 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-lg transition-colors"
            >
              <User className="w-5 h-5 text-purple-600" />
              <span className="text-gray-700 font-medium">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                  <Link href="/SurveyPage">
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Check-In
                    </button>
                  </Link>
                  <Link href="/Dashboard">
                    <button
                      onClick={() => setDropdownOpen(false)}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-50 transition-colors"
                    >
                      Dashboard
                    </button>
                  </Link>
                  <div className="border-t border-gray-200 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : mounted ? (
          <Link href="/SignUp">
            <Button className="bg-purple-600 hover:bg-black hover:cursor-pointer text-white hover:shadow-lg hover:shadow-purple-600 transition-all">
              Get Started
            </Button>
          </Link>
        ) : (
          <div className="w-32 h-10" />
        )}
      </div>
    </header>
  );
}
