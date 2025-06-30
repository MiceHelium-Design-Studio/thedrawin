import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, DollarSign, Gift, Image as ImageIcon } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: selectedDraw?.title || '',
    description: selectedDraw?.description || '',
    maxParticipants: selectedDraw?.maxParticipants || 100,
    ticketPrices: selectedDraw?.ticketPrices?.join(', ') || '5, 10, 15, 20, 30',
    startDate: selectedDraw?.startDate ? new Date(selectedDraw.startDate).toISOString().slice(0, 16) : '',
    endDate: selectedDraw?.endDate ? new Date(selectedDraw.endDate).toISOString().slice(0, 16) : '',
    status: selectedDraw?.status || 'open' as 'open' | 'active' | 'completed',
    goldWeightGrams: selectedDraw?.goldWeightGrams || 10
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Title Required',
        description: 'Please enter a title for the draw.'
      });
      return false;
    }

    if (!formData.startDate) {
      toast({
        variant: 'destructive',
        title: 'Start Date Required',
        description: 'Please select a start date for the draw.'
      });
      return false;
    }

    if (!formData.endDate) {
      toast({
        variant: 'destructive',
        title: 'End Date Required',
        description: 'Please select an end date for the draw.'
      });
      return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Date Range',
        description: 'End date must be after start date.'
      });
      return false;
    }

    if (formData.maxParticipants < 1) {
      toast({
        variant: 'destructive',
        title: 'Invalid Participants',
        description: 'Maximum participants must be at least 1.'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const drawData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        maxParticipants: formData.maxParticipants,
        currentParticipants: selectedDraw?.currentParticipants || 0,
        ticketPrices: formData.ticketPrices.split(',').map(price => parseFloat(price.trim())).filter(price => !isNaN(price)),
        status: formData.status,
        startDate: formData.startDate,
        endDate: formData.endDate,
        drawDate: formData.endDate, // Use end date as draw date
        bannerImage: drawImageUrl || undefined,
        imageUrl: drawImageUrl || undefined,
        goldWeightGrams: formData.goldWeightGrams
      };

      if (selectedDraw) {
        await updateDraw(selectedDraw.id, drawData);
        toast({
          title: "🎉 Draw Updated!",
          description: `"${drawData.title}" has been successfully updated.`,
          duration: 4000,
        });
      } else {
        await createDraw(drawData);
        toast({
          title: "🎊 Draw Created!",
          description: `"${drawData.title}" has been successfully created.`,
          duration: 4000,
        });
      }
      
      onSuccess();
    } catch (error) {
      console.error('Error saving draw:', error);
      toast({
        variant: 'destructive',
        title: "Creation failed",
        description: "There was a problem saving the draw. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickTicketPresets = [
    { name: 'Standard', prices: '5, 10, 15, 20, 30', label: '$5-$30' },
    { name: 'Basic', prices: '5, 10, 20', label: '$5, $10, $20' },
    { name: 'Premium', prices: '10, 15, 25, 30', label: '$10-$30' },
    { name: 'Single', prices: '5', label: '$5 Only' },
    { name: 'High Value', prices: '20, 30, 50', label: '$20-$50' }
  ];

  const statusOptions = [
    { value: 'open', label: 'Open', color: 'bg-green-100 text-green-800' },
    { value: 'active', label: 'Active', color: 'bg-blue-100 text-blue-800' },
    { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className="space-y-6 p-6 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Gift className="h-5 w-5 text-orange-500" />
                <h3 className="text-lg font-semibold">Basic Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">Draw Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter draw title..."
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description (Display Only)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the draw and what participants can win..."
                    rows={3}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Note: Description is for reference only and won't be saved to the database.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Draw Details */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-500" />
                <h3 className="text-lg font-semibold">Draw Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxParticipants" className="text-sm font-medium">Max Participants *</Label>
                  <Input
                    id="maxParticipants"
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', parseInt(e.target.value))}
                    min="1"
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="goldWeightGrams" className="text-sm font-medium">Gold Weight (grams)</Label>
                  <Input
                    id="goldWeightGrams"
                    type="number"
                    value={formData.goldWeightGrams}
                    onChange={(e) => handleInputChange('goldWeightGrams', parseFloat(e.target.value))}
                    min="0.1"
                    step="0.1"
                    className="mt-1"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Pricing */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold">Ticket Pricing</h3>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Quick Presets</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickTicketPresets.map((preset) => (
                    <Button
                      key={preset.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleInputChange('ticketPrices', preset.prices)}
                      className="text-xs"
                    >
                      {preset.name} ({preset.label})
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="ticketPrices" className="text-sm font-medium">Custom Prices *</Label>
                <Input
                  id="ticketPrices"
                  value={formData.ticketPrices}
                  onChange={(e) => handleInputChange('ticketPrices', e.target.value)}
                  placeholder="5, 10, 15, 20, 30"
                  className="mt-1"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter comma-separated values (e.g., 5, 10, 15, 20, 30)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-500" />
                <h3 className="text-lg font-semibold">Schedule</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="text-sm font-medium">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="endDate" className="text-sm font-medium">End Date *</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Image */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h3 className="text-lg font-semibold">Status & Media</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: 'open' | 'active' | 'completed') => handleInputChange('status', value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={option.color}>{option.label}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Banner Image</Label>
                  <div className="mt-1">
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Form Actions */}
        <DrawerFooter className="px-0">
          <div className="flex gap-3 w-full">
            <Button 
              type="submit" 
              disabled={isSubmitting || isUploadingDrawImage}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {selectedDraw ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {selectedDraw ? 'Update Draw' : 'Create Draw'}
                </>
              )}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="flex-1">
                Cancel
              </Button>
            </DrawerClose>
          </div>
        </DrawerFooter>
      </form>
    </div>
  );
};

export default DrawFormContent;
