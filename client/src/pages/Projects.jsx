import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import { Plus, FolderKanban, MapPin, Loader2, Eye, Edit2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        fetchProjects();
      } catch (err) {
        console.error(err);
        alert('Failed to delete project');
      }
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Client Projects</h1>
          <p className="text-gray-400">Manage and view your premium client projects.</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button 
            onClick={() => navigate('/admin/projects/new')}
            className="btn-primary flex items-center space-x-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
          >
            <Plus size={20} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin text-primary-gold" size={32} />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-surface rounded-2xl shadow-2xl border border-white/5 p-16 text-center">
          <FolderKanban className="mx-auto text-gray-600 mb-6" size={48} />
          <h3 className="text-2xl font-serif text-white mb-2">No Projects Found</h3>
          <p className="text-gray-400">Get started by creating a new client project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-surface rounded-2xl shadow-2xl border border-white/5 overflow-hidden flex flex-col group hover:border-primary-gold/30 transition-all duration-500"
            >
              {/* Cover Image Placeholder */}
              <div className="h-56 bg-black relative overflow-hidden">
                {project.coverImage ? (
                  <img src={project.coverImage} alt={project.clientName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 bg-black/50">
                    <FolderKanban size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
                
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
                  {project.buildingLevel}
                </div>
                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border border-white/10 ${
                  project.visibility === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 
                  project.visibility === 'DRAFT' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {project.visibility}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col relative z-10">
                <h3 className="text-2xl font-serif text-white mb-2">{project.clientName}</h3>
                
                {project.location && (
                  <div className="flex items-center text-gray-400 text-sm mb-4">
                    <MapPin size={14} className="mr-2 text-primary-gold" />
                    {project.location}
                  </div>
                )}
                
                {user?.role === 'ADMIN' && (
                  <div className="mt-2 text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                    <span className="font-medium text-gray-500 uppercase text-[10px] tracking-wider">Assigned BDM</span> 
                    <span className="text-white">{project.assignedBdm?.name || 'Unassigned'}</span>
                  </div>
                )}

                <div className="mt-auto pt-6 flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500 font-medium tracking-wide">
                    {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/gallery/${project.slug}`)}
                      className="p-2.5 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-primary-gold/20 rounded-lg border border-white/5 hover:border-primary-gold/30"
                      title="View Gallery"
                    >
                      <Eye size={16} />
                    </button>
                    {user?.role === 'ADMIN' && (
                      <>
                        <button 
                          onClick={() => navigate(`/admin/projects/edit/${project._id}`)}
                          className="p-2.5 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-primary-gold/20 rounded-lg border border-white/5 hover:border-primary-gold/30"
                          title="Edit / Upload Media"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(project._id)}
                          className="p-2.5 text-gray-400 hover:text-red-400 transition-colors bg-white/5 hover:bg-red-500/20 rounded-lg border border-white/5 hover:border-red-500/30"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Projects;
