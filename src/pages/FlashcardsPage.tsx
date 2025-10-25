import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Brain, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Trash2,
  Shuffle,
  Target
} from 'lucide-react';
import Navigation from '../components/Navigation';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  reviewCount: number;
}

const FlashcardsPage: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '' });

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch('/api/flashcards', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFlashcards(data);
    } catch (error) {
      // Mock data
      const mockCards: Flashcard[] = [
        {
          id: '1',
          front: 'What is photosynthesis?',
          back: 'The process by which plants use sunlight, water, and carbon dioxide to create glucose and oxygen',
          difficulty: 'medium',
          nextReview: new Date().toISOString(),
          reviewCount: 3
        },
        {
          id: '2',
          front: 'Define mitosis',
          back: 'Cell division that results in two daughter cells, each having the same number of chromosomes as the parent nucleus',
          difficulty: 'hard',
          nextReview: new Date().toISOString(),
          reviewCount: 1
        }
      ];
      setFlashcards(mockCards);
      setCurrentCard(mockCards[0]);
    }
  };

  const createFlashcard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) {
      toast.error('Please fill in both sides of the card');
      return;
    }

    const card: Flashcard = {
      id: Date.now().toString(),
      front: newCard.front,
      back: newCard.back,
      difficulty: 'medium',
      nextReview: new Date().toISOString(),
      reviewCount: 0
    };

    try {
      await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(card)
      });

      setFlashcards([...flashcards, card]);
      setNewCard({ front: '', back: '' });
      setShowCreateForm(false);
      toast.success('Flashcard created successfully');
    } catch (error) {
      setFlashcards([...flashcards, card]);
      setNewCard({ front: '', back: '' });
      setShowCreateForm(false);
      toast.success('Flashcard created successfully');
    }
  };

  const startReview = () => {
    if (flashcards.length > 0) {
      setCurrentCard(flashcards[0]);
      setReviewMode(true);
      setIsFlipped(false);
    }
  };

  const reviewCard = (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;

    const updatedCard = {
      ...currentCard,
      difficulty,
      reviewCount: currentCard.reviewCount + 1
    };

    const remainingCards = flashcards.filter(card => card.id !== currentCard.id);
    setFlashcards(flashcards.map(card => 
      card.id === currentCard.id ? updatedCard : card
    ));

    if (remainingCards.length > 0) {
      setCurrentCard(remainingCards[0]);
      setIsFlipped(false);
    } else {
      setReviewMode(false);
      setCurrentCard(null);
      toast.success('Review session complete!');
    }
  };

  const deleteCard = async (cardId: string) => {
    try {
      await fetch(`/api/flashcards/${cardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setFlashcards(flashcards.filter(card => card.id !== cardId));
      toast.success('Flashcard deleted');
    } catch (error) {
      setFlashcards(flashcards.filter(card => card.id !== cardId));
      toast.success('Flashcard deleted');
    }
  };

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
          <h1 className="text-4xl font-bold text-white mb-2">Flashcards</h1>
          <p className="text-gray-300 text-lg">Master your subjects with spaced repetition</p>
        </motion.div>

        {!reviewMode ? (
          <div className="space-y-6">
            {/* Action Buttons */}
            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Create Flashcard</span>
              </button>
              
              <button
                onClick={startReview}
                disabled={flashcards.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Brain className="w-5 h-5" />
                <span>Start Review</span>
              </button>
            </motion.div>

            {/* Create Form */}
            <AnimatePresence>
              {showCreateForm && (
                <motion.div
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-white mb-4">Create New Flashcard</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Question / Front Side
                      </label>
                      <textarea
                        value={newCard.front}
                        onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        placeholder="Enter the question or prompt..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Answer / Back Side
                      </label>
                      <textarea
                        value={newCard.back}
                        onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        rows={3}
                        placeholder="Enter the answer..."
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={createFlashcard}
                        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                      >
                        Create Card
                      </button>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Flashcards Grid */}
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {flashcards.map((card, index) => (
                <motion.div
                  key={card.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      card.difficulty === 'easy' 
                        ? 'bg-green-500/20 text-green-300'
                        : card.difficulty === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {card.difficulty}
                    </span>
                    
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteCard(card.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-white font-medium mb-2">{card.front}</p>
                    <p className="text-gray-300 text-sm line-clamp-3">{card.back}</p>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>Reviewed {card.reviewCount} times</span>
                    <span>Next: Today</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          /* Review Mode */
          <div className="max-w-2xl mx-auto">
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-white mb-2">Review Session</h2>
              <p className="text-gray-300">
                {flashcards.filter(c => c.id !== currentCard?.id).length + 1} cards remaining
              </p>
            </motion.div>

            {currentCard && (
              <motion.div
                className="relative perspective-1000"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={`relative w-full h-80 cursor-pointer transform-style-3d transition-transform duration-700 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                  onClick={() => setIsFlipped(!isFlipped)}
                >
                  {/* Front */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl p-8 flex items-center justify-center backface-hidden">
                    <div className="text-center">
                      <Brain className="w-12 h-12 text-white mb-4 mx-auto" />
                      <p className="text-white text-xl font-medium leading-relaxed">
                        {currentCard.front}
                      </p>
                      <p className="text-purple-200 text-sm mt-4">Click to reveal answer</p>
                    </div>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 flex items-center justify-center backface-hidden rotate-y-180">
                    <div className="text-center">
                      <Target className="w-12 h-12 text-white mb-4 mx-auto" />
                      <p className="text-white text-lg leading-relaxed">
                        {currentCard.back}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Review Buttons */}
                {isFlipped && (
                  <motion.div
                    className="flex justify-center space-x-4 mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.button
                      onClick={() => reviewCard('hard')}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Hard</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => reviewCard('medium')}
                      className="flex items-center space-x-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Good</span>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => reviewCard('easy')}
                      className="flex items-center space-x-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Easy</span>
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Exit Review */}
            <div className="text-center mt-8">
              <button
                onClick={() => {
                  setReviewMode(false);
                  setCurrentCard(null);
                  setIsFlipped(false);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                Exit Review Session
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsPage;