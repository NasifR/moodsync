"use client";

import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
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

import { Heart, LogOut, Bell, Search, Sparkles } from "lucide-react";

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
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";

/* ---------------------------
   Types & Helpers
   --------------------------- */
type Checkin = {
  sleepHours?: number | string;
  sLeepHours?: number | string;
  caffeineCups?: number | string;
  physicalActivity?: number | string;
  screenTime?: number | string;
  workStudyHours?: number | string;
  dayDescription?: string;
  smoking?: string;
  predictedStress?: string | number;
  detectedEmotion?: string;
  createdAt?: any;
  [key: string]: any;
};

function toDate(x: any): Date {
  if (!x) return new Date();
  if (typeof x === "number") return new Date(x);
  if (x instanceof Date) return x;
  if (typeof x === "string") return new Date(x);
  if (x.seconds !== undefined && typeof x.seconds === "number")
    return new Date(x.seconds * 1000);
  if (x.toDate) return x.toDate();
  return new Date(x);
}

function mapStressToNumber(val: any): number {
  if (!val) return 0;
  if (typeof val === "number") return val;
  const s = String(val).toLowerCase();
  if (s.includes("low")) return 1;
  if (s.includes("medium")) return 2;
  if (s.includes("high")) return 3;
  const n = Number(val);
  if (!Number.isNaN(n)) return n;
  return 2;
}

function formatShortDate(d: Date) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const EMOTIONS = [
  "Sadness",
  "Anger",
  "Love",
  "Surprise",
  "Fear",
  "Happiness",
  "Neutral",
  "Disgust",
  "Shame",
  "Guilt",
  "Confusion",
  "Desire",
  "Sarcasm",
];

function getEmojiForEmotion(e: string) {
  switch (e) {
    case "Happiness":
      return "😊";
    case "Sadness":
      return "😢";
    case "Anger":
      return "😡";
    case "Neutral":
      return "😐";
    case "Fear":
      return "😨";
    case "Surprise":
      return "😲";
    case "Love":
      return "❤️";
    case "Disgust":
      return "🤢";
    case "Shame":
      return "😳";
    case "Guilt":
      return "😔";
    case "Confusion":
      return "😕";
    case "Desire":
      return "😍";
    case "Sarcasm":
      return "😏";
    default:
      return "❓";
  }
}

/* ---------------------------
   Page Component
   --------------------------- */
