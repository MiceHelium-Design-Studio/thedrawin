
import React from 'react';
import { useDraws } from '../../context/DrawContext';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Banner } from '../../types';

export const BannersAdmin: React.FC = () => {
  const { banners, loading, updateBanner, deleteBanner } = useDraws();
  
  const toggleBannerStatus = async (banner: Banner) => {
    try {
      await updateBanner(banner.id, { active: !banner.active });
    } catch (error) {
      console.error('Error toggling banner status:', error);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl text-gold">Manage Banners</h2>
        <Button className="bg-gold hover:bg-gold/80 text-black flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          <span>Add New Banner</span>
        </Button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-white/70">Loading banners...</div>
      ) : (
        <div className="grid gap-4">
          {banners.map(banner => (
            <div key={banner.id} className="bg-black-light/40 border border-gold/10 rounded-lg p-4">
              <div className="flex items-start gap-4">
                <div className="w-40 h-24 rounded-md overflow-hidden flex-shrink-0">
                  <img
                    src={banner.imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-white font-medium">Banner #{banner.id}</h3>
                      <p className="text-white/70 text-sm truncate mt-1">
                        Link: <a href={banner.linkUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">{banner.linkUrl}</a>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 ${banner.active ? 'text-green-500 hover:text-green-400' : 'text-gray-500 hover:text-gray-400'}`}
                        onClick={() => toggleBannerStatus(banner)}
                      >
                        {banner.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gold hover:text-gold/80 hover:bg-gold/10">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${banner.active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}>
                      {banner.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
