import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Brain, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  BarChart3,
  ArrowLeft,
  ArrowRight,
  Award
} from 'lucide-react';
import { useQuizzes } from '../hooks/useQuizzes';
import { useAuth } from '../hooks/useAuth';
import { QuizTemplate, Question, QuizResponse } from '../lib/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

interface QuizState {
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeSpent: Record<string, number>;
  startTime: Date;
  isPaused: boolean;
}

export default function QuizPage() {
  const { quizId } = useParams();
  const { user } = useAuth();
  const { 
    quizTemplates, 
    currentQuiz,
    currentAttempt, 
    loading, 
    error,
    loadQuizTemplates,
    loadQuizWithQuestions,
    startQuizAttempt,
    submitQuizResponse,
    completeQuizAttempt,
    getQuizResults,
    getUserQuizHistory
  } = useQuizzes();

  const [mode, setMode] = useState<'browse' | 'taking' | 'results'>('browse');
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    answers: {},
    timeSpent: {},
    startTime: new Date(),
    isPaused: false,
  });
  const [quizResults, setQuizResults] = useState<QuizResponse[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [timer, setTimer] = useState(0);
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);

  useEffect(() => {
    loadQuizTemplates();
    loadRecentQuizzes();
  }, []);

  useEffect(() => {
    if (quizId) {
      loadQuizWithQuestions(quizId);
    }
  }, [quizId]);

  // Timer effect for active quizzes
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (mode === 'taking' && !quizState.isPaused && currentQuiz) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mode, quizState.isPaused]);

  const loadRecentQuizzes = async () => {
    const { data } = await getUserQuizHistory(10);
    setRecentQuizzes(data || []);
  };

  const handleStartQuiz = async (quiz: QuizTemplate, quizMode: 'practice' | 'exam' | 'review' = 'practice') => {
    const { data } = await startQuizAttempt(quiz.id, quizMode);
    if (data) {
      setMode('taking');
      setQuizState({
        currentQuestionIndex: 0,
        answers: {},
        timeSpent: {},
        startTime: new Date(),
        isPaused: false,
      });
      setTimer(0);
      setSelectedAnswer('');
    }
  };

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
    setQuizState(prev => ({
      ...prev,
      answers: {
        ...prev.answers,
        [getCurrentQuestion()?.id || '']: answer
      }
    }));
  };

  const handleNextQuestion = async () => {
    if (!currentQuiz?.questions || !currentAttempt) return;

    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !selectedAnswer) return;

    // Calculate if answer is correct
    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();

    // Submit response
    await submitQuizResponse(currentQuestion.id, selectedAnswer, isCorrect, timer);

    // Record time spent on this question
    setQuizState(prev => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [currentQuestion.id]: timer
      }
    }));

    // Move to next question or finish quiz
    if (quizState.currentQuestionIndex < currentQuiz.questions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
      setSelectedAnswer('');
      setTimer(0);
    } else {
      await finishQuiz();
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
      
      const prevQuestion = currentQuiz?.questions?.[quizState.currentQuestionIndex - 1];
      if (prevQuestion) {
        setSelectedAnswer(quizState.answers[prevQuestion.id] || '');
      }
    }
  };

  const finishQuiz = async () => {
    if (!currentAttempt) return;

    // Get all responses for this attempt
    const { data: responses } = await getQuizResults(currentAttempt.id);
    if (responses) {
      await completeQuizAttempt(responses);
      setQuizResults(responses);
      setMode('results');
      loadRecentQuizzes();
    }
  };

  const getCurrentQuestion = (): Question | null => {
    if (!currentQuiz?.questions) return null;
    return currentQuiz.questions[quizState.currentQuestionIndex] || null;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuizScore = (): { score: number; total: number } => {
    const correct = quizResults.filter(r => r.is_correct).length;
    return { score: correct, total: quizResults.length };
  };

  if (loading) {
    return <LoadingSpinner text="Loading quizzes..." />;
  }

  // Results View
  if (mode === 'results') {
    const { score, total } = getQuizScore();
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Award className="h-16 w-16 mx-auto mb-4 text-yellow-500" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h1>
            <div className="text-6xl font-bold mb-4">
              <span className={percentage >= 80 ? 'text-green-600' : percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}>
                {percentage}%
              </span>
            </div>
            <p className="text-gray-600 mb-2">
              You scored {score} out of {total} questions correctly
            </p>
            <p className="text-sm text-gray-500">
              Quiz: {currentQuiz?.title}
            </p>
          </div>

          {/* Detailed Results */}
          <div className="space-y-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Question Review</h2>
            {quizResults.map((result, index) => (
              <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900">
                    Question {index + 1}
                  </h3>
                  {result.is_correct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                
                <p className="text-gray-800 mb-3">{result.question?.question_text}</p>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Your answer: </span>
                    <span className={`font-medium ${result.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                      {result.user_answer}
                    </span>
                  </div>
                  {!result.is_correct && (
                    <div>
                      <span className="text-sm font-medium text-gray-600">Correct answer: </span>
                      <span className="font-medium text-green-700">
                        {result.question?.correct_answer}
                      </span>
                    </div>
                  )}
                  {result.question?.explanation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium text-blue-800">Explanation: </span>
                      <span className="text-sm text-blue-700">{result.question.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                setMode('browse');
                setQuizResults([]);
              }}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Quizzes
            </button>
            <button
              onClick={() => handleStartQuiz(currentQuiz!, 'practice')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Taking Quiz View
  if (mode === 'taking' && currentQuiz) {
    const currentQuestion = getCurrentQuestion();
    const progress = ((quizState.currentQuestionIndex + 1) / currentQuiz.questions!.length) * 100;

    if (!currentQuestion) {
      return <LoadingSpinner text="Loading question..." />;
    }

    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">{currentQuiz.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timer)}</span>
              </div>
              <button
                onClick={() => setQuizState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                {quizState.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Question {quizState.currentQuestionIndex + 1} of {currentQuiz.questions!.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-6">
            {currentQuestion.question_text}
          </h2>

          {/* Answer Input */}
          <div className="space-y-4">
            {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options ? (
              <div className="space-y-3">
                {Object.entries(currentQuestion.options as Record<string, string>).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={value}
                      checked={selectedAnswer === value}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{value}</span>
                  </label>
                ))}
              </div>
            ) : currentQuestion.question_type === 'true_false' ? (
              <div className="space-y-3">
                {['True', 'False'].map((option) => (
                  <label key={option} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="answer"
                      value={option}
                      checked={selectedAnswer === option}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-900">{option}</span>
                  </label>
                ))}
              </div>
            ) : (
              <textarea
                value={selectedAnswer}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Enter your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                rows={4}
              />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <button
            onClick={handleNextQuestion}
            disabled={!selectedAnswer.trim()}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>
              {quizState.currentQuestionIndex === currentQuiz.questions!.length - 1 ? 'Finish Quiz' : 'Next'}
            </span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  // Browse Quizzes View
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quiz Center</h1>
        <p className="text-gray-600">
          Test your knowledge and track your progress with interactive quizzes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quiz History */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Attempts</h2>
            {recentQuizzes.length > 0 ? (
              <div className="space-y-3">
                {recentQuizzes.map((quiz) => (
                  <div key={quiz.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm">
                      {quiz.quiz_template?.title}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className={`text-sm font-medium ${
                        quiz.score >= 80 ? 'text-green-600' : quiz.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {Math.round(quiz.score)}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(quiz.completed_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No quiz attempts yet</p>
            )}
          </div>
        </div>

        {/* Available Quizzes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Available Quizzes</h2>
            
            {quizTemplates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quizTemplates.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <Brain className="h-8 w-8 text-blue-600" />
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {quiz.topic?.subject_area}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {quiz.description || 'Test your knowledge on this topic'}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{quiz.question_count} questions</span>
                      {quiz.time_limit_minutes && (
                        <span>{quiz.time_limit_minutes} minutes</span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <button
                        onClick={() => handleStartQuiz(quiz, 'practice')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Practice Mode
                      </button>
                      <button
                        onClick={() => handleStartQuiz(quiz, 'exam')}
                        className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        Exam Mode
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes available</h3>
                <p className="text-gray-600 mb-6">
                  Create some flashcards first, then quizzes will be generated automatically
                </p>
                <Link
                  to="/study"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Create Flashcards
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}