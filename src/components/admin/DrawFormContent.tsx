
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Draw } from '../../types';
import { useDraws } from '@/context/DrawContext';
import { ImageUploader } from './ImageUploader';
import { uploadToS3 } from '@/utils/s3Utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";

const drawFormSchema = z.object({
  title: z.string().min(2, {
    message: "Draw title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  maxParticipants: z.number().min(1, {
    message: "Max participants must be at least 1.",
  }).max(1000, {
    message: "Max participants must be less than 1000.",
  }),
  ticketPrices: z.string().refine(value => {
    try {
      const prices = value.split(',').map(Number);
      return prices.every(price => price > 0);
    } catch (error) {
      return false;
    }
  }, {
    message: "Ticket prices must be a comma-separated list of numbers greater than 0.",
  }),
  startDate: z.date(),
  endDate: z.date().min(new Date(), {
    message: "End date must be after today.",
  }),
  bannerImage: z.string().url({
    message: "Banner image must be a valid URL.",
  }).optional().or(z.literal('')),
  status: z.enum(['active', 'upcoming', 'completed']),
});

interface DrawFormContentProps {
  selectedDraw: Draw | null;
  drawImageUrl: string;
  isUploadingDrawImage: boolean;
  setDrawImageUrl: (url: string) => void;
  setIsUploadingDrawImage: (isUploading: boolean) => void;
  onSuccess: () => void;
}

export const DrawFormContent: React.FC<DrawFormContentProps> = ({
  selectedDraw,
  drawImageUrl,
  isUploadingDrawImage,
  setDrawImageUrl,
  setIsUploadingDrawImage,
  onSuccess
}) => {
  const { toast } = useToast();
  const { createDraw, updateDraw } = useDraws();

  const drawForm = useForm<z.infer<typeof drawFormSchema>>({
    resolver: zodResolver(drawFormSchema),
    defaultValues: {
      title: selectedDraw?.title || "",
      description: selectedDraw?.description || "",
      maxParticipants: selectedDraw?.maxParticipants || 100,
      ticketPrices: selectedDraw?.ticketPrices.join(', ') || "5, 10, 20",
      startDate: selectedDraw ? new Date(selectedDraw.startDate) : new Date(),
      endDate: selectedDraw ? new Date(selectedDraw.endDate) : new Date(),
      bannerImage: selectedDraw?.bannerImage || "",
      status: selectedDraw?.status || 'active',
    },
  });

  const handleDrawCreate = async (values: z.infer<typeof drawFormSchema>) => {
    try {
      const ticketPricesArray = values.ticketPrices.split(',').map(Number);
      
      const newDraw = {
        title: values.title,
        description: values.description,
        maxParticipants: values.maxParticipants,
        currentParticipants: 0,
        ticketPrices: ticketPricesArray,
        status: values.status,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        bannerImage: values.bannerImage || drawImageUrl
      };
      
      await createDraw(newDraw);
      drawForm.reset();
      onSuccess();
      toast({
        title: "Draw created",
        description: "The draw has been successfully created.",
      });
    } catch (error) {
      console.error('Error creating draw:', error);
      toast({
        variant: 'destructive',
        title: "Creation failed",
        description: "There was a problem creating the draw.",
      });
    }
  };

  const handleDrawUpdate = async (values: z.infer<typeof drawFormSchema>) => {
    if (!selectedDraw) return;
    
    try {
      const ticketPricesArray = values.ticketPrices.split(',').map(Number);
      
      const updatedDraw = {
        title: values.title,
        description: values.description,
        maxParticipants: values.maxParticipants,
        ticketPrices: ticketPricesArray,
        status: values.status,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        bannerImage: values.bannerImage || drawImageUrl
      };
      
      await updateDraw(selectedDraw.id, updatedDraw);
      drawForm.reset();
      onSuccess();
      toast({
        title: "Draw updated",
        description: "The draw has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating draw:', error);
      toast({
        variant: 'destructive',
        title: "Update failed",
        description: "There was a problem updating the draw.",
      });
    }
  };

  const handleDrawImageUpload = async (file: File) => {
    try {
      setIsUploadingDrawImage(true);
      toast({
        title: "Uploading image...",
        description: "Please wait while your image is being uploaded."
      });
      
      const { url } = await uploadToS3(file, 'draw_images');
      setDrawImageUrl(url);
      drawForm.setValue('bannerImage', url);
      
      toast({
        title: "Image uploaded",
        description: "Draw image has been uploaded successfully."
      });
    } catch (error) {
      console.error('Error uploading draw image:', error);
      toast({
        variant: 'destructive',
        title: "Upload failed",
        description: "There was a problem uploading the draw image."
      });
    } finally {
      setIsUploadingDrawImage(false);
    }
  };

  return (
    <div className="p-4 pb-0">
      <Form {...drawForm}>
        <form onSubmit={drawForm.handleSubmit(selectedDraw ? handleDrawUpdate : handleDrawCreate)} className="space-y-4">
          <div className="mb-6">
            <FormLabel className="block mb-2">Draw Image</FormLabel>
            <ImageUploader 
              onImageSelected={handleDrawImageUpload} 
              previewUrl={drawImageUrl || selectedDraw?.bannerImage}
              isUploading={isUploadingDrawImage}
            />
            {drawImageUrl && (
              <p className="text-xs text-gray-500 mt-2">
                This image will be displayed on the draw card.
              </p>
            )}
          </div>
          
          <FormField
            control={drawForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Draw Title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={drawForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Draw Description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={drawForm.control}
            name="maxParticipants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max Participants</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="100" 
                    {...field} 
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={drawForm.control}
            name="ticketPrices"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Prices (comma-separated)</FormLabel>
                <FormControl>
                  <Input placeholder="5, 10, 20" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={drawForm.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''} 
                    onChange={(e) => field.onChange(new Date(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={drawForm.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date" 
                    value={field.value instanceof Date ? format(field.value, 'yyyy-MM-dd') : ''} 
                    onChange={(e) => field.onChange(new Date(e.target.value))} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={drawForm.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="upcoming">Upcoming</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <DrawerFooter>
            <Button type="submit" className="w-full">
              {selectedDraw ? 'Update Draw' : 'Create Draw'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </Form>
    </div>
  );
};
