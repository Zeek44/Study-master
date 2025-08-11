import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface CreateTopicModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateTopicModal({ onClose, onSuccess }: CreateTopicModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject_area: '',
    difficulty_level: 1,
    is_public: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subjectAreas = [
    'Mathematics',
    'Science',
    'History',
    'Literature',
    'Foreign Languages',
    'Computer Science',
    'Business',
    'Medicine',
    'Law',
    'Arts',
    'Philosophy',
    'Psychology',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Topic name is required';
    if (!formData.subject_area) newErrors.subject_area = 'Subject area is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('topics')
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          subject_area: formData.subject_area,
          difficulty_level: formData.difficulty_level,
          created_by: user!.id,
          is_public: formData.is_public,
        });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to create topic' });
    } finally {
      setLoading(false);
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
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Topic</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Topic Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Topic Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Calculus Fundamentals"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of what this topic covers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
          </div>

          {/* Subject Area */}
          <div>
            <label htmlFor="subject_area" className="block text-sm font-medium text-gray-700 mb-2">
              Subject Area *
            </label>
            <select
              id="subject_area"
              name="subject_area"
              value={formData.subject_area}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.subject_area ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a subject area...</option>
              {subjectAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            {errors.subject_area && (
              <p className="mt-1 text-sm text-red-600">{errors.subject_area}</p>
            )}
          </div>

          {/* Difficulty Level */}
          <div>
            <label htmlFor="difficulty_level" className="block text-sm font-medium text-gray-700 mb-2">
              Difficulty Level
            </label>
            <select
              id="difficulty_level"
              name="difficulty_level"
              value={formData.difficulty_level}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>1 - Beginner</option>
              <option value={2}>2 - Elementary</option>
              <option value={3}>3 - Intermediate</option>
              <option value={4}>4 - Advanced</option>
              <option value={5}>5 - Expert</option>
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
              Make this topic public (others can see and study it)
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
              <span>{loading ? 'Creating...' : 'Create Topic'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}