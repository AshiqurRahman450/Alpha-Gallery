import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import { Plus, Edit2, Power, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

const bdmSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const ManageBDMs = () => {
  const [bdms, setBdms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm({
    resolver: zodResolver(bdmSchema),
  });

  const fetchBdms = async () => {
    try {
      const { data } = await api.get('/bdms');
      setBdms(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBdms();
  }, []);

  const onSubmit = async (data) => {
    try {
      setError('');
      await api.post('/bdms', data);
      await fetchBdms();
      setIsModalOpen(false);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create BDM');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/bdms/${id}/status`, { isActive: !currentStatus });
      await fetchBdms();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DashboardLayout role="ADMIN">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-serif text-white mb-2">Manage BDMs</h1>
          <p className="text-gray-400">Create and manage Business Development Managers.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center space-x-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          <Plus size={20} />
          <span>Add New BDM</span>
        </button>
      </div>

      {/* BDM Table */}
      <div className="bg-surface rounded-2xl shadow-2xl border border-white/5 overflow-hidden">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-primary-gold" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-background/50 border-b border-white/5 text-xs uppercase tracking-wider text-gray-500 font-bold">
                  <th className="px-6 py-5">Name</th>
                  <th className="px-6 py-5">Contact</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bdms.map((bdm) => (
                  <tr key={bdm._id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-primary-gold/10 flex items-center justify-center text-primary-gold font-bold border border-primary-gold/20">
                          {bdm.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{bdm.name}</p>
                          <p className="text-[11px] uppercase tracking-wider text-gray-500 mt-0.5">Joined {new Date(bdm.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-300">{bdm.email}</p>
                      <p className="text-xs text-gray-500 mt-1">{bdm.phone || 'No phone'}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        bdm.isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {bdm.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end space-x-3">
                        {/* <button className="p-2 text-secondary hover:text-primary-gold transition-colors" title="Edit">
                          <Edit2 size={18} />
                        </button> */}
                        <button 
                          onClick={() => toggleStatus(bdm._id, bdm.isActive)}
                          className={`p-2 transition-colors ${bdm.isActive ? 'text-red-500 hover:bg-red-50 rounded' : 'text-green-500 hover:bg-green-50 rounded'}`}
                          title={bdm.isActive ? "Deactivate" : "Activate"}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {bdms.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-secondary">
                      No BDMs found. Click "Add New BDM" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create BDM Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-white/10"
            >
              <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-background/50">
                <h2 className="text-2xl font-serif text-white">Create New BDM</h2>
                <button onClick={() => { setIsModalOpen(false); reset(); setError(''); }} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-full">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 text-sm border border-red-500/20">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`input-field ${errors.name ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.name && <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Email Address</label>
                    <input
                      type="email"
                      {...register('email')}
                      className={`input-field ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Phone Number (Optional)</label>
                    <input
                      type="text"
                      {...register('phone')}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold tracking-wider uppercase text-gray-400 mb-2">Temporary Password</label>
                    <input
                      type="password"
                      {...register('password')}
                      className={`input-field ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                    />
                    {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => { setIsModalOpen(false); reset(); setError(''); }}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 btn-primary flex justify-center items-center"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create BDM'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default ManageBDMs;
