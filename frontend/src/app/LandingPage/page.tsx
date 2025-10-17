import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Brain, BarChart3, Users } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';
import { Navbar } from '@/components/Navbar'; // <- Import your Navbar here

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left Content */}
            <div className="space-y-8">
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
                <Button onClick={onGetStarted} className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-3">
                  Start Your Journey
                </Button>
                <Button variant="outline" className="text-lg px-8 py-3 border-purple-300 text-purple-700">
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

            {/* Right Content / Image Card */}
            <div className="relative">
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1573285702030-f7952e595655?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwbWluZGZ1bG5lc3MlMjBwZWFjZWZ1bHxlbnwxfHx8fDE3NTgyMzI0NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Peaceful meditation scene"
                  className="w-full h-64 object-cover rounded-2xl"
                />
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Today's Mood</span>
                    <span className="text-2xl">😊</span>
                  </div>
                  <div className="bg-purple-100 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-3/4"></div>
                  </div>
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Mood Tracking</h3>
              <p className="text-gray-600">
                Log your emotions daily and discover patterns in your mood fluctuations over time.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-blue-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Smart Insights</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your mood patterns and lifestyle factors.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow border-indigo-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="font-semibold mb-2">Visual Analytics</h3>
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
              onClick={onGetStarted}
              className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3"
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
  );
}


