
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Image, 
  Trash2, 
  UploadCloud, 
  Search,
  SortAsc,
  SortDesc,
  Filter
} from 'lucide-react';
import { useDraws } from '../context/DrawContext';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';

const MediaLibrary: React.FC = () => {
  const { media, loading, uploadMedia, deleteMedia } = useDraws();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedItem = await uploadMedia(files[0]);
      toast({
        title: 'File uploaded',
        description: `${uploadedItem.name} has been uploaded successfully.`,
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was an error uploading your file.',
      });
      console.error(error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteMedia(id);
      toast({
        title: 'File deleted',
        description: `${name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: 'There was an error deleting your file.',
      });
      console.error(error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const filteredMedia = media
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'asc') {
        return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
      } else {
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      }
    });

  return (
    <div className="container mx-auto px-4 py-6 pb-20">
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Media Library</h1>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Input 
            placeholder="Search files..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gold/30 focus:border-gold"
          />

          <Button
            variant="outline"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border-gold/30 text-gold"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
            className="border-gold/30 text-gold"
          >
            {view === 'grid' ? (
              <Filter className="h-4 w-4" />
            ) : (
              <Image className="h-4 w-4" />
            )}
          </Button>

          <Button 
            onClick={() => fileInputRef.current?.click()} 
            className="bg-gold hover:bg-gold-dark text-black"
            disabled={loading}
          >
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden"
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
      </div>

      {filteredMedia.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No media files found.</p>
          </CardContent>
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredMedia.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <img
                  src={item.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
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
                        onClick={() => handleDelete(item.id, item.name)}
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
      ) : (
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
              {filteredMedia.map(item => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-16 h-16 bg-gray-100 rounded">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded"
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
                      onClick={() => handleDelete(item.id, item.name)}
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
      )}
    </div>
  );
};

export default MediaLibrary;
