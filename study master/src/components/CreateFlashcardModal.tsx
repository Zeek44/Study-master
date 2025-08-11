import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useFlashcards } from '../hooks/useFlashcards';
import { Topic } from '../lib/supabase';

interface CreateFlashcardModalProps {
  topics: Topic[];
  selectedTopicId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFlashcardModal({
  topics,
  selectedTopicId,
  onClose,
  onSuccess
}: CreateFlashcardModalProps) {
  const { createFlashcard, loading } = useFlashcards();
  const [formData, setFormData] = useState({
    topic_id: selectedTopicId || '',
    front_text: '',
    back_text: '',
    tags: '',
    difficulty: 3,
    is_public: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.topic_id) newErrors.topic_id = 'Topic is required';
    if (!formData.front_text.trim()) newErrors.front_text = 'Question is required';
    if (!formData.back_text.trim()) newErrors.back_text = 'Answer is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    const { error } = await createFlashcard({
      topic_id: formData.topic_id,
      front_text: formData.front_text.trim(),
      back_text: formData.back_text.trim(),
      tags,
      difficulty: formData.difficulty,
      is_public: formData.is_public,
    });

    if (!error) {
      onSuccess();
    } else {
      setErrors({ submit: error });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Flashcard</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Topic Selection */}
          <div>
            <label htmlFor="topic_id" className="block text-sm font-medium text-gray-700 mb-2">
              Topic *
            </label>
            <select
              id="topic_id"
              name="topic_id"
              value={formData.topic_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.topic_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name} ({topic.subject_area})
                </option>
              ))}
            </select>
            {errors.topic_id && (
              <p className="mt-1 text-sm text-red-600">{errors.topic_id}</p>
            )}
          </div>

          {/* Question/Front */}
          <div>
            <label htmlFor="front_text" className="block text-sm font-medium text-gray-700 mb-2">
              Question/Front Side *
            </label>
            <textarea
              id="front_text"
              name="front_text"
              rows={3}
              value={formData.front_text}
              onChange={handleInputChange}
              placeholder="Enter the question or front side of the flashcard..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                errors.front_text ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.front_text && (
              <p className="mt-1 text-sm text-red-600">{errors.front_text}</p>
            )}
          </div>

          {/* Answer/Back */}
          <div>
            <label htmlFor="back_text" className="block text-sm font-medium text-gray-700 mb-2">
              Answer/Back Side *
            </label>
            <textarea
              id="back_text"
              name="back_text"
              rows={3}
              value={formData.back_text}
              onChange={handleInputChange}
              placeholder="Enter the answer or back side of the flashcard..."
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
                errors.back_text ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.back_text && (
              <p className="mt-1 text-sm text-red-600">{errors.back_text}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="math, algebra, equations..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Add tags to help categorize and search your flashcards
            </p>
          </div>

          {/* Difficulty */}
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 - Very Easy</option>
              <option value={2}>2 - Easy</option>
              <option value={3}>3 - Medium</option>
              <option value={4}>4 - Hard</option>
              <option value={5}>5 - Very Hard</option>
            </select>
          </div>

          {/* Public Checkbox */}
          <div className="flex items-center">
            <input
              id="is_public"
              name="is_public"
              type="checkbox"
              checked={formData.is_public}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
              Make this flashcard public (others can study it)
            </label>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {errors.submit}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{loading ? 'Creating...' : 'Create Flashcard'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}