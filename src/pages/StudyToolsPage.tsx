import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw, 
  Calendar,
  Target,
  TrendingUp,
  Award,
  Flame
} from 'lucide-react';
import Navigation from '../components/Navigation';

const StudyToolsPage: React.FC = () => {
  const [activeTimer, setActiveTimer] = useState(25 * 60); // 25 minutes
  const [isRunning, setIsRunning] = useState(false);
  const [currentSession, setCurrentSession] = useState<'work' | 'break'>('work');
  const [sessions, setSessions] = useState(0);
  const [streak, setStreak] = useState(12);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && activeTimer > 0) {
      interval = setInterval(() => {
        setActiveTimer(time => time - 1);
      }, 1000);
    } else if (activeTimer === 0) {
      // Timer finished
      setIsRunning(false);
      if (currentSession === 'work') {
        setSessions(sessions + 1);
        setActiveTimer(5 * 60); // 5-minute break
        setCurrentSession('break');
      } else {
        setActiveTimer(25 * 60); // Back to 25-minute work
        setCurrentSession('work');
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, activeTimer, currentSession, sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsRunning(false);
    setActiveTimer(currentSession === 'work' ? 25 * 60 : 5 * 60);
  };

  const weeklyData = [
    { day: 'Mon', hours: 3.5 },
    { day: 'Tue', hours: 2.8 },
    { day: 'Wed', hours: 4.2 },
    { day: 'Thu', hours: 3.1 },
    { day: 'Fri', hours: 2.5 },
    { day: 'Sat', hours: 5.0 },
    { day: 'Sun', hours: 1.2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Study Tools</h1>
          <p className="text-gray-300 text-lg">Focus techniques and progress tracking</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pomodoro Timer */}
          <motion.div
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-6">Pomodoro Timer</h2>
              
              {/* Timer Display */}
              <motion.div
                className={`relative mx-auto mb-8 w-64 h-64 rounded-full flex items-center justify-center ${
                  currentSession === 'work' 
                    ? 'bg-gradient-to-br from-red-500 to-orange-500'
                    : 'bg-gradient-to-br from-green-500 to-teal-500'
                }`}
                animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 2, repeat: isRunning ? Infinity : 0 }}
              >
                {/* Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (activeTimer / (currentSession === 'work' ? 25 * 60 : 5 * 60))}
                    transition={{ duration: 1 }}
                  />
                </svg>

                <div className="text-center z-10">
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatTime(activeTimer)}
                  </div>
                  <div className="text-white/80 font-medium">
                    {currentSession === 'work' ? 'Focus Time' : 'Break Time'}
                  </div>
                </div>
              </motion.div>

              {/* Timer Controls */}
              <div className="flex justify-center space-x-4 mb-6">
                <motion.button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                    isRunning
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span>{isRunning ? 'Pause' : 'Start'}</span>
                </motion.button>
                
                <motion.button
                  onClick={resetTimer}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </motion.button>
              </div>

              {/* Session Count */}
              <div className="flex items-center justify-center space-x-2 text-gray-300">
                <Timer className="w-5 h-5" />
                <span>Sessions completed today: {sessions}</span>
              </div>
            </div>
          </motion.div>

          {/* Progress Tracking */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{streak}</div>
                <div className="text-gray-300 text-sm">Day Streak</div>
              </motion.div>

              <motion.div
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <Target className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">87%</div>
                <div className="text-gray-300 text-sm">Weekly Goal</div>
              </motion.div>
            </div>

            {/* Weekly Chart */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
                This Week's Progress
              </h3>
              
              <div className="space-y-3">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={day.day}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="w-12 text-gray-300 text-sm font-medium">{day.day}</div>
                    <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${(day.hours / 5) * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                      />
                    </div>
                    <div className="w-16 text-right text-white text-sm font-medium">
                      {day.hours}h
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-400" />
                Recent Achievements
              </h3>
              
              <div className="space-y-3">
                <motion.div
                  className="flex items-center space-x-3 p-3 bg-yellow-500/20 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Flame className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">12-Day Streak!</p>
                    <p className="text-yellow-200 text-sm">Keep up the momentum</p>
                  </div>
                </motion.div>
                
                <motion.div
                  className="flex items-center space-x-3 p-3 bg-purple-500/20 rounded-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                    <Timer className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">Focus Master</p>
                    <p className="text-purple-200 text-sm">Completed 50 Pomodoro sessions</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudyToolsPage;