
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Award, Bell, User, Settings, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { cn } from '../../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const location = useLocation();
  
  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;
  const isAuthPage = location.pathname === '/auth';

  console.log("Layout rendering, user:", user?.id, "isAdmin:", user?.isAdmin, "isAuthPage:", isAuthPage);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-black-dark to-black">
      <main className="flex-grow pb-16 pattern-bg">{children}</main>

      {/* Only show navbar if not on auth page or if user is authenticated */}
      {(!isAuthPage || (user && !authLoading)) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-gold/20">
          <div className="grid grid-cols-5 h-16">
            <NavLink
              to="/"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs transition-all duration-300",
                  isActive
                    ? "text-gold font-medium"
                    : "text-white hover:text-gold"
                )
              }
              onClick={(e) => {
                if (authLoading) {
                  e.preventDefault();
                  console.log("Navigation prevented during loading");
                }
              }}
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", location.pathname === '/' && "bg-black-light/50")}>
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
                    : "text-white hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", location.pathname === '/winners' && "bg-black-light/50")}>
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
                    : "text-white hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", location.pathname === '/notifications' && "bg-black-light/50")}>
                <Bell className="h-5 w-5 mb-1" />
                {!notificationsLoading && unreadCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center text-[10px] border border-black">
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
                    : "text-white hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", location.pathname === '/profile' && "bg-black-light/50")}>
                <User className="h-5 w-5 mb-1" />
              </div>
              <span>Profile</span>
            </NavLink>
            
            {/* Always show Admin Access link for users who need to gain admin privileges */}
            <NavLink
              to="/admin-access"
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center text-xs transition-all duration-300",
                  isActive
                    ? "text-gold font-medium"
                    : "text-white hover:text-gold"
                )
              }
            >
              <div className={cn("p-1.5 rounded-full transition-all duration-300", location.pathname === '/admin-access' && "bg-black-light/50")}>
                <Shield className="h-5 w-5 mb-1" />
              </div>
              <span>Access</span>
            </NavLink>
          </div>
        </nav>
      )}
    </div>
  );
};

export default Layout;
