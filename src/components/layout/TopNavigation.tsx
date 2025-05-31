
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { useDraws } from '../../context/DrawContext';
import { Wallet, Award, Bell } from 'lucide-react';
import { cn } from '../../lib/utils';

const TopNavigation: React.FC = () => {
  const { user } = useAuth();
  const { draws } = useDraws();
  const navigate = useNavigate();
  const location = useLocation();

  const activeDrawsCount = draws?.filter(draw => draw.status === 'active').length || 0;

  const navItems = [
    { label: 'Home', path: '/', active: location.pathname === '/' },
    { label: `Draws (${activeDrawsCount})`, path: '/draws', active: location.pathname === '/draws' },
    { label: 'Winners', path: '/winners', active: location.pathname === '/winners' },
  ];

  if (!user) return null;

  return (
    <div className="bg-black/95 backdrop-blur-md border-b border-gold/20 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gold uppercase tracking-wider">
              DRAWIN
            </h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-gold",
                  item.active ? "text-gold" : "text-white"
                )}
              >
                {item.label}
              </Button>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gold">
              <Wallet className="h-4 w-4" />
              <span className="font-medium">${user.wallet}</span>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              className="relative"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavigation;
