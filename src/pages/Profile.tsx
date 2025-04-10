
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Wallet, LogOut, User, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const Profile: React.FC = () => {
  const { user, logout, updateProfile, addFunds, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [name, setName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [amount, setAmount] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  
  if (!user) {
    navigate('/auth');
    return null;
  }
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'There was an error logging out.',
      });
      console.error(error);
    }
  };
  
  const handleUpdateProfile = async () => {
    try {
      await updateProfile({ name, avatar: avatarUrl });
      setIsEditing(false);
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: 'There was an error updating your profile.',
      });
      console.error(error);
    }
  };
  
  const handleAddFunds = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
      });
      return;
    }
    
    try {
      await addFunds(Number(amount));
      setAmount('');
      toast({
        title: 'Funds added',
        description: `$${amount} has been added to your wallet.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Transaction failed',
        description: 'There was an error adding funds.',
      });
      console.error(error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg bg-gold/20">
                {user.name?.slice(0, 2) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      className="border-gold/30 focus:border-gold"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateProfile}
                      disabled={loading}
                      className="bg-gold hover:bg-gold-dark text-black"
                    >
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="border-gold/30 text-gold hover:text-gold-dark"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gold hover:bg-gold-dark text-black"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-gold" />
              Wallet Balance
            </h2>
            <div className="text-2xl font-bold text-gold">${user.wallet.toFixed(2)}</div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Add Funds</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="pl-10 border-gold/30 focus:border-gold"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                onClick={() => setAmount('5')}
                className="border-gold/30 text-gold hover:text-gold-dark"
              >
                $5
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAmount('10')}
                className="border-gold/30 text-gold hover:text-gold-dark"
              >
                $10
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setAmount('20')}
                className="border-gold/30 text-gold hover:text-gold-dark"
              >
                $20
              </Button>
            </div>
            
            <Button
              onClick={handleAddFunds}
              disabled={loading || !amount}
              className="w-full bg-gold hover:bg-gold-dark text-black"
            >
              Add Funds
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Button 
        variant="outline" 
        onClick={handleLogout}
        className="border-red-300 text-red-500 hover:text-red-700 w-full"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default Profile;
