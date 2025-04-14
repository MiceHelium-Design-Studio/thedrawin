
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Ticket, Users, Settings, BarChart, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminMenuProps {
  className?: string;
}

const AdminMenu: React.FC<AdminMenuProps> = ({ className }) => {
  const [activeItem, setActiveItem] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart, path: '/admin' },
    { id: 'banners', label: 'Banners', icon: Image, path: '/admin/banners' },
    { id: 'draws', label: 'Draws', icon: Ticket, path: '/admin/draws' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'content', label: 'Content', icon: FileText, path: '/admin/content' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  return (
    <div className={cn("bg-black-light/50 border-r border-gold/10 h-full p-4", className)}>
      <h2 className="text-gold font-bold text-xl mb-6 px-4">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.id}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  cn(
                    "flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all",
                    isActive 
                      ? "bg-gold/10 text-gold" 
                      : "text-white hover:bg-black-light hover:text-gold"
                  )
                }
                onClick={() => setActiveItem(item.id)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AdminMenu;
