import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  Brain, 
  FileText, 
  Upload, 
  Timer, 
  User, 
  LogOut,
  Home,
  Crown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/flashcards', icon: Brain, label: 'Flashcards' },
    { path: '/notes', icon: FileText, label: 'Notes' },
    { path: '/documents', icon: Upload, label: 'Documents' },
    { path: '/study-tools', icon: Timer, label: 'Study Tools' },
    { path: '/account', icon: User, label: 'Account' },
  ];

  return (
    <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <motion.div
              className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <BookOpen className="w-8 h-8 text-purple-400 inline-block mr-2" />
              JUNEWRLD
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <motion.div
                    className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-all ${
                      isActive
                        ? 'bg-purple-500/20 text-purple-300'
                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            {user?.subscription_status === 'premium' && (
              <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full text-sm font-medium text-white">
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </div>
            )}
            
            <span className="text-gray-300 text-sm hidden sm:block">
              {user?.name}
            </span>
            
            <motion.button
              onClick={handleLogout}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-red-500/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;