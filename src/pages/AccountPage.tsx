import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Crown, 
  CreditCard, 
  Settings, 
  Trash2,
  Edit,
  Save,
  Zap
} from 'lucide-react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const AccountPage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSave = () => {
    // Save user data logic
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  const upgradeToPremium = () => {
    // Payment integration logic
    toast.success('Redirecting to payment...');
  };

  const cancelSubscription = () => {
    if (confirm('Are you sure you want to cancel your Premium subscription?')) {
      toast.success('Subscription cancelled');
    }
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion initiated');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-gray-300 text-lg">Manage your profile and subscription</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            className="md:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-white/20">
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Account Status
                </label>
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                  user?.subscription_status === 'premium'
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white'
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {user?.subscription_status === 'premium' ? (
                    <Crown className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="font-medium capitalize">
                    {user?.subscription_status} Account
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Subscription & Actions */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Subscription Card */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
                Subscription
              </h3>

              {user?.subscription_status === 'free' ? (
                <div className="text-center">
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm mb-2">Current Plan</p>
                    <p className="text-white font-semibold">Free Account</p>
                    <p className="text-gray-400 text-xs mt-1">4 document uploads maximum</p>
                  </div>
                  
                  <button
                    onClick={upgradeToPremium}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all hover:shadow-lg"
                  >
                    <Crown className="w-5 h-5" />
                    <span>Upgrade to Premium</span>
                  </button>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-white font-medium text-sm">Premium Benefits:</p>
                    <ul className="text-gray-300 text-xs space-y-1">
                      <li>• Unlimited document uploads</li>
                      <li>• Advanced spaced repetition</li>
                      <li>• AI study recommendations</li>
                      <li>• Export study reports</li>
                      <li>• Priority support</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Crown className="w-6 h-6 text-yellow-400" />
                      <p className="text-white font-semibold">Premium Active</p>
                    </div>
                    <p className="text-gray-300 text-sm">$9.99/month</p>
                    <p className="text-green-400 text-xs mt-1">Next billing: Feb 15, 2025</p>
                  </div>
                  
                  <button
                    onClick={cancelSubscription}
                    className="w-full px-4 py-2 border border-red-500/50 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all"
                  >
                    Cancel Subscription
                  </button>
                </div>
              )}
            </div>

            {/* Account Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-gray-400" />
                Account Actions
              </h3>
              
              <div className="space-y-3">
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all">
                  Change Password
                </button>
                
                <button className="w-full text-left px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 hover:text-white transition-all">
                  Download Data
                </button>
                
                <button
                  onClick={deleteAccount}
                  className="w-full flex items-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;