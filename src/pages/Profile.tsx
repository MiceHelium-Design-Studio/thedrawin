
import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';
import WalletSection from '../components/profile/WalletSection';
import UserTickets from '../components/profile/UserTickets';
import { useProfileManagement } from '../hooks/useProfileManagement';

const Profile: React.FC = () => {
  const { user, addFunds } = useAuth();
  const [loading, setLoading] = useState(false);
  const { saveProfile } = useProfileManagement();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <p>Please login to view your profile.</p>
        </div>
      </Layout>
    );
  }

  const handleAddFunds = async (amount: number) => {
    setLoading(true);
    try {
      await addFunds(amount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        
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
