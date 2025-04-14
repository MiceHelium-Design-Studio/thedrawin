
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminMenu from '../components/admin/AdminMenu';
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from '@/components/ui/menubar';
import { Menu } from 'lucide-react';

// Placeholder components for admin sections
const AdminDashboard = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">Dashboard</h2><p>Welcome to the admin dashboard. Select an option from the menu to manage your application.</p></div>;
const AdminBanners = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">Banner Management</h2><p>Manage promotional banners here.</p></div>;
const AdminDraws = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">Draw Management</h2><p>Manage draws and competitions here.</p></div>;
const AdminUsers = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">User Management</h2><p>Manage user accounts here.</p></div>;
const AdminContent = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">Content Management</h2><p>Manage site content here.</p></div>;
const AdminSettings = () => <div className="p-6"><h2 className="text-2xl font-bold mb-4">Admin Settings</h2><p>Configure admin settings here.</p></div>;

const Admin: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && !user.isAdmin) {
      navigate('/admin-access');
    }
  }, [user, navigate]);

  // Handle mobile menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  if (!user || !user.isAdmin) {
    return null; // Don't render anything while checking admin status
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 bg-black-dark border-b border-gold/10">
        <Menubar className="border-none bg-transparent p-0">
          <MenubarMenu>
            <MenubarTrigger className="text-white hover:text-gold p-0 cursor-pointer">
              <Menu className="h-6 w-6" />
              <span className="ml-2 font-bold">Admin Menu</span>
            </MenubarTrigger>
            <MenubarContent className="bg-black-light border border-gold/20 text-white">
              <MenubarItem className="focus:bg-gold/10 focus:text-gold" onClick={() => navigate('/admin')}>
                Dashboard
              </MenubarItem>
              <MenubarItem className="focus:bg-gold/10 focus:text-gold" onClick={() => navigate('/admin/banners')}>
                Banners
              </MenubarItem>
              <MenubarItem className="focus:bg-gold/10 focus:text-gold" onClick={() => navigate('/admin/draws')}>
                Draws
              </MenubarItem>
              <MenubarItem className="focus:bg-gold/10 focus:text-gold" onClick={() => navigate('/admin/users')}>
                Users
              </MenubarItem>
              <MenubarItem className="focus:bg-gold/10 focus:text-gold" onClick={() => navigate('/admin/content')}>
                Content
              </MenubarItem>
              <MenubarItem className="focus:bg-gold/10 focus:text-gold" onClick={() => navigate('/admin/settings')}>
                Settings
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block md:w-64 flex-shrink-0">
        <AdminMenu />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/banners" element={<AdminBanners />} />
          <Route path="/draws" element={<AdminDraws />} />
          <Route path="/users" element={<AdminUsers />} />
          <Route path="/content" element={<AdminContent />} />
          <Route path="/settings" element={<AdminSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin;
