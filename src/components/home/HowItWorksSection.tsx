import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, Award, Users } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [{
    icon: Coins,
    title: "Purchase Tickets",
    description: "Select your favorite draws and purchase tickets using your secure wallet balance.",
    color: "from-[#F39C0A] to-[#FFD700]"
  }, {
    icon: Users,
    title: "Join the Community",
    description: "Connect with players worldwide as draws fill up and excitement builds.",
    color: "from-[#06B6D4] to-[#0EA5E9]"
  }, {
    icon: Award,
    title: "Win Premium Prizes",
    description: "Experience the thrill as winners are selected and claim their exclusive rewards.",
    color: "from-[#F39C0A] to-[#F97316]"
  }];
  return (
    <section className="mb-20 relative rounded-full my-[6px]">
      {/* Enhanced section background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F39C0A]/5 via-transparent to-[#06B6D4]/8 rounded-3xl" />
      
      <div className="relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
            How It Works?
          </h2>
          
          <div className="w-24 h-1 bg-gradient-to-r from-[#F39C0A] to-[#06B6D4] rounded-full mx-auto mb-6" />
          <p className="text-slate-400 max-w-3xl mx-auto text-xl leading-relaxed">
            Three simple steps to join the future of digital gaming and start winning amazing prizes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection line for larger screens */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[#F39C0A]/30 to-transparent z-10" />
              )}
              
              <Card className="luxury-card text-center group hover:scale-[1.03] transition-all duration-500 relative overflow-hidden h-full">
                {/* Premium card background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 relative">
                  {/* Step number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-[#F39C0A]/20 rounded-full flex items-center justify-center text-[#F39C0A] font-bold text-sm border border-[#F39C0A]/30">
                    {index + 1}
                  </div>
                  
                  <div className="mb-8">
                    <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <div className="w-20 h-20 bg-black/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <step.icon className="h-12 w-12 text-white drop-shadow-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-6 text-white group-hover:text-[#F39C0A] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 leading-relaxed text-lg group-hover:text-slate-300 transition-colors duration-300">
                    {step.description}
                  </p>
                  
                  {/* Bottom accent line */}
                  <div className={`w-16 h-1 bg-gradient-to-r ${step.color} rounded-full mx-auto mt-6 opacity-50 group-hover:opacity-100 transition-opacity duration-300`} />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
