import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, Clock, Brain } from 'lucide-react';

interface StudyAnalyticsProps {
  data: {
    weeklyHours: number[];
    accuracy: number;
    streakDays: number;
    cardsReviewed: number;
  };
}

const StudyAnalytics: React.FC<StudyAnalyticsProps> = ({ data }) => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxHours = Math.max(...data.weeklyHours);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <TrendingUp className="w-5 h-5 mr-2 text-purple-400" />
        Study Analytics
      </h3>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{data.accuracy}%</div>
          <div className="text-gray-300 text-sm">Accuracy</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{data.cardsReviewed}</div>
          <div className="text-gray-300 text-sm">Cards Reviewed</div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="space-y-3">
        <p className="text-white font-medium">This Week's Study Hours</p>
        {weekDays.map((day, index) => (
          <motion.div
            key={day}
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="w-8 text-gray-300 text-sm font-medium">{day}</div>
            <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: `${(data.weeklyHours[index] / maxHours) * 100}%` }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
            <div className="w-12 text-right text-white text-sm">
              {data.weeklyHours[index]}h
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudyAnalytics;