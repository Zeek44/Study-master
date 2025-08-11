import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Brain, 
  TrendingUp, 
  Clock, 
  Target,
  Star,
  Calendar,
  BarChart3,
  Plus
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFlashcards } from '../hooks/useFlashcards';
import { useQuizzes } from '../hooks/useQuizzes';
import { supabase, StudySession, UserProgress, Topic } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
  totalFlashcards: number;
  dueCards: number;
  completedQuizzes: number;
  averageScore: number;
  currentStreak: number;
  totalStudyTime: number;
}

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { flashcards, getDueCards } = useFlashcards();
  const { getUserQuizHistory } = useQuizzes();
  const [stats, setStats] = useState<DashboardStats>({
    totalFlashcards: 0,
    dueCards: 0,
    completedQuizzes: 0,
    averageScore: 0,
    currentStreak: 0,
    totalStudyTime: 0,
  });
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [topicProgress, setTopicProgress] = useState<UserProgress[]>([]);
  const [popularTopics, setPopularTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, flashcards]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load recent study sessions
      const { data: sessions } = await supabase
        .from('study_sessions')
        .select(`
          *,
          topic:topics(*)
        `)
        .eq('user_id', user!.id)
        .order('started_at', { ascending: false })
        .limit(5);

      setRecentSessions(sessions || []);

      // Load user progress by topic
      const { data: progress } = await supabase
        .from('user_progress')
        .select(`
          *,
          topic:topics(*)
        `)
        .eq('user_id', user!.id)
        .order('mastery_level', { ascending: false })
        .limit(5);

      setTopicProgress(progress || []);

      // Load popular topics
      const { data: topics } = await supabase
        .from('topics')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(6);

      setPopularTopics(topics || []);

      // Calculate stats
      const quizHistory = await getUserQuizHistory(50);
      const completedQuizzes = quizHistory.data?.length || 0;
      const averageScore = completedQuizzes > 0 
        ? quizHistory.data!.reduce((sum, quiz) => sum + (quiz.score || 0), 0) / completedQuizzes
        : 0;

      // Calculate total study time from sessions
      const totalMinutes = sessions?.reduce((sum, session) => 
        sum + (session.duration_minutes || 0), 0) || 0;

      // Get due cards count
      const dueCards = getDueCards();

      // Calculate streak from progress data
      let currentStreak = 0;
      if (progress && progress.length > 0) {
        currentStreak = Math.max(...progress.map(p => p.streak_days));
      }

      setStats({
        totalFlashcards: flashcards.length,
        dueCards: dueCards.length,
        completedQuizzes,
        averageScore: Math.round(averageScore),
        currentStreak,
        totalStudyTime: totalMinutes,
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDailyGoalProgress = () => {
    const todayMinutes = recentSessions
      .filter(session => {
        const sessionDate = new Date(session.started_at).toDateString();
        const today = new Date().toDateString();
        return sessionDate === today;
      })
      .reduce((sum, session) => sum + (session.duration_minutes || 0), 0);

    const dailyGoal = profile?.daily_goal || 30;
    return Math.min((todayMinutes / dailyGoal) * 100, 100);
  };

  if (loading) {
    return <LoadingSpinner text="Loading your dashboard..." />;
  }

  const dailyProgress = getDailyGoalProgress();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to continue your learning journey? Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Flashcards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalFlashcards}</p>
              <p className="text-xs text-blue-600 mt-1">{stats.dueCards} due for review</p>
            </div>
            <BookOpen className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Quiz Average</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
              <p className="text-xs text-green-600 mt-1">{stats.completedQuizzes} completed</p>
            </div>
            <Brain className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
              <p className="text-xs text-purple-600 mt-1">days in a row</p>
            </div>
            <Star className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Study Time</p>
              <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalStudyTime / 60)}h</p>
              <p className="text-xs text-orange-600 mt-1">{stats.totalStudyTime % 60}m total</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Today's Progress</h2>
          <Target className="h-5 w-5 text-gray-400" />
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Daily Goal: {profile?.daily_goal || 30} minutes</span>
              <span>{Math.round(dailyProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${dailyProgress}%` }}
              ></div>
            </div>
          </div>
          <Link
            to="/study"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Start Studying
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Study Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sessions</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {session.topic?.name || 'Study Session'}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      {session.session_type} • {session.duration_minutes || 0} minutes
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.started_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    {session.accuracy_rate && (
                      <p className="text-sm font-medium text-green-600">
                        {Math.round(session.accuracy_rate)}% accuracy
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {session.cards_reviewed} cards • {session.questions_answered} questions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No study sessions yet</p>
              <Link
                to="/study"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Start Your First Session</span>
              </Link>
            </div>
          )}
        </div>

        {/* Topic Progress */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Your Progress</h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>

          {topicProgress.length > 0 ? (
            <div className="space-y-4">
              {topicProgress.map((progress) => (
                <div key={progress.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {progress.topic?.name}
                    </p>
                    <span className="text-sm text-gray-600">
                      {Math.round(progress.mastery_level)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                      style={{ width: `${progress.mastery_level}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{progress.cards_mastered} cards mastered</span>
                    <span>{progress.quizzes_completed} quizzes completed</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Start studying to track your progress</p>
              <Link
                to="/study"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span>Begin Learning</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/study"
            className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
          >
            <BookOpen className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Review Flashcards</h3>
            <p className="text-sm text-gray-600">
              {stats.dueCards} cards ready for review
            </p>
          </Link>

          <Link
            to="/quiz"
            className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
          >
            <Brain className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">Take a Quiz</h3>
            <p className="text-sm text-gray-600">
              Test your knowledge and improve
            </p>
          </Link>

          <Link
            to="/progress"
            className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
          >
            <TrendingUp className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900">View Analytics</h3>
            <p className="text-sm text-gray-600">
              Track your learning progress
            </p>
          </Link>
        </div>
      </div>

      {/* Popular Topics */}
      {popularTopics.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Explore Popular Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularTopics.map((topic) => (
              <Link
                key={topic.id}
                to={`/study/${topic.id}`}
                className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{topic.name}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {topic.description || 'Start learning about this topic'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {topic.subject_area}
                  </span>
                  <span className="text-xs text-gray-500">
                    Level {topic.difficulty_level}/5
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}