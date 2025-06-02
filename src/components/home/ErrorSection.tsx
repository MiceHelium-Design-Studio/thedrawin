
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ErrorSectionProps {
  user: any;
}

const ErrorSection: React.FC<ErrorSectionProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-8 text-center">
          <img 
            src="/lovable-uploads/eb8560b4-61ba-46be-a7eb-ab1918ff22de.png"
            alt="DRAWIN - The First Draw & Win App" 
            className="max-w-[280px] md:max-w-[320px] lg:max-w-[400px] mx-auto mb-4"
          />
          <p className="text-white/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Join exciting draws, win amazing prizes, and be part of the ultimate gaming experience
          </p>
        </div>

        <div className="text-center py-12 bg-gray-900/50 rounded-xl">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold mb-2 text-gold-500">Error Loading Draws</h3>
          <p className="text-white/60 mb-6">
            We're having trouble loading the draws. Please try refreshing the page.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="mr-4"
          >
            Refresh Page
          </Button>
          {!user && (
            <Button onClick={() => navigate('/login')} className="bg-gold-500 hover:bg-gold-600 text-black">
              Login
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorSection;
