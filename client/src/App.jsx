import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminDashboard from './pages/AdminDashboard';
import ManageBDMs from './pages/ManageBDMs';
import BDMDashboard from './pages/BDMDashboard';
import Projects from './pages/Projects';
import CreateProject from './pages/CreateProject';
import EditProject from './pages/EditProject';
import ProjectGallery from './pages/ProjectGallery';
import MediaLibrary from './pages/MediaLibrary';

function App() {
  return (
    <Router>
      <div className="min-h-screen font-sans bg-[#000000] text-white">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/bdms" element={<ManageBDMs />} />
            <Route path="/admin/projects" element={<Projects />} />
            <Route path="/admin/projects/new" element={<CreateProject />} />
            <Route path="/admin/projects/edit/:id" element={<EditProject />} />
            <Route path="/admin/media" element={<MediaLibrary />} />
          </Route>
          
          {/* BDM Routes */}
          <Route element={<ProtectedRoute allowedRoles={['BDM']} />}>
            <Route path="/bdm/dashboard" element={<BDMDashboard />} />
            <Route path="/bdm/projects" element={<Projects />} />
          </Route>
          
          {/* Public Gallery Route */}
          <Route path="/gallery/:slug" element={<ProjectGallery />} />

          {/* Fallback Route */}
          <Route path="*" element={<div className="p-8 text-center text-2xl font-bold">404 - Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
