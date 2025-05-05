
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Image, Trash2, Upload, RefreshCw, HardDrive, FileText, Video, AlertTriangle, HelpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { uploadToS3, getMediaItems, deleteFromS3, getStorageStats, StorageStats } from '@/utils/s3Utils';
import ImageStorageGuide from '../guides/ImageStorageGuide';

const MediaManager: React.FC = () => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const { toast } = useToast();

  // Get media items on component mount
  useEffect(() => {
    fetchMediaItems();
    fetchStorageStats();
  }, []);

  const fetchMediaItems = async () => {
    try {
      setIsLoading(true);
      const items = await getMediaItems();
      setMediaItems(items);
    } catch (error) {
      console.error('Failed to fetch media items:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load media items. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStorageStats = async () => {
    try {
      const statsData = await getStorageStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch storage stats:', error);
    }
  };

  const handleFileSelected = (file: File) => {
    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      toast({
        variant: 'destructive',
        title: 'No file selected',
        description: 'Please select a file to upload.'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      const result = await uploadToS3(uploadFile, 'media');
      
      // Add new item to the media list
      setMediaItems([
        {
          id: result.key,
          name: result.name,
          url: result.url,
          type: result.type,
          size: result.size,
          uploadDate: new Date().toISOString()
        },
        ...mediaItems
      ]);
      
      // Reset upload state
      setUploadFile(null);
      
      // Refresh stats after successful upload
      fetchStorageStats();
      
      toast({
        title: 'Upload successful',
        description: `${result.name} has been uploaded.`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'There was a problem uploading your file. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteMedia = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteFromS3(id);
        
        // Remove the deleted item from the list
        setMediaItems(mediaItems.filter(item => item.id !== id));
        
        // Refresh stats after deletion
        fetchStorageStats();
        
        toast({
          title: 'Media deleted',
          description: `${name} has been deleted.`
        });
      } catch (error) {
        console.error('Deletion error:', error);
        toast({
          variant: 'destructive',
          title: 'Deletion failed',
          description: 'There was a problem deleting the file. Please try again.'
        });
      }
    }
  };

  const handlePreviewImage = (url: string) => {
    setPreviewImage(url);
    setPreviewOpen(true);
  };

  const refreshMediaList = () => {
    fetchMediaItems();
    fetchStorageStats();
    toast({
      title: 'Refreshed',
      description: 'Media list has been refreshed.'
    });
  };

  // Filter media based on selected tab
  const filteredMedia = mediaItems.filter(item => {
    if (selectedTab === 'all') return true;
    return item.type === selectedTab;
  });

  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      default:
        return <HardDrive className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Media Manager</h2>
        <div className="flex items-center gap-2">
          <Button onClick={refreshMediaList} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowGuide(true)} 
            variant="outline" 
            size="sm" 
            className="gap-2"
          >
            <HelpCircle className="h-4 w-4" />
            Storage Guide
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Files</CardTitle>
            <CardDescription>Number of media files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalFiles || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Storage Used</CardTitle>
            <CardDescription>Total space used</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatBytes(stats?.totalSize || 0)}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Images</CardTitle>
            <CardDescription>Number of image files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.fileTypeCount.image || 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Documents</CardTitle>
            <CardDescription>Number of document files</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.fileTypeCount.document || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Upload Media</CardTitle>
            <CardDescription>Add new media files to your library</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <ImageUploader 
                onImageSelected={handleFileSelected} 
                previewUrl={uploadFile ? URL.createObjectURL(uploadFile) : ''} 
                isUploading={isUploading}
              />
            </div>
            
            {uploadFile && (
              <div className="space-y-2">
                <Label htmlFor="filename">File Name</Label>
                <Input 
                  id="filename" 
                  value={uploadFile.name} 
                  disabled 
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Type: {uploadFile.type}</span>
                  <span>Size: {formatBytes(uploadFile.size)}</span>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleUpload} 
              disabled={!uploadFile || isUploading} 
              className="w-full gap-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload Media
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Manage your uploaded media files</CardDescription>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mt-3">
                <TabsList className="w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="image">Images</TabsTrigger>
                  <TabsTrigger value="document">Documents</TabsTrigger>
                  <TabsTrigger value="video">Videos</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No media files found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedTab === 'all' 
                      ? 'Your media library is empty. Upload files to get started.' 
                      : `You don't have any ${selectedTab} files. Try uploading some or switch to a different category.`}
                  </p>
                </div>
              ) : (
                <div className="overflow-auto max-h-[500px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedia.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.type === 'image' ? (
                                <img 
                                  src={item.url} 
                                  alt={item.name} 
                                  className="w-8 h-8 rounded object-cover cursor-pointer"
                                  onClick={() => handlePreviewImage(item.url)}
                                />
                              ) : (
                                getMediaTypeIcon(item.type)
                              )}
                              <span className="truncate max-w-[120px]" title={item.name}>
                                {item.name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{formatBytes(item.size)}</TableCell>
                          <TableCell>{formatDate(item.uploadDate)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {item.type === 'image' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreviewImage(item.url)}
                                >
                                  <Image className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMedia(item.id, item.name)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
            <DialogDescription>
              Full size preview of the selected image
            </DialogDescription>
          </DialogHeader>
          {previewImage && (
            <div className="flex justify-center">
              <img 
                src={previewImage} 
                alt="Preview" 
                className="max-h-[60vh] object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setPreviewOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Storage Guide Dialog */}
      <Dialog open={showGuide} onOpenChange={setShowGuide}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Storage Guide</DialogTitle>
            <DialogDescription>
              Learn how to access and display images from storage in your application
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ImageStorageGuide />
          </div>
          <DialogFooter>
            <Button onClick={() => setShowGuide(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MediaManager;
