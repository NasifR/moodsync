"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Brain, BarChart3, Users } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Navbar } from '@/components/Navbar';

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/SignUp");
  };

  // ⭐ NEW — Mood Slider Data
  const moodStates = [
    {
      emoji: '😊',
      label: 'Happy',
      description: 'Feeling joyful and content',
      image: 'https://images.unsplash.com/photo-1653730442000-c1514b290be3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      color: 'bg-yellow-600',
      intensity: '85%'
    },
    {
      emoji: '😢',
      label: 'Sad',
      description: 'Feeling down or melancholic',
      image: 'https://images.unsplash.com/photo-1698759638816-aca74ceb2893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      color: 'bg-blue-600',
      intensity: '40%'
    },
    {
      emoji: '😠',
      label: 'Angry',
      description: 'Feeling frustrated or upset',
      image: 'https://images.unsplash.com/photo-1690762733108-cb8a0ed72880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      color: 'bg-red-600',
      intensity: '90%'
    },
    {
      emoji: '😌',
      label: 'Calm',
      description: 'Feeling peaceful and relaxed',
      image: 'https://images.unsplash.com/photo-1735151055127-73c610ae901f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      color: 'bg-green-600',
      intensity: '70%'
    },
    {
      emoji: '😰',
      label: 'Anxious',
      description: 'Feeling worried or stressed',
      image: 'https://images.unsplash.com/photo-1693197207296-f6272b8b3a57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080',
      color: 'bg-orange-600',
      intensity: '75%'
    }
  ];

  const [currentMoodIndex, setCurrentMoodIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoodIndex((prev) => (prev + 1) % moodStates.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentMood = moodStates[currentMoodIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100">
      <div className="min-h-screen">

        {/* Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">

              {/* LEFT SIDE (unchanged) */}
              <div className="space-y-8 mt-10">
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
                    Your Personal{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                      Emotional
                    </span>{' '}
                    Companion
                  </h1>
                  <p className="text-lg text-gray-600 max-w-lg">
                    Understand your emotions, track your mood patterns, and discover insights
                    that help you live a more balanced and fulfilling life.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleGetStarted}
                    className="bg-purple-600 hover:bg-black hover:cursor-pointer hover:text-white hover:shadow-xl hover:shadow-purple-600 text-lg px-8 py-5 transition-all"
                  >
                    Start Your Journey
                  </Button>
                  <Button 
                    variant="outline"
                    className="text-lg px-8 py-5 bg-white border-purple-300 hover:border-black text-purple-700 hover:bg-black hover:text-white hover:shadow-xl hover:shadow-purple-600 transition-all"
                  >
                    Learn More
                  </Button>
                </div>

                <div className="flex items-center space-x-8 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>10,000+ users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>Science-backed</span>
                  </div>
                </div>
              </div>

              {/* ⭐ RIGHT SIDE — REPLACED WITH NEW MOOD SLIDER */}
              <div className="relative">
                <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">

                  {/* Slideshow */}
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden">
                    {moodStates.map((mood, index) => (
                      <div
                        key={mood.label}
                        className={`absolute inset-0 transition-opacity duration-1000 ${
                          index === currentMoodIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        <ImageWithFallback
                          src={mood.image}
                          alt={`${mood.label} mood`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Mood Info */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500">Current Mood</span>
                        <p className="font-semibold text-gray-900">
                          {currentMood.label}
                        </p>
                      </div>
                      <span className="text-4xl">{currentMood.emoji}</span>
                    </div>

                    <div className="bg-gray-100 rounded-full h-2">
                      <div
                        className={`${currentMood.color} h-2 rounded-full transition-all duration-1000`}
                        style={{ width: currentMood.intensity }}
                      ></div>
                    </div>

                    <p className="text-sm text-gray-500">{currentMood.description}</p>
                  </div>

                  {/* Mood Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {moodStates.map((mood, index) => (
                      <button
                        key={mood.label}
                        onClick={() => setCurrentMoodIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentMoodIndex ? 'bg-purple-600 w-6' : 'bg-gray-300'
                        }`}
                        aria-label={`Show ${mood.label} mood`}
                      />
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 py-16 bg-white/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                How MoodSync Helps You
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our comprehensive approach combines mood tracking, personalized insights,
                and evidence-based techniques to support your emotional wellbeing.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow border-purple-200">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-1">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-black">Mood Tracking</h3>
                <p className="text-gray-600">
                  Log your emotions daily and discover patterns in your mood fluctuations over time.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow border-blue-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-1">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-black">Smart Insights</h3>
                <p className="text-gray-600">
                  Get personalized recommendations based on your mood patterns and lifestyle factors.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow border-indigo-200">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-1">
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-black">Visual Analytics</h3>
                <p className="text-gray-600">
                  Beautiful charts and graphs help you understand your emotional journey at a glance.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start Your Emotional Wellness Journey?
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Join thousands of users who have discovered greater emotional awareness
                and wellbeing through MoodSync.
              </p>
              <Button
                onClick={handleGetStarted}
                className="bg-white text-purple-600 hover:shadow-xl hover:shadow-black hover:bg-black hover:text-white text-lg px-8 py-3 transition-all"
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-8 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-purple-400" />
              <span className="text-lg">MoodSync</span>
            </div>
            <p className="text-gray-400">
              Supporting your emotional wellbeing, one day at a time.
            </p>
          </div>
        </footer>

      </div>
    </div>
  );
}

