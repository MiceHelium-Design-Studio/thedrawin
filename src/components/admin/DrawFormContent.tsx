import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { useDraws } from '@/context/DrawContext';
import { Draw } from '@/types';
import { toast } from '@/hooks/use-toast';
import { ImageUploader } from './ImageUploader';

interface DrawFormContentProps {
  selectedDraw: Draw | null;
  drawImageUrl: string;
  isUploadingDrawImage: boolean;
  setDrawImageUrl: (url: string) => void;
  setIsUploadingDrawImage: (uploading: boolean) => void;
  onSuccess: () => void;
}

const DrawFormContent: React.FC<DrawFormContentProps> = ({
  selectedDraw,
  drawImageUrl,
  isUploadingDrawImage,
  setDrawImageUrl,
  setIsUploadingDrawImage,
  onSuccess
}) => {
  const { createDraw, updateDraw } = useDraws();
  const [formData, setFormData] = useState({
    title: selectedDraw?.title || '',
    description: selectedDraw?.description || '',
    maxParticipants: selectedDraw?.maxParticipants || 100,
    ticketPrices: selectedDraw?.ticketPrices?.join(', ') || '10',
    startDate: selectedDraw?.startDate ? new Date(selectedDraw.startDate).toISOString().slice(0, 16) : '',
    endDate: selectedDraw?.endDate ? new Date(selectedDraw.endDate).toISOString().slice(0, 16) : '',
    status: selectedDraw?.status || 'upcoming' as 'upcoming' | 'active' | 'open' | 'completed'
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const drawData = {
        title: formData.title,
        description: formData.description,
        maxParticipants: formData.maxParticipants,
        currentParticipants: selectedDraw?.currentParticipants || 0,
        ticketPrices: formData.ticketPrices.split(',').map(price => parseFloat(price.trim())),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        bannerImage: drawImageUrl || undefined
      };

      if (selectedDraw) {
        await updateDraw(selectedDraw.id, drawData);
      } else {
        await createDraw(drawData);
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving draw:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save draw. Please try again.'
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="maxParticipants">Max Participants</Label>
        <Input
          id="maxParticipants"
          type="number"
          value={formData.maxParticipants}
          onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
          min="1"
          required
        />
      </div>

      <div>
        <Label htmlFor="ticketPrices">Ticket Prices (comma separated)</Label>
        <Input
          id="ticketPrices"
          value={formData.ticketPrices}
          onChange={(e) => handleInputChange('ticketPrices', e.target.value)}
          placeholder="10, 20, 50"
          required
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value: 'upcoming' | 'active' | 'open' | 'completed') => handleInputChange('status', value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="datetime-local"
          value={formData.startDate}
          onChange={(e) => handleInputChange('startDate', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="endDate">End Date</Label>
        <Input
          id="endDate"
          type="datetime-local"
          value={formData.endDate}
          onChange={(e) => handleInputChange('endDate', e.target.value)}
          required
        />
      </div>

      <div>
        <Label>Banner Image</Label>
        <ImageUploader
          previewUrl={drawImageUrl}
          onImageSelected={(file) => {
            setIsUploadingDrawImage(true);
            // Mock upload for now
            setTimeout(() => {
              const mockUrl = URL.createObjectURL(file);
              setDrawImageUrl(mockUrl);
              setIsUploadingDrawImage(false);
            }, 1000);
          }}
          isUploading={isUploadingDrawImage}
        />
      </div>

      <DrawerFooter>
        <Button type="submit" disabled={isUploadingDrawImage}>
          {selectedDraw ? 'Update Draw' : 'Create Draw'}
        </Button>
        <DrawerClose asChild>
          <Button variant="outline">Cancel</Button>
        </DrawerClose>
      </DrawerFooter>
    </form>
  );
};

export default DrawFormContent;
