"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MessageCircle,
  X,
  Send,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { auth, db } from "../../lib/firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const PRESET_MESSAGES = [
  "What can I do to reduce my stress levels?",
  "How is my sleep affecting my mood?",
  "What patterns do you see in my wellness data?",
  "Give me tips for better emotional wellbeing",
  "How can I improve my daily routine?",
];

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const presetScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const checkScrollButtons = () => {
    if (presetScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = presetScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
  }, [isOpen]);

  const scrollPresets = (direction: "left" | "right") => {
    if (presetScrollRef.current) {
      const scrollAmount = 200;
      const newScrollLeft =
        direction === "left"
          ? presetScrollRef.current.scrollLeft - scrollAmount
          : presetScrollRef.current.scrollLeft + scrollAmount;

      presetScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });

      setTimeout(checkScrollButtons, 300);
    }
  };

  const fetchUserContext = async () => {
    if (!currentUser) {
      return null;
    }

    try {
      const colRef = collection(db, "users", currentUser.uid, "checkins");
      const q = query(colRef, orderBy("createdAt", "desc"), limit(7));
      const snapshot = await getDocs(q);

      const checkins = snapshot.docs.map((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt || data.created_at;
        let dateStr = "Unknown date";

        if (createdAt) {
          try {
            if (createdAt.toDate) {
              dateStr = createdAt.toDate().toISOString();
            } else if (typeof createdAt === "number") {
              dateStr = new Date(createdAt).toISOString();
            } else if (createdAt.seconds) {
              dateStr = new Date(createdAt.seconds * 1000).toISOString();
            }
          } catch (e) {
            console.error("Error converting date:", e);
          }
        }

        return {
          ...data,
          id: doc.id,
          createdAt: dateStr,
        };
      });

      return {
        total_checkins: checkins.length,
        checkins: checkins,
        user_id: currentUser.uid,
        user_email: currentUser.email,
      };
    } catch (error) {
      console.error("Error fetching user context:", error);
      return null;
    }
  };

  const sendMessage = async (messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const userContext = await fetchUserContext();

      const response = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: messageText,
          user_context: userContext,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg hover:shadow-xl transition-all z-50"
          aria-label="Open chat"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] flex flex-col shadow-2xl z-50 rounded-lg overflow-hidden bg-white border border-purple-200">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">MindSight Assistant</h3>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-purple-500 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Welcome to MindSight Assistant
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a question below to get personalized wellness insights
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-purple-600 text-white"
                      : "bg-white text-gray-900 border border-gray-200"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      message.sender === "user"
                        ? "text-purple-200"
                        : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-200 flex-shrink-0">
            <div>
              <p className="text-xs text-gray-500 mb-2">Choose a question:</p>
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => scrollPresets("left")}
                  disabled={!canScrollLeft}
                  className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                    canScrollLeft
                      ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div
                  ref={presetScrollRef}
                  onScroll={checkScrollButtons}
                  className="flex-1 flex gap-2 overflow-x-auto scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {PRESET_MESSAGES.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => sendMessage(preset)}
                      disabled={loading}
                      className="flex-shrink-0 px-3 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => scrollPresets("right")}
                  disabled={!canScrollRight}
                  className={`flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                    canScrollRight
                      ? "bg-purple-100 hover:bg-purple-200 text-purple-700"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
