
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Wallet, Trophy, Settings, Edit3, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import UserTickets from '../components/profile/UserTickets';
import WalletSection from '../components/profile/WalletSection';
import UpdateProfileForm from '../components/profile/UpdateProfileForm';
import { cn } from '@/lib/utils';

const Profile: React.FC = () => {
  const { user, loading: authLoading, updateProfile, addFunds, logout } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'tickets' | 'wallet' | 'settings'>('overview');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0D] pattern-bg">
        <div className="luxury-card w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-[#F39C0A]/10 rounded-full flex items-center justify-center mx-auto mb-4 gold-pulse">
              <User className="w-8 h-8 text-[#F39C0A]" />
            </div>
            <p className="text-slate-400 text-lg">
              Please log in to view your profile.
            </p>
          </CardContent>
        </div>
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
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      {/* Premium background effects */}
      <div className="fixed inset-0 pattern-bg pointer-events-none" />
      <div className="fixed inset-0 hero-glow pointer-events-none" />
      
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-8 luxury-fade-in">
          {/* Enhanced Profile Header */}
          <div className="text-center mb-8 relative">
            <div className="absolute inset-0 hero-glow opacity-50"></div>
            <div className="relative z-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#F39C0A] to-[#FFA726] p-1 gold-pulse">
                  <div className="rounded-full bg-[#0D0D0D] p-2">
                    <Avatar className="w-24 h-24 mx-auto ring-4 ring-[#F39C0A]/20 shadow-gold">
                      <AvatarImage 
                        src={user.avatar || user.avatar_url} 
                        alt={user.email}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gradient-to-br from-[#F39C0A] to-[#FFA726] text-black text-xl font-bold">
                        {getUserInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
                {user.isAdmin && (
                  <div className="absolute -top-2 -right-2">
                    <Badge className="bg-[#F39C0A] text-black text-xs px-3 py-1 rounded-full font-bold shadow-gold">
                      <Crown className="w-3 h-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {user.name || 'Welcome'}
              </h1>
              <p className="text-slate-400 text-lg font-medium mb-4">
                {user.email}
              </p>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setActiveTab('settings')}
                className="premium-outline-button group"
              >
                <Edit3 className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="flex space-x-1 luxury-card p-1 rounded-xl mb-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 whitespace-nowrap group",
                    activeTab === tab.id
                      ? "bg-[#F39C0A] text-black shadow-gold"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Enhanced Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="luxury-card group hover:scale-[1.02] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <User className="h-5 w-5 text-[#F39C0A] group-hover:scale-110 transition-transform" />
                      <span>Account Information</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Email</label>
                      <p className="text-white font-medium text-lg">{user.email}</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Member since</label>
                      <p className="text-white font-medium text-lg">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Account Type</label>
                      <div className="flex items-center space-x-2">
                        <p className="text-white font-medium text-lg">
                          {user.isAdmin ? 'Administrator' : 'Premium Member'}
                        </p>
                        {user.isAdmin && <Crown className="w-5 h-5 text-[#F39C0A]" />}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="luxury-card group hover:scale-[1.02] transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <Trophy className="h-5 w-5 text-[#F39C0A] group-hover:scale-110 transition-transform" />
                      <span>Activity Summary</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-slate-400 font-medium">Draws Entered</span>
                      <span className="font-bold text-white text-lg">-</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-slate-400 font-medium">Total Spent</span>
                      <span className="font-bold text-white text-lg">$0.00</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-slate-400 font-medium">Prizes Won</span>
                      <span className="font-bold text-[#F39C0A] text-lg">0</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'tickets' && (
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-white">My Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <UserTickets />
                </CardContent>
              </Card>
            )}

            {activeTab === 'wallet' && (
              <Card className="luxury-card">
                <CardHeader>
                  <CardTitle className="text-white">Wallet & Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <WalletSection 
                    user={user}
                    loading={authLoading}
                    addFunds={addFunds}
                  />
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
    </div>
  );
};

export default Profile;
