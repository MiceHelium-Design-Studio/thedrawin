
import React from 'react';
import AdminGrantAccess from '@/components/AdminGrantAccess';

const AdminAccessPage: React.FC = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-center text-white mb-8">Admin Access Control</h1>
      <AdminGrantAccess />
    </div>
  );
};

export default AdminAccessPage;
