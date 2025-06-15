
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminContent from '@/components/admin/AdminContent';
import { Home, ChevronRight } from 'lucide-react';

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
        description: 'You do not have permission to access this page.'
      });
      navigate('/');
    }
  }, [user, navigate, toast]);

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden" style={{ backgroundColor: '#0D0D0D' }}>
      {/* Premium ambient effects */}
      <div className="fixed top-20 right-10 w-24 h-24 rounded-full blur-2xl animate-pulse opacity-30" style={{ background: 'rgba(243, 156, 10, 0.08)' }} />
      <div className="fixed bottom-40 left-20 w-32 h-32 rounded-full blur-3xl animate-pulse opacity-20" style={{ background: 'rgba(6, 182, 212, 0.06)', animationDelay: '2s' }} />
      
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex-1 relative z-10">
        {/* Premium breadcrumbs */}
        <div className="flex items-center mb-6 text-sm">
          <a 
            href="/"
            className="flex items-center text-[#CCCCCC] hover:text-[#F39C0A] transition-colors"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </a>
          <ChevronRight className="mx-2 h-4 w-4 text-[#CCCCCC]" />
          <span className="text-white font-medium">Administration</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          <AdminContent activeSection={activeTab} activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

export default Admin;
