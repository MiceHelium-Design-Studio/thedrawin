
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Award, Users } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Coins,
      title: "Buy Tickets",
      description: "Purchase tickets for your favorite draws using your wallet balance."
    },
    {
      icon: Users,
      title: "Join the Draw",
      description: "Wait for other participants to join and the draw to reach capacity."
    },
    {
      icon: Award,
      title: "Win Prizes",
      description: "When the draw ends, one lucky winner takes home the prize!"
    }
  ];

  return (
    <section className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">
          <span className="bg-gold-gradient bg-clip-text text-transparent">
            How It Works
          </span>
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto">
          Join exciting draws, win amazing prizes, and be part of the DRAWIN community
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="luxury-card text-center">
            <CardContent className="p-6">
              <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <step.icon className="h-8 w-8 text-gold" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gold uppercase">
                {step.title}
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default HowItWorksSection;
