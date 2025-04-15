
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Layers, Image, Users, Palette, Settings } from 'lucide-react';
import { DrawsAdmin } from '../components/admin/DrawsAdmin';
import { BannersAdmin } from '../components/admin/BannersAdmin';
import { UsersAdmin } from '../components/admin/UsersAdmin';
import { AppearanceAdmin } from '../components/admin/AppearanceAdmin';
import { SettingsAdmin } from '../components/admin/SettingsAdmin';

type AdminTab = 'draws' | 'banners' | 'users' | 'appearance' | 'settings';

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('draws');

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/admin-access');
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) {
    return null; // Don't render anything while checking admin status
  }

  const TabItem: React.FC<{ 
    id: AdminTab; 
    icon: React.ReactNode; 
    label: string 
  }> = ({ id, icon, label }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors ${
        activeTab === id 
          ? 'border-gold text-gold' 
          : 'border-transparent text-white/70 hover:text-white hover:border-white/20'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="container mx-auto py-4 px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
      
      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto bg-black-light/30 rounded-t-lg border-b border-gold/10">
        <TabItem id="draws" icon={<Layers className="w-5 h-5" />} label="Draws" />
        <TabItem id="banners" icon={<Image className="w-5 h-5" />} label="Banners" />
        <TabItem id="users" icon={<Users className="w-5 h-5" />} label="Users" />
        <TabItem id="appearance" icon={<Palette className="w-5 h-5" />} label="Appearance" />
        <TabItem id="settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
      </div>
      
      {/* Content Area */}
      <div className="bg-black-light/20 border border-gold/10 rounded-b-lg p-4 min-h-[60vh]">
        {activeTab === 'draws' && <DrawsAdmin />}
        {activeTab === 'banners' && <BannersAdmin />}
        {activeTab === 'users' && <UsersAdmin />}
        {activeTab === 'appearance' && <AppearanceAdmin />}
        {activeTab === 'settings' && <SettingsAdmin />}
      </div>
    </div>
  );
};

export default Admin;
