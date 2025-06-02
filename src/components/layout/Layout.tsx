
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Award, Bell, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useMobileDetection } from '../../hooks/useMobileDetection';
import { cn } from '../../lib/utils';
import MobileLayout from './MobileLayout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { notifications, loading: notificationsLoading } = useNotifications();
  const { isMobile, isNativeMobile } = useMobileDetection();
  const location = useLocation();
  
  const unreadCount = notifications?.filter(n => !n.read)?.length || 0;
  const isAuthPage = location.pathname === '/login' || location.pathname === '/auth';
  const isAdminPage = location.pathname === '/admin';

  console.log("Layout rendering, user:", user?.id, "isAdmin:", user?.isAdmin, "isAuthPage:", isAuthPage, "isMobile:", isMobile, "isNativeMobile:", isNativeMobile);

  if (authLoading && !isAuthPage) {
    return (
      <MobileLayout className="bg-[#0D0D0D] min-h-screen">
        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="luxury-fade-in space-y-6 w-full max-w-md">
            <div className="h-8 bg-[#1A1A1A] rounded-lg w-3/4 mx-auto gold-shimmer"></div>
            <div className="h-48 luxury-card rounded-xl"></div>
            <div className="space-y-3">
              <div className="h-4 bg-[#1A1A1A] rounded w-full gold-shimmer"></div>
              <div className="h-4 bg-[#1A1A1A] rounded w-2/3 gold-shimmer"></div>
            </div>
          </div>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      className={cn(
        "flex flex-col min-h-screen bg-[#0D0D0D]",
        isNativeMobile && "safe-area-inset-top safe-area-inset-bottom"
      )} 
      aria-hidden={false}
    >
      <main 
        className={cn(
          "flex-grow mobile-scroll relative luxury-fade-in",
          (!isAuthPage && !isAdminPage) && user ? "pb-20" : "pb-0",
          "px-1"
        )} 
        role="main" 
        aria-label="Main content"
      >
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {(!isAuthPage && !isAdminPage) && user && (
        <nav 
          className={cn(
            "fixed bottom-0 left-0 right-0 glass-effect",
            "border-t border-gold-500/20 shadow-luxury",
            isNativeMobile && "safe-area-inset-bottom"
          )}
        >
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-5 h-16 px-2">
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1 group",
                    isActive
                      ? "text-gold-500 font-bold bg-gold-500/20 shadow-md"
                      : "text-gray-400 hover:text-gold-400 hover:bg-white/5"
                  )
                }
              >
                <Home className="h-5 w-5 mb-1 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Home</span>
              </NavLink>
              
              <NavLink
                to="/winners"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1 group",
                    isActive
                      ? "text-gold-500 font-bold bg-gold-500/20 shadow-md"
                      : "text-gray-400 hover:text-gold-400 hover:bg-white/5"
                  )
                }
              >
                <Award className="h-5 w-5 mb-1 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Winners</span>
              </NavLink>
              
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs relative transition-all duration-300 touch-target no-select rounded-xl mx-1 group",
                    isActive
                      ? "text-gold-500 font-bold bg-gold-500/20 shadow-md"
                      : "text-gray-400 hover:text-gold-400 hover:bg-white/5"
                  )
                }
              >
                <div className="relative">
                  <Bell className="h-5 w-5 mb-1 transition-transform group-hover:scale-110" />
                  {!notificationsLoading && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="font-semibold">Alerts</span>
              </NavLink>
              
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1 group",
                    isActive
                      ? "text-gold-500 font-bold bg-gold-500/20 shadow-md"
                      : "text-gray-400 hover:text-gold-400 hover:bg-white/5"
                  )
                }
              >
                <User className="h-5 w-5 mb-1 transition-transform group-hover:scale-110" />
                <span className="font-semibold">Profile</span>
              </NavLink>
              
              {user?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1 group",
                      isActive
                        ? "text-gold-500 font-bold bg-gold-500/20 shadow-md"
                        : "text-gray-400 hover:text-gold-400 hover:bg-white/5"
                    )
                  }
                >
                  <Settings className="h-5 w-5 mb-1 transition-transform group-hover:scale-110" />
                  <span className="font-semibold">Admin</span>
                </NavLink>
              )}
            </div>
          </div>
        </nav>
      )}
    </MobileLayout>
  );
};

export default Layout;
