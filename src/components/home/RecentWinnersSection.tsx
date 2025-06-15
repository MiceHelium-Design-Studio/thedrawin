
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar, Trophy } from 'lucide-react';
import { useDraws } from '../../context/DrawContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const RecentWinnersSection: React.FC = () => {
  const { draws } = useDraws();
  const navigate = useNavigate();
  
  // Get recent completed draws with winners (limit to 3)
  const recentWinners = draws
    ?.filter(draw => draw.status === 'completed' && draw.winner)
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
    .slice(0, 3) || [];

  if (recentWinners.length === 0) {
    return (
      <section className="mb-20 relative">
        {/* Enhanced empty state background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/8 via-transparent to-[#06B6D4]/6 rounded-3xl" />
        
        <div className="relative text-center">
          <div className="inline-flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-xl flex items-center justify-center border border-[#F39C0A]/20">
              <Trophy className="h-6 w-6 text-[#F39C0A]" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Recent <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent">Winners</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#F39C0A] to-[#06B6D4] rounded-full mx-auto mb-8" />
          
          <div className="luxury-card max-w-2xl mx-auto p-12">
            <div className="space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-full flex items-center justify-center mx-auto border border-[#F39C0A]/20">
                <Trophy className="h-10 w-10 text-[#F39C0A]" />
              </div>
              <h3 className="text-2xl font-bold text-white">Champions Hall Coming Soon</h3>
              <p className="text-slate-400 text-lg leading-relaxed">
                The first champions will be crowned soon. Join the competition and make history!
              </p>
              <Button 
                onClick={() => navigate('/draws')}
                className="luxury-button mt-6"
              >
                View Active Draws
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-20 relative">
      {/* Enhanced section background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/8 via-transparent to-[#06B6D4]/6 rounded-3xl" />
      
      <div className="relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-xl flex items-center justify-center border border-[#F39C0A]/20">
              <Trophy className="h-6 w-6 text-[#F39C0A]" />
            </div>
            <h2 className="text-4xl font-bold text-white tracking-tight">
              Recent <span className="bg-gradient-to-r from-[#F39C0A] via-[#FFD700] to-[#F39C0A] bg-clip-text text-transparent">Winners</span>
            </h2>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-[#F39C0A] to-[#06B6D4] rounded-full mx-auto mb-6" />
          <p className="text-slate-400 text-xl leading-relaxed">
            Celebrating our latest champions and their incredible victories
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {recentWinners.map((draw, index) => (
            <Card key={draw.id} className="luxury-card group hover:scale-[1.03] transition-all duration-500 relative overflow-hidden">
              {/* Winner ranking badge */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                  'bg-gradient-to-br from-yellow-600 to-yellow-800'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              {/* Premium card background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/10 via-transparent to-[#06B6D4]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F39C0A]/20 to-[#06B6D4]/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-[#F39C0A]/20">
                    <Award className="h-8 w-8 text-[#F39C0A]" />
                  </div>
                  <div className="flex items-center text-sm text-slate-400 bg-white/5 px-3 py-1 rounded-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(new Date(draw.endDate), 'MMM d')}
                  </div>
                </div>
                
                <h3 className="font-bold text-xl mb-4 text-white truncate group-hover:text-[#F39C0A] transition-colors duration-300">
                  {draw.title}
                </h3>
                
                <div className="mb-8">
                  <p className="text-sm text-slate-400 mb-2">🏆 Champion</p>
                  <p className="font-bold text-white text-xl bg-gradient-to-r from-[#F39C0A] to-[#FFD700] bg-clip-text text-transparent">
                    {draw.winner}
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-[#F39C0A]/10 to-[#06B6D4]/5 rounded-xl p-6 text-center border border-[#F39C0A]/20">
                  <p className="text-sm text-slate-400 mb-2">Prize Value</p>
                  <p className="font-bold text-[#F39C0A] text-2xl">
                    ${Math.max(...draw.ticketPrices).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate('/winners')}
            className="premium-outline-button group"
          >
            <span className="relative z-10">View All Winners</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#F39C0A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RecentWinnersSection;
