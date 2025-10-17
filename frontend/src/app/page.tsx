"use client";
import React, { useState } from 'react';
import { LandingPage } from './LandingPage/page';

type Page = 'landing' | 'auth' | 'survey' | 'dashboard';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  const handleAuth = (userData: User) => {
    setUser(userData);
    if (surveyCompleted) {
      setCurrentPage('dashboard');
    } else {
      setCurrentPage('survey');
    }
  };

  const handleSurveyComplete = () => {
    setSurveyCompleted(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setSurveyCompleted(false);
    setCurrentPage('landing');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={() => navigateTo('auth')} />;
      default:
        return <LandingPage onGetStarted={() => navigateTo('auth')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
      {renderPage()}
    </div>
  );
}



