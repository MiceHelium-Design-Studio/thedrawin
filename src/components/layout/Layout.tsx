
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
      <MobileLayout className="bg-[#0D0D0D] min-h-screen pattern-bg">
        <main className="flex-grow flex items-center justify-center px-6 py-12">
          <div className="luxury-fade-in space-y-6 w-full max-w-md">
            <div className="h-8 bg-slate-800 rounded-lg w-3/4 mx-auto gold-shimmer"></div>
            <div className="h-48 luxury-card rounded-xl gold-shimmer"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded w-full gold-shimmer"></div>
              <div className="h-4 bg-slate-800 rounded w-2/3 gold-shimmer"></div>
            </div>
          </div>
        </main>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout 
      className={cn(
        "flex flex-col min-h-screen bg-[#0D0D0D] relative overflow-hidden",
        isNativeMobile && "safe-area-inset-top safe-area-inset-bottom"
      )} 
      aria-hidden={false}
    >
      {/* Premium background effects */}
      <div className="fixed inset-0 pattern-bg pointer-events-none" />
      <div className="fixed inset-0 hero-glow pointer-events-none opacity-30" />
      
      <main 
        className={cn(
          "flex-grow mobile-scroll relative luxury-fade-in z-10",
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
            "fixed bottom-0 left-0 right-0 z-50",
            "luxury-card border-t border-[#F39C0A]/20 shadow-luxury backdrop-blur-xl",
            isNativeMobile && "safe-area-inset-bottom"
          )}
        >
          <div className="max-w-lg mx-auto">
            <div className="grid grid-cols-5 h-16 px-2">
              <NavLink
                to="/home"
                className={({ isActive }) =>
                  cn(
                    "flex flex-col items-center justify-center text-xs transition-all duration-300 touch-target no-select rounded-xl mx-1 group relative",
                    isActive
                      ? "text-[#F39C0A] font-bold bg-[#F39C0A]/20 shadow-gold"
                      : "text-slate-400 hover:text-[#F39C0A] hover:bg-white/5"
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
                      ? "text-[#F39C0A] font-bold bg-[#F39C0A]/20 shadow-gold"
                      : "text-slate-400 hover:text-[#F39C0A] hover:bg-white/5"
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
                      ? "text-[#F39C0A] font-bold bg-[#F39C0A]/20 shadow-gold"
                      : "text-slate-400 hover:text-[#F39C0A] hover:bg-white/5"
                  )
                }
              >
                <div className="relative">
                  <Bell className="h-5 w-5 mb-1 transition-transform group-hover:scale-110" />
                  {!notificationsLoading && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center text-[10px] font-bold shadow-sm gold-pulse">
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
                      ? "text-[#F39C0A] font-bold bg-[#F39C0A]/20 shadow-gold"
                      : "text-slate-400 hover:text-[#F39C0A] hover:bg-white/5"
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
                        ? "text-[#F39C0A] font-bold bg-[#F39C0A]/20 shadow-gold"
                        : "text-slate-400 hover:text-[#F39C0A] hover:bg-white/5"
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
