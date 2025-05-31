
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { DrawProvider } from './context/DrawContext';
import { NotificationProvider } from './context/NotificationContext';
import { BackgroundProvider } from './context/BackgroundContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Draws from './pages/Draws';
import Winners from './pages/Winners';
import ProfilePage from './pages/ProfilePage';
import Auth from './pages/Auth';
import Admin from './pages/Admin';
import NotificationsPage from './pages/NotificationsPage';
import AdminIndexUsage from './pages/AdminIndexUsage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <DrawProvider>
            <NotificationProvider>
              <BackgroundProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/draws" element={<Draws />} />
                    <Route path="/winners" element={<Winners />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/index-usage" element={<AdminIndexUsage />} />
                  </Routes>
                </Layout>
              </BackgroundProvider>
            </NotificationProvider>
          </DrawProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
