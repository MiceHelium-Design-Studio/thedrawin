
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus, Eye, EyeOff } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Banner } from '../../types';
import { useDraws } from '@/context/DrawContext';
import { BannerFormContent } from './BannerFormContent';

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

const BannersManagement: React.FC = () => {
  const { banners, fetchBanners } = useDraws();
  const [isBannerDrawerOpen, setIsBannerDrawerOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleEditBanner = (banner: Banner) => {
    setSelectedBanner(banner);
    setBannerImageUrl(banner.imageUrl);
    setIsBannerDrawerOpen(true);
  };

  const resetBannerForm = () => {
    setSelectedBanner(null);
    setBannerImageUrl('');
    setIsBannerDrawerOpen(false);
  };

  const bannerTableColumns = [
    {
      accessorKey: 'imageUrl',
      header: 'Image',
      cell: ({ row }: { row: { original: Banner } }) => (
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
      cell: ({ row }: { row: { original: Banner } }) => (
        row.original.active ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-red-500" />
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Banner } }) => (
        <BannerAction banner={row.original} onEdit={handleEditBanner} />
      )
    }
  ];

  return (
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
            <BannerFormContent
              selectedBanner={selectedBanner}
              bannerImageUrl={bannerImageUrl}
              isUploading={isUploading}
              setBannerImageUrl={setBannerImageUrl}
              setIsUploading={setIsUploading}
              onSuccess={resetBannerForm}
            />
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
  );
};

export default BannersManagement;
