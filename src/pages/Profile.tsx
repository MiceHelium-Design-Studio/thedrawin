
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Wallet, Trophy, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserTickets from '../components/profile/UserTickets';
import WalletSection from '../components/profile/WalletSection';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'tickets' | 'wallet' | 'settings'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Please log in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'tickets', label: 'My Tickets', icon: Trophy },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 mx-auto mb-4 ring-4 ring-white dark:ring-gray-800 shadow-lg">
              <AvatarImage 
                src={user.user_metadata?.avatar_url} 
                alt={user.email}
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-gold-400 to-gold-600 text-white text-xl font-bold">
                {getUserInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            {user.user_metadata?.isAdmin && (
              <Badge className="absolute -top-1 -right-1 bg-gold-500 text-white text-xs px-2 py-1 rounded-full">
                Admin
              </Badge>
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {user.user_metadata?.full_name || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            {user.email}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-gold-600 dark:text-gold-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-gray-700/50"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gold-500" />
                    <span>Account Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                    <p className="text-gray-900 dark:text-white font-medium">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Member since</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Type</label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {user.user_metadata?.isAdmin ? 'Administrator' : 'Standard User'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-gold-500" />
                    <span>Activity Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Draws Entered</span>
                    <span className="font-semibold text-gray-900 dark:text-white">-</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Spent</span>
                    <span className="font-semibold text-gray-900 dark:text-white">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Prizes Won</span>
                    <span className="font-semibold text-gray-900 dark:text-white">0</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tickets' && (
            <Card>
              <CardHeader>
                <CardTitle>My Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <UserTickets />
              </CardContent>
            </Card>
          )}

          {activeTab === 'wallet' && (
            <Card>
              <CardHeader>
                <CardTitle>Wallet & Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <WalletSection />
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <UpdateProfileForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