export default function AnalyticsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [allCheckins, setAllCheckins] = useState<Checkin[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setLoadingAuth(false);
        router.push("/SignUp");
      } else {
        try {
          const userDoc = await getDoc(doc(db, "users", u.uid));
          const udata = userDoc.exists() ? userDoc.data() : {};
          setUser({
            id: u.uid,
            email: u.email,
            name:
              udata?.fullName ||
              u.displayName ||
              u.email?.split?.("@")?.[0] ||
              "User",
          });
        } catch {
          setUser({
            id: u.uid,
            email: u.email,
            name: u.displayName || u.email?.split?.("@")?.[0] || "User",
          });
        }
        setLoadingAuth(false);
      }
    });
    return () => unsub();
  }, [router]);

  // fetch all users' checkins
  useEffect(() => {
    let mounted = true;
    const fetchAll = async () => {
      setLoadingData(true);
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        const arr: Checkin[] = [];
        for (const udoc of usersSnap.docs) {
          const snap = await getDocs(collection(db, "users", udoc.id, "checkins"));
          snap.forEach((d) => {
            const data = d.data();
            // unify createdAt into JS Date if firestore Timestamp
            const created = data?.createdAt
              ? typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate()
                : data.createdAt
              : new Date();
            arr.push({ ...data, createdAt: created });
          });
        }
        if (mounted) setAllCheckins(arr);
      } catch (err) {
        console.error("fetchAllCheckins err:", err);
      } finally {
        if (mounted) setLoadingData(false);
      }
    };
    fetchAll();
    return () => {
      mounted = false;
    };
  }, []);

  // filter last 7 days
  const oneWeekFiltered = useMemo(() => {
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    return allCheckins.filter((c) => {
      try {
        const t = toDate(c.createdAt).getTime();
        return t >= weekAgo && t <= now;
      } catch {
        return false;
      }
    });
  }, [allCheckins]);

  // weekly emotion counts (for bar)
  const weeklyEmotionCounts = useMemo(() => {
  const counts: Record<string, number> = {};
  EMOTIONS.forEach((e) => (counts[e] = 0));

  oneWeekFiltered.forEach((c) => {
    const e = c.detectedEmotion ?? c.detected_emotion ?? c.predictedEmotion;
    if (e && counts[e] !== undefined) counts[e]++;
  });

  return EMOTIONS
    .map((e) => ({ emotion: e, count: counts[e] }))
    .sort((a, b) => b.count - a.count); // ← SORT DESC
}, [oneWeekFiltered]);

  // weekly avg stress by day (for line)
  const weeklyAvgStressByDay = useMemo(() => {
    const map: Record<string, { date: Date; values: number[] }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      map[key] = { date: d, values: [] };
    }
    oneWeekFiltered.forEach((c) => {
      const dStr = toDate(c.createdAt).toISOString().slice(0, 10);
      if (map[dStr]) map[dStr].values.push(mapStressToNumber(c.predictedStress));
    });
    return Object.values(map).map((entry) => ({
      dayLabel: entry.date.toLocaleDateString(undefined, { weekday: "short" }),
      avgStress: entry.values.length
        ? +(entry.values.reduce((a, b) => a + b, 0) / entry.values.length).toFixed(2)
        : 0,
    }));
  }, [oneWeekFiltered]);

  // weekly sleep vs stress (scatter)
  // Weekly Sleep vs Stress (Scatter Chart)
 const weeklySleepStress = useMemo(() => {
    return oneWeekFiltered
      .map((c) => {
        const sleepRaw = c.sLeepHours ?? c.sleepHours ?? c.sleep ?? 0;
        const sleep = Number(sleepRaw) || 0;
        const stress = mapStressToNumber(c.predictedStress);
        if (sleep <= 0 || stress <= 0) return null;
        return { sleep, stress };
      })
      .filter(Boolean) as { sleep: number; stress: number }[];
  }, [oneWeekFiltered]);


  // top 3 emotions (dynamic)
  const top3Emotions = useMemo(() => {
    const counts: Record<string, number> = {};
    EMOTIONS.forEach((e) => (counts[e] = 0));
    oneWeekFiltered.forEach((c) => {
      const e = c.detectedEmotion ?? c.detected_emotion ?? c.predictedEmotion;
      if (e && counts[e] !== undefined) counts[e]++;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map((x) => x[0]);
  }, [oneWeekFiltered]);

  // emotion cloud data (positions will be computed in canvas)
  // Build items with counts for sizing
  const emotionCloudRaw = useMemo(() => {
    const counts: Record<string, number> = {};
    EMOTIONS.forEach((e) => (counts[e] = 0));
    oneWeekFiltered.forEach((c) => {
      const e = c.detectedEmotion ?? c.detected_emotion ?? c.predictedEmotion;
      if (e && counts[e] !== undefined) counts[e]++;
    });
    return EMOTIONS.map((e) => ({
      emotion: e,
      value: counts[e] || 0,
    }));
  }, [oneWeekFiltered]);

  if (loadingAuth || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <div className="w-36 h-36 rounded-full bg-purple-200 mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading analytics…</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  /* ---------------------------
     Render
     --------------------------- */
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
            <Link href="/">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
                <span>Home</span>
              </button>
            </Link>
            <Link href="/Dashboard">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
                <span>Dashboard</span>
              </button>
            </Link>
            <Link href="/SurveyPage">
              <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
                <span>Survey</span>
              </button>
            </Link>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/20 text-white">
              <span>Analytics</span>
            </button>
            
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
              onClick={async () => {
                await auth.signOut();
                router.push("/SignUp");
              }}
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
                Welcome back — here's your analytics overview.
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
            {/* Left / main area (charts) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Emotion Cloud Card */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-gray-700 font-bold">
                        Weekly Emotion Cloud
                      </CardTitle>
                      <CardDescription className="text-gray-500 mt-1">
                        Anonymized — includes everyone's check-ins from the past
                        7 days. Top 3 are centered.
                      </CardDescription>
                    </div>
                    <div className="text-sm text-gray-600">
                      {oneWeekFiltered.length} check-ins
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="relative w-full h-72 rounded-xl border border-white/10 overflow-visible">
                    <CanvasEmotionCloud
                      raw={emotionCloudRaw}
                      top3={top3Emotions}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emotion distribution */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-700 font-bold">
                    Weekly Emotion Distribution
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    Counts across all users (anonymized)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart
                      data={weeklyEmotionCounts}
                      margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                      <XAxis
                        dataKey="emotion"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                        allowDecimals={false}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="count"
                        fill="#7C3AED"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Stress over time */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-700 font-bold">
                    Weekly Average Stress Levels
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    Average predicted stress per day (1=Low,2=Med,3=High)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={weeklyAvgStressByDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                      <XAxis
                        dataKey="dayLabel"
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <YAxis
                        domain={[0, 3]}
                        ticks={[0, 1, 2, 3]}
                        tick={{ fill: "#6B7280", fontSize: 12 }}
                      />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgStress"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sleep vs Stress */}
              <Card className="border-purple-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-gray-700 font-bold">
                    Weekly Sleep vs Stress
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    Each dot = one anonymized check-in
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={320}>
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3E8FF" />
                      <XAxis
                        type="number"
                        dataKey="sleep"
                        name="Sleep (hours)"
                        unit="h"
                        tick={{ fill: "#6B7280" }}
                      />
                      <YAxis
                        type="number"
                        dataKey="stress"
                        name="Stress"
                        tick={{ fill: "#6B7280" }}
                      />
                      <ZAxis range={[60, 400]} />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter
                        name="Users"
                        data={weeklySleepStress}
                        fill="#16a34a"
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Right column: summary */}
            <div className="space-y-6">
              <Card className="border-purple-100 shadow-lg text-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-700 font-bold">
                    Overview
                  </CardTitle>
                  <CardDescription className="text-gray-500 mt-1">
                    Quick insights (anonymous)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          Average stress (week)
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          {weeklyAvgStressByDay.length
                            ? Math.round(
                                weeklyAvgStressByDay.reduce(
                                  (a, b) => a + b.avgStress,
                                  0
                                ) / weeklyAvgStressByDay.length
                              )
                            : "—"}
                          <span className="text-xs text-gray-500"> /3</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Check-ins</p>
                        <p className="font-semibold text-gray-900">
                          {oneWeekFiltered.length}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            Community snapshot
                          </p>
                          <p className="text-sm text-gray-500">
                            This shows anonymized check-ins from all active
                            users.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Button
                        onClick={() => router.push("/SurveyPage")}
                        className="w-full bg-purple-600 text-white border-purple-200 hover:bg-black hover:text-white hover:shadow-xl hover:shadow-purple-600 hover:cursor-pointer transition-all"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   CanvasEmotionCloud Component
   - physics-based nodes
   - top3 centered cluster (dynamic)
   - outer ring for others
   - automatic label size and collision avoidance
   - hover tooltip & click
   --------------------------- */
function CanvasEmotionCloud({
  raw,
  top3,
}: {
  raw: { emotion: string; value: number }[];
  top3: string[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animRef = useRef<number | null>(null);
  const stateRef = useRef<any>(null); // runtime items + mouse

  // initialize state when raw/top3 change
  useEffect(() => {
    if (!raw || raw.length === 0) {
      stateRef.current = null;
      return;
    }

    // compute max value for scaling
    const maxVal = Math.max(...raw.map((r) => r.value), 1);

    // Build items: center cluster for top3, outer ring for others
    const centerItems: any[] = [];
    const outerItems: any[] = [];
    const others = raw.filter((r) => !top3.includes(r.emotion));
    const centerRaw = raw.filter((r) => top3.includes(r.emotion));

    // center items: arrange in small triangle
    for (let i = 0; i < centerRaw.length; i++) {
      const r = centerRaw[i];
      centerItems.push({
        emotion: r.emotion,
        value: r.value,
        size: 18 + (r.value / maxVal) * 40,
        // initial positions will be set relative to center
        x: 0.5,
        y: 0.5,
        vx: 0,
        vy: 0,
        angle: (i / Math.max(1, centerRaw.length)) * Math.PI * 2,
      });
    }

    // outer items: equally spaced ring
    const ringCount = others.length;
    for (let i = 0; i < others.length; i++) {
      const r = others[i];
      outerItems.push({
        emotion: r.emotion,
        value: r.value,
        size: 12 + (r.value / maxVal) * 30,
        // will be positioned around ring
        x: 0.5 + Math.cos((i / Math.max(1, ringCount)) * 2 * Math.PI) * 0.36,
        y: 0.5 + Math.sin((i / Math.max(1, ringCount)) * 2 * Math.PI) * 0.36,
        vx: 0,
        vy: 0,
        angle: (i / Math.max(1, ringCount)) * 2 * Math.PI,
      });
    }

    // combine: put center first (so they visually appear slightly larger)
    const items = [...centerItems, ...outerItems];

    stateRef.current = {
      items,
      mouse: { x: 0.5, y: 0.5, inside: false },
      last: performance.now(),
      hovered: -1,
    };
  }, [raw, top3]);

  // resize helper
  const resizeCanvas = (canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  // render loop
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let mounted = true;

    const onResize = () => {
      resizeCanvas(canvas);
    };
    window.addEventListener("resize", onResize);
    resizeCanvas(canvas);

    const tick = (time: number) => {
      const state = stateRef.current;
      if (!state || !mounted) {
        animRef.current = requestAnimationFrame(tick);
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;

      // measure label widths for collision
      ctx.font = `600 12px Inter, system-ui`;
      state.items.forEach((it: any) => {
        const emojiW = Math.max(14, it.size * 0.5);
        const fontSize = Math.max(10, Math.floor(it.size * 0.42));
        ctx.font = `600 ${fontSize}px Inter, system-ui`;
        const m = ctx.measureText(it.emotion);
        it.labelW = Math.max(48, Math.ceil(m.width + emojiW + 22));
        it.labelH = Math.max(28, fontSize + 12);
      });

      // dynamic center radius: ensure largest label fits
      const maxLabelPx = Math.max(...state.items.map((it: any) => it.labelW || 40));
      const minDim = Math.min(W, H);
      const safeRadiusPx = Math.max(minDim * 0.28, maxLabelPx * 1.2);
      const ringFrac = Math.min(0.48, safeRadiusPx / minDim);

      // target positions:
      // first N center nodes (top3) arranged in a small cluster offset from center slightly
      const centerCount = top3.length;
      for (let i = 0; i < state.items.length; i++) {
        const it = state.items[i];
        if (i < centerCount) {
          // center cluster - spread in small triangle/circle
          const idx = i;
          const a = (idx / Math.max(1, centerCount)) * Math.PI * 2;
          const r = 0.0 + (idx - (centerCount - 1) / 2) * 0.035; // slight spread
          it.tx = 0.5 + r * Math.cos(a);
          it.ty = 0.5 + r * Math.sin(a);
        } else {
          // outer ring evenly spaced
          const outIdx = i - centerCount;
          const outCount = state.items.length - centerCount;
          const angle = (outIdx / Math.max(1, outCount)) * Math.PI * 2;
          it.tx = 0.5 + Math.cos(angle) * ringFrac;
          it.ty = 0.5 + Math.sin(angle) * ringFrac;
        }
      }

      // mouse influence (pull/push)
      const mousePxX = state.mouse.x * W;
      const mousePxY = state.mouse.y * H;

      // collision avoidance (iterative)
      const nodesPx = state.items.map((it: any) => ({
        it,
        x: it.x * W,
        y: it.y * H,
        r: Math.max(18, (it.labelW || 40) / 2) + 8,
      }));

      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < nodesPx.length; i++) {
          for (let j = i + 1; j < nodesPx.length; j++) {
            const A = nodesPx[i];
            const B = nodesPx[j];
            let dx = B.x - A.x;
            let dy = B.y - A.y;
            let dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
            const minDist = A.r + B.r + 6;
            if (dist < minDist) {
              const overlap = (minDist - dist) * 0.5;
              const ux = dx / dist;
              const uy = dy / dist;
              A.x -= ux * overlap;
              A.y -= uy * overlap;
              B.x += ux * overlap;
              B.y += uy * overlap;
            }
          }
        }
      }

      // apply new targets based on collision-adjusted coordinates
      for (let i = 0; i < nodesPx.length; i++) {
        const np = nodesPx[i];
        const it = np.it;
        // blend target to avoid jitter
        const tgtX = np.x / W;
        const tgtY = np.y / H;
        it.tx = it.tx * 0.6 + tgtX * 0.4;
        it.ty = it.ty * 0.6 + tgtY * 0.4;
      }

      // simulate spring to target
      const dt = Math.min(32, time - (state.last || time)) / 1000;
      state.last = time;
      state.items.forEach((it: any, idx: number) => {
        // mouse repulsion/attraction
        const dx = it.tx - it.x;
        const dy = it.ty - it.y;
        const ax = dx * 8;
        const ay = dy * 8;
        // additional small force from mouse for interactivity
        const mdx = (it.x * W) - mousePxX;
        const mdy = (it.y * H) - mousePxY;
        const md = Math.sqrt(mdx * mdx + mdy * mdy) || 0.0001;
        const influence = Math.max(0, 1 - md / (Math.min(W, H) * 0.6));
        // near cursor -> repel a bit
        const repel = (influence > 0.1) ? (md < 0.11 * Math.min(W, H) ? -0.12 * influence : 0.02 * influence) : 0;
        const ux = mdx / md;
        const uy = mdy / md;
        const ax2 = ux * repel;
        const ay2 = uy * repel;

        it.vx = it.vx * 0.86 + (ax + ax2) * dt;
        it.vy = it.vy * 0.86 + (ay + ay2) * dt;
        it.x += it.vx * dt;
        it.y += it.vy * dt;

        // clamp inside with margin so labels aren't clipped
        const margin = (it.labelW || 40) / Math.min(W, H) * 0.6;
        it.x = Math.max(0 + margin, Math.min(1 - margin, it.x));
        it.y = Math.max(0 + margin, Math.min(1 - margin, it.y));
      });

      // draw background
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(250,248,255,0.02)";
      ctx.fillRect(0, 0, W, H);

      // draw web lines (connect near neighbors to form spiderweb)
      ctx.lineWidth = 1.6;
      for (let i = 0; i < state.items.length; i++) {
        const a = state.items[i];
        const ax = a.x * W;
        const ay = a.y * H;
        // connect to several nearest neighbors (1..3) to create web
        const neighbors = findNearestIndices(state.items, i, 3);
        neighbors.forEach((jidx) => {
          const b = state.items[jidx];
          const bx = b.x * W;
          const by = b.y * H;
          // mid control influenced by mouse for wobble
          let mx = (ax + bx) / 2;
          let my = (ay + by) / 2;
          if (state.mouse.inside) {
            const mdx = mousePxX - mx;
            const mdy = mousePxY - my;
            const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
            const influence = Math.max(0, 1 - mdist / (Math.min(W, H) * 0.6));
            mx += mdx * 0.45 * influence;
            my += mdy * 0.45 * influence;
          }
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.quadraticCurveTo(mx, my, bx, by);
          // alpha based on proximity to cursor
          const dToCursor = Math.min(
            Math.hypot(ax - mousePxX, ay - mousePxY),
            Math.hypot(bx - mousePxX, by - mousePxY)
          );
          let alpha = 0.06;
          if (state.mouse.inside) {
            alpha = Math.max(0.06, 0.7 * (1 - dToCursor / (Math.min(W, H) * 0.6)));
          }
          ctx.strokeStyle = `rgba(124,58,237,${alpha})`;
          ctx.stroke();
        });
      }

      // draw nodes (rounded rectangles with emoji + label)
      state.items.forEach((it: any, idx: number) => {
        const px = it.x * W;
        const py = it.y * H;
        const labelW = it.labelW || 60;
        const labelH = it.labelH || 28;
        const halfW = labelW / 2 + 12;
        const halfH = labelH / 2 + 6;
        const left = px - halfW;
        const top = py - halfH;
        const right = px + halfW;
        const bottom = py + halfH;
        const radius = Math.min(20, halfH * 0.6);
        // background
        const g = ctx.createLinearGradient(left, top, right, bottom);
        g.addColorStop(0, "rgba(255,255,255,0.98)");
        g.addColorStop(1, "rgba(246,240,255,0.95)");
        ctx.fillStyle = g as any;
        roundRect(ctx, left, top, halfW * 2, halfH * 2, radius);
        ctx.fill();
        // stroke
        ctx.beginPath();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "rgba(124,58,237,0.08)";
        roundRect(ctx, left, top, halfW * 2, halfH * 2, radius);
        ctx.stroke();
        // emoji
        const emojiSize = Math.max(12, it.size * 0.55);
        ctx.font = `${emojiSize}px serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        ctx.fillStyle = "#111827";
        ctx.fillText(getEmojiForEmotion(it.emotion), left + 12, py);
        // label
        const labelFontSize = Math.max(10, Math.floor(it.size * 0.42));
        ctx.font = `600 ${labelFontSize}px Inter, system-ui`;
        ctx.fillStyle = "#3b0764";
        ctx.textAlign = "left";
        ctx.fillText(it.emotion, left + 12 + emojiSize + 8, py);
      });

      // compute hovered (closest node within threshold)
      const mouseInside = state.mouse.inside;
      let hoveredIdx = -1;
      if (mouseInside) {
        let bestD = 1e9;
        for (let i = 0; i < state.items.length; i++) {
          const it = state.items[i];
          const dx = (it.x - state.mouse.x) * W;
          const dy = (it.y - state.mouse.y) * H;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < bestD) {
            bestD = d;
            hoveredIdx = i;
          }
        }
        if (bestD > Math.min(W, H) * 0.09) hoveredIdx = -1;
      }
      state.hovered = hoveredIdx;

      // show tooltip if hovered
      // (we render a DOM tooltip element outside canvas via state)
      // we'll attach handling below in another effect that watches stateRef.current.hovered

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, [raw, top3]);

  // mouse interactions
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const state = stateRef;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (!state.current) return;
      state.current.mouse.x = Math.max(0, Math.min(1, x));
      state.current.mouse.y = Math.max(0, Math.min(1, y));
      state.current.mouse.inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
    };
    const onLeave = () => {
      if (!state.current) return;
      state.current.mouse.inside = false;
    };
    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      if (!state.current) return;
      // find nearest
      let nearestIdx = -1;
      let nearestD = Infinity;
      for (let i = 0; i < state.current.items.length; i++) {
        const it = state.current.items[i];
        const d = Math.hypot(it.x - x, it.y - y);
        if (d < nearestD) {
          nearestD = d;
          nearestIdx = i;
        }
      }
      if (nearestIdx >= 0 && nearestD < 0.08) {
        const clicked = state.current.items[nearestIdx];
        // instead of alert, you could trigger filter — for now: small UI modal (alert)
        // Keep anonymous: show count only if you want, otherwise show emotion
        window.alert(`Emotion selected: ${clicked.emotion}`);
      }
    };

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    canvas.addEventListener("click", onClick);
    return () => {
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      canvas.removeEventListener("click", onClick);
    };
  }, []);

  // tooltip DOM follow effect
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; visible: boolean }>({
    text: "",
    x: 0,
    y: 0,
    visible: false,
  });
  useEffect(() => {
    let raf: number | null = null;
    const loop = () => {
      const s = stateRef.current;
      if (s) {
        const hovered = s.hovered;
        if (hovered >= 0) {
          const it = s.items[hovered];
          const canvas = canvasRef.current!;
          const rect = canvas.getBoundingClientRect();
          setTooltip({
            text: `${it.emotion} — ${it.value}`,
            x: rect.left + it.x * rect.width,
            y: rect.top + it.y * rect.height,
            visible: true,
          });
        } else {
          setTooltip((t) => ({ ...t, visible: false }));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <canvas ref={canvasRef} className="w-full h-full block" />
      {/* Tooltip element */}
      <div
        style={{
          position: "fixed",
          left: tooltip.x,
          top: tooltip.y,
          transform: "translate(-50%, -140%)",
          pointerEvents: "none",
          transition: "opacity 100ms ease, transform 120ms ease",
          opacity: tooltip.visible ? 1 : 0,
          zIndex: 60,
        }}
      >
        <div className="bg-white rounded-md px-3 py-2 text-sm shadow-lg border border-purple-50">
          <div className="text-purple-700 font-semibold">{tooltip.text}</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------
   Utility: find nearest indices
   --------------------------- */
function findNearestIndices(items: any[], idx: number, count = 3) {
  const target = items[idx];
  const dists: { idx: number; d: number }[] = [];
  for (let i = 0; i < items.length; i++) {
    if (i === idx) continue;
    const it = items[i];
    const dx = it.x - target.x;
    const dy = it.y - target.y;
    const d = dx * dx + dy * dy;
    dists.push({ idx: i, d });
  }
  dists.sort((a, b) => a.d - b.d);
  return dists.slice(0, count).map((x) => x.idx);
}

/* ---------------------------
   Utility: rounded rect path
   --------------------------- */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}









