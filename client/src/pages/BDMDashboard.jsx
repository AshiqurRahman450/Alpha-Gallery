import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Users, FolderKanban, Image as ImageIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const BDMDashboard = () => {
  const [statsData, setStatsData] = useState({ totalClients: 0, totalProjects: 0, totalMedia: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStatsData(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { title: 'My Clients', value: statsData.totalClients, icon: <Users size={24} className="text-primary-gold" /> },
    { title: 'My Projects', value: statsData.totalProjects, icon: <FolderKanban size={24} className="text-primary-gold" /> },
    { title: 'Total Media', value: statsData.totalMedia, icon: <ImageIcon size={24} className="text-primary-gold" /> },
  ];

  return (
    <DashboardLayout role="BDM">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">My Dashboard</h1>
          <p className="text-gray-400">Manage your clients and projects.</p>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary-gold" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
              className="bg-surface p-6 rounded-2xl border border-white/5 shadow-2xl flex items-center space-x-5 hover:border-primary-gold/30 transition-colors group"
            >
              <div className="p-3.5 bg-primary-gold/10 rounded-xl group-hover:bg-primary-gold/20 transition-colors">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-400 font-medium tracking-wide uppercase text-[11px] mb-1">{stat.title}</p>
                <p className="text-3xl font-serif text-white">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* My Projects Placeholder */}
      <div className="bg-surface rounded-2xl shadow-2xl border border-white/5 p-8">
        <h2 className="text-2xl font-serif text-white mb-6">My Recent Projects</h2>
        <div className="text-center py-16 bg-background/50 rounded-xl border border-dashed border-border">
          <p className="text-gray-500 font-medium">No recent projects found.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BDMDashboard;
