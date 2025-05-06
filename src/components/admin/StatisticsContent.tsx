
import React from 'react';
import { Card } from "@/components/ui/card";

const StatisticsContent: React.FC = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Statistics</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium">Total Draws</h3>
            <p className="text-3xl font-bold mt-2">3</p>
          </div>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium">Active Draws</h3>
            <p className="text-3xl font-bold mt-2">1</p>
          </div>
        </Card>
        
        <Card className="backdrop-blur-sm bg-card/90 shadow-sm border-0 overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-medium">Completed Draws</h3>
            <p className="text-3xl font-bold mt-2">1</p>
          </div>
        </Card>
      </div>
    </section>
  );
};

export default StatisticsContent;
