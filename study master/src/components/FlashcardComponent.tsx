import React, { useState } from 'react';
import { RotateCcw, Eye, EyeOff, Star } from 'lucide-react';
import { Flashcard } from '../lib/supabase';

interface FlashcardComponentProps {
  flashcard: Flashcard;
  showAnswer?: boolean;
  onRate?: (quality: 1 | 2 | 3 | 4 | 5) => void;
  onFlip?: () => void;
  className?: string;
}

export default function FlashcardComponent({
  flashcard,
  showAnswer = false,
  onRate,
  onFlip,
  className = '',
}: FlashcardComponentProps) {
  const [isFlipped, setIsFlipped] = useState(showAnswer);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  const renderDifficultyStars = (difficulty: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const qualityButtons = [
    { quality: 1, label: 'Again', color: 'bg-red-500 hover:bg-red-600' },
    { quality: 2, label: 'Hard', color: 'bg-orange-500 hover:bg-orange-600' },
    { quality: 3, label: 'Good', color: 'bg-blue-500 hover:bg-blue-600' },
    { quality: 4, label: 'Easy', color: 'bg-green-500 hover:bg-green-600' },
    { quality: 5, label: 'Perfect', color: 'bg-purple-500 hover:bg-purple-600' },
  ];

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {flashcard.topic?.name}
            </span>
            <div className="flex items-center space-x-1">
              {renderDifficultyStars(flashcard.difficulty)}
            </div>
          </div>
          {flashcard.tags && flashcard.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {flashcard.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="min-h-[200px] flex items-center justify-center">
          <div className="text-center w-full">
            {!isFlipped ? (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Question</h3>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {flashcard.front_text}
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Answer</h3>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {flashcard.back_text}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-center mb-4">
            <button
              onClick={handleFlip}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              {!isFlipped ? (
                <>
                  <Eye className="h-4 w-4" />
                  <span>Show Answer</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4" />
                  <span>Hide Answer</span>
                </>
              )}
            </button>
          </div>

          {/* Rating Buttons */}
          {isFlipped && onRate && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">How well did you know this?</p>
              <div className="grid grid-cols-5 gap-2">
                {qualityButtons.map((button) => (
                  <button
                    key={button.quality}
                    onClick={() => onRate(button.quality as 1 | 2 | 3 | 4 | 5)}
                    className={`px-2 py-1 text-white text-xs font-medium rounded transition-colors ${button.color}`}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}