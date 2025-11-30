"use client";

import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebaseConfig";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import ChatWidget from "@/components/ChatWidget";

import {
  Heart,
  LogOut,
  Bell,
  Search,
  ArrowRight,
  Sparkles,
  Smile,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import EmotionWheel from "@/components/EmotionWheel";
import EmotionTimeline from "@/components/EmotionTimeline";
import DominantEmotionCard from "@/components/DominantEmotionCard";
import TodayEmotionCard from "@/components/TodayEmotionCard";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const stressValue = payload[0].value;
    const stressLabel =
      stressValue <= 4 ? "Low" : stressValue <= 7 ? "Medium" : "High";

    return (
      <div className="bg-white border border-gray-300 p-2 rounded-lg shadow-md">
        <p className="text-purple-600 font-semibold">{label}</p>
        <p className="text-gray-800">
          Stress: <span className="font-medium">{stressLabel}</span>
        </p>
      </div>
    );
  }
  return null;
};

const MoodTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const moodValue = payload[0].value;
    const moodLabel =
      moodValue <= 3 ? "Negative" : moodValue <= 7 ? "Neutral" : "Positive";

    return (
      <div className="bg-white border border-gray-300 p-2 rounded-lg shadow-md">
        <p className="text-green-600 font-semibold">{label}</p>
        <p className="text-gray-800">
          Mood: <span className="font-medium">{moodLabel}</span>
        </p>
      </div>
    );
  }
  return null;
};

type Checkin = {
  sleepHours?: number | string;
  caffeineCups?: number | string;
  physicalActivity?: number | string; // minutes or hours depending on you
  screenTime?: number | string;
  workStudyHours?: number | string;
  dayDescription?: string;
  smoking?: number; // 0|1
  predictedStress?: string | number;
  createdAt?: Timestamp | { seconds: number } | string | number;
  // any other fields
  [key: string]: any;
};

interface DashboardPageProps {
  user?: { id: string; email?: string; name?: string } | null;
  onLogout?: () => void;
}

function toDate(x: any): Date {
  // Handle Firestore Timestamp, number/ms, or Date
  if (!x) return new Date();
  if (typeof x === "number") return new Date(x);
  if (x instanceof Date) return x;
  if (typeof x === "string") return new Date(x);
  if (x.seconds !== undefined && typeof x.seconds === "number")
    return new Date(x.seconds * 1000);
  if (x.toDate) return x.toDate(); // firebase Timestamp
  return new Date();
}

// Map stress label -> numeric value for chart (adjust values if you prefer)
function mapStressToNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (typeof val === "number") return val;
  const s = String(val).toLowerCase();
  if (s.includes("low")) return 3;
  if (s.includes("medium")) return 6;
  if (s.includes("high")) return 9;
  // fallback: try parse number
  const n = Number(val);
  if (!Number.isNaN(n)) return n;
  return 5; // neutral fallback
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function getMoodLabel(moodScore: number | string | undefined): string {
  if (moodScore === null || moodScore === undefined) return "Unknown";
  const score =
    typeof moodScore === "string" ? parseFloat(moodScore) : moodScore;
  if (isNaN(score)) return "Unknown";

  if (score >= 0.2) return "Positive";
  if (score <= -0.2) return "Negative";
  return "Neutral";
}

function mapMoodToNumber(moodScore: number | string | undefined): number {
  if (moodScore === null || moodScore === undefined) return 0;
  const score =
    typeof moodScore === "string" ? parseFloat(moodScore) : moodScore;
  if (isNaN(score)) return 0;
  return Math.round((score + 1) * 5);
}

export default function DashboardPage({
  user: userProp,
  onLogout,
}: DashboardPageProps) {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(userProp ?? null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // check auth and redirect if not logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoadingAuth(false);
        router.push("/SignUp");
      } else {
        try {
          // Fetch user details from Firestore
          const userDoc = await getDoc(doc(db, "users", u.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};

          setUser({
            id: u.uid,
            email: u.email,
            name:
              userData.fullName ||
              u.displayName ||
              u.email?.split("@")[0] ||
              "User",
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            id: u.uid,
            email: u.email,
            name: u.displayName || u.email?.split("@")[0] || "User",
          });
        }
        setLoadingAuth(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // checkins state
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  // fetch last 30 checkins for current user
  useEffect(() => {
    if (!user) return;
    let mounted = true;
    const fetchData = async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const colRef = collection(db, "users", user.id, "checkins");
        const q = query(colRef, orderBy("createdAt", "desc"), limit(30));
        const snap = await getDocs(q);
        if (!mounted) return;
        const docs: Checkin[] = snap.docs.map((d) => {
          const data = d.data() as any;
          return {
            ...data,
            id: d.id,
            createdAt: data.createdAt ?? data.created_at ?? Date.now(),
          } as Checkin;
        });
        setCheckins(docs);
      } catch (e: any) {
        console.error("Error fetching checkins:", e);
        setFetchError(String(e?.message ?? e));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();
    return () => {
      mounted = false;
    };
  }, [user]);

  // today's emotion
  function isToday(date: Date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  let todayEmotion: string | null = null;

  if (checkins.length > 0) {
    const latest = checkins[0];
    const d = toDate(latest.createdAt);

    if (isToday(d)) {
      todayEmotion = latest.detectedEmotion ?? null;
    }
  }

  // derive last 7 days aggregated series (or available days)
  const last7Series = useMemo(() => {
    // Build map for last 7 calendar dates (including today)
    const now = new Date();
    // Gather dates from checkins
    // We'll aggregate by date string "YYYY-MM-DD"
    const group: Record<
      string,
      {
        date: Date;
        stressVals: number[];
        physical: number[];
        screen: number[];
        moodVals: number[];
        raw: Checkin[];
      }
    > = {};

    const pushEntry = (dStr: string, date: Date, entry: Checkin) => {
      if (!group[dStr])
        group[dStr] = {
          date,
          stressVals: [],
          physical: [],
          screen: [],
          moodVals: [],
          raw: [],
        };
      group[dStr].raw.push(entry);
      group[dStr].stressVals.push(mapStressToNumber(entry.predictedStress));
      if (entry.physicalActivity !== undefined)
        group[dStr].physical.push(Number(entry.physicalActivity) || 0);
      if (entry.screenTime !== undefined)
        group[dStr].screen.push(Number(entry.screenTime) || 0);
      if (entry.moodScore !== undefined)
        group[dStr].moodVals.push(mapMoodToNumber(entry.moodScore));
    };

    checkins.forEach((c) => {
      const d = toDate(c.createdAt);
      const dStr = d.toISOString().slice(0, 10);
      pushEntry(dStr, d, c);
    });

    // If there are not 7 calendar days, use available unique days sorted desc up to 7.
    const uniqueDates = Object.keys(group)
      .sort((a, b) => (a < b ? 1 : -1)) // desc
      .slice(0, 7)
      .map((k) => ({ key: k, ...group[k] }))
      .reverse(); // reverse so earliest first

    // If no checkins, return empty
    if (uniqueDates.length === 0 && checkins.length > 0) {
      // fallback: use raw checkins limited to 7 most recent, one per checkin
      return checkins
        .slice(0, 7)
        .reverse()
        .map((c) => {
          const d = toDate(c.createdAt);
          return {
            dateLabel: formatShortDate(d),
            dateIso: d.toISOString().slice(0, 10),
            stress: mapStressToNumber(c.predictedStress),
            physical: Number(c.physicalActivity) || 0,
            screen: Number(c.screenTime) || 0,
            mood: mapMoodToNumber(c.moodScore),
          };
        });
    }

    return uniqueDates.map((u) => {
      const avgStress = u.stressVals.length
        ? Math.round(
            u.stressVals.reduce((a, b) => a + b, 0) / u.stressVals.length
          )
        : 0;
      const sumPhysical = u.physical.reduce((a, b) => a + b, 0);
      const sumScreen = u.screen.reduce((a, b) => a + b, 0);
      const avgMood = u.moodVals.length
        ? Math.round(u.moodVals.reduce((a, b) => a + b, 0) / u.moodVals.length)
        : 0;
      return {
        dateLabel: formatShortDate(u.date),
        dateIso: u.date.toISOString().slice(0, 10),
        stress: avgStress,
        physical: Math.round(sumPhysical),
        screen: Math.round(sumScreen),
        mood: avgMood,
      };
    });
  }, [checkins]);

  // list data to show (first 7 or 30)
  const listToShow = useMemo(() => {
    const limitCount = showMore ? 30 : 7;
    return checkins.slice(0, limitCount);
  }, [checkins, showMore]);

  // helper to display predictedStress in readable form
  const displayStressLabel = (val: any) => {
    if (val === null || val === undefined) return "Unknown";
    if (typeof val === "number") {
      // map numeric back to label roughly
      if (val <= 4) return "Low";
      if (val <= 7) return "Medium";
      return "High";
    }
    return String(val);
  };

  // --- NEW: derive emotions summary/timeline/dominant
  const emotionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    checkins.forEach((c) => {
      const e = (
        c.detectedEmotion ??
        c.detected_emotion ??
        c.predictedEmotion ??
        ""
      )
        .toString()
        .trim();
      if (!e) return;
      counts[e] = (counts[e] || 0) + 1;
    });
    return counts;
  }, [checkins]);

  const totalEmotionEntries = useMemo(() => {
    return Object.values(emotionCounts).reduce((a, b) => a + b, 0);
  }, [emotionCounts]);

  const dominantEmotion = useMemo(() => {
    let best: { label: string; count: number } | null = null;
    Object.entries(emotionCounts).forEach(([label, count]) => {
      if (!best || count > best.count) best = { label, count };
    });
    return best;
  }, [emotionCounts]);

  // timeline: use the most recent up to 12 checkins, oldest first
  const emotionTimeline = useMemo(() => {
    const items = checkins
      .filter((c) => {
        const emotion =
          c.detectedEmotion ?? c.detected_emotion ?? c.predictedEmotion ?? "";
        return emotion && emotion.toString().trim() !== "";
      })
      .slice(0, 12)
      .map((c) => {
        const d = toDate(c.createdAt);
        return {
          dateLabel: formatShortDate(d),
          emotion:
            c.detectedEmotion ??
            c.detected_emotion ??
            c.predictedEmotion ??
            "Unknown",
          emoji: (() => {
            const map: Record<string, string> = {
              Sadness: "😢",
              Anger: "😠",
              Love: "❤️",
              Surprise: "😲",
              Fear: "😱",
              Happiness: "😄",
              Neutral: "😐",
              Disgust: "🤢",
              Shame: "🙈",
              Guilt: "😔",
              Confusion: "😕",
              Desire: "🔥",
              Sarcasm: "😏",
            };
            return (
              map[
                (
                  c.detectedEmotion ??
                  c.detected_emotion ??
                  c.predictedEmotion ??
                  ""
                ).toString()
              ] ?? "❓"
            );
          })(),
          ts: toDate(c.createdAt).getTime(),
        };
      })
      .sort((a, b) => a.ts - b.ts)
      .map(({ ts, ...rest }) => rest);
    return items;
  }, [checkins]);

  // small handlers
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/SignUp");
  };

  // layout placeholders when loading / empty
  if (loadingAuth || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-36 h-36 rounded-full bg-purple-200 mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // redirect already triggered by auth listener
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-purple-700 to-purple-900 flex flex-col">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl">MindSight</span>
          </div>

          <nav className="space-y-2 mb-8">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <span>Dashboard</span>
            </button>
            <Link href="/SurveyPage">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
                <span>Survey</span>
              </button>
            </Link>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <span>Analytics</span>
            </button>
            <Link href="/">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
                <span>Home</span>
              </button>
            </Link>
          </nav>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-white/30">
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                  {String(user.name || "U")
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-purple-200 text-sm">Premium Member</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-purple-100 hover:bg-white/10 justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <div className="mt-auto p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-sm mb-2">Check your condition</p>
            <p className="text-purple-200 text-xs mb-3">
              Track stress, activity & screen time
            </p>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
              Check It Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-purple-100 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">
                Hi, <span className="font-semibold">{user.name}</span> 👋
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Welcome back — here's how you've been feeling.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-white border border-purple-200 rounded-xl text-sm focus:outline-none focus:border-purple-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stress last 7 days */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-700 font-bold">
                        Last week's stress level
                      </CardTitle>
                      <CardDescription className="text-gray-500 mt-1">
                        Trend based on your recent check-ins
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-600">
                      {last7Series.length
                        ? `${last7Series.length} days`
                        : "No data"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {last7Series.length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={last7Series}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                        <XAxis
                          dataKey="dateLabel"
                          tick={{ fill: "#6B7280", fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          tick={{ fill: "#6B7280", fontSize: 12 }}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="stress"
                          stroke="#7C3AED"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          animationDuration={800}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No stress data yet. Submit your first check-in to see it
                      here.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mood last 7 days */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-700 font-bold">
                        Last week's mood
                      </CardTitle>
                      <CardDescription className="text-gray-500 mt-1">
                        Sentiment analysis from your journal entries
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-600">
                      {last7Series.filter((s) => s.mood > 0).length
                        ? `${last7Series.filter((s) => s.mood > 0).length} days`
                        : "No data"}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {last7Series.filter((s) => s.mood > 0).length ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart
                        data={last7Series.filter((s) => s.mood > 0)}
                        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                        <XAxis
                          dataKey="dateLabel"
                          tick={{ fill: "#6B7280", fontSize: 12 }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          ticks={[2, 5, 8]}
                          tickFormatter={(value) => {
                            if (value <= 3) return "Negative";
                            if (value <= 7) return "Neutral";
                            return "Positive";
                          }}
                          tick={{ fill: "#6B7280", fontSize: 12 }}
                        />
                        <Tooltip content={<MoodTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke="#10B981"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          animationDuration={800}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="py-8 text-center text-gray-500">
                      No mood data available. Add journal entries to your
                      check-ins to see mood analysis here.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Multi metrics row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Physical activity */}
                <Card className="border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-700 font-bold">
                      Physical activity (recent)
                    </CardTitle>
                    <CardDescription className="text-gray-500 mt-1">
                      Minutes/hours recorded per day
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {last7Series.length ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={last7Series}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#F3E8FF"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="dateLabel"
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                          <Tooltip />
                          <Bar
                            dataKey="physical"
                            fill="#60A5FA"
                            radius={[6, 6, 0, 0]}
                            animationDuration={800}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No physical activity data yet.
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Screen time */}
                <Card className="border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-gray-700 font-bold">
                      Screen time (recent)
                    </CardTitle>
                    <CardDescription className="text-gray-500 mt-1">
                      Hours spent on screens
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {last7Series.length ? (
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart data={last7Series}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#F3E8FF"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="dateLabel"
                            tick={{ fill: "#6B7280", fontSize: 12 }}
                          />
                          <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
                          <Tooltip />
                          <Bar
                            dataKey="screen"
                            fill="#C084FC"
                            radius={[6, 6, 0, 0]}
                            animationDuration={800}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No screen time data yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DominantEmotionCard
                  dominant={dominantEmotion}
                  total={totalEmotionEntries}
                />

                <TodayEmotionCard emotion={todayEmotion} />
              </div>

              {/* --- Full-width Emotion Timeline (wider + nicer) --- */}
              <div className="mt-8">
                <EmotionTimeline timeline={emotionTimeline} />
              </div>
              {/*end of Emotion Timeline*/}

              {/* Recent list / activity */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-700 font-bold">
                        Recent check-ins
                      </CardTitle>
                      <CardDescription className="text-gray-500 mt-1">
                        See your latest mood & stress entries
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-purple-50 text-purple-700">
                        {checkins.length} total
                      </Badge>
                      <Button
                        onClick={() => setShowMore((s) => !s)}
                        className="bg-purple-600 border text-white border-purple-200 hover:bg-black hover:text-white hover:shadow-2xl hover:shadow-purple-600bg-purple-600 hover:cursor-pointer hover:shadow-purple-600 transition-all"
                      >
                        {showMore ? "Show less" : "Show more"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {checkins.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                      No check-ins yet. Start by submitting your daily check-in.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {listToShow.map((c: Checkin, idx: number) => {
                        const date = toDate(c.createdAt);
                        return (
                          <div
                            key={c.id ?? idx}
                            className="p-3 bg-white rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                    U
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {formatShortDate(date)}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {c.dayDescription
                                      ? c.dayDescription.slice(0, 80) +
                                        (c.dayDescription.length > 80
                                          ? "…"
                                          : "")
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="text-sm text-gray-500 mb-1">
                                Stress
                              </div>
                              <div className="font-semibold text-gray-900">
                                {displayStressLabel(c.predictedStress)}
                              </div>
                              {c.moodScore !== null &&
                                c.moodScore !== undefined && (
                                  <>
                                    <div className="text-sm text-gray-500 mt-2 mb-1">
                                      Mood
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                      {getMoodLabel(c.moodScore)}
                                    </div>
                                  </>
                                )}
                              <div className="text-xs text-gray-400 mt-1">
                                {toDate(c.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right column: summary + insights */}
            <div className="space-y-6">
              <Card className="border-purple-100 shadow-lg text-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-700 font-bold">
                    Overview
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    Quick insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Average stress (recent)
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {last7Series.length
                            ? Math.round(
                                last7Series.reduce((a, b) => a + b.stress, 0) /
                                  last7Series.length
                              )
                            : "—"}
                          <span className="text-xs text-gray-500"> /10</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Check-ins</p>
                        <p className="font-semibold text-gray-900">
                          {checkins.length}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smile className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Wellbeing is improving
                          </p>
                          <p className="text-sm text-gray-500">
                            Stay consistent with check-ins to track progress.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button
                        onClick={() => router.push("/SurveyPage")}
                        className="w-full bg-purple-600 border text-white border-purple-200 hover:bg-black hover:text-white hover:shadow-2xl hover:shadow-purple-600bg-purple-600 hover:cursor-pointer hover:shadow-purple-600 transition-all"
                      >
                        Add today's check-in
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-700 font-bold">
                    Tips
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    Quick actions to reduce stress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">
                          Short breathing exercise
                        </p>
                        <p className="text-sm text-gray-500">
                          Try 4-4-4 breathing for 60 seconds.
                        </p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-gray-700">
                          Step away from screens
                        </p>
                        <p className="text-sm text-gray-500">
                          Take a 10-minute walk to reset focus.
                        </p>
                      </div>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="w-full">
                <EmotionWheel
                  counts={emotionCounts}
                  total={totalEmotionEntries || 0}
                />
              </div>
            </div>
          </div>

          {fetchError && (
            <div className="mt-6 text-center text-red-600">
              Error loading your data: {fetchError}
            </div>
          )}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
