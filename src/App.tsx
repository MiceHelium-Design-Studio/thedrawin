import React, { useState } from "react";
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

// Create a new QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

// Simplified protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // If still loading, render children anyway and let the child component handle loading state
  if (loading) {
    return <>{children}</>;
  }
  
  // If no user after loading completed, redirect to auth
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  // User is authenticated, render children
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
