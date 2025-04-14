
import React from 'react';
import AdminGrantAccess from '@/components/AdminGrantAccess';
import { Shield } from 'lucide-react';

const AdminAccessPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <Shield className="h-12 w-12 text-gold mx-auto mb-2" />
        <h1 className="text-2xl font-bold text-white mb-2">Admin Access Control</h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Use this page to grant admin privileges to users in the system. 
          You can grant admin access to yourself or any other user by email address.
        </p>
      </div>
      <AdminGrantAccess />
    </div>
  );
};

export default AdminAccessPage;
