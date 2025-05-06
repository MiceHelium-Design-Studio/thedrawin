
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';

interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadDate: string;
}

interface MediaListProps {
  media: MediaItem[];
  onDelete: (id: string, name: string) => Promise<void>;
  onImageError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  formatFileSize: (bytes: number) => string;
}

const MediaList: React.FC<MediaListProps> = ({ 
  media, 
  onDelete, 
  onImageError,
  formatFileSize
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Preview</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {media.map(item => (
            <TableRow key={item.id}>
              <TableCell>
                <div className="w-16 h-16 bg-gray-100 rounded">
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover rounded"
                    onError={onImageError}
                  />
                </div>
              </TableCell>
              <TableCell>{item.name}</TableCell>
              <TableCell>{formatFileSize(item.size)}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(item.uploadDate), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item.id, item.name)}
                  className="text-red-600 hover:text-red-700 p-0 h-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MediaList;
