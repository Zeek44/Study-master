import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter,
  RotateCcw,
  Clock,
  Star,
  Edit,
  Trash2
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useFlashcards } from '../hooks/useFlashcards';
import { supabase, Topic } from '../lib/supabase';
import FlashcardComponent from '../components/FlashcardComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import CreateFlashcardModal from '../components/CreateFlashcardModal';
import CreateTopicModal from '../components/CreateTopicModal';

export default function StudyPage() {
  const { topicId } = useParams();
  const { user } = useAuth();
  const { 
    flashcards, 
    srsItems, 
    loading, 
    error, 
    createFlashcard, 
    deleteFlashcard, 
    reviewCard,
    getDueCards,
    loadFlashcards
  } = useFlashcards(topicId);

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [studyMode, setStudyMode] = useState<'browse' | 'review'>('browse');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateCard, setShowCreateCard] = useState(false);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    cardsReviewed: 0,
    correctAnswers: 0,
    startTime: new Date(),
  });

  useEffect(() => {
    loadTopics();
  }, [user]);

  useEffect(() => {
    if (topicId && topics.length > 0) {
      const topic = topics.find(t => t.id === topicId);
      setSelectedTopic(topic || null);
    }
  }, [topicId, topics]);

  const loadTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .or(`is_public.eq.true,created_by.eq.${user?.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTopics(data || []);
    } catch (err) {
      console.error('Error loading topics:', err);
    }
  };

  const handleReviewCard = async (quality: 1 | 2 | 3 | 4 | 5) => {
    const dueCards = getDueCards();
    if (currentCardIndex >= dueCards.length) return;

    const card = dueCards[currentCardIndex];
    await reviewCard(card.flashcard_id, quality);

    setSessionStats(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      correctAnswers: prev.correctAnswers + (quality >= 3 ? 1 : 0),
    }));

    // Move to next card or finish session
    if (currentCardIndex < dueCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    } else {
      await saveStudySession();
      setStudyMode('browse');
      setCurrentCardIndex(0);
    }
  };

  const saveStudySession = async () => {
    try {
      const duration = Math.floor((new Date().getTime() - sessionStats.startTime.getTime()) / 60000);
      const accuracy = sessionStats.cardsReviewed > 0 
        ? (sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100 
        : 0;

      await supabase.from('study_sessions').insert({
        user_id: user!.id,
        topic_id: selectedTopic?.id || null,
        session_type: 'flashcards',
        ended_at: new Date().toISOString(),
        duration_minutes: duration,
        cards_reviewed: sessionStats.cardsReviewed,
        accuracy_rate: accuracy,
      });

      // Update user progress
      if (selectedTopic) {
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user!.id)
          .eq('topic_id', selectedTopic.id)
          .single();

        const newMasteryLevel = Math.min(100, (existingProgress?.mastery_level || 0) + (accuracy / 10));
        const newTotalTime = (existingProgress?.total_time_minutes || 0) + duration;

        await supabase
          .from('user_progress')
          .upsert({
            user_id: user!.id,
            topic_id: selectedTopic.id,
            mastery_level: newMasteryLevel,
            total_time_minutes: newTotalTime,
            cards_mastered: existingProgress?.cards_mastered || 0 + sessionStats.correctAnswers,
            last_activity_date: new Date().toISOString().split('T')[0],
          });
      }

    } catch (err) {
      console.error('Error saving study session:', err);
    }
  };

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = !searchQuery || 
      card.front_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back_text.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const dueCards = getDueCards();

  if (loading) {
    return <LoadingSpinner text="Loading your study materials..." />;
  }

  // Review Mode
  if (studyMode === 'review' && dueCards.length > 0) {
    const currentCard = dueCards[currentCardIndex];
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Review Session</h1>
              <p className="text-gray-600">
                Card {currentCardIndex + 1} of {dueCards.length}
              </p>
            </div>
            <button
              onClick={() => {
                setStudyMode('browse');
                setCurrentCardIndex(0);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Exit Review
            </button>
          </div>
          
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / dueCards.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <FlashcardComponent
            flashcard={currentCard.flashcard!}
            onRate={handleReviewCard}
            className="w-full max-w-md"
          />
        </div>

        <div className="mt-6 text-center">
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{sessionStats.cardsReviewed}</p>
              <p className="text-sm text-gray-600">Reviewed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{sessionStats.correctAnswers}</p>
              <p className="text-sm text-gray-600">Correct</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {sessionStats.cardsReviewed > 0 
                  ? Math.round((sessionStats.correctAnswers / sessionStats.cardsReviewed) * 100)
                  : 0
                }%
              </p>
              <p className="text-sm text-gray-600">Accuracy</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Center</h1>
          <p className="text-gray-600">
            {selectedTopic ? `Studying ${selectedTopic.name}` : 'Choose a topic to start studying'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateTopic(true)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-4 w-4 inline mr-2" />
            New Topic
          </button>
          <button
            onClick={() => setShowCreateCard(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!selectedTopic}
          >
            <Plus className="h-4 w-4 inline mr-2" />
            New Flashcard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Topics */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Topics</h2>
            <div className="space-y-2">
              <Link
                to="/study"
                className={`block px-3 py-2 rounded-lg transition-colors ${
                  !selectedTopic 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                All Topics
              </Link>
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  to={`/study/${topic.id}`}
                  className={`block px-3 py-2 rounded-lg transition-colors ${
                    selectedTopic?.id === topic.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{topic.name}</span>
                    <div className="flex items-center space-x-1 ml-2">
                      {Array.from({ length: topic.difficulty_level }, (_, i) => (
                        <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Study Stats */}
          {selectedTopic && (
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Cards</span>
                  <span className="font-medium">{filteredFlashcards.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Due for Review</span>
                  <span className="font-medium text-orange-600">{dueCards.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Subject</span>
                  <span className="font-medium">{selectedTopic.subject_area}</span>
                </div>
              </div>

              {dueCards.length > 0 && (
                <button
                  onClick={() => {
                    setStudyMode('review');
                    setCurrentCardIndex(0);
                    setSessionStats({
                      cardsReviewed: 0,
                      correctAnswers: 0,
                      startTime: new Date(),
                    });
                  }}
                  className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Start Review ({dueCards.length} cards)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search flashcards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Flashcards Grid */}
          {filteredFlashcards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFlashcards.map((flashcard) => (
                <div key={flashcard.id} className="relative">
                  <FlashcardComponent
                    flashcard={flashcard}
                    className="h-full"
                  />
                  {flashcard.created_by === user?.id && (
                    <div className="absolute top-2 right-2 flex items-center space-x-1">
                      <button
                        onClick={() => {/* TODO: Edit flashcard */}}
                        className="p-1 bg-white bg-opacity-90 rounded text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteFlashcard(flashcard.id)}
                        className="p-1 bg-white bg-opacity-90 rounded text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {selectedTopic ? 'No flashcards in this topic' : 'No flashcards found'}
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedTopic 
                  ? 'Create your first flashcard to start studying this topic'
                  : 'Select a topic or create your first flashcard to get started'
                }
              </p>
              <button
                onClick={() => setShowCreateCard(true)}
                disabled={!selectedTopic}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create First Flashcard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCreateCard && (
        <CreateFlashcardModal
          topics={topics}
          selectedTopicId={selectedTopic?.id}
          onClose={() => setShowCreateCard(false)}
          onSuccess={() => {
            setShowCreateCard(false);
            loadFlashcards();
          }}
        />
      )}

      {showCreateTopic && (
        <CreateTopicModal
          onClose={() => setShowCreateTopic(false)}
          onSuccess={() => {
            setShowCreateTopic(false);
            loadTopics();
          }}
        />
      )}
    </div>
  );
}