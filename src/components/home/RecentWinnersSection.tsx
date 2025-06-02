
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Award, Calendar } from 'lucide-react';
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
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">
            Recent <span className="bg-gold-gradient bg-clip-text text-transparent">Winners</span>
          </h2>
          <p className="text-slate-400 text-lg">
            The first champions will be crowned soon. Join the competition!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">
          Recent <span className="bg-gold-gradient bg-clip-text text-transparent">Winners</span>
        </h2>
        <p className="text-slate-400 text-lg">
          Celebrating our latest champions and their victories
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-10">
        {recentWinners.map((draw, index) => (
          <Card key={draw.id} className="luxury-card group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-[#F39C0A]/10 rounded-xl flex items-center justify-center group-hover:bg-[#F39C0A]/20 transition-colors duration-300 border border-[#F39C0A]/20">
                  <Award className="h-6 w-6 text-[#F39C0A]" />
                </div>
                <div className="flex items-center text-sm text-slate-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(draw.endDate), 'MMM d')}
                </div>
              </div>
              
              <h3 className="font-semibold text-lg mb-3 text-white truncate">
                {draw.title}
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-slate-400 mb-2">Champion</p>
                <p className="font-medium text-white text-lg">{draw.winner}</p>
              </div>
              
              <div className="bg-[#F39C0A]/5 rounded-xl p-4 text-center border border-[#F39C0A]/10">
                <p className="text-sm text-slate-400 mb-1">Prize Value</p>
                <p className="font-bold text-[#F39C0A] text-xl">
                  ${Math.max(...draw.ticketPrices)}
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
          className="premium-outline-button"
        >
          View All Winners
        </Button>
      </div>
    </section>
  );
};

export default RecentWinnersSection;
