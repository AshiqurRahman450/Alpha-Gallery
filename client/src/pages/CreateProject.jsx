import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const projectSchema = z.object({
  clientName: z.string().min(2, 'Client name must be at least 2 characters'),
  buildingLevel: z.enum(['G+1', 'G+2', 'G+3', 'G+4', 'G+5'], { required_error: 'Building level is required' }),
  location: z.string().min(2, 'Location is required'),
  description: z.string().optional(),
  assignedBdm: z.string().optional(),
  visibility: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
});

const CreateProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bdms, setBdms] = useState([]);
  const [loading, setLoading] = useState(user?.role === 'ADMIN'); // Only load BDMs if admin
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      visibility: 'DRAFT',
      assignedBdm: user?.role === 'BDM' ? user._id : ''
    }
  });

  useEffect(() => {
    const fetchBdms = async () => {
      if (user?.role === 'ADMIN') {
        try {
          const { data } = await api.get('/bdms');
          setBdms(data.filter(bdm => bdm.isActive)); // Only active BDMs
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBdms();
  }, [user]);

  const onSubmit = async (data) => {
    try {
      setError('');
      
      // Admin must select a BDM
      if (user?.role === 'ADMIN' && !data.assignedBdm) {
        setError('You must assign a BDM to this project');
        return;
      }

      await api.post('/projects', data);
      
      // Redirect to the projects list
      navigate(user?.role === 'ADMIN' ? '/admin/projects' : '/bdm/projects');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </button>
        <h1 className="text-4xl font-serif text-white mb-2">Create Client Project</h1>
        <p className="text-gray-400">Set up a new premium gallery for your client.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl shadow-2xl border border-white/5 p-8 max-w-3xl"
      >
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary-gold" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Client Name */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Client / Project Name *</label>
                <input
                  type="text"
                  {...register('clientName')}
                  className={`input-field ${errors.clientName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="e.g. The Royal Residence"
                />
                {errors.clientName && <p className="mt-1.5 text-xs text-red-400">{errors.clientName.message}</p>}
              </div>

              {/* Building Level */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Building Level *</label>
                <select
                  {...register('buildingLevel')}
                  className={`input-field appearance-none cursor-pointer ${errors.buildingLevel ? 'border-red-500' : ''}`}
                >
                  <option value="" className="bg-surface">Select Level...</option>
                  <option value="G+1" className="bg-surface">G+1</option>
                  <option value="G+2" className="bg-surface">G+2</option>
                  <option value="G+3" className="bg-surface">G+3</option>
                  <option value="G+4" className="bg-surface">G+4</option>
                  <option value="G+5" className="bg-surface">G+5</option>
                </select>
                {errors.buildingLevel && <p className="mt-1.5 text-xs text-red-400">{errors.buildingLevel.message}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Project Location *</label>
                <input
                  type="text"
                  {...register('location')}
                  className={`input-field ${errors.location ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                  placeholder="e.g. Dubai Marina, UAE"
                />
                {errors.location && <p className="mt-1.5 text-xs text-red-400">{errors.location.message}</p>}
              </div>

              {/* Assign BDM (Admin Only) */}
              {user?.role === 'ADMIN' && (
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Assign BDM *</label>
                  <select
                    {...register('assignedBdm')}
                    className={`input-field appearance-none cursor-pointer ${errors.assignedBdm ? 'border-red-500' : ''}`}
                  >
                    <option value="" className="bg-surface">Select a BDM...</option>
                    {bdms.map(bdm => (
                      <option key={bdm._id} value={bdm._id} className="bg-surface">{bdm.name} ({bdm.email})</option>
                    ))}
                  </select>
                  {errors.assignedBdm && <p className="mt-1.5 text-xs text-red-400">{errors.assignedBdm.message}</p>}
                </div>
              )}

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Project Description (Optional)</label>
                <textarea
                  {...register('description')}
                  rows="4"
                  className="input-field resize-none"
                  placeholder="Enter details about the architecture, elevator installation, or interior..."
                ></textarea>
              </div>

              {/* Visibility */}
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-3">Initial Visibility</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" value="DRAFT" {...register('visibility')} className="text-primary-gold focus:ring-primary-gold bg-background border-white/20 w-4 h-4" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">Draft (Private)</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input type="radio" value="PUBLISHED" {...register('visibility')} className="text-primary-gold focus:ring-primary-gold bg-background border-white/20 w-4 h-4" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">Published (Public via link)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={() => navigate(-1)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary min-w-[150px] flex justify-center items-center"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Project'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default CreateProject;
