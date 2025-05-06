
import React from 'react';
import { Filter, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadDate: string;
}

interface MediaGridProps {
  media: MediaItem[];
  onDelete: (id: string, name: string) => Promise<void>;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  formatFileSize: (bytes: number) => string;
}

const MediaGrid: React.FC<MediaGridProps> = ({ 
  media, 
  onDelete, 
  onImageError,
  formatFileSize
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {media.map(item => (
        <Card key={item.id} className="overflow-hidden">
          <div className="relative aspect-square bg-gray-100">
            <img
              src={item.url}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={onImageError}
            />
          </div>
          <CardContent className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-sm truncate" title={item.name}>
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.size)}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(item.id, item.name)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MediaGrid;
