
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, ImagePlus, Plus } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { Draw } from '../../types';
import { useDraws } from '@/context/DrawContext';
import { DrawFormContent } from './DrawFormContent';

interface DrawActionProps {
  draw: Draw;
  onEdit: (draw: Draw) => void;
  onDeleteConfirm: (id: string) => void;
}

const DrawAction: React.FC<DrawActionProps> = ({ draw, onEdit, onDeleteConfirm }) => {
  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => onEdit(draw)}
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button>
      <Button 
        variant="destructive" 
        size="sm"
        onClick={() => onDeleteConfirm(draw.id)}
      >
        <Trash className="h-4 w-4 mr-2" />
        Delete
      </Button>
    </div>
  );
};

const DrawsManagement: React.FC = () => {
  const { toast } = useToast();
  const { draws, deleteDraw } = useDraws();
  const [isDrawDrawerOpen, setIsDrawDrawerOpen] = useState(false);
  const [selectedDraw, setSelectedDraw] = useState<Draw | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [drawToDelete, setDrawToDelete] = useState<string | null>(null);
  const [drawImageUrl, setDrawImageUrl] = useState('');
  const [isUploadingDrawImage, setIsUploadingDrawImage] = useState(false);

  const handleEditDraw = (draw: Draw) => {
    setSelectedDraw(draw);
    setDrawImageUrl(draw.bannerImage || '');
    setIsDrawDrawerOpen(true);
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

  const resetDrawForm = () => {
    setSelectedDraw(null);
    setDrawImageUrl('');
    setIsDrawDrawerOpen(false);
  };

  const drawTableColumns = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'description', header: 'Description' },
    { accessorKey: 'maxParticipants', header: 'Max Participants' },
    { accessorKey: 'currentParticipants', header: 'Current Participants' },
    {
      accessorKey: 'ticketPrices',
      header: 'Ticket Prices',
      cell: ({ row }: { row: { original: Draw } }) => row.original.ticketPrices.join(', '),
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }: { row: { original: Draw } }) => new Date(row.original.startDate).toLocaleDateString(),
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }: { row: { original: Draw } }) => new Date(row.original.endDate).toLocaleDateString(),
    },
    { accessorKey: 'status', header: 'Status' },
    {
      accessorKey: 'bannerImage',
      header: 'Image',
      cell: ({ row }: { row: { original: Draw } }) => row.original.bannerImage ? (
        <a href={row.original.bannerImage} target="_blank" rel="noopener noreferrer">
          <img src={row.original.bannerImage} alt="Draw banner" className="w-20 h-12 object-cover rounded" />
        </a>
      ) : (
        <span className="text-gray-400">No image</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Draw } }) => (
        <DrawAction 
          draw={row.original} 
          onEdit={handleEditDraw} 
          onDeleteConfirm={confirmDeleteDraw} 
        />
      )
    }
  ];

  return (
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
            <DrawFormContent 
              selectedDraw={selectedDraw}
              drawImageUrl={drawImageUrl}
              isUploadingDrawImage={isUploadingDrawImage}
              setDrawImageUrl={setDrawImageUrl}
              setIsUploadingDrawImage={setIsUploadingDrawImage}
              onSuccess={resetDrawForm}
            />
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this draw from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDrawToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDrawDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
};

export default DrawsManagement;
