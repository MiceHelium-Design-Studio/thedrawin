
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChromePicker } from '@/components/ui/color-picker';

export const AppearanceAdmin: React.FC = () => {
  const [primaryColor, setPrimaryColor] = useState('#d4af37'); // Gold
  const [backgroundColor, setBackgroundColor] = useState('#121212'); // Dark
  const [accentColor, setAccentColor] = useState('#ffffff'); // White
  const [selectedFont, setSelectedFont] = useState('default');
  
  const fonts = [
    { id: 'default', name: 'Default (System)' },
    { id: 'playfair', name: 'Playfair Display' },
    { id: 'roboto', name: 'Roboto' },
    { id: 'montserrat', name: 'Montserrat' },
    { id: 'poppins', name: 'Poppins' }
  ];
  
  const handleSaveChanges = () => {
    // This would typically update your app's theme context
    // For now, we'll just log the changes
    console.log('Appearance changes:', {
      primaryColor,
      backgroundColor,
      accentColor,
      selectedFont
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gold">App Appearance</h2>
        <Button 
          className="bg-gold hover:bg-gold/80 text-black"
          onClick={handleSaveChanges}
        >
          Save Changes
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-black-light/40 border border-gold/10 rounded-lg p-6">
          <h3 className="text-white text-lg mb-4">Colors</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 mb-2">Primary Color (Gold)</label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded border border-white/10"
                  style={{ backgroundColor: primaryColor }}
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white/70 mb-2">Background Color</label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded border border-white/10"
                  style={{ backgroundColor: backgroundColor }}
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-white/70 mb-2">Accent Color</label>
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded border border-white/10"
                  style={{ backgroundColor: accentColor }}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-black-light/40 border border-gold/10 rounded-lg p-6">
          <h3 className="text-white text-lg mb-4">Typography</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-white/70 mb-2">App Font</label>
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="w-full bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white"
              >
                {fonts.map(font => (
                  <option key={font.id} value={font.id}>{font.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <h4 className="text-white mb-3">Font Preview</h4>
              <div className="p-4 bg-black-light/30 rounded-lg border border-gold/5">
                <p className={`text-2xl text-gold mb-2 font-${selectedFont}`}>
                  Heading Example
                </p>
                <p className={`text-white/90 mb-4 font-${selectedFont}`}>
                  This is an example of body text with the selected font. It shows how the typography will look throughout the application.
                </p>
                <p className={`text-sm text-white/70 font-${selectedFont}`}>
                  Smaller text example for captions and secondary information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-6 bg-black-light/40 border border-gold/10 rounded-lg">
        <h3 className="text-white text-lg mb-4">Preview</h3>
        <div 
          className="p-6 rounded-lg border border-white/10"
          style={{ backgroundColor }}
        >
          <div className="flex flex-col items-center">
            <h1 className={`text-2xl font-${selectedFont}`} style={{ color: primaryColor }}>
              The Draw In
            </h1>
            <p className="text-center mt-2" style={{ color: accentColor }}>
              Win amazing prizes with our exclusive draws and competitions
            </p>
            <button 
              className="mt-4 px-6 py-2 rounded"
              style={{ backgroundColor: primaryColor, color: backgroundColor }}
            >
              Enter Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
