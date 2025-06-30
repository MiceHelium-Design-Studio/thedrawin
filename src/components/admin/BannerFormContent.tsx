import React, { useRef, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { Banner } from '../../types';
import { useDraws } from '@/context/DrawContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Link, ImagePlus, Edit, Check } from 'lucide-react';
import { useBannerImageUpload } from '@/hooks/useBannerImageUpload';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";

const bannerFormSchema = z.object({
  imageUrl: z.string().url({
    message: "Image URL must be a valid URL.",
  }),
  linkUrl: z.string().url({
    message: "Link URL must be a valid URL.",
  }).optional().or(z.literal('')).transform(val => val || '/draws'),
  title: z.string().optional(),
  active: z.boolean().default(true),
  position: z.number().optional(),
});

interface BannerFormContentProps {
  selectedBanner: Banner | null;
  bannerImageUrl: string;
  isUploading: boolean;
  setBannerImageUrl: React.Dispatch<React.SetStateAction<string>>;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  onSuccess: () => void;
}

export const BannerFormContent: React.FC<BannerFormContentProps> = ({
  selectedBanner,
  bannerImageUrl,
  isUploading,
  setBannerImageUrl,
  setIsUploading,
  onSuccess
}) => {
  const { toast } = useToast();
  const { createBanner, updateBanner, banners } = useDraws();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState(bannerImageUrl || '');
  const [imageUploadTab, setImageUploadTab] = useState<'upload' | 'url'>('upload');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  const {
    imageFile,
    imagePreview,
    uploading,
    handleImageChange,
    uploadBannerImage,
    clearImageState
  } = useBannerImageUpload();

  const bannerForm = useForm<z.infer<typeof bannerFormSchema>>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      imageUrl: bannerImageUrl || selectedBanner?.imageUrl || "",
      linkUrl: selectedBanner?.linkUrl || "/draws",
      title: selectedBanner?.title || "",
      active: selectedBanner?.active ?? true,
      position: selectedBanner?.position || banners.length + 1,
    },
  });

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    
    setIsUploading(true);
    setUploadSuccess(false);
    
    const uploadedUrl = await uploadBannerImage();
    if (uploadedUrl) {
      setBannerImageUrl(uploadedUrl);
      bannerForm.setValue('imageUrl', uploadedUrl);
      clearImageState();
      
      setUploadSuccess(true);
      
      toast({
        title: '🎉 Banner Image Uploaded!',
        description: 'Your banner image has been automatically uploaded.',
        duration: 3000,
      });
      
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    }
    setIsUploading(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setBannerImageUrl(urlInput.trim());
      bannerForm.setValue('imageUrl', urlInput.trim());
      toast({
        title: '✅ Image URL Set!',
        description: 'Banner image URL has been updated.',
        duration: 2000,
      });
    }
  };

  const handleBannerCreate = async (values: z.infer<typeof bannerFormSchema>) => {
    try {
      const newBanner = {
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl || '/draws',
        title: values.title || '',
        active: values.active,
        position: values.position || banners.length + 1
      };
      
      await createBanner(newBanner);
      bannerForm.reset();
      onSuccess();
      toast({
        title: "🎊 Banner Created Successfully!",
        description: "Your new banner has been created.",
        duration: 3000,
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
        linkUrl: values.linkUrl || '/draws',
        title: values.title || '',
        active: values.active,
        position: values.position || selectedBanner.position
      };
      
      await updateBanner(selectedBanner.id, updatedBanner);
      bannerForm.reset();
      onSuccess();
      toast({
        title: "✨ Banner Updated Successfully!",
        description: "Your banner changes have been saved.",
        duration: 3000,
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

  // Auto-upload when image file is selected
  React.useEffect(() => {
    if (imageFile && !uploading && !isUploading) {
      handleUploadImage();
    }
  }, [imageFile]);

  React.useEffect(() => {
    if (bannerImageUrl) {
      bannerForm.setValue('imageUrl', bannerImageUrl);
      setUrlInput(bannerImageUrl);
    }
  }, [bannerImageUrl, bannerForm]);

  return (
    <div className="px-6 pb-2 max-h-[80vh] overflow-y-auto">
      <Form {...bannerForm}>
        <form onSubmit={bannerForm.handleSubmit(selectedBanner ? handleBannerUpdate : handleBannerCreate)} className="space-y-4">
          
          <FormField
            control={bannerForm.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-white">Banner Image</FormLabel>
                <FormControl>
                  <div className="space-y-3">
                    <Tabs value={imageUploadTab} onValueChange={(value) => setImageUploadTab(value as 'upload' | 'url')}>
                      <TabsList className="grid w-full grid-cols-2 h-8">
                        <TabsTrigger value="upload" className="text-xs">
                          <Upload className="w-3 h-3 mr-1" />
                          Upload
                        </TabsTrigger>
                        <TabsTrigger value="url" className="text-xs">
                          <Link className="w-3 h-3 mr-1" />
                          URL
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="upload" className="space-y-3 mt-3">
                        {field.value && !imageFile ? (
                          <div className="relative w-full">
                            <img 
                              src={field.value} 
                              alt="Banner preview" 
                              className="w-full h-32 object-cover rounded-lg border border-gold/20" 
                              onError={() => {
                                toast({
                                  variant: 'destructive',
                                  title: "Invalid image URL",
                                  description: "The current image URL could not be loaded."
                                });
                              }}
                            />
                            <Button 
                              type="button" 
                              size="sm" 
                              variant="outline" 
                              className="absolute top-2 right-2 bg-black/80 hover:bg-black border-gold/30 text-gold h-7 px-2"
                              onClick={triggerFileInput}
                              disabled={isUploading || uploading}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Change
                            </Button>
                          </div>
                        ) : imageFile ? (
                          <div className="space-y-3">
                            <div className="relative w-full">
                              <img 
                                src={imagePreview!} 
                                alt="Banner preview" 
                                className="w-full h-32 object-cover rounded-lg border border-gold/20" 
                              />
                              <Button 
                                type="button" 
                                size="sm" 
                                variant="outline" 
                                className="absolute top-2 right-2 bg-black/80 hover:bg-black border-gold/30 text-gold h-7 px-2"
                                onClick={triggerFileInput}
                                disabled={isUploading || uploading}
                              >
                                <Edit className="h-3 w-3 mr-1" />
                                Change
                              </Button>
                            </div>
                            
                            {/* Auto-upload status display */}
                            <div className={`w-full h-9 flex items-center justify-center rounded-md font-medium transition-all duration-300 ${
                              uploadSuccess 
                                ? 'bg-green-500/20 border border-green-500/50 text-green-400' 
                                : uploading || isUploading
                                ? 'bg-gold/20 border border-gold/50 text-gold'
                                : 'bg-blue-500/20 border border-blue-500/50 text-blue-400'
                            }`}>
                              {uploading || isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gold mr-2"></div>
                                  Auto-uploading...
                                </>
                              ) : uploadSuccess ? (
                                <>
                                  <Check className="w-3 h-3 mr-2" />
                                  Upload Successful!
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3 h-3 mr-2" />
                                  Ready to upload
                                </>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={triggerFileInput}
                            disabled={isUploading || uploading}
                            className="w-full flex items-center justify-center h-24 border-2 border-dashed border-gold/30 rounded-lg bg-black-light hover:bg-black hover:border-gold/50 transition-colors"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <ImagePlus className="h-8 w-8 text-gold/70" />
                              <span className="text-xs text-white/80">Click to select and auto-upload</span>
                              <span className="text-xs text-white/60">Image will upload automatically</span>
                            </div>
                          </Button>
                        )}
                      </TabsContent>

                      <TabsContent value="url" className="space-y-3 mt-3">
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input 
                              placeholder="https://example.com/banner.jpg" 
                              value={urlInput}
                              onChange={(e) => setUrlInput(e.target.value)}
                              disabled={isUploading || uploading}
                              className="flex-1 h-9 text-sm text-black"
                            />
                            <Button
                              type="button"
                              onClick={handleUrlSubmit}
                              disabled={!urlInput.trim() || isUploading || uploading}
                              variant="outline"
                              className="border-gold/30 text-gold hover:bg-gold/10 h-9 px-3"
                            >
                              Set
                            </Button>
                          </div>
                          
                          <div className="p-3 bg-black-light rounded-md border border-gold/10">
                            <h3 className="text-xs font-medium mb-2 text-white">Quick Select</h3>
                            <div className="grid grid-cols-4 gap-1">
                              {[
                                "https://images.unsplash.com/photo-1627843240167-b1f9d00c5880",
                                "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
                                "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c",
                                "https://images.unsplash.com/photo-1616514169928-a1e40c6f791c"
                              ].map((url, index) => (
                                <div 
                                  key={index} 
                                  className="relative h-12 cursor-pointer rounded-md overflow-hidden border border-gold/20 hover:border-gold/50 transition-all"
                                  onClick={() => {
                                    if (!isUploading && !uploading) {
                                      setUrlInput(url);
                                      setBannerImageUrl(url);
                                      bannerForm.setValue('imageUrl', url);
                                    }
                                  }}
                                >
                                  <img src={url} alt={`Sample ${index+1}`} className="w-full h-full object-cover" />
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {field.value && (
                            <div className="relative w-full">
                              <p className="text-xs mb-1 text-white/80">Preview:</p>
                              <img 
                                src={field.value} 
                                alt="Banner preview" 
                                className="w-full h-24 object-cover rounded-md border border-gold/20"
                                onError={() => {
                                  toast({
                                    variant: 'destructive',
                                    title: "Invalid image URL",
                                    description: "The image URL could not be loaded."
                                  });
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileSelect}
                      disabled={isUploading || uploading}
                    />
                  </div>
                </FormControl>
                {/* <FormDescription className="text-xs text-white/70">
                  Upload a file (auto-uploads when selected) or provide an image URL.
                </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={bannerForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white">Title (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Banner Title" {...field} className="h-9 text-sm text-black" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={bannerForm.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-white">Position</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      placeholder="1" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      className="h-9 text-sm text-black"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={bannerForm.control}
            name="linkUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-white">Link URL</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com" {...field} className="h-9 text-sm text-black" />
                </FormControl>
                <FormDescription className="text-xs text-white/70">
                  Where users go when they click the banner.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={bannerForm.control}
            name="active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel className="text-sm font-medium text-white">
                    Active
                  </FormLabel>
                  <FormDescription className="text-xs text-white/70">
                    Make this banner visible on the site.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <DrawerFooter className="px-0 pt-4">
            <Button type="submit" className="w-full h-10" disabled={isUploading}>
              {selectedBanner ? 'Update Banner' : 'Create Banner'}
            </Button>
            <DrawerClose asChild>
              <Button variant="outline" className="h-9">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </Form>
    </div>
  );
};
