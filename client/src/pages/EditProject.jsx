import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowLeft, UploadCloud, Image as ImageIcon, Video, Trash2, GripVertical } from 'lucide-react';

const EditProject = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchProjectDetails = async () => {
    try {
      const [projectRes, mediaRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/media`)
      ]);
      setProject(projectRes.data);
      setMedia(mediaRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      setUploading(true);
      await api.post(`/projects/${id}/media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      await fetchProjectDetails();
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload media. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = null; // Reset input
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media item?')) {
      try {
        await api.delete(`/media/${mediaId}`);
        setMedia(media.filter(m => m._id !== mediaId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSetCover = async (imageUrl) => {
    try {
      await api.patch(`/projects/${id}`, { coverImage: imageUrl });
      setProject({ ...project, coverImage: imageUrl });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin text-primary-gold" size={48} />
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout role={user?.role}>
        <div className="text-center p-12">Project not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={user?.role}>
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Projects
        </button>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-serif text-white mb-2">{project.clientName}</h1>
            <p className="text-gray-400 tracking-wide">{project.buildingLevel} <span className="text-primary-gold mx-2">•</span> {project.location}</p>
          </div>
          <div className="flex space-x-3">
             <button 
                onClick={() => navigate(`/gallery/${project.slug}`)}
                className="btn-secondary flex items-center"
              >
                Preview Gallery
              </button>
          </div>
        </div>
      </div>

      {/* Media Uploader Section */}
      <div className="bg-surface rounded-2xl shadow-2xl border border-white/5 p-8 mb-8">
        <h2 className="text-2xl font-serif text-white mb-6">Project Media</h2>
        
        <div className="border border-dashed border-white/20 rounded-2xl p-12 text-center bg-background/50 relative transition-all duration-300 hover:bg-white/5 hover:border-primary-gold/50 group">
          <input 
            type="file" 
            multiple 
            accept="image/*,video/mp4,video/webm"
            onChange={handleFileUpload}
            disabled={uploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center pointer-events-none relative z-0">
            {uploading ? (
              <>
                <Loader2 className="animate-spin text-primary-gold mb-4" size={48} />
                <p className="text-white font-medium text-lg tracking-wide">Uploading... {uploadProgress}%</p>
                <div className="w-64 h-1.5 bg-background rounded-full mt-4 overflow-hidden border border-white/10">
                  <div className="h-full bg-primary-gold transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/5 group-hover:scale-110 transition-transform duration-500">
                  <UploadCloud className="text-gray-500 group-hover:text-primary-gold transition-colors" size={32} />
                </div>
                <p className="text-white font-serif text-2xl mb-2">Click or drag files to upload</p>
                <p className="text-gray-400 text-sm tracking-wide uppercase">Supports JPG, PNG, WebP, MP4, WebM</p>
              </>
            )}
          </div>
        </div>

        {/* Media Grid */}
        <div className="mt-12">
          <h3 className="text-xl font-serif text-white mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
            <span>Uploaded Media</span>
            <span className="text-sm font-sans text-gray-500 bg-background px-3 py-1 rounded-full border border-white/5">{media.length} items</span>
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {media.map((item) => (
              <div key={item._id} className="group relative rounded-xl overflow-hidden border border-white/5 bg-background shadow-lg aspect-square hover:border-primary-gold/30 transition-all duration-500">
                {item.type === 'IMAGE' ? (
                  <img src={item.thumbnailUrl || item.originalUrl} alt="gallery item" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full relative">
                    <video src={`${item.originalUrl}#t=0.1`} preload="metadata" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute top-3 left-3 bg-black/60 p-2 rounded-full text-white backdrop-blur-md border border-white/10">
                      <Video size={16} />
                    </div>
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center space-y-3 backdrop-blur-sm">
                  {item.type === 'IMAGE' && project.coverImage !== item.originalUrl && (
                    <button 
                      onClick={() => handleSetCover(item.originalUrl)}
                      className="px-4 py-2 bg-white/10 hover:bg-primary-gold text-white text-[10px] font-bold tracking-wider uppercase rounded-full transition-colors border border-white/20 hover:border-primary-gold shadow-lg"
                    >
                      Set Cover
                    </button>
                  )}
                  {project.coverImage === item.originalUrl && (
                    <span className="px-4 py-2 bg-primary-gold/20 text-primary-gold border border-primary-gold/30 text-[10px] font-bold tracking-wider uppercase rounded-full shadow-lg">Cover Image</span>
                  )}
                  <button 
                    onClick={() => handleDeleteMedia(item._id)}
                    className="p-3 bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors shadow-lg"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {media.length === 0 && (
            <div className="text-center py-16 bg-background/50 rounded-xl border border-dashed border-white/10">
              <p className="text-gray-400 font-medium tracking-wide">No media uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditProject;
