
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
      <MobileLayout className="bg-black">
        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="animate-pulse space-y-6 w-full max-w-md">
            <div className="h-8 bg-gray-800 rounded-lg w-3/4 mx-auto"></div>
            <div className="h-48 bg-gray-800 rounded-xl shadow-sm"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-800 rounded w-full"></div>
              <div className="h-4 bg-gray-800 rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      className={cn(
        "flex flex-col min-h-screen bg-black",
        isNativeMobile && "safe-area-inset-top safe-area-inset-bottom"
      )} 
      aria-hidden={false}
    >
      <main 
        className={cn(
          "flex-grow mobile-scroll relative",
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
            "fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl",
            "border-t border-gray-800/50 shadow-lg",
            isNativeMobile && "safe-area-inset-bottom"
          )}
        >
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-5 h-16 px-2">
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1",
                    isActive
                      ? "text-gold-600 font-semibold bg-gold-900/30"
                      : "text-gray-400 hover:text-gold-600 hover:bg-gray-800/50"
                  )
                }
              >
                <Home className="h-5 w-5 mb-1" />
                <span className="font-medium">Home</span>
              </NavLink>
              
              <NavLink
                to="/winners"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1",
                    isActive
                      ? "text-gold-600 font-semibold bg-gold-900/30"
                      : "text-gray-400 hover:text-gold-600 hover:bg-gray-800/50"
                  )
                }
              >
                <Award className="h-5 w-5 mb-1" />
                <span className="font-medium">Winners</span>
              </NavLink>
              
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs relative transition-all duration-300 touch-target no-select rounded-xl mx-1",
                    isActive
                      ? "text-gold-600 font-semibold bg-gold-900/30"
                      : "text-gray-400 hover:text-gold-600 hover:bg-gray-800/50"
                  )
                }
              >
                <div className="relative">
                  <Bell className="h-5 w-5 mb-1" />
                  {!notificationsLoading && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center text-[10px] font-semibold shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <span className="font-medium">Alerts</span>
              </NavLink>
              
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1",
                    isActive
                      ? "text-gold-600 font-semibold bg-gold-900/30"
                      : "text-gray-400 hover:text-gold-600 hover:bg-gray-800/50"
                  )
                }
              >
                <User className="h-5 w-5 mb-1" />
                <span className="font-medium">Profile</span>
              </NavLink>
              
              {user?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1",
                      isActive
                        ? "text-gold-600 font-semibold bg-gold-900/30"
                        : "text-gray-400 hover:text-gold-600 hover:bg-gray-800/50"
                    )
                  }
                >
                  <Settings className="h-5 w-5 mb-1" />
                  <span className="font-medium">Admin</span>
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
