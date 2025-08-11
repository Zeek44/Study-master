import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Navbar from './Navbar';
import LoadingSpinner from './LoadingSpinner';
import AuthPage from '../pages/AuthPage';
import Dashboard from '../pages/Dashboard';
import StudyPage from '../pages/StudyPage';
import QuizPage from '../pages/QuizPage';
import ProgressPage from '../pages/ProgressPage';
import SettingsPage from '../pages/SettingsPage';

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pb-16 md:pb-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/study" element={<StudyPage />} />
            <Route path="/study/:topicId" element={<StudyPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/quiz/:quizId" element={<QuizPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}