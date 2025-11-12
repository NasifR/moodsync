"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

import { 
  Heart, 
  TrendingUp, 
  Activity,
  LogOut,
  Settings,
  Bell,
  Users,
  BarChart3,
  Moon,
  Sun,
  Brain,
  Home,
  Calendar,
  MessageSquare,
  Award,
  HelpCircle,
  Smile,
  Sparkles,
  Search,
  Video,
  Clock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { 
  AreaChart,
  Area,
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardPageProps {
  user: { id: string; email: string; name: string } | null;
  onLogout: () => void;
}

// Mock data based on emotional wellness tracking
const emotionalActivitiesData = [
  { month: 'Jul', value: 65 },
  { month: 'Aug', value: 72 },
  { month: 'Sep', value: 85 },
  { month: 'Oct', value: 78 },
  { month: 'Nov', value: 88 },
  { month: 'Dec', value: 92 }
];

const weekData = [
  { day: 'Sun', mood: 8, stress: 3, energy: 7 },
  { day: 'Mon', mood: 7, stress: 5, energy: 6 },
  { day: 'Tue', mood: 8, stress: 4, energy: 7 },
  { day: 'Wed', mood: 6, stress: 6, energy: 5 },
  { day: 'Thu', mood: 9, stress: 2, energy: 8 },
  { day: 'Fri', mood: 8, stress: 3, energy: 8 },
  { day: 'Sat', mood: 9, stress: 2, energy: 9 }
];

const upcomingActivities = [
  {
    title: 'Manage stress',
    time: '12:00 pm - 12:30 pm',
    icon: Brain,
    color: 'from-purple-400 to-purple-600'
  },
  {
    title: 'Physiotherapy',
    time: '09:00 am - 10:00 am',
    icon: Activity,
    color: 'from-orange-400 to-orange-600'
  }
];

export function DashboardPage({ user, onLogout }: DashboardPageProps) {
  const [selectedDate, setSelectedDate] = useState(6);
  const currentWellnessScore = 80;
  
  // Generate calendar days
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const monthYear = 'October 2022';

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-purple-700 to-purple-900 flex flex-col">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-xl">MoodSync</span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2 mb-8">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-white/20 text-white backdrop-blur-sm">
              <Home className="w-5 h-5" />
              <span>Dashboard</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <Activity className="w-5 h-5" />
              <span>Activities</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <Users className="w-5 h-5" />
              <span>Community</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <MessageSquare className="w-5 h-5" />
              <span>Messages</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-purple-100 hover:bg-white/10 transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
            </button>
          </nav>

          {/* User Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-12 h-12 border-2 border-white/30">
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                  {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-white font-medium">{user?.name || 'User'}</p>
                <p className="text-purple-200 text-sm">Premium Member</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="ghost"
              className="w-full text-purple-100 hover:bg-white/10 justify-start"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Illustration at bottom */}
        <div className="mt-auto p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-white text-sm mb-2">Check your condition</p>
            <p className="text-purple-200 text-xs mb-3">Check your stress situation and your activities</p>
            <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
              Check It Now
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white/70 backdrop-blur-sm border-b border-purple-100 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-gray-900">
                Hi, <span className="font-semibold">{user?.name || 'User'}!</span> 👋
              </h1>
              <p className="text-gray-600 text-sm mt-1">Let's track your health daily!</p>
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
              <Avatar className="w-10 h-10 cursor-pointer border-2 border-purple-200">
                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                  {user?.name.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Appointment */}
                <Card className="border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle>Upcoming appointment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-6">
                      {/* Illustration placeholder */}
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-300 rounded-2xl flex items-center justify-center">
                        <div className="relative">
                          <div className="w-20 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg"></div>
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-500 rounded"></div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded"></div>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <Avatar className="w-12 h-12">
                            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                              EW
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-gray-900">Dr. Emilia Winson</p>
                            <p className="text-sm text-gray-600">Psychotherapy</p>
                          </div>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 ml-auto">
                            <Video className="w-3 h-3 mr-1" />
                            Video call
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>14 Mar 2022</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>09:00 pm</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <p>Monggo ST Hospital</p>
                        <p>New York, USA</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Activities */}
                <Card className="border-purple-100 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Emotional wellness activities</CardTitle>
                        <CardDescription>Today, 5 October 2022</CardDescription>
                      </div>
                      <select className="px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm focus:outline-none focus:border-purple-400">
                        <option>Month</option>
                        <option>Week</option>
                        <option>Year</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={emotionalActivitiesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" vertical={false} />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 12, fill: '#9CA3AF' }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis hide />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #E9D5FF',
                            borderRadius: '8px' 
                          }}
                        />
                        <Bar 
                          dataKey="value" 
                          fill="#86EFAC" 
                          radius={[8, 8, 8, 8]}
                          maxBarSize={60}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                    
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                      <div className="flex items-center space-x-2 text-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Smile className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Good conditions</p>
                          <p className="text-gray-600">Anxiety is wellness</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Overview */}
                <Card className="border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle>Weekly mood patterns</CardTitle>
                    <CardDescription>Your emotional journey this week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={240}>
                      <AreaChart data={weekData}>
                        <defs>
                          <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E9D5FF" />
                        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="mood" 
                          stroke="#A78BFA" 
                          strokeWidth={2}
                          fill="url(#colorMood)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="energy" 
                          stroke="#60A5FA" 
                          strokeWidth={2}
                          fill="url(#colorEnergy)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* List of Appointments */}
                <Card className="border-purple-100 shadow-lg">
                  <CardHeader>
                    <CardTitle>List of appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Tabs */}
                    <div className="flex space-x-2 mb-4">
                      <button className="px-4 py-2 bg-white border border-purple-200 rounded-lg text-sm hover:border-purple-400">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        Monthly
                      </button>
                      <button className="px-4 py-2 bg-white border border-purple-200 rounded-lg text-sm">
                        Daily
                      </button>
                    </div>

                    {/* Calendar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">{monthYear}</span>
                        <div className="flex space-x-2">
                          <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">‹</button>
                          <button className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded">›</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => (
                          <button
                            key={day}
                            onClick={() => setSelectedDate(day)}
                            className={`text-center text-sm py-2 rounded-lg transition-colors ${
                              day === selectedDate
                                ? 'bg-gradient-to-br from-orange-400 to-orange-500 text-white'
                                : day === 1 || day === 2 || day === 4 || day === 7 || day === 8 || day === 9 || 
                                  day === 10 || day === 11 || day === 12 || day === 13 || day === 14 || 
                                  day === 15 || day === 16 || day === 17 || day === 18 || day === 19 ||
                                  day === 20 || day === 21 || day === 22 || day === 24 || day === 25 ||
                                  day === 26 || day === 27 || day === 28 || day === 29 || day === 30 || day === 31
                                ? 'text-gray-400'
                                : 'text-gray-900 hover:bg-purple-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Daily Progress */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">Daily progress</p>
                          <p className="text-sm text-gray-600">Keep improving the quality of your health</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                          <svg className="w-32 h-32 transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="#E5E7EB"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="56"
                              stroke="#86EFAC"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 56}`}
                              strokeDashoffset={`${2 * Math.PI * 56 * (1 - currentWellnessScore / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl font-semibold text-gray-900">{currentWellnessScore}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Schedule Items */}
                    <div className="space-y-3">
                      {upcomingActivities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-white rounded-xl hover:shadow-md transition-shadow cursor-pointer border border-purple-100"
                        >
                          <div className={`w-12 h-12 bg-gradient-to-br ${activity.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <activity.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-sm">{activity.title}</p>
                            <p className="text-xs text-gray-600">{activity.time}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                      
                      <button className="w-full text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center space-x-2 py-2">
                        <span>See More Schedule</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
