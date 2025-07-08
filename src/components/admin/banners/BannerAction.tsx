
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
import { useTranslation } from 'react-i18next';

interface BannerActionProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
}

const BannerAction: React.FC<BannerActionProps> = ({ banner, onEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const { fetchBanners } = useDraws();
  const { t } = useTranslation();
  
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
        title: t('admin.banners.bannerDeleted'),
        description: t('admin.banners.bannerDeletedDescription'),
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        variant: 'destructive',
        title: t('admin.banners.deletionFailed'),
        description: t('admin.banners.deletionFailedDescription'),
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
        {t('common.edit')}
      </Button>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            {t('common.delete')}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.banners.deleteConfirmationTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.banners.deleteConfirmationDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? t('admin.banners.deleting') : t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BannerAction;
