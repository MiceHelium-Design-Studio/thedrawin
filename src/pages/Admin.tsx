import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Edit, 
  Trash, 
  ImagePlus, 
  Link, 
  Check, 
  X,
  Upload,
  Eye,
  EyeOff,
  Image,
  LayoutDashboard,
  Tag,
  Images,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator
} from "@/components/ui/menubar";
import { createDraw, updateDraw, deleteDraw, createBanner, updateBanner, deleteBanner, uploadMedia, deleteMedia } from '../server-actions';
import { Draw, Banner } from '../types';
import { uploadToS3, deleteFromS3, BucketType } from '@/utils/s3Utils';
import { useDraws } from '@/context/DrawContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

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

const bannerFormSchema = z.object({
  imageUrl: z.string().url({
    message: "Image URL must be a valid URL.",
  }),
  linkUrl: z.string().url({
    message: "Link URL must be a valid URL.",
  }),
  active: z.boolean().default(true),
});

const ImageUploader = ({ onImageSelected, previewUrl = '', isUploading = false }: { 
  onImageSelected: (file: File) => void; 
  previewUrl?: string;
  isUploading?: boolean;
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImageSelected(files[0]);
    }
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="flex flex-col items-center w-full">
      {isUploading ? (
        <div className="flex items-center justify-center p-6 border border-gray-200 rounded-lg w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">Uploading image...</p>
          </div>
        </div>
      ) : previewUrl ? (
        <div className="relative w-full">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border border-gray-200" 
          />
          <Button 
            type="button" 
            size="sm" 
            variant="outline" 
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={triggerFileInput}
          >
            <Edit className="h-4 w-4 mr-1" />
            Change
          </Button>
        </div>
      ) : (
        <Button 
          type="button" 
          variant="outline" 
          onClick={triggerFileInput}
          className="w-full flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex flex-col items-center gap-2">
            <ImagePlus className="h-10 w-10 text-gray-400" />
            <span className="text-sm text-gray-500">Click to select an image</span>
          </div>
        </Button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

const Admin: React.FC = () => {
  const { toast } = useToast();
  const { draws, banners, createDraw, updateDraw, deleteDraw, createBanner, updateBanner, deleteBanner, uploadMedia, deleteMedia } = useDraws();
  const [isDrawDrawerOpen, setIsDrawDrawerOpen] = useState(false);
  const [isBannerDrawerOpen, setIsBannerDrawerOpen] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [drawToDelete, setDrawToDelete] = useState<string | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerFileKey, setBannerFileKey] = useState('');
  const [activeTab, setActiveTab] = useState('draws');
  const [drawImageUrl, setDrawImageUrl] = useState('');
  const [isUploadingDrawImage, setIsUploadingDrawImage] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user?.isAdmin) {
      toast({
        variant: 'destructive',
        title: 'Unauthorized',
        description: 'You do not have permission to access this page.',
      });
      navigate('/');
    }
  }, [user, navigate, toast]);
  
  if (!user?.isAdmin) {
    return null;
  }

  const drawForm = useForm<z.infer<typeof drawFormSchema>>({
    resolver: zodResolver(drawFormSchema),
    defaultValues: {
      title: "",
      description: "",
      maxParticipants: 100,
      ticketPrices: "5, 10, 20",
      startDate: new Date(),
      endDate: new Date(),
      bannerImage: "",
      status: 'active',
    },
  });
  
  const bannerForm = useForm<z.infer<typeof bannerFormSchema>>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      imageUrl: "",
      linkUrl: "",
      active: true,
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
      setIsDrawDrawerOpen(false);
      drawForm.reset();
      setDrawImageUrl('');
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
      setIsDrawDrawerOpen(false);
      drawForm.reset();
      setSelectedDraw(null);
      setDrawImageUrl('');
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
  
  const confirmDeleteDraw = (id: string) => {
    setDrawToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDrawDelete = async () => {
    if (!drawToDelete) return;
    
    try {
      await deleteDraw(drawToDelete);
      setIsDeleteDialogOpen(false);
      setDrawToDelete(null);
      toast({
        title: "Draw deleted",
        description: "The draw has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting draw:', error);
      toast({
        variant: 'destructive',
        title: "Deletion failed",
        description: "There was a problem deleting the draw.",
      });
    }
  };

  const handleBannerCreate = async (values: z.infer<typeof bannerFormSchema>) => {
    try {
      const newBanner = {
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl,
        active: values.active
      };
      
      await createBanner(newBanner);
      setIsBannerDrawerOpen(false);
      bannerForm.reset();
      setBannerImageUrl('');
      setBannerFileKey('');
      toast({
        title: "Banner created",
        description: "The banner has been successfully created.",
      });
    } catch (error) {
      console.error('Error creating banner:', error);
      toast({
        variant: 'destructive',
        title: "Creation failed",
        description: "There was a problem creating the banner.",
      });
    }
  };

  const handleBannerUpdate = async (values: z.infer<typeof bannerFormSchema>) => {
    if (!selectedBanner) return;
    
    try {
      const updatedBanner = {
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl,
        active: values.active
      };
      
      await updateBanner(selectedBanner.id, updatedBanner);
      setIsBannerDrawerOpen(false);
      bannerForm.reset();
      setSelectedBanner(null);
      setBannerImageUrl('');
      setBannerFileKey('');
      toast({
        title: "Banner updated",
        description: "The banner has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        variant: 'destructive',
        title: "Update failed",
        description: "There was a problem updating the banner.",
      });
    }
  };
  
  const confirmDeleteBanner = (id: string) => {
    setBannerToDelete(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleBannerDelete = async () => {
    if (!bannerToDelete) return;
    
    try {
      await deleteBanner(bannerToDelete);
      setIsDeleteDialogOpen(false);
      setBannerToDelete(null);
      toast({
        title: "Banner deleted",
        description: "The banner has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: "Deletion failed",
        description: "There was a problem deleting the banner.",
      });
    }
  };

  const drawTableColumns = [
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'maxParticipants',
      header: 'Max Participants',
    },
    {
      accessorKey: 'currentParticipants',
      header: 'Current Participants',
    },
    {
      accessorKey: 'ticketPrices',
      header: 'Ticket Prices',
      cell: ({ row }) => row.original.ticketPrices.join(', '),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
    },
    {
      accessorKey: 'bannerImage',
      header: 'Image',
      cell: ({ row }) => row.original.bannerImage ? (
        <a href={row.original.bannerImage} target="_blank" rel="noopener noreferrer">
          <img src={row.original.bannerImage} alt="Draw banner" className="w-20 h-12 object-cover rounded" />
        </a>
      ) : (
        <span className="text-gray-400">No image</span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const draw = row.original;
        
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedDraw(draw);
                drawForm.setValue('title', draw.title);
                drawForm.setValue('description', draw.description);
                drawForm.setValue('maxParticipants', draw.maxParticipants);
                drawForm.setValue('ticketPrices', draw.ticketPrices.join(', '));
                drawForm.setValue('startDate', new Date(draw.startDate));
                drawForm.setValue('endDate', new Date(draw.endDate));
                drawForm.setValue('bannerImage', draw.bannerImage || '');
                drawForm.setValue('status', draw.status);
                setDrawImageUrl(draw.bannerImage || '');
                setIsDrawDrawerOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => confirmDeleteDraw(draw.id)}
            >
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        );
      }
    }
  ];
  
  const bannerTableColumns = [
    {
      accessorKey: 'imageUrl',
      header: 'Image',
      cell: ({ row }) => (
        <a href={row.original.imageUrl} target="_blank" rel="noopener noreferrer">
          <img src={row.original.imageUrl} alt="Banner" className="w-20 h-12 object-cover rounded" />
        </a>
      ),
    },
    {
      accessorKey: 'linkUrl',
      header: 'Link',
    },
    {
      accessorKey: 'active',
      header: 'Active',
      cell: ({ row }) => (
        row.original.active ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-500" />
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const banner = row.original;
        const [isDeleting, setIsDeleting] = useState(false);
        
        return (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                setSelectedBanner(banner);
                bannerForm.setValue('imageUrl', banner.imageUrl);
                bannerForm.setValue('linkUrl', banner.linkUrl);
                bannerForm.setValue('active', banner.active);
                setBannerImageUrl(banner.imageUrl);
                setIsBannerDrawerOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={isDeleting}>
                  <Trash className="h-4 w-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the banner from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    const handleDelete = async () => {
                      try {
                        setIsDeleting(true);
                        const fileKey = banner.imageUrl.split('/').pop() || '';
                        await deleteFromS3(fileKey, 'banners');
                        await deleteBanner(banner.id);
                        toast({
                          title: "Banner deleted",
                          description: "The banner has been successfully deleted.",
                        });
                      } catch (error) {
                        console.error('Error deleting banner:', error);
                        toast({
                          variant: 'destructive',
                          title: "Deletion failed",
                          description: "There was a problem deleting the banner.",
                        });
                      } finally {
                        setIsDeleting(false);
                      }
                    };
                    handleDelete();
                  }}>
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      }
    }
  ];
  
  const handleBannerUpload = async (file: File) => {
    try {
      setIsUploading(true);
      toast({
        title: "Uploading image...",
        description: "Please wait while your image is being uploaded."
      });
      
      const { url, key } = await uploadToS3(file, 'banners');
      setBannerImageUrl(url);
      setBannerFileKey(key);
      bannerForm.setValue('imageUrl', url);
      
      toast({
        title: "Image uploaded",
        description: "Banner image has been uploaded successfully."
      });
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast({
        variant: 'destructive',
        title: "Upload failed",
        description: "There was a problem uploading the banner image."
      });
    } finally {
      setIsUploading(false);
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
    <div className="flex flex-col min-h-screen">
      <Menubar className="rounded-none border-b border-none px-2 lg:px-4 sticky top-0 z-10 bg-background">
        <div className="flex items-center mr-4">
          <h2 className="font-semibold text-lg">Admin Dashboard</h2>
        </div>
        
        <MenubarMenu>
          <MenubarTrigger className={activeTab === 'draws' ? 'bg-accent' : ''} onClick={() => setActiveTab('draws')}>
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Draws
          </MenubarTrigger>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className={activeTab === 'banners' ? 'bg-accent' : ''} onClick={() => setActiveTab('banners')}>
            <Images className="w-4 h-4 mr-2" />
            Banners
          </MenubarTrigger>
        </MenubarMenu>
        
        <MenubarMenu>
          <MenubarTrigger className={activeTab === 'stats' ? 'bg-accent' : ''} onClick={() => setActiveTab('stats')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Stats
          </MenubarTrigger>
        </MenubarMenu>
        
        <div className="ml-auto flex items-center">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </Menubar>
      
      <div className="container mx-auto py-8 flex-1 overflow-auto">
        {activeTab === 'draws' && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Draws</h2>
              <Drawer open={isDrawDrawerOpen} onOpenChange={setIsDrawDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Draw
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>{selectedDraw ? 'Edit Draw' : 'Create Draw'}</DrawerTitle>
                    <DrawerDescription>
                      {selectedDraw ? 'Edit the draw details.' : 'Create a new draw for users to participate in.'}
                    </DrawerDescription>
                  </DrawerHeader>
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
                </DrawerContent>
              </Drawer>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {drawTableColumns.map((column) => (
                    <TableHead key={column.accessorKey || column.id || column.header}>{column.header}</TableHead>
                  ))}
                </TableHeader>
                <TableBody>
                  {draws.map((draw) => (
                    <TableRow key={draw.id}>
                      {drawTableColumns.map((column) => {
                        const key = column.accessorKey || column.id || column.header;
                        const value = column.cell
                          ? column.cell({ row: { original: draw } })
                          : draw[column.accessorKey as keyof Draw];
                        return <TableCell key={key}>{value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}

        {activeTab === 'banners' && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Banners</h2>
              <Drawer open={isBannerDrawerOpen} onOpenChange={setIsBannerDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Banner
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>{selectedBanner ? 'Edit Banner' : 'Create Banner'}</DrawerTitle>
                    <DrawerDescription>
                      {selectedBanner ? 'Edit the banner details.' : 'Create a new banner to display on the site.'}
                    </DrawerDescription>
                  </DrawerHeader>
                  <div className="p-6">
                    <Form {...bannerForm}>
                      <form onSubmit={bannerForm.handleSubmit(selectedBanner ? handleBannerUpdate : handleBannerCreate)} className="space-y-6">
                        <div className="mb-6">
                          <FormLabel className="block mb-2">Banner Image</FormLabel>
                          <ImageUploader 
                            onImageSelected={handleBannerUpload} 
                            previewUrl={bannerImageUrl}
                            isUploading={isUploading}
                          />
                        </div>
                        
                        <FormField
                          control={bannerForm.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com/image.jpg" {...field} />
                              </FormControl>
                              <FormDescription>
                                This will be automatically filled when you upload an image above.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bannerForm.control}
                          name="linkUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Link URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                Where users will be directed when they click the banner.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={bannerForm.control}
                          name="active"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Active</FormLabel>
                                <FormDescription>
                                  This banner will be displayed on the site.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        
                        <DrawerFooter className="px-0">
                          <Button 
                            type="submit" 
                            className="w-full" 
                            disabled={isUploading || (!bannerImageUrl && !bannerForm.getValues('imageUrl'))}
                          >
                            {selectedBanner ? 'Update Banner' : 'Create Banner'}
                          </Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </form>
                    </Form>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  {bannerTableColumns.map((column) => (
                    <TableHead key={column.accessorKey || column.id || column.header}>{column.header}</TableHead>
                  ))}
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id}>
                      {bannerTableColumns.map((column) => {
                        const key = column.accessorKey || column.id || column.header;
                        const value = column.cell
                          ? column.cell({ row: { original: banner } })
                          : banner[column.accessorKey as keyof Banner];
                        return <TableCell key={key}>{value}</TableCell>;
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}
        
        {activeTab === 'stats' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Statistics</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Total Draws</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{draws.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Active Draws</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{draws.filter(d => d.status === 'active').length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <h3 className="text-lg font-medium">Banners</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{banners.length}</p>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setDrawToDelete(null);
              setBannerToDelete(null);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (drawToDelete) {
                handleDrawDelete();
              } else if (bannerToDelete) {
                handleBannerDelete();
              }
            }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Admin;
