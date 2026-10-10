import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { Loader2, MapPin, Building, Play, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectGallery = () => {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('PHOTOS');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [videoModal, setVideoModal] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await api.get(`/public/galleries/${slug}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Gallery not found');
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-navy">
        <Loader2 className="animate-spin text-primary-gold" size={48} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-primary-navy text-white text-center p-4">
        <h1 className="text-4xl font-bold mb-4">Gallery Not Found</h1>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  const { project, media } = data;
  const photos = media.filter(m => m.type === 'IMAGE');
  const videos = media.filter(m => m.type === 'VIDEO');
  const displayedMedia = activeTab === 'PHOTOS' ? photos : videos;

  const handlePrev = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? photos.length - 1 : lightboxIndex - 1);
    }
  };

  const handleNext = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === photos.length - 1 ? 0 : lightboxIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-[60vh] lg:h-[80vh] w-full overflow-hidden bg-primary-navy">
        {project.coverImage ? (
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "linear" }}
            src={project.coverImage} 
            className="w-full h-full object-cover opacity-60" 
            alt={project.clientName} 
          />
        ) : (
          <div className="w-full h-full bg-primary-navy absolute inset-0"></div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-navy via-primary-charcoal/50 to-transparent"></div>

        {/* Hero Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-4xl"
          >
            <div className="flex items-center space-x-4 mb-4">
              <span className="px-4 py-1 bg-primary-gold/90 backdrop-blur text-white text-sm font-bold rounded-full shadow-lg">
                <Building size={14} className="inline mr-1 mb-0.5" />
                {project.buildingLevel}
              </span>
              {project.location && (
                <span className="flex items-center text-gray-300 text-sm font-medium">
                  <MapPin size={16} className="mr-1 text-primary-gold" />
                  {project.location}
                </span>
              )}
            </div>
            <h1 className="text-4xl lg:text-7xl font-bold text-white tracking-tight mb-4 drop-shadow-md leading-tight">
              {project.clientName}
            </h1>
            {project.description && (
              <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
                {project.description}
              </p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="max-w-7xl mx-auto px-4 py-16 lg:px-8">
        
        {/* Tabs */}
        <div className="flex items-center justify-center space-x-8 mb-12 border-b border-border">
          <button
            onClick={() => setActiveTab('PHOTOS')}
            className={`pb-4 px-2 font-medium text-lg transition-colors relative ${activeTab === 'PHOTOS' ? 'text-primary-gold' : 'text-secondary hover:text-primary-charcoal'}`}
          >
            Photos ({photos.length})
            {activeTab === 'PHOTOS' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gold" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('VIDEOS')}
            className={`pb-4 px-2 font-medium text-lg transition-colors relative ${activeTab === 'VIDEOS' ? 'text-primary-gold' : 'text-secondary hover:text-primary-charcoal'}`}
          >
            Videos ({videos.length})
            {activeTab === 'VIDEOS' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-gold" />
            )}
          </button>
        </div>

        {/* Media Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {displayedMedia.map((item, idx) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                key={item._id}
                className={`relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100 ${
                  activeTab === 'PHOTOS' ? 'aspect-[4/5]' : 'aspect-video sm:col-span-2'
                }`}
                onClick={() => activeTab === 'PHOTOS' ? setLightboxIndex(idx) : setVideoModal(item)}
              >
                {item.type === 'VIDEO' ? (
                  <video 
                    src={`${item.originalUrl}#t=0.1`} 
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <img 
                    src={item.thumbnailUrl || item.originalUrl} 
                    alt="Gallery item" 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                )}
                
                {activeTab === 'VIDEOS' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform group-hover:scale-110 transition-transform">
                      <Play size={24} className="ml-1" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {displayedMedia.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-secondary">No {activeTab.toLowerCase()} available for this project yet.</p>
          </div>
        )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center"
          >
            <button 
              onClick={() => setLightboxIndex(null)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/20 rounded-full transition-colors z-50"
            >
              <X size={24} />
            </button>

            <button onClick={handlePrev} className="absolute left-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50">
              <ChevronLeft size={36} />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              src={photos[lightboxIndex].originalUrl}
              className="max-w-full max-h-[90vh] object-contain select-none"
              alt="Lightbox"
            />

            <button onClick={handleNext} className="absolute right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors z-50">
              <ChevronRight size={36} />
            </button>

            <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 font-medium tracking-widest text-sm">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {videoModal !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 lg:p-20"
          >
            <button 
              onClick={() => setVideoModal(null)}
              className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-black/20 rounded-full transition-colors z-50"
            >
              <X size={24} />
            </button>

            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10"
            >
              <video 
                src={videoModal.originalUrl} 
                className="w-full h-full outline-none"
                controls
                autoPlay
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectGallery;
