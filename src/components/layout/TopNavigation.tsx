import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { useDraws } from '../../context/DrawContext';
import { Wallet, Award, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';
const TopNavigation: React.FC = () => {
  const {
    user
  } = useAuth();
  const {
    draws
  } = useDraws();
  const navigate = useNavigate();
  const location = useLocation();
  const activeDrawsCount = draws?.filter(draw => draw.status === 'active').length || 0;
  const navItems = [{
    label: 'Home',
    path: '/home',
    active: location.pathname === '/home'
  }, {
    label: `Draws (${activeDrawsCount})`,
    path: '/draws',
    active: location.pathname === '/draws'
  }, {
    label: 'Winners',
    path: '/winners',
    active: location.pathname === '/winners'
  }];
  if (!user) return null;
  return <div className="bg-black/95 backdrop-blur-md border-b border-gold/20 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        
      </div>
    </div>;
};
export default TopNavigation;