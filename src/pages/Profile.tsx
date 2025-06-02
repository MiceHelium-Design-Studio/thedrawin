
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';
import WalletSection from '../components/profile/WalletSection';
import UserTickets from '../components/profile/UserTickets';

const Profile: React.FC = () => {
  const { user, addFunds } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-gray-600">Please login to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const handleAddFunds = async (amount: number) => {
    setLoading(true);
    try {
      console.log('Adding funds:', amount);
      await addFunds(amount);
      console.log('Funds added successfully');
    } catch (error) {
      console.error('Error adding funds:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <div className="text-sm text-gray-500">
            Welcome back, {user.name || user.email}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <UpdateProfileForm />
            <WalletSection 
              user={user} 
              loading={loading} 
              addFunds={handleAddFunds} 
            />
          </div>
          
          <div>
            <UserTickets />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
