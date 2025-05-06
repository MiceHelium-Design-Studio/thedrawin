
import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from '@/hooks/use-toast';
import { Banner } from '../../types';
import { useDraws } from '@/context/DrawContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from "@/components/ui/switch";
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
  }),
  active: z.boolean().default(true),
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
  const { createBanner, updateBanner } = useDraws();

  const bannerForm = useForm<z.infer<typeof bannerFormSchema>>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      imageUrl: bannerImageUrl || selectedBanner?.imageUrl || "",
      linkUrl: selectedBanner?.linkUrl || "",
      active: selectedBanner?.active ?? true,
    },
  });

  const handleBannerCreate = async (values: z.infer<typeof bannerFormSchema>) => {
    try {
      const newBanner = {
        imageUrl: values.imageUrl,
        linkUrl: values.linkUrl,
        active: values.active
      };
      
      await createBanner(newBanner);
      bannerForm.reset();
      onSuccess();
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
      bannerForm.reset();
      onSuccess();
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

  // Update form values when bannerImageUrl changes
  React.useEffect(() => {
    if (bannerImageUrl) {
      bannerForm.setValue('imageUrl', bannerImageUrl);
    }
  }, [bannerImageUrl, bannerForm]);

  return (
    <div className="p-6">
      <Form {...bannerForm}>
        <form onSubmit={bannerForm.handleSubmit(selectedBanner ? handleBannerUpdate : handleBannerCreate)} className="space-y-6">
          <div className="mb-4 p-4 bg-black-light rounded-md border border-gold/10">
            <h3 className="text-sm font-medium mb-2">Unsplash Images</h3>
            <p className="text-xs text-gold-light mb-3">
              Use any of these sample Unsplash images or paste your own URL:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                "https://images.unsplash.com/photo-1627843240167-b1f9d00c5880",
                "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead",
                "https://images.unsplash.com/photo-1614028674026-a65e31bfd27c",
                "https://images.unsplash.com/photo-1616514169928-a1e40c6f791c"
              ].map((url, index) => (
                <div 
                  key={index} 
                  className="relative h-16 cursor-pointer rounded-md overflow-hidden border border-gold/20 hover:border-gold/50 transition-all"
                  onClick={() => {
                    setBannerImageUrl(url);
                    bannerForm.setValue('imageUrl', url);
                  }}
                >
                  <img src={url} alt={`Sample ${index+1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          
          {bannerForm.watch('imageUrl') && (
            <div className="relative w-full mb-4">
              <p className="text-sm mb-1">Preview:</p>
              <img 
                src={bannerForm.watch('imageUrl')} 
                alt="Banner preview" 
                className="w-full h-40 object-cover rounded-md border border-gold/20"
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
                  Paste an Unsplash image URL or any other image URL.
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
                  <FormLabel className="text-base">
                    Active
                  </FormLabel>
                  <FormDescription>
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
          
          <DrawerFooter>
            <Button type="submit" className="w-full" disabled={isUploading}>
              {selectedBanner ? 'Update Banner' : 'Create Banner'}
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
