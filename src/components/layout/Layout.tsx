
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Award, Bell, User, Settings, Image } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const location = useLocation();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pb-16">{children}</main>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-800">
          <div className="grid grid-cols-6 h-16">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gray-500 hover:text-gold"
                )
              }
            >
              <Home className="h-6 w-6 mb-1" />
              <span>Home</span>
            </NavLink>
            
            <NavLink
              to="/winners"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gray-500 hover:text-gold"
                )
              }
            >
              <Award className="h-6 w-6 mb-1" />
              <span>Winners</span>
            </NavLink>
            
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs relative",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gray-500 hover:text-gold"
                )
              }
            >
              <Bell className="h-6 w-6 mb-1" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-1/4 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
              <span>Alerts</span>
            </NavLink>
            
            <NavLink
              to="/media"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gray-500 hover:text-gold"
                )
              }
            >
              <Image className="h-6 w-6 mb-1" />
              <span>Media</span>
            </NavLink>
            
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gray-500 hover:text-gold"
                )
              }
            >
              <User className="h-6 w-6 mb-1" />
              <span>Profile</span>
            </NavLink>
            
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs",
                    isActive
                      ? "text-gold font-medium"
                      : "text-gray-500 hover:text-gold"
                  )
                }
              >
                <Settings className="h-6 w-6 mb-1" />
                <span>Admin</span>
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
