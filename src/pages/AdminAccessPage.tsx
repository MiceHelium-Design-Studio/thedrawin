
import React from 'react';
import AdminGrantAccess from '@/components/AdminGrantAccess';

const AdminAccessPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center text-white mb-4">Admin Access Control</h1>
      <p className="text-center text-gray-400 mb-8">
        Use this page to grant admin privileges to users in the system. Only existing users can be granted admin access.
      </p>
      <AdminGrantAccess />
    </div>
  );
};

export default AdminAccessPage;
