import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DrawProvider } from "./context/DrawContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BackgroundProvider } from "./context/BackgroundContext";
import { useCapacitorPlugins } from "./hooks/useCapacitorPlugins";
import { useToast } from "@/hooks/use-toast";
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import DrawDetail from "./pages/DrawDetail";
import Winners from "./pages/Winners";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MediaLibrary from "./pages/MediaLibrary";
import NotFound from "./pages/NotFound";
import TodoList from "./pages/TodoList";
import TodoPage from "./pages/TodoPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      gcTime: 300000,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    console.log("ProtectedRoute at path:", location.pathname, "user:", user?.id, "loading:", loading);
  }, [location.pathname, user, loading]);
  
  if (loading) {
    console.log("ProtectedRoute: Auth state is loading");
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
          <div className="h-32 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  console.log("ProtectedRoute: User authenticated, rendering content", user?.id);
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  useEffect(() => {
    console.log("AdminRoute at path:", location.pathname, "user:", user?.id, "isAdmin:", user?.isAdmin, "loading:", loading);
  }, [location.pathname, user, loading]);
  
  useEffect(() => {
    // Only show toast if user is not admin and this isn't from an automatic redirect
    if (!loading && user && !user.isAdmin && !location.state?.from) {
      console.log("AdminRoute: Non-admin user attempted to access admin area");
      toast({
        variant: 'destructive',
        title: '🚫 Access Denied',
        description: 'You do not have permission to access the admin panel. Only administrators can view this area.',
        duration: 5000,
      });
    }
  }, [user, loading, toast, location.state]);
  
  if (loading) {
    console.log("AdminRoute: Auth state is loading");
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#0D0D0D]">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
          <div className="h-32 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("AdminRoute: No user, redirecting to login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  if (!user.isAdmin) {
    console.log("AdminRoute: User is not admin, redirecting to home");
    return <Navigate to="/home" replace />;
  }
  
  console.log("AdminRoute: Admin user authenticated, rendering admin content", user?.id);
  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black/90">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-8 bg-gray-300 rounded-md dark:bg-gray-700 w-3/4 mx-auto"></div>
          <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }
  
  if (user) {
    // Get the intended destination from location state, or default to home
    const from = location.state?.from?.pathname || "/home";
    
    // Don't redirect to admin routes unless user is actually an admin
    const adminRoutes = ['/admin', '/media'];
    const isFromAdminRoute = adminRoutes.includes(from);
    
    if (isFromAdminRoute && !user.isAdmin) {
      console.log("PublicRoute: Non-admin user attempted redirect to admin route, redirecting to home instead");
      return <Navigate to="/home" replace />;
    }
    
    console.log("PublicRoute: User already logged in, redirecting to:", from);
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

const AppContent = () => {
  useCapacitorPlugins();
  
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<PublicRoute><Auth /></PublicRoute>} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/draw/:id" element={<ProtectedRoute><DrawDetail /></ProtectedRoute>} />
        <Route path="/winners" element={<ProtectedRoute><Winners /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="/media" element={<AdminRoute><MediaLibrary /></AdminRoute>} />
        <Route path="/todos" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
        <Route path="/todo-page" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
};

const App = () => {
  console.log("App rendering");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <BackgroundProvider>
              <AuthProvider>
                <DrawProvider>
                  <NotificationProvider>
                    <Toaster />
                    <Sonner />
                    <AppContent />
                  </NotificationProvider>
                </DrawProvider>
              </AuthProvider>
            </BackgroundProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
