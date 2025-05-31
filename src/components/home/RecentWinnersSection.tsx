
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
      <section className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">
            <span className="bg-gold-gradient bg-clip-text text-transparent">
              Recent Winners
            </span>
          </h2>
          <p className="text-white/80">
            The first winners will be announced soon. Be part of the action!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">
          <span className="bg-gold-gradient bg-clip-text text-transparent">
            Recent Winners
          </span>
        </h2>
        <p className="text-white/80">
          Congratulations to our latest winners!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        {recentWinners.map((draw) => (
          <Card key={draw.id} className="luxury-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-6 w-6 text-gold" />
                <div className="flex items-center text-sm text-white/60">
                  <Calendar className="h-4 w-4 mr-1" />
                  {format(new Date(draw.endDate), 'MMM d')}
                </div>
              </div>
              
              <h3 className="font-bold text-lg mb-2 text-gold uppercase truncate">
                {draw.title}
              </h3>
              
              <div className="mb-4">
                <p className="text-sm text-white/60 mb-1">Winner</p>
                <p className="font-medium text-white">{draw.winner}</p>
              </div>
              
              <div className="bg-gold/10 rounded-lg p-3 text-center">
                <p className="text-sm text-white/60">Prize Value</p>
                <p className="font-bold text-gold">
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
          onClick={() => navigate('/winners')}
          className="uppercase tracking-wide"
        >
          View All Winners
        </Button>
      </div>
    </section>
  );
};

export default RecentWinnersSection;
