
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminContent from '@/components/admin/AdminContent';

const Admin: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('draws');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You do not have permission to access this page.',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 flex-1">
        <h1 className="text-2xl font-bold mb-6 text-center md:text-left text-primary">Admin Dashboard</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
