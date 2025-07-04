
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { Banner } from '@/types';
import { useDraws } from '@/context/DrawContext';
import { supabase } from '@/integrations/supabase/client';

interface BannerActionProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
}

const BannerAction: React.FC<BannerActionProps> = ({ banner, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { fetchBanners } = useDraws();
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Attempting to delete banner with ID:', banner.id);
      
      // Direct database operation instead of using Context
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', banner.id);

      if (error) {
        console.error('Database error deleting banner:', error);
        throw error;
      }
      
      // Close dialog after successful deletion
      setIsDialogOpen(false);
      
      // Refresh the banners list
      await fetchBanners();
      
      toast({
        title: 'Banner deleted',
        description: 'The banner has been successfully removed.',
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: 'Deletion failed',
        description: 'There was a problem deleting the banner. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(banner)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
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
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannerAction;
