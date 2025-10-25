import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-b-transparent rounded-full opacity-50"></div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;