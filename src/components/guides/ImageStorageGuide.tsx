
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon, AlertCircle, Image as ImageIcon, Database, FolderOpen } from 'lucide-react';
import { useDraws } from '@/context/DrawContext';
import { getMediaItems } from '@/utils/s3Utils';
import { supabase } from '@/integrations/supabase/client';
import CodeBlock from './CodeBlock';

const ImageStorageGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { media = [] } = useDraws();
  const [directImages, setDirectImages] = useState<any[]>([]);
  
  useEffect(() => {
    // Example of loading images directly from Supabase storage
    const fetchDirectImages = async () => {
      try {
        const { data } = await supabase.storage
          .from('media')
          .list('', { sortBy: { column: 'created_at', order: 'desc' }, limit: 5 });
          
        if (data) {
          setDirectImages(data.map(item => ({
            name: item.name,
            url: supabase.storage.from('media').getPublicUrl(item.name).data.publicUrl
          })));
        }
      } catch (error) {
        console.error('Error fetching direct images:', error);
      }
    };
    
    fetchDirectImages();
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Image Storage Guide</CardTitle>
        <CardDescription>
          Learn how to access and display images from storage in your application
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mediaLibrary">Media Library</TabsTrigger>
            <TabsTrigger value="directUrl">Direct URL</TabsTrigger>
            <TabsTrigger value="s3utils">S3 Utils</TabsTrigger>
            <TabsTrigger value="drawContext">DrawContext</TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="pt-6">
          <TabsContent value="overview" className="space-y-4">
            <Alert>
              <InfoIcon className="h-4 w-4" />
              <AlertTitle>Storage Structure</AlertTitle>
              <AlertDescription>
                Your application uses Supabase Storage with the following buckets:
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-blue-500" />
                    Media Bucket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    General purpose storage for various media files.
                    Access via the Media Library page.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-purple-500" />
                    Banners Bucket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Stores promotional banners for the homepage.
                    Managed via the Banner Management component.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-green-500" />
                    Profile Images Bucket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Contains user profile avatars and photos.
                    Used in user profiles and comments.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center">
                    <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
                    Draw Images Bucket
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Stores images related to draws and contests.
                    Used in draw cards and detail pages.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-6 space-y-4">
              <h3 className="font-semibold">Available Methods</h3>
              <ol className="list-decimal pl-5 space-y-2">
                <li>
                  <strong>Media Library Component</strong> - Use for visual browsing and management of media files
                </li>
                <li>
                  <strong>Direct URL References</strong> - When you already know the image URL
                </li>
                <li>
                  <strong>S3 Utils Functions</strong> - For programmatic access to storage
                </li>
                <li>
                  <strong>Draw Context Provider</strong> - Access media through the application context
                </li>
              </ol>
            </div>
          </TabsContent>

          <TabsContent value="mediaLibrary">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Using the Media Library</h3>
              <p>
                The Media Library component provides a visual interface to upload, browse, and select
                images from your storage. Use this when you need to:
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Let users upload new images</li>
                <li>Browse existing media visually</li>
                <li>Select images for various purposes</li>
              </ul>
              
              <Alert>
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Implementation</AlertTitle>
                <AlertDescription>
                  Navigate to the Media Library page at <code>/media-library</code> to use this interface.
                  You can also integrate the MediaManager component in your admin panels.
                </AlertDescription>
              </Alert>
              
              <h4 className="font-medium mt-4">Example Code:</h4>
              
              <CodeBlock
                code={`import { MediaManager } from '@/components/admin/MediaManager';

export const AdminPage = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <MediaManager />
    </div>
  );
};`}
                language="typescript"
              />
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mt-4">
                <h4 className="font-medium mb-2">Preview of Media Library:</h4>
                <img 
                  src="/lovable-uploads/e0c90449-0e21-4fa2-8656-efdf3f993ce8.png" 
                  alt="Media Library Preview" 
                  className="w-full rounded-md border border-gray-200 dark:border-gray-700" 
                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="directUrl">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Using Direct URLs</h3>
              <p>
                When you already have the URL of an image, you can display it directly using the
                standard HTML <code>img</code> tag or React components. This is the simplest approach
                when you know the exact image path.
              </p>
              
              <h4 className="font-medium mt-4">Basic Example:</h4>
              
              <CodeBlock
                code={`// Using a direct URL reference
<img 
  src="https://vfmulngualkzxwdzcbwb.supabase.co/storage/v1/object/public/media/example.jpg" 
  alt="Example" 
  className="w-full h-auto rounded-md"
  onError={(e) => {
    e.currentTarget.src = '/placeholder.svg';
    console.error('Image failed to load');
  }}
/>`}
                language="typescript"
              />
              
              <h4 className="font-medium mt-4">Public URL from Supabase:</h4>
              
              <CodeBlock
                code={`import { supabase } from '@/integrations/supabase/client';

// Generate a public URL for a file in a bucket
const { data } = supabase.storage
  .from('media')
  .getPublicUrl('filename.jpg');

// Use the URL in your component
<img src={data.publicUrl} alt="My image" />`}
                language="typescript"
              />
              
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Note</AlertTitle>
                <AlertDescription>
                  Direct URLs work only for files in public buckets or when appropriate RLS policies are in place.
                  Always include error handling for broken images.
                </AlertDescription>
              </Alert>
              
              <div className="border rounded-md p-4 mt-6">
                <h4 className="font-medium mb-4">Examples from Your Storage:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {directImages.slice(0, 4).map((item, index) => (
                    <div key={index} className="text-center">
                      <img 
                        src={item.url} 
                        alt={item.name} 
                        className="w-full h-24 object-cover rounded-md mb-2 border border-gray-200" 
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                          e.currentTarget.className += ' bg-gray-100';
                        }}
                      />
                      <p className="text-xs truncate">{item.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="s3utils">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Using S3Utils Functions</h3>
              <p>
                Your application includes utility functions in <code>s3Utils.ts</code> for 
                programmatically working with storage. These are useful for:
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Getting a list of media items</li>
                <li>Uploading new files</li>
                <li>Generating upload URLs</li>
                <li>Deleting files</li>
              </ul>
              
              <h4 className="font-medium mt-4">Getting Media Items:</h4>
              
              <CodeBlock
                code={`import { getMediaItems } from '@/utils/s3Utils';

const MyComponent = () => {
  const [media, setMedia] = useState([]);
  
  useEffect(() => {
    async function loadMedia() {
      try {
        const items = await getMediaItems();
        setMedia(items);
      } catch (error) {
        console.error('Error loading media:', error);
      }
    }
    
    loadMedia();
  }, []);
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {media.map(item => (
        <div key={item.id} className="border rounded-md p-2">
          <img 
            src={item.url} 
            alt={item.name} 
            className="w-full h-32 object-cover rounded-md"
          />
          <p className="mt-2 text-sm truncate">{item.name}</p>
        </div>
      ))}
    </div>
  );
};`}
                language="typescript"
              />
              
              <h4 className="font-medium mt-4">Uploading Files:</h4>
              
              <CodeBlock
                code={`import { uploadToS3 } from '@/utils/s3Utils';

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      // Upload to the media bucket
      const result = await uploadToS3(file, 'media');
      console.log('Uploaded file:', result.url);
      
      // Do something with the result (e.g., save URL to form state)
      
    } catch (error) {
      console.error('Error uploading:', error);
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        disabled={uploading} 
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};`}
                language="typescript"
              />
              
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Common Pitfalls</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Remember to handle errors and loading states</li>
                    <li>Check bucket permissions if files aren't accessible</li>
                    <li>Use the correct bucket type for your use case</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
          
          <TabsContent value="drawContext">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Using DrawContext Provider</h3>
              <p>
                Your application includes a DrawContext provider with built-in media management.
                This is useful when you want to:
              </p>
              
              <ul className="list-disc pl-5 space-y-2">
                <li>Access media throughout your component tree</li>
                <li>Use a consistent set of images across components</li>
                <li>Avoid multiple API calls to fetch the same images</li>
              </ul>
              
              <h4 className="font-medium mt-4">Accessing Media from Context:</h4>
              
              <CodeBlock
                code={`import { useDraws } from '@/context/DrawContext';

const GalleryComponent = () => {
  const { media, loading } = useDraws();
  
  if (loading) {
    return <p>Loading images...</p>;
  }
  
  // Filter for only image type items
  const images = media.filter(item => item.type === 'image');
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map(item => (
        <div key={item.id} className="relative group">
          <img 
            src={item.url} 
            alt={item.name}
            className="w-full aspect-square object-cover rounded-md transition-all 
                       group-hover:shadow-lg"
            loading="lazy"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white 
                         p-2 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {item.name}
          </div>
        </div>
      ))}
    </div>
  );
};`}
                language="typescript"
              />
              
              <h4 className="font-medium mt-4">Uploading with DrawContext:</h4>
              
              <CodeBlock
                code={`import { useDraws } from '@/context/DrawContext';

const MediaUploader = () => {
  const { uploadMedia, loading } = useDraws();
  const [file, setFile] = useState(null);
  
  const handleUpload = async () => {
    if (!file) return;
    
    try {
      const result = await uploadMedia(file, 'media');
      console.log('Uploaded:', result);
      setFile(null);
      
      // Show success message
      
    } catch (error) {
      console.error('Upload failed:', error);
      // Show error message
    }
  };
  
  return (
    <div className="space-y-4">
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
      />
      <button 
        onClick={handleUpload}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-500 text-white rounded-md"
      >
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </div>
  );
};`}
                language="typescript"
              />
              
              <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 mt-4">
                <h4 className="font-medium mb-2">Currently Available Media:</h4>
                {media.length === 0 ? (
                  <p className="text-sm text-gray-500">No media items available</p>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {media.slice(0, 6).map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="bg-white dark:bg-gray-700 rounded-md border overflow-hidden">
                          <img 
                            src={item.url} 
                            alt={item.name} 
                            className="w-full h-16 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                              e.currentTarget.className += ' p-2';
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <Alert className="mt-4">
                <InfoIcon className="h-4 w-4" />
                <AlertTitle>Tip</AlertTitle>
                <AlertDescription>
                  The DrawContext provider automatically refreshes when media items change,
                  making it perfect for real-time media management interfaces.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t p-6">
        <div className="space-y-4 w-full">
          <h3 className="font-semibold">Troubleshooting Common Issues</h3>
          
          <div className="space-y-2">
            <details>
              <summary className="font-medium cursor-pointer">Images not displaying</summary>
              <div className="pl-4 pt-2">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Check if the bucket is public or has appropriate RLS policies</li>
                  <li>Verify that the URL is correct and accessible</li>
                  <li>Add error handlers to your <code>img</code> tags</li>
                  <li>Check browser console for CORS errors</li>
                </ul>
              </div>
            </details>
            
            <details>
              <summary className="font-medium cursor-pointer">Upload errors</summary>
              <div className="pl-4 pt-2">
                <ul className="list-disc space-y-1 pl-5">
                  <li>Verify file size and format restrictions</li>
                  <li>Check user permissions and bucket policies</li>
                  <li>Ensure proper authentication for protected buckets</li>
                </ul>
              </div>
            </details>
            
            <details>
              <summary className="font-medium cursor-pointer">Responsive image best practices</summary>
              <div className="pl-4 pt-2">
                <CodeBlock
                  code={`// Responsive image with error handling and loading state
const [imageLoaded, setImageLoaded] = useState(false);
const [imageError, setImageError] = useState(false);

// In your JSX:
{!imageLoaded && !imageError && (
  <div className="w-full h-40 bg-gray-200 animate-pulse rounded-md" />
)}
<img 
  src={imageUrl} 
  alt="Description"
  className={\`w-full h-auto rounded-md \${imageLoaded ? '' : 'hidden'}\`}
  onLoad={() => setImageLoaded(true)}
  onError={() => {
    setImageError(true);
    setImageLoaded(true);
  }}
/>
{imageError && (
  <div className="w-full h-40 bg-gray-100 flex items-center justify-center rounded-md">
    <span className="text-gray-400">Image unavailable</span>
  </div>
)}
`}
                  language="typescript"
                />
              </div>
            </details>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ImageStorageGuide;
