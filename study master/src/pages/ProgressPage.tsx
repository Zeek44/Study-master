import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock,
  Target,
  Star,
  Award,
  Brain
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase, UserProgress, StudySession } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface ProgressStats {
  totalStudyTime: number;
  totalFlashcards: number;
  masteredCards: number;
  totalQuizzes: number;
  averageScore: number;
  currentStreak: number;
  weeklyGoalProgress: number;
}

export default function ProgressPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProgressStats>({
    totalStudyTime: 0,
    totalFlashcards: 0,
    masteredCards: 0,
    totalQuizzes: 0,
    averageScore: 0,
    currentStreak: 0,
    weeklyGoalProgress: 0,
  });
  const [topicProgress, setTopicProgress] = useState<UserProgress[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [dailyActivity, setDailyActivity] = useState<any[]>([]);
  const [subjectBreakdown, setSubjectBreakdown] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadProgressData();
    }
  }, [user]);

  const loadProgressData = async () => {
    try {
      setLoading(true);

      // Load user progress by topic
      const { data: progress } = await supabase
        .from('user_progress')
        .select(`
          *,
          topic:topics(*)
        `)
        .eq('user_id', user!.id)
        .order('mastery_level', { ascending: false });

      setTopicProgress(progress || []);

      // Load recent study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select(`
          *,
          topic:topics(*)
        `)
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false })
        .limit(20);

      setRecentSessions(sessions || []);

      // Load quiz attempts
      const { data: quizAttempts } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('user_id', user!.id)
        .not('completed_at', 'is', null);

      // Calculate stats
      const totalStudyTime = (sessions || []).reduce((sum, session) => 
        sum + (session.duration_minutes || 0), 0);
      
      const totalFlashcards = (sessions || []).reduce((sum, session) => 
        sum + (session.cards_reviewed || 0), 0);

      const masteredCards = (progress || []).reduce((sum, p) => 
        sum + (p.cards_mastered || 0), 0);

      const totalQuizzes = quizAttempts?.length || 0;
      const averageScore = totalQuizzes > 0 
        ? quizAttempts!.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / totalQuizzes
        : 0;

      const currentStreak = Math.max(...(progress || []).map(p => p.streak_days), 0);

      // Calculate weekly goal progress (assuming 3.5 hours per week goal)
      const weeklyGoal = 210; // 3.5 hours in minutes
      const thisWeekTime = getThisWeekStudyTime(sessions || []);
      const weeklyGoalProgress = Math.min((thisWeekTime / weeklyGoal) * 100, 100);

      setStats({
        totalStudyTime,
        totalFlashcards,
        masteredCards,
        totalQuizzes,
        averageScore: Math.round(averageScore),
        currentStreak,
        weeklyGoalProgress: Math.round(weeklyGoalProgress),
      });

      // Prepare daily activity chart data
      const dailyData = prepareDailyActivityData(sessions || []);
      setDailyActivity(dailyData);

      // Prepare subject breakdown
      const subjectData = prepareSubjectBreakdown(progress || []);
      setSubjectBreakdown(subjectData);

    } catch (error) {
      console.error('Error loading progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThisWeekStudyTime = (sessions: StudySession[]): number => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return sessions
      .filter(session => new Date(session.started_at) >= oneWeekAgo)
      .reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
  };

  const prepareDailyActivityData = (sessions: StudySession[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        minutes: 0,
        sessions: 0,
      };
    }).reverse();

    sessions.forEach(session => {
      const sessionDate = new Date(session.started_at).toISOString().split('T')[0];
      const dayData = last30Days.find(day => day.date === sessionDate);
      if (dayData) {
        dayData.minutes += session.duration_minutes || 0;
        dayData.sessions += 1;
      }
    });

    return last30Days.map(day => ({
      ...day,
      dateFormatted: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  };

  const prepareSubjectBreakdown = (progress: UserProgress[]) => {
    const subjects = progress.reduce((acc, p) => {
      const subject = p.topic?.subject_area || 'Other';
      if (!acc[subject]) {
        acc[subject] = { name: subject, value: 0, time: 0, topics: 0 };
      }
      acc[subject].value += p.mastery_level;
      acc[subject].time += p.total_time_minutes;
      acc[subject].topics += 1;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(subjects).map((subject: any) => ({
      ...subject,
      value: Math.round(subject.value / subject.topics), // Average mastery
    }));
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  if (loading) {
    return <LoadingSpinner text="Loading your progress..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">
          Track your learning journey and celebrate your achievements
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalStudyTime)}</p>
              <p className="text-xs text-blue-600 mt-1">Total time invested</p>
            </div>
            <Clock className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cards Mastered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.masteredCards}</p>
              <p className="text-xs text-green-600 mt-1">Out of {stats.totalFlashcards} studied</p>
            </div>
            <Brain className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quiz Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              <p className="text-xs text-purple-600 mt-1">{stats.totalQuizzes} quizzes taken</p>
            </div>
            <Award className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
              <p className="text-xs text-orange-600 mt-1">days in a row</p>
            </div>
            <Star className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Goal Progress</h2>
          <Target className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Weekly Goal: 3.5 hours</span>
              <span>{stats.weeklyGoalProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${stats.weeklyGoalProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Keep up the great work! You're making excellent progress.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Daily Activity Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Study Activity</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="dateFormatted" 
                  tick={{ fontSize: 12 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value, name) => [
                    name === 'minutes' ? `${value} minutes` : value,
                    name === 'minutes' ? 'Study Time' : 'Sessions'
                  ]}
                />
                <Bar dataKey="minutes" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Subject Mastery</h2>
          {subjectBreakdown.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {subjectBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Average Mastery']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>No subject data available yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Topic Progress */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Topic Progress</h2>
        {topicProgress.length > 0 ? (
          <div className="space-y-6">
            {topicProgress.map((progress) => (
              <div key={progress.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{progress.topic?.name}</h3>
                    <p className="text-sm text-gray-600">{progress.topic?.subject_area}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-blue-600">
                      {Math.round(progress.mastery_level)}%
                    </p>
                    <p className="text-sm text-gray-500">Mastery</p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
                    style={{ width: `${progress.mastery_level}%` }}
                  ></div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{progress.cards_mastered}</span>
                    <span className="block text-xs">Cards Mastered</span>
                  </div>
                  <div>
                    <span className="font-medium">{progress.quizzes_completed}</span>
                    <span className="block text-xs">Quizzes Completed</span>
                  </div>
                  <div>
                    <span className="font-medium">{formatDuration(progress.total_time_minutes)}</span>
                    <span className="block text-xs">Time Spent</span>
                  </div>
                  <div>
                    <span className="font-medium">{progress.streak_days}</span>
                    <span className="block text-xs">Day Streak</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No progress data yet</h3>
            <p className="text-gray-600">
              Start studying to see your progress here
            </p>
          </div>
        )}
      </div>

      {/* Recent Study Sessions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Study Sessions</h2>
        {recentSessions.length > 0 ? (
          <div className="space-y-4">
            {recentSessions.slice(0, 10).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    {session.topic?.name || 'General Study'}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {session.session_type} session • {formatDuration(session.duration_minutes || 0)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(session.started_at).toLocaleDateString()} at {new Date(session.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {session.cards_reviewed} cards • {session.questions_answered} questions
                  </p>
                  {session.accuracy_rate !== null && (
                    <p className="text-sm text-green-600">
                      {Math.round(session.accuracy_rate)}% accuracy
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study sessions yet</h3>
            <p className="text-gray-600">
              Your recent study activity will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}