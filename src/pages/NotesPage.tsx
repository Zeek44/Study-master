import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Search, 
  BookOpen,
  Edit3,
  Save,
  Trash2,
  Brain,
  Network
} from 'lucide-react';
import Navigation from '../components/Navigation';
import CornellNotes from '../components/CornellNotes';
import MindMap from '../components/MindMap';

const NotesPage: React.FC = () => {
  const [activeView, setActiveView] = useState<'list' | 'cornell' | 'mindmap'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Biology Chapter 5: Cell Structure',
      type: 'cornell',
      lastModified: '2 hours ago',
      preview: 'Cell membrane composition and function...'
    },
    {
      id: '2',
      title: 'History: World War 2 Timeline',
      type: 'mindmap',
      lastModified: '1 day ago',
      preview: 'Major events and connections...'
    },
    {
      id: '3',
      title: 'Mathematics: Calculus Derivatives',
      type: 'cornell',
      lastModified: '3 days ago',
      preview: 'Derivative rules and applications...'
    }
  ]);

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const viewTabs = [
    { id: 'list', label: 'All Notes', icon: FileText },
    { id: 'cornell', label: 'Cornell Notes', icon: BookOpen },
    { id: 'mindmap', label: 'Mind Map', icon: Network }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Study Notes</h1>
          <p className="text-gray-300 text-lg">Organize knowledge with Cornell notes and mind maps</p>
        </motion.div>

        {/* View Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 inline-flex">
            {viewTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeView === tab.id
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeView === 'list' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Search and Create */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setActiveView('cornell')}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all"
                >
                  <BookOpen className="w-5 h-5" />
                  <span>Cornell Notes</span>
                </button>
                
                <button
                  onClick={() => setActiveView('mindmap')}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-all"
                >
                  <Brain className="w-5 h-5" />
                  <span>Mind Map</span>
                </button>
              </div>
            </div>

            {/* Notes Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => setActiveView(note.type as any)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${
                      note.type === 'cornell' 
                        ? 'bg-blue-500/20' 
                        : 'bg-purple-500/20'
                    }`}>
                      {note.type === 'cornell' ? (
                        <BookOpen className="w-5 h-5 text-blue-400" />
                      ) : (
                        <Network className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    
                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 hover:text-white transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{note.title}</h3>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{note.preview}</p>
                  
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="capitalize">{note.type} notes</span>
                    <span>{note.lastModified}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 'cornell' && <CornellNotes onBack={() => setActiveView('list')} />}
        {activeView === 'mindmap' && <MindMap onBack={() => setActiveView('list')} />}
      </div>
    </div>
  );
};

export default NotesPage;