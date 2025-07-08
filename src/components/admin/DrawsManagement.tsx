import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash, Plus, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Draw } from '../../types';
import { useDraws } from '@/context/DrawContext';
import DrawFormContent from './DrawFormContent';

interface DrawActionProps {
  draw: Draw;
  onEdit: (draw: Draw) => void;
  onDeleteConfirm: (id: string) => void;
}

const DrawAction: React.FC<DrawActionProps> = ({ draw, onEdit, onDeleteConfirm }) => {
  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(draw)}
        className="h-8 px-2"
      >
        <Edit className="h-3 w-3" />
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={() => onDeleteConfirm(draw.id)}
        className="h-8 px-2"
      >
        <Trash className="h-3 w-3" />
      </Button>
    </div>
  );
};

const DrawsManagement: React.FC = () => {
  const { toast } = useToast();
  const { draws, deleteDraw, fetchDraws } = useDraws();
  const { t } = useTranslation();
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
        title: t('admin.draws.drawDeleted'),
        description: t('admin.draws.drawDeletedDescription'),
      });
    } catch (error) {
      console.error('Error deleting draw:', error);
      toast({
        variant: 'destructive',
        title: t('admin.draws.deletionFailed'),
        description: t('admin.draws.deletionFailedDescription'),
      });
    }
  };

  const resetDrawForm = async () => {
    setSelectedDraw(null);
    setDrawImageUrl('');
    setIsDrawDrawerOpen(false);
    // Refresh draws list to show the newly saved image immediately
    await fetchDraws();
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'open': 'bg-green-500/20 text-green-400 border-green-500/50',
      'active': 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      'completed': 'bg-gray-500/20 text-gray-400 border-gray-500/50',
    };

    return (
      <Badge
        variant="outline"
        className={`text-xs ${statusColors[status as keyof typeof statusColors] || 'bg-gray-500/20 text-gray-400 border-gray-500/50'}`}
      >
        {t(`admin.draws.status.${status}`)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white">{t('admin.draws.title')}</h2>
          <p className="text-white/70 text-sm mt-1">{t('admin.draws.subtitle')}</p>
        </div>
        <Drawer open={isDrawDrawerOpen} onOpenChange={setIsDrawDrawerOpen}>
          <DrawerTrigger asChild>
            <Button className="bg-[#F39C0A] hover:bg-[#F39C0A]/90 text-black font-medium">
              <Plus className="h-4 w-4 mr-2" />
              {t('admin.draws.createDraw')}
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{selectedDraw ? t('admin.draws.editDraw') : t('admin.draws.createDraw')}</DrawerTitle>
              <DrawerDescription>
                {selectedDraw ? t('admin.draws.editDrawDescription') : t('admin.draws.createDrawDescription')}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-white">{draws.length}</div>
          <div className="text-white/70 text-sm">{t('admin.draws.totalDraws')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-400">{draws.filter(d => d.status === 'active').length}</div>
          <div className="text-white/70 text-sm">{t('admin.draws.activeDraws')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-400">{draws.filter(d => d.status === 'completed').length}</div>
          <div className="text-white/70 text-sm">{t('admin.draws.completed')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-400">{draws.filter(d => d.status === 'open').length}</div>
          <div className="text-white/70 text-sm">{t('admin.draws.open')}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-400">{draws.filter(d => d.bannerImage).length}</div>
          <div className="text-white/70 text-sm">{t('admin.draws.withImages')}</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-medium text-white">{t('admin.draws.allDraws')}</h3>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/5">
                  <TableHead className="text-white/90 font-medium min-w-[150px]">Title</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[200px] hidden lg:table-cell">Description</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[100px] text-center">Participants</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[120px] hidden md:table-cell">Entry Fee Options</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[100px] hidden xl:table-cell">Start Date</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[100px] hidden xl:table-cell">End Date</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[80px] text-center">Status</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[100px] text-center hidden md:table-cell">Banner Image</TableHead>
                  <TableHead className="text-white/90 font-medium min-w-[100px] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-white/70">
                      <div className="flex flex-col items-center gap-2">
                        <ImagePlus className="h-12 w-12 text-white/40" />
                        <div>
                          <div className="font-medium">No draws found</div>
                          <div className="text-sm">Create your first draw to get started</div>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  draws.map((draw) => (
                    <TableRow key={draw.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-white font-medium">
                        <div className="max-w-[150px] truncate" title={draw.title}>
                          {draw.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80 hidden lg:table-cell">
                        <div className="max-w-[200px] truncate text-white/60">
                          No description stored
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80 text-center">
                        <div className="text-sm">
                          <div className="text-[#F39C0A] font-medium">{draw.currentParticipants}</div>
                          <div className="text-white/60">/ {draw.maxParticipants}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80 hidden md:table-cell">
                        <div className="text-sm">
                          {draw.ticketPrices.length > 0 ? (
                            <span className="text-[#F39C0A] font-medium">
                              ${Math.min(...draw.ticketPrices)} - ${Math.max(...draw.ticketPrices)}
                            </span>
                          ) : (
                            <span className="text-white/60">N/A</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-white/80 text-sm hidden xl:table-cell">
                        {new Date(draw.startDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-white/80 text-sm hidden xl:table-cell">
                        {new Date(draw.endDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(draw.status)}
                      </TableCell>
                      <TableCell className="text-center hidden md:table-cell">
                        {draw.bannerImage ? (
                          <div className="relative group">
                            <a href={draw.bannerImage} target="_blank" rel="noopener noreferrer">
                              <img
                                src={draw.bannerImage}
                                alt={`Draw banner for ${draw.title}`}
                                className="w-16 h-12 object-cover rounded-lg border border-white/20 mx-auto hover:scale-105 transition-all duration-200 shadow-lg"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement?.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            </a>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                              <span className="text-white text-xs font-medium">View Full</span>
                            </div>
                            <div className="hidden w-16 h-12 bg-red-500/20 rounded-lg border border-red-500/50 mx-auto flex items-center justify-center">
                              <span className="text-red-400 text-xs">Error</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-16 h-12 bg-white/10 rounded-lg border border-white/20 mx-auto flex items-center justify-center group hover:bg-white/20 transition-colors">
                            <ImagePlus className="h-4 w-4 text-white/40 group-hover:text-white/60" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <DrawAction
                          draw={draw}
                          onEdit={handleEditDraw}
                          onDeleteConfirm={confirmDeleteDraw}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1A1A1A] border-white/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              This action cannot be undone. This will permanently delete this draw from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDrawToDelete(null)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDrawDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DrawsManagement;
