
import { User } from '@/types';
import { StatsCard } from '../stats/StatsCard';
import { useTranslation } from 'react-i18next';

interface StatsOverviewProps {
  users: User[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ users }) => {
  const { t } = useTranslation();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title={t('admin.users.totalUsers')}
        description={t('admin.users.totalUsersDescription')}
        value={users.length}
      />
      <StatsCard
        title={t('admin.users.admins')}
        description={t('admin.users.adminsDescription')}
        value={users.filter(user => user.isAdmin).length}
      />
      <StatsCard
        title={t('admin.users.regularUsers')}
        description={t('admin.users.regularUsersDescription')}
        value={users.filter(user => !user.isAdmin).length}
      />
      <StatsCard
        title={t('admin.users.totalBalance')}
        description={t('admin.users.totalBalanceDescription')}
        value={users.reduce((total, user) => total + (user.wallet || 0), 0)}
      />
    </div>
  );
};
