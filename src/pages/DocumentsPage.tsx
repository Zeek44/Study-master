import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Download, 
  Eye,
  AlertCircle,
  Crown,
  Plus
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  name: string;
  size: string;
  uploadDate: string;
  type: string;
  processed: boolean;
}

const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Biology Textbook Chapter 5.pdf',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      type: 'pdf',
      processed: true
    },
    {
      id: '2',
      name: 'History Notes - WWII.docx',
      size: '1.8 MB',
      uploadDate: '2024-01-14',
      type: 'docx',
      processed: true
    }
  ]);

  const [dragActive, setDragActive] = useState(false);
  const maxUploads = user?.subscription_status === 'premium' ? Infinity : 4;
  const uploadsRemaining = user?.subscription_status === 'premium' 
    ? Infinity 
    : Math.max(0, maxUploads - documents.length);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFiles = (files: FileList) => {
    if (user?.subscription_status === 'free' && documents.length >= 4) {
      toast.error('Upload limit reached. Upgrade to Premium for unlimited uploads.');
      return;
    }

    Array.from(files).forEach(file => {
      if (file.type === 'application/pdf' || 
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          file.type === 'text/plain') {
        
        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
          uploadDate: new Date().toISOString().split('T')[0],
          type: file.type.split('/')[1],
          processed: false
        };

        setDocuments(prev => [...prev, newDoc]);
        
        // Simulate processing
        setTimeout(() => {
          setDocuments(prev => prev.map(doc => 
            doc.id === newDoc.id ? { ...doc, processed: true } : doc
          ));
          toast.success(`${file.name} processed successfully`);
        }, 3000);

        toast.success(`${file.name} uploaded successfully`);
      } else {
        toast.error('Unsupported file type. Please upload PDF, DOCX, or TXT files.');
      }
    });
  };

  const deleteDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
    toast.success('Document deleted');
  };

  const generateFlashcards = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      toast.success(`Generating flashcards from ${doc.name}...`);
      // Integration point for AI flashcard generation
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
          <h1 className="text-4xl font-bold text-white mb-2">Documents</h1>
          <p className="text-gray-300 text-lg">
            Upload and manage your study materials
            {user?.subscription_status === 'free' && (
              <span className="ml-2 text-yellow-400">
                ({uploadsRemaining} uploads remaining)
              </span>
            )}
          </p>
        </motion.div>

        {/* Upload Limit Warning */}
        {user?.subscription_status === 'free' && uploadsRemaining <= 1 && (
          <motion.div
            className="mb-6 bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-6 h-6 text-orange-400" />
              <div className="flex-1">
                <p className="text-white font-medium">Upload limit almost reached</p>
                <p className="text-gray-300 text-sm">
                  Upgrade to Premium for unlimited document uploads and advanced features
                </p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                <Crown className="w-4 h-4" />
                <span>Upgrade</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Upload Area */}
        <motion.div
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive 
              ? 'border-purple-400 bg-purple-500/20' 
              : 'border-white/30 bg-white/10 hover:bg-white/15'
          } ${user?.subscription_status === 'free' && documents.length >= 4 ? 'opacity-50' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={user?.subscription_status === 'free' && documents.length >= 4}
          />
          
          <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Drop files here or click to upload
          </h3>
          <p className="text-gray-300 mb-4">
            Supports PDF, DOCX, and TXT files up to 10MB each
          </p>
          <p className="text-sm text-gray-400">
            Files will be automatically processed for flashcard generation
          </p>
        </motion.div>

        {/* Documents List */}
        {documents.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Your Documents</h2>
            
            <div className="grid gap-4">
              {documents.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-blue-500/20 rounded-lg">
                        <FileText className="w-6 h-6 text-blue-400" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{doc.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                          <span>{doc.size}</span>
                          <span>Uploaded {doc.uploadDate}</span>
                          <span className={`inline-flex items-center space-x-1 ${
                            doc.processed ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {doc.processed ? (
                              <>
                                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                <span>Processed</span>
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                <span>Processing...</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.processed && (
                        <button
                          onClick={() => generateFlashcards(doc.id)}
                          className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-all"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Generate Cards</span>
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default DocumentsPage;