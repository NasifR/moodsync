"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Heart,
  Brain,
  BarChart3,
  MessageSquare,
  BrainCircuit,
  TrendingUp,
  Shield,
  Clock,
  Sparkles,
  Target,
  Users,
  CheckCircle2,
  LineChart,
} from "lucide-react";
import { ImageWithFallback } from "@/components/ui/ImageWithFallback";
import { Navbar } from "@/components/Navbar";
import { motion } from "framer-motion";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/SignUp");
  };

  const moodStates = [
    {
      emoji: "😊",
      label: "Happy",
      description: "Feeling joyful and content",
      image:
        "https://images.unsplash.com/photo-1653730442000-c1514b290be3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      color: "bg-yellow-600",
      intensity: "85%",
    },
    {
      emoji: "😢",
      label: "Sad",
      description: "Feeling down or melancholic",
      image:
        "https://images.unsplash.com/photo-1698759638816-aca74ceb2893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      color: "bg-blue-600",
      intensity: "40%",
    },
    {
      emoji: "😠",
      label: "Angry",
      description: "Feeling frustrated or upset",
      image:
        "https://images.unsplash.com/photo-1690762733108-cb8a0ed72880?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      color: "bg-red-600",
      intensity: "90%",
    },
    {
      emoji: "😌",
      label: "Calm",
      description: "Feeling peaceful and relaxed",
      image:
        "https://images.unsplash.com/photo-1735151055127-73c610ae901f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      color: "bg-green-600",
      intensity: "70%",
    },
    {
      emoji: "😰",
      label: "Anxious",
      description: "Feeling worried or stressed",
      image:
        "https://images.unsplash.com/photo-1693197207296-f6272b8b3a57?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080",
      color: "bg-orange-600",
      intensity: "75%",
    },
  ];

  const [currentMoodIndex, setCurrentMoodIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMoodIndex((prev) => (prev + 1) % moodStates.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentMood = moodStates[currentMoodIndex];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const floatingVariants = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
        body {
          font-family: "Inter", sans-serif;
        }
      `}</style>

      <div className="min-h-screen">
        <Navbar />

        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="px-6 py-16 md:py-24 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-100/40 to-blue-100/40 -z-10"></div>

          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={itemVariants} className="space-y-8 mt-10">
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-block"
                  >
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      <Sparkles className="w-4 h-4" />
                      AI-Powered Emotional Intelligence
                    </span>
                  </motion.div>

                  <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight tracking-tight">
                    Your Personal{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 animate-gradient">
                      Emotional
                    </span>{" "}
                    Wellness Companion
                  </h1>

                  <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                    Track your mood, understand your emotions, and discover
                    patterns in your mental wellness journey. Get personalized
                    insights that help you manage stress and live a more
                    balanced, fulfilling life.
                  </p>
                </div>

                <motion.div
                  variants={itemVariants}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    onClick={handleGetStarted}
                    className="
  bg-gradient-to-r from-purple-600 to-blue-600
  text-white text-lg px-8 py-6 rounded-xl shadow-md
  transition-all

  hover:from-black hover:to-black
  hover:text-white
  hover:shadow-xl hover:shadow-purple-600
"
                  >
                    Start Your Journey
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      document.getElementById("features")?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }}
                    className="text-lg px-8 py-6 rounded-xl bg-white border-2 border-gray-200 text-gray-700 hover:bg-black hover:border-black hover:shadow-xl hover:shadow-purple-600 hover:text-white transition-all"
                  >
                    Learn More
                  </Button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center space-x-8 text-sm text-gray-600"
                >
                  <div className="flex items-center space-x-2">
                    <BrainCircuit className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">ML-Powered</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Heart className="w-5 h-5 text-pink-600" />
                    <span className="font-medium">Science-Backed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Private & Secure</span>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div
                variants={floatingVariants}
                animate="animate"
                className="relative"
              >
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden">
                    {moodStates.map((mood, index) => (
                      <motion.div
                        key={mood.label}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: index === currentMoodIndex ? 1 : 0,
                        }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0"
                      >
                        <ImageWithFallback
                          src={mood.image}
                          alt={`${mood.label} mood`}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm text-gray-500 font-medium">
                          Current Mood
                        </span>
                        <p className="font-bold text-gray-900 text-lg">
                          {currentMood.label}
                        </p>
                      </div>
                      <motion.span
                        key={currentMoodIndex}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="text-4xl"
                      >
                        {currentMood.emoji}
                      </motion.span>
                    </div>

                    <div className="bg-gray-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className={`${currentMood.color} h-3 rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: currentMood.intensity }}
                        transition={{ duration: 1 }}
                      ></motion.div>
                    </div>

                    <p className="text-sm text-gray-600">
                      {currentMood.description}
                    </p>
                  </div>

                  <div className="flex justify-center gap-2 mt-4">
                    {moodStates.map((mood, index) => (
                      <button
                        key={mood.label}
                        onClick={() => setCurrentMoodIndex(index)}
                        className={`h-2 rounded-full transition-all duration-300 ${
                          index === currentMoodIndex
                            ? "bg-purple-600 w-8"
                            : "bg-gray-300 w-2"
                        }`}
                        aria-label={`Show ${mood.label} mood`}
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="features"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="px-6 py-20 bg-white"
        >
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
                Comprehensive Features for Your Well-being
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                MindSight combines cutting-edge AI technology with
                evidence-based psychology to provide a holistic approach to
                emotional wellness
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Heart,
                  title: "Mood & Emotion Tracking",
                  description:
                    "Log your daily emotions through an intuitive interface. Track patterns over time and see how various factors influence your emotional state with beautiful visualizations.",
                  color: "purple",
                  gradient: "from-purple-500 to-pink-500",
                },
                {
                  icon: MessageSquare,
                  title: "NLP-Powered Text Analysis",
                  description:
                    "Express yourself freely through text entries. Our advanced natural language processing models analyze your writing to detect emotional nuances and sentiment patterns.",
                  color: "blue",
                  gradient: "from-blue-500 to-cyan-500",
                },
                {
                  icon: BarChart3,
                  title: "Smart Stress Prediction",
                  description:
                    "Machine learning algorithms analyze your sleep patterns, caffeine intake, and daily activities to predict stress levels and identify potential triggers before they escalate.",
                  color: "indigo",
                  gradient: "from-indigo-500 to-purple-500",
                },
                {
                  icon: TrendingUp,
                  title: "Personalized Insights",
                  description:
                    "Receive tailored recommendations based on your unique patterns. Discover what activities, habits, and routines have the most positive impact on your well-being.",
                  color: "emerald",
                  gradient: "from-emerald-500 to-teal-500",
                },
                {
                  icon: Target,
                  title: "Stressor Identification",
                  description:
                    "Pinpoint specific factors contributing to stress and anxiety. Our AI helps you understand correlations between lifestyle choices and emotional responses.",
                  color: "orange",
                  gradient: "from-orange-500 to-red-500",
                },
                {
                  icon: LineChart,
                  title: "Visual Analytics Dashboard",
                  description:
                    "Access comprehensive charts and graphs that make your emotional journey clear at a glance. Track progress, identify trends, and celebrate improvements.",
                  color: "violet",
                  gradient: "from-violet-500 to-purple-500",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <Card className="p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200 bg-white">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                    >
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="mission-vision"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="px-6 py-20 bg-gradient-to-br from-purple-50 to-blue-50"
        >
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                  Our Mission & Vision
                </h2>
                <div className="space-y-6 text-lg text-gray-600 leading-relaxed">
                  <p>
                    At MindSight, we believe that mental health should be
                    accessible, personalized, and empowering. Too many people
                    struggle in silence, unaware of the patterns and triggers
                    affecting their emotional well-being.
                  </p>
                  <p>
                    We founded MindSight with a clear goal: to democratize
                    emotional intelligence through technology. By combining
                    advanced machine learning, natural language processing, and
                    evidence-based psychological research, we create a tool that
                    helps everyone understand and improve their mental health.
                  </p>
                  <p>
                    Our vision is a world where everyone has the insights and
                    tools needed to proactively manage their emotional wellness,
                    leading to healthier, happier, and more fulfilling lives.
                  </p>
                </div>
                <div className="mt-8 space-y-4">
                  {[
                    "Make mental health insights accessible to everyone",
                    "Provide evidence-based, personalized recommendations",
                    "Empower users with data-driven self-awareness",
                    "Support proactive emotional wellness management",
                  ].map((goal, index) => (
                    <motion.div
                      key={goal}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <span className="text-gray-700 font-medium">{goal}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl p-12 text-white shadow-2xl">
                  <h3 className="text-3xl font-bold mb-8">
                    Why Choose MindSight?
                  </h3>
                  <div className="space-y-6">
                    {[
                      {
                        icon: BrainCircuit,
                        title: "Advanced AI Technology",
                        description:
                          "State-of-the-art ML models trained on emotional wellness data",
                      },
                      {
                        icon: Clock,
                        title: "Takes Just 2 Minutes",
                        description:
                          "Quick daily check-ins that fit seamlessly into your routine",
                      },
                      {
                        icon: Shield,
                        title: "Privacy First",
                        description:
                          "Your data is encrypted and never shared with third parties",
                      },
                      {
                        icon: Users,
                        title: "Community Support",
                        description:
                          "Join thousands on their journey to better mental health",
                      },
                    ].map((item, index) => (
                      <motion.div
                        key={item.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex items-start gap-4"
                      >
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg mb-1">
                            {item.title}
                          </h4>
                          <p className="text-purple-100">{item.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="px-6 py-20"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-3xl p-12 md:p-16 text-white text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  Ready to Transform Your Emotional Wellness?
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-xl mb-10 opacity-95 max-w-2xl mx-auto"
                >
                  Join thousands of users who have discovered greater emotional
                  awareness, reduced stress, and improved well-being through
                  MindSight.
                </motion.p>
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <Button
                    onClick={handleGetStarted}
                    className="bg-white text-purple-600 hover:bg-black text-lg px-10 py-6 rounded-xl shadow-lg hover:shadow-xl hover:shadow-purple-900 hover:scale-105 transition-all hover:text-white font-bold"
                  >
                    Get Started for Free
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-6 text-sm opacity-90"
                >
                  No credit card required. Start tracking your emotional
                  wellness in under 2 minutes.
                </motion.p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        <footer className="px-6 py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="flex items-center justify-center space-x-3 mb-6"
              >
                <Heart className="w-8 h-8 text-purple-400" />
                <span className="text-2xl font-bold">MindSight</span>
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-gray-400 text-lg"
              >
                Your journey to emotional wellness starts here
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-gray-500 text-sm mt-4"
              >
                © 2025 MindSight. Supporting your emotional wellbeing, one day
                at a time.
              </motion.p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
