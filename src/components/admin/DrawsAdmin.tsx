
import React from 'react';
import { useDraws } from '../../context/DrawContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

export const DrawsAdmin: React.FC = () => {
  const { draws, loading } = useDraws();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gold">Manage Draws</h2>
        <Button className="bg-gold hover:bg-gold/80 text-black flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Create New Draw</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-white/70">Loading draws...</div>
      ) : (
        <div className="grid gap-4">
          {draws.map(draw => (
            <div key={draw.id} className="bg-black-light/40 border border-gold/10 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-white">{draw.title}</h3>
                  <p className="text-white/70 mt-1 text-sm">{draw.description}</p>
                  <div className="mt-2 flex gap-4">
                    <span className="text-xs px-2 py-1 rounded bg-gold/20 text-gold">
                      Status: {draw.status}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gold/20 text-gold">
                      Participants: {draw.currentParticipants}/{draw.maxParticipants}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gold hover:text-gold/80 hover:bg-gold/10">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
