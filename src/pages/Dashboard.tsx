import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Upload, 
  Timer, 
  TrendingUp, 
  Target,
  Calendar,
  Award,
  BookOpen,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalFlashcards: 0,
    studyStreak: 0,
    documentsUploaded: 0,
    hoursStudied: 0,
    weeklyGoal: 10,
    accuracy: 0
  });

  useEffect(() => {
    // Fetch user statistics
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      // Mock data for demo
      setStats({
        totalFlashcards: 127,
        studyStreak: 12,
        documentsUploaded: user?.subscription_status === 'premium' ? 8 : 2,
        hoursStudied: 24.5,
        weeklyGoal: 10,
        accuracy: 87
      });
    }
  };

  const quickActions = [
    {
      title: 'Practice Flashcards',
      description: 'Review your cards with spaced repetition',
      icon: Brain,
      link: '/flashcards',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Take Notes',
      description: 'Cornell notes and mind mapping',
      icon: FileText,
      link: '/notes',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Upload Documents',
      description: `${user?.subscription_status === 'premium' ? 'Unlimited' : `${4 - stats.documentsUploaded} remaining`} uploads`,
      icon: Upload,
      link: '/documents',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Study Timer',
      description: 'Pomodoro sessions and focus tracking',
      icon: Timer,
      link: '/study-tools',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const statCards = [
    {
      title: 'Study Streak',
      value: `${stats.studyStreak} days`,
      icon: Award,
      color: 'text-yellow-400'
    },
    {
      title: 'Total Flashcards',
      value: stats.totalFlashcards,
      icon: Brain,
      color: 'text-purple-400'
    },
    {
      title: 'Hours Studied',
      value: `${stats.hoursStudied}h`,
      icon: BookOpen,
      color: 'text-blue-400'
    },
    {
      title: 'Average Accuracy',
      value: `${stats.accuracy}%`,
      icon: Target,
      color: 'text-green-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name}! 
            {user?.subscription_status === 'premium' && (
              <span className="ml-2 inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-sm">
                👑 Premium
              </span>
            )}
          </h1>
          <p className="text-gray-300 text-lg">Ready to continue your learning journey?</p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
                whileHover={{ scale: 1.02, y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color} group-hover:scale-110 transition-transform`} />
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-300 text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Link key={index} to={action.link}>
                  <motion.div
                    className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group cursor-pointer"
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                    <p className="text-gray-300 text-sm">{action.description}</p>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>

        {/* Recent Activity & Progress */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-purple-400" />
              Weekly Progress
            </h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-1">
                  <span>Weekly Goal Progress</span>
                  <span>{stats.hoursStudied}/{stats.weeklyGoal}h</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats.hoursStudied / stats.weeklyGoal) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/20">
                <p className="text-gray-300 text-sm mb-2">This Week's Activity</p>
                <div className="grid grid-cols-7 gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-8 rounded text-xs flex items-center justify-center font-medium ${
                        Math.random() > 0.3 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-700 text-gray-400'
                      }`}
                    >
                      {Math.floor(Math.random() * 3)}h
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Completed Biology flashcards</p>
                  <p className="text-gray-400 text-xs">2 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Created new note set</p>
                  <p className="text-gray-400 text-xs">5 hours ago</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">Uploaded study material</p>
                  <p className="text-gray-400 text-xs">1 day ago</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;