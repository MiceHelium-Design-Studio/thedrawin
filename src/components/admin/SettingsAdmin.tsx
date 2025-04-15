
import React from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '../../context/AuthContext';

export const SettingsAdmin: React.FC = () => {
  const { user, clearCacheAndReload } = useAuth();
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gold">App Settings</h2>
        <Button 
          className="bg-gold hover:bg-gold/80 text-black"
          onClick={clearCacheAndReload}
        >
          Apply Changes
        </Button>
      </div>
      
      <div className="space-y-6">
        <div className="bg-black-light/40 border border-gold/10 rounded-lg p-6">
          <h3 className="text-white text-lg mb-4">General Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Allow User Registration</p>
                <p className="text-white/50 text-sm">Enable or disable new user registration</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Maintenance Mode</p>
                <p className="text-white/50 text-sm">Temporarily disable the app for maintenance</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Show Winner Names</p>
                <p className="text-white/50 text-sm">Display full winner names on the winners page</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
        
        <div className="bg-black-light/40 border border-gold/10 rounded-lg p-6">
          <h3 className="text-white text-lg mb-4">Draw Settings</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Automatic Draw Completion</p>
                <p className="text-white/50 text-sm">Automatically complete draws when maximum participants is reached</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white">Winner Notifications</p>
                <p className="text-white/50 text-sm">Send notifications to winners when a draw is completed</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div>
              <p className="text-white mb-2">Default Ticket Prices ($)</p>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  defaultValue="5" 
                  className="w-20 bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white" 
                />
                <input 
                  type="number" 
                  defaultValue="10" 
                  className="w-20 bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white" 
                />
                <input 
                  type="number" 
                  defaultValue="20" 
                  className="w-20 bg-black-light/50 border border-gold/10 rounded px-3 py-2 text-white" 
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-black-light/40 border border-gold/10 rounded-lg p-6">
          <h3 className="text-white text-lg mb-4">Advanced</h3>
          
          <div className="space-y-4">
            <div>
              <p className="text-white mb-2">Cache Management</p>
              <Button 
                variant="outline" 
                className="border-gold/30 text-gold hover:bg-gold/10"
                onClick={clearCacheAndReload}
              >
                Clear Application Cache
              </Button>
            </div>
            
            <div>
              <p className="text-white mb-2">Admin Email</p>
              <p className="text-gold">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
