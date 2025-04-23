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
import { ensureFullAdmin } from "./utils/adminSetup";
import BannerUploader from './components/admin/BannerUploader';

// Pages
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import DrawDetail from "./pages/DrawDetail";
import Winners from "./pages/Winners";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import MediaLibrary from "./pages/MediaLibrary";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
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
          <div className="h-64 bg-gray-300 rounded-lg dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to auth");
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  
  console.log("ProtectedRoute: User authenticated, rendering content", user?.id);
  return <>{children}</>;
};

function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BannerUploader />
      </div>
    </div>
  );
}

const App = () => {
  console.log("App rendering");
  
  useEffect(() => {
    ensureFullAdmin()
      .then(() => console.log('Admin check completed'))
      .catch(err => console.error('Admin check failed:', err));
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <BackgroundProvider>
          <TooltipProvider>
            <AuthProvider>
              <DrawProvider>
                <NotificationProvider>
                  <Toaster />
                  <Sonner />
                  <Layout>
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      
                      <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                      <Route path="/draw/:id" element={<ProtectedRoute><DrawDetail /></ProtectedRoute>} />
                      <Route path="/winners" element={<ProtectedRoute><Winners /></ProtectedRoute>} />
                      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                      <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
                      
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                </NotificationProvider>
              </DrawProvider>
            </AuthProvider>
          </TooltipProvider>
        </BackgroundProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
