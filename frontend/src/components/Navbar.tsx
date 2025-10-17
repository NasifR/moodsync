"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: "Features", href: "/#features" }, // scroll link on landing page
    { label: "Survey", href: "/SurveyPage" },
    { label: "Dashboard", href: "/Dashboard" },
  ];

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
                  ? "text-purple-600 font-medium"
                  : "text-gray-600 hover:text-purple-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link href="/auth">
          <Button className="bg-purple-600 hover:bg-purple-700">Get Started</Button>
        </Link>
      </div>
    </header>
  );
}
