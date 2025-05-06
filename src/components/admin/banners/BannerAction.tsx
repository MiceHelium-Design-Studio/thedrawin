
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

interface BannerActionProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
}

const BannerAction: React.FC<BannerActionProps> = ({ banner, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { deleteBanner } = useDraws();
  
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Attempting to delete banner with ID:', banner.id);
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
        description: "There was a problem deleting the banner. Please check console for details.",
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
