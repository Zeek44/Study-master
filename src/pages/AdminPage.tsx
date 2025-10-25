import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Crown, 
  Upload, 
  Volume2,
  Settings,
  TrendingUp,
  FileText,
  Trash2,
  Edit,
  Plus
} from 'lucide-react';
import Navigation from '../components/Navigation';
import toast from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  subscription_status: 'free' | 'premium';
  created_at: string;
  documents_count: number;
}

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [currentSound, setCurrentSound] = useState<string | null>(null);
  const [soundFile, setSoundFile] = useState<File | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalDocuments: 0,
    activeToday: 0
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchCurrentSound();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      // Mock data for demo
      setUsers([
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          subscription_status: 'premium',
          created_at: '2024-01-15',
          documents_count: 12
        },
        {
          id: '2',
          name: 'Bob Smith',
          email: 'bob@example.com',
          subscription_status: 'free',
          created_at: '2024-02-20',
          documents_count: 3
        },
        {
          id: '3',
          name: 'Carol Wilson',
          email: 'carol@example.com',
          subscription_status: 'free',
          created_at: '2024-03-10',
          documents_count: 1
        }
      ]);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      const data = await response.json();
      setStats(data);
    } catch (error) {
      setStats({
        totalUsers: 1247,
        premiumUsers: 89,
        totalDocuments: 3456,
        activeToday: 142
      });
    }
  };

  const fetchCurrentSound = async () => {
    try {
      const response = await fetch('/api/admin/ambient-sound');
      const data = await response.json();
      setCurrentSound(data.sound_url);
    } catch (error) {
      console.log('No current sound');
    }
  };

  const handleSoundUpload = async () => {
    if (!soundFile) return;

    const formData = new FormData();
    formData.append('sound', soundFile);

    try {
      const response = await fetch('/api/admin/upload-sound', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: formData
      });

      if (response.ok) {
        toast.success('Ambient sound updated successfully');
        fetchCurrentSound();
        setSoundFile(null);
      }
    } catch (error) {
      toast.error('Failed to upload sound');
    }
  };

  const toggleUserSubscription = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'free' ? 'premium' : 'free';
    
    try {
      await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ subscription_status: newStatus })
      });

      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, subscription_status: newStatus as 'free' | 'premium' }
          : user
      ));

      toast.success(`User ${newStatus === 'premium' ? 'upgraded to' : 'downgraded to'} ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update user subscription');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'sound', label: 'Sound Settings', icon: Volume2 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900">
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="w-8 h-8 text-red-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                JUNEWRLD Admin
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300 text-lg">Manage users, settings, and system configuration</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {[
            { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
            { title: 'Premium Users', value: stats.premiumUsers, icon: Crown, color: 'text-yellow-400' },
            { title: 'Documents', value: stats.totalDocuments, icon: FileText, color: 'text-green-400' },
            { title: 'Active Today', value: stats.activeToday, icon: TrendingUp, color: 'text-purple-400' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
                whileHover={{ scale: 1.02 }}
              >
                <Icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-300 text-sm">{stat.title}</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-lg rounded-lg p-1 inline-flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-red-500/20 text-red-300'
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

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'users' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-white/20">
                <h2 className="text-2xl font-bold text-white">User Management</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">User</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Subscription</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Documents</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-white/10 hover:bg-white/5">
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-white font-medium">{user.name}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.subscription_status === 'premium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-gray-500/20 text-gray-300'
                          }`}>
                            {user.subscription_status === 'premium' && <Crown className="w-4 h-4 mr-1" />}
                            {user.subscription_status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white">{user.documents_count}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleUserSubscription(user.id, user.subscription_status)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.subscription_status === 'premium'
                                  ? 'text-gray-400 hover:text-white hover:bg-gray-500/20'
                                  : 'text-yellow-400 hover:text-white hover:bg-yellow-500/20'
                              }`}
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="p-2 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'sound' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">Ambient Sound Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Current Ambient Sound
                  </label>
                  {currentSound ? (
                    <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Volume2 className="w-5 h-5 text-purple-400" />
                        <span className="text-white">Sound file active</span>
                      </div>
                      <audio controls className="h-8">
                        <source src={currentSound} type="audio/mpeg" />
                      </audio>
                    </div>
                  ) : (
                    <div className="bg-white/5 rounded-lg p-4 text-gray-400">
                      No ambient sound configured
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Upload New Ambient Sound
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setSoundFile(e.target.files?.[0] || null)}
                      className="flex-1 text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:bg-purple-600 file:hover:bg-purple-700 file:cursor-pointer"
                    />
                    <button
                      onClick={handleSoundUpload}
                      disabled={!soundFile}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Upload
                    </button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Supported formats: MP3, WAV, OGG. Max file size: 10MB
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">System Analytics</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">This Month</span>
                      <span className="text-green-400 font-medium">+23 users</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Premium Conversion</span>
                      <span className="text-yellow-400 font-medium">7.1%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Churn Rate</span>
                      <span className="text-red-400 font-medium">2.3%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Usage Statistics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Daily Active Users</span>
                      <span className="text-blue-400 font-medium">{stats.activeToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Avg. Session Time</span>
                      <span className="text-purple-400 font-medium">18 min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Documents per User</span>
                      <span className="text-green-400 font-medium">2.8</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminPage;