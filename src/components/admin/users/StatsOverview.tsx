
import { User } from '@/types';
import { StatsCard } from '../stats/StatsCard';

interface StatsOverviewProps {
  users: User[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total Users"
        description="Number of registered users"
        value={users.length}
      />
      <StatsCard
        title="Admins"
        description="Users with admin privileges"
        value={users.filter(user => user.isAdmin).length}
      />
      <StatsCard
        title="Regular Users"
        description="Users without admin privileges"
        value={users.filter(user => !user.isAdmin).length}
      />
      <StatsCard
        title="Total Balance"
        description="Combined wallet balances"
        value={users.reduce((total, user) => total + (user.wallet || 0), 0)}
      />
    </div>
  );
};
