import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/layout/Layout";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { DrawProvider } from "./context/DrawContext";
import { NotificationProvider } from "./context/NotificationContext";
import { BackgroundProvider } from "./context/BackgroundContext";
import { Skeleton } from "@/components/ui/skeleton";

// Pages
import Index from "./pages/Home";
import Auth from "./pages/Auth";
import DrawDetail from "./pages/DrawDetail";
import Winners from "./pages/Winners";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import MediaLibrary from "./pages/MediaLibrary";
import NotFound from "./pages/NotFound";

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const [forceRender, setForceRender] = useState(false);
  
  // Force render after a timeout to prevent infinite loading
  useEffect(() => {
    console.log("ProtectedRoute - Auth loading:", loading, "User:", user ? "logged in" : "not logged in");
    const timeout = setTimeout(() => {
      console.log("ProtectedRoute - Force rendering after timeout");
      setForceRender(true);
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [loading, user]);
  
  // Show a simple loading spinner with timeout to prevent infinite loading
  if (loading && !forceRender) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold mx-auto mb-4"></div>
          <p className="text-gold">Loading...</p>
        </div>
      </div>
    );
  }
  
  // If still no user after force render timeout, redirect to auth
  if (!user && forceRender) {
    console.log("ProtectedRoute - No user after timeout, redirecting to /auth");
    return <Navigate to="/auth" />;
  }
  
  // If no user and still in normal loading state, keep showing loader
  if (!user && !forceRender) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

const App = () => {
  console.log("App rendering");
  
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <DrawProvider>
              <NotificationProvider>
                <BackgroundProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <Layout>
                      <Routes>
                        <Route path="/auth" element={<Auth />} />
                        
                        <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                        <Route path="/draw/:id" element={<ProtectedRoute><DrawDetail /></ProtectedRoute>} />
                        <Route path="/winners" element={<ProtectedRoute><Winners /></ProtectedRoute>} />
                        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                        {/* Keep the media route but it won't be in the navigation */}
                        <Route path="/media" element={<ProtectedRoute><MediaLibrary /></ProtectedRoute>} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Layout>
                  </BrowserRouter>
                </BackgroundProvider>
              </NotificationProvider>
            </DrawProvider>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
