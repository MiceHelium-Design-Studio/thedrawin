
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Search, UserPlus, UserCheck, UserX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '../../types';

export const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { user: currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        const formattedUsers = data.map(profile => ({
          id: profile.id,
          email: profile.email || '',
          name: profile.name || '',
          avatar: profile.avatar || undefined,
          wallet: profile.wallet || 0,
          isAdmin: profile.is_admin || false
        }));
        
        setUsers(formattedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      // Update the user's admin status
      // This is just UI simulation - actual implementation would need proper backend integration
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, isAdmin: !isAdmin } : u
        )
      );
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gold">Manage Users</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-black-light/50 border border-gold/10 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-1 focus:ring-gold/30"
          />
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-white/70">Loading users...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gold/10 text-left">
                <th className="p-3 text-white/70">User</th>
                <th className="p-3 text-white/70">Email</th>
                <th className="p-3 text-white/70">Wallet</th>
                <th className="p-3 text-white/70">Role</th>
                <th className="p-3 text-white/70">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-gold/5 hover:bg-black-light/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
                        {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                      </div>
                      <span className="text-white">{user.name || '(No name)'}</span>
                    </div>
                  </td>
                  <td className="p-3 text-white/70">{user.email}</td>
                  <td className="p-3 text-white/70">${user.wallet.toFixed(2)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${user.isAdmin ? 'bg-gold/20 text-gold' : 'bg-white/10 text-white/70'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 text-gold hover:text-gold/80 hover:bg-gold/10"
                        onClick={() => toggleAdminStatus(user.id, user.isAdmin)}
                        disabled={user.id === currentUser?.id} // Prevent changing own status
                      >
                        {user.isAdmin ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
