import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, FolderKanban, Image as ImageIcon, Settings, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

const DashboardLayout = ({ children, role }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'BDM Management', path: '/admin/bdms', icon: <Users size={20} /> },
    { name: 'Client Projects', path: '/admin/projects', icon: <FolderKanban size={20} /> },
    { name: 'Media Library', path: '/admin/media', icon: <ImageIcon size={20} /> },
  ];

  const bdmLinks = [
    { name: 'Dashboard', path: '/bdm/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Projects', path: '/bdm/projects', icon: <FolderKanban size={20} /> },
  ];

  const links = role === 'ADMIN' ? adminLinks : bdmLinks;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden absolute top-4 left-4 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-surface rounded-md shadow-md text-white border border-border">
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed lg:static inset-y-0 left-0 z-40 w-64 bg-surface text-white border-r border-border shadow-2xl flex flex-col"
          >
            <div className="p-6 flex items-center justify-center border-b border-border h-20">
              <img src={logo} alt="Alpha Gallery Logo" className="h-8 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.3)]" />
            </div>

            <div className="flex-1 overflow-y-auto py-8 px-4 space-y-2">
              {links.map((link) => {
                const isActive = location.pathname.startsWith(link.path);
                return (
                  <NavLink
                    key={link.name}
                    to={link.path}
                    className={`flex items-center space-x-4 px-4 py-3.5 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-primary-gold/10 text-primary-gold shadow-sm border border-primary-gold/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    <span className="font-medium tracking-wide">{link.name}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-white/5 rounded-xl border border-white/5">
                <div className="w-9 h-9 rounded-full bg-primary-gold/20 flex items-center justify-center text-primary-gold font-bold border border-primary-gold/30">
                  {user?.name?.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate text-white">{user?.name}</p>
                  <p className="text-xs text-primary-gold/80 truncate">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header - Mobile spacing */}
        <div className="lg:hidden h-16 bg-surface shadow-md border-b border-border flex items-center justify-center">
            <img src={logo} alt="Alpha Gallery Logo" className="h-6 object-contain" />
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background p-4 lg:p-8 xl:p-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
