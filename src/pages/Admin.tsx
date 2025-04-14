
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/admin-access');
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) {
    return null; // Don't render anything while checking admin status
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-black-light/50 border border-gold/10 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gold mb-2">Banners</h2>
          <p className="text-gray-300 mb-4">Manage promotional banners</p>
          <button className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-md transition-colors">
            Manage Banners
          </button>
        </div>
        
        <div className="bg-black-light/50 border border-gold/10 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gold mb-2">Draws</h2>
          <p className="text-gray-300 mb-4">Manage draws and competitions</p>
          <button className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-md transition-colors">
            Manage Draws
          </button>
        </div>
        
        <div className="bg-black-light/50 border border-gold/10 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gold mb-2">Users</h2>
          <p className="text-gray-300 mb-4">Manage user accounts</p>
          <button className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-md transition-colors">
            Manage Users
          </button>
        </div>
        
        <div className="bg-black-light/50 border border-gold/10 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gold mb-2">Content</h2>
          <p className="text-gray-300 mb-4">Manage site content</p>
          <button className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-md transition-colors">
            Manage Content
          </button>
        </div>
        
        <div className="bg-black-light/50 border border-gold/10 p-6 rounded-lg">
          <h2 className="text-lg font-semibold text-gold mb-2">Settings</h2>
          <p className="text-gray-300 mb-4">Configure admin settings</p>
          <button className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-md transition-colors">
            Manage Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
