
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Award, Bell, User, Settings } from 'lucide-react';
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-darkBlue-dark to-darkBlue">
      <main className="flex-grow pb-16 pattern-bg">{children}</main>

      {user && (
        <nav className="fixed bottom-0 left-0 right-0 bg-darkBlue-dark/90 backdrop-blur-md border-t border-gold/20">
          <div className="grid grid-cols-5 h-16">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs transition-all duration-300",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gold-light/70 hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive && "bg-darkBlue-light/50 glow-effect")}>
                <Home className="h-5 w-5 mb-1" />
              </div>
              <span>Home</span>
            </NavLink>
            
            <NavLink
              to="/winners"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs transition-all duration-300",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gold-light/70 hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive && "bg-darkBlue-light/50 glow-effect")}>
                <Award className="h-5 w-5 mb-1" />
              </div>
              <span>Winners</span>
            </NavLink>
            
            <NavLink
              to="/notifications"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs relative transition-all duration-300",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gold-light/70 hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive && "bg-darkBlue-light/50 glow-effect")}>
                <Bell className="h-5 w-5 mb-1" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center text-[10px] border border-darkBlue">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>Alerts</span>
            </NavLink>
            
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs transition-all duration-300",
                  isActive
                    ? "text-gold font-medium"
                    : "text-gold-light/70 hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive && "bg-darkBlue-light/50 glow-effect")}>
                <User className="h-5 w-5 mb-1" />
              </div>
              <span>Profile</span>
            </NavLink>
            
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300",
                    isActive
                      ? "text-gold font-medium"
                      : "text-gold-light/70 hover:text-gold"
                  )
                }
              >
                <div className={cn("p-1.5 rounded-full transition-all duration-300", isActive && "bg-darkBlue-light/50 glow-effect")}>
                  <Settings className="h-5 w-5 mb-1" />
                </div>
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
