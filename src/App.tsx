
import React from "react";
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

// Create a new QueryClient instance with longer staleTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60000, // Increase stale time to reduce refetches
    },
  },
});

// Improved protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Show a basic loading state while checking auth
  if (loading) {
    console.log("ProtectedRoute: Loading auth state");
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  // If no user after loading completed, redirect to auth
  if (!user) {
    console.log("ProtectedRoute: No user, redirecting to auth");
    return <Navigate to="/auth" replace />;
  }
  
  // User is authenticated, render children
  console.log("ProtectedRoute: User authenticated, rendering content");
  return <>{children}</>;
};

const App = () => {
  console.log("App rendering");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthProvider>
            <DrawProvider>
              <BackgroundProvider>
                <NotificationProvider>
                  <Toaster />
                  <Sonner />
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
                </NotificationProvider>
              </BackgroundProvider>
            </DrawProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
