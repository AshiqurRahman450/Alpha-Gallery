import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, UploadCloud, Video, Trash2, Loader2, User } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';

const MediaLibrary = () => {
  const { user } = useAuth();
  const [media, setMedia] = useState([]);
  const [bdms, setBdms] = useState([]);
  const [selectedBdmId, setSelectedBdmId] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchBdms();
    }
  }, [user]);

  useEffect(() => {
    fetchMedia();
  }, [selectedBdmId]);

  const fetchBdms = async () => {
    try {
      const { data } = await api.get('/bdms');
      setBdms(data);
    } catch (error) {
      console.error('Error fetching BDMs:', error);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const url = selectedBdmId ? `/media?bdmId=${selectedBdmId}` : '/media';
      const { data } = await api.get(url);
      setMedia(data);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (user?.role === 'ADMIN' && !selectedBdmId) {
      alert('Please select a BDM to assign this media to before uploading.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    if (selectedBdmId) {
      formData.append('bdmId', selectedBdmId);
    }

    try {
      setUploading(true);
      await api.post('/media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchMedia();
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload media.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      await api.delete(`/media/${id}`);
      setMedia(media.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media.');
    }
  };

  return (
    <DashboardLayout role={user?.role}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-surface p-6 rounded-2xl shadow-2xl border border-white/5 gap-4">
        <div>
          <h1 className="text-3xl font-serif text-white mb-2">Media Library</h1>
          <p className="text-gray-400 mt-1">Manage and assign luxury media assets</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {user?.role === 'ADMIN' && (
            <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg w-full sm:w-auto">
              <User size={18} className="text-primary-gold" />
              <select 
                value={selectedBdmId} 
                onChange={(e) => setSelectedBdmId(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium text-white w-full min-w-[150px] appearance-none cursor-pointer"
              >
                <option value="" className="bg-surface text-white">All Media (Unassigned)</option>
                {bdms.map(bdm => (
                  <option key={bdm._id} value={bdm._id} className="bg-surface text-white">{bdm.name}</option>
                ))}
              </select>
            </div>
          )}

          <input 
            type="file" 
            multiple 
            accept="image/*,video/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => {
              if (user?.role === 'ADMIN' && !selectedBdmId) {
                alert('Please select a BDM first before uploading.');
                return;
              }
              fileInputRef.current?.click();
            }}
            disabled={uploading}
            className="w-full sm:w-auto btn-primary flex items-center justify-center space-x-2"
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
            <span>{uploading ? 'Uploading...' : 'Upload Media'}</span>
          </button>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-2xl shadow-2xl border border-white/5 min-h-[400px]">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-primary-gold" size={40} />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/5">
              <ImageIcon className="text-gray-600" size={32} />
            </div>
            <h3 className="text-2xl font-serif text-white">No media found</h3>
            <p className="text-gray-400 mt-2">
              {user?.role === 'ADMIN' && !selectedBdmId 
                ? "Select a BDM from the dropdown to assign and view their media." 
                : "Upload some images or videos to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {media.map((item) => (
              <div key={item._id} className="group relative rounded-xl overflow-hidden border border-white/10 aspect-square bg-background shadow-lg hover:border-primary-gold/30 transition-all duration-500">
                {item.type === 'VIDEO' ? (
                  <div className="w-full h-full relative">
                    <video 
                      src={`${item.originalUrl}#t=0.1`} 
                      preload="metadata"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                      muted
                      onMouseOver={e => e.target.play().catch(()=>{})}
                      onMouseOut={e => {e.target.pause(); e.target.currentTime = 0;}}
                    />
                    <div className="absolute top-3 left-3 bg-black/60 p-2 rounded-full text-white backdrop-blur-md shadow-lg border border-white/10">
                      <Video size={16} />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={item.originalUrl} 
                    alt={item.caption || 'Media asset'} 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                )}
                
                {user?.role === 'ADMIN' && item.assignedBdm && (
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full truncate max-w-[80%] border border-white/10 shadow-lg">
                    {item.assignedBdm.name}
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transform scale-0 group-hover:scale-100 transition-transform shadow-lg"
                    title="Delete Media"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
};

export default MediaLibrary;
