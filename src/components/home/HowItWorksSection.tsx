
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Award, Users } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Coins,
      title: "Purchase Tickets",
      description: "Select your favorite draws and purchase tickets using your secure wallet balance."
    },
    {
      icon: Users,
      title: "Join the Community",
      description: "Connect with players worldwide as draws fill up and excitement builds."
    },
    {
      icon: Award,
      title: "Win Premium Prizes",
      description: "Experience the thrill as winners are selected and claim their exclusive rewards."
    }
  ];

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-white tracking-tight">
          How It <span className="bg-gold-gradient bg-clip-text text-transparent">Works</span>
        </h2>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Three simple steps to join the future of digital gaming
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((step, index) => (
          <Card key={index} className="luxury-card text-center group hover:scale-[1.02] transition-all duration-300">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-[#F39C0A]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#F39C0A]/20 transition-colors duration-300 border border-[#F39C0A]/20">
                <step.icon className="h-10 w-10 text-[#F39C0A]" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-white">
                {step.title}
              </h3>
              <p className="text-slate-400 leading-relaxed">
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
