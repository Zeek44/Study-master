import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, Download, Plus } from 'lucide-react';

interface CornellNotesProps {
  onBack: () => void;
}

const CornellNotes: React.FC<CornellNotesProps> = ({ onBack }) => {
  const [noteData, setNoteData] = useState({
    title: '',
    cues: '',
    notes: '',
    summary: ''
  });

  const handleSave = () => {
    // Save logic here
    console.log('Saving Cornell notes:', noteData);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Notes</span>
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <input
          type="text"
          value={noteData.title}
          onChange={(e) => setNoteData({ ...noteData, title: e.target.value })}
          placeholder="Note Title..."
          className="w-full text-2xl font-bold text-white bg-transparent border-none outline-none placeholder-gray-400"
        />
      </div>

      {/* Cornell Layout */}
      <div className="grid lg:grid-cols-3 gap-6 h-96">
        {/* Cues Column */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Cues & Questions</h3>
          <textarea
            value={noteData.cues}
            onChange={(e) => setNoteData({ ...noteData, cues: e.target.value })}
            placeholder="Key concepts, questions, formulas..."
            className="w-full h-full bg-transparent text-gray-300 placeholder-gray-400 border-none outline-none resize-none"
          />
        </div>

        {/* Notes Column */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Notes</h3>
          <textarea
            value={noteData.notes}
            onChange={(e) => setNoteData({ ...noteData, notes: e.target.value })}
            placeholder="Main content, explanations, examples..."
            className="w-full h-full bg-transparent text-gray-300 placeholder-gray-400 border-none outline-none resize-none"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
        <textarea
          value={noteData.summary}
          onChange={(e) => setNoteData({ ...noteData, summary: e.target.value })}
          placeholder="Key takeaways and summary..."
          className="w-full h-24 bg-transparent text-gray-300 placeholder-gray-400 border-none outline-none resize-none"
        />
      </div>
    </motion.div>
  );
};

export default CornellNotes;