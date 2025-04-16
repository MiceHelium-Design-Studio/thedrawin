
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from 'https://esm.sh/@aws-sdk/client-s3@3.427.0'
import { getSignedUrl } from 'https://esm.sh/@aws-sdk/s3-request-presigner@3.427.0'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') as string
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Create S3 client using environment variables
const s3Client = new S3Client({
  region: "us-east-2",
  endpoint: "https://vfmulngualkzxwdzcbwb.supabase.co/storage/v1/s3",
  credentials: {
    accessKeyId: Deno.env.get('S3_ACCESS_KEY') as string,
    secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY') as string,
  }
})

// Configuration for the S3 bucket
const BUCKET_NAME = "thedrawwin-media"

// Media mimetype categories
const imageMimeTypes = [
  'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 
  'image/webp', 'image/tiff', 'image/bmp'
];

const documentMimeTypes = [
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain', 'text/csv'
];

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify JWT to ensure the user is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', details: authError?.message || 'Invalid user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request body
    let actionData = {}
    let action = ''

    if (req.method === 'POST') {
      try {
        const requestBody = await req.json()
        console.log('Request body:', JSON.stringify(requestBody))
        
        // Extract action from body
        if (requestBody && typeof requestBody === 'object') {
          action = requestBody.action || ''
          actionData = requestBody
        }
      } catch (e) {
        console.error('Error parsing request body:', e)
        return new Response(JSON.stringify({ error: 'Invalid request body' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } else if (req.method === 'GET') {
      // Parse request URL for GET requests
      const url = new URL(req.url)
      action = url.searchParams.get('action') || ''
      
      // Convert URL params to object
      url.searchParams.forEach((value, key) => {
        actionData[key] = value
      })
    } else {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log(`Processing action: ${action}`)

    // Handle different S3 operations based on action parameter
    if (action === 'list') {
      // First check the database for media items
      const { data: dbMedia, error: dbError } = await supabase
        .from('media_items')
        .select('*')
        .eq('user_id', user.id);
      
      if (dbError) {
        console.error('Error fetching from DB:', dbError);
        // Continue to fetch from S3 as fallback
      } else if (dbMedia && dbMedia.length > 0) {
        // If we have items in the database, return them
        return new Response(JSON.stringify({ 
          media: dbMedia,
          source: 'database' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Fallback to S3 listing if database retrieval fails or returns empty
      const prefix = user.id + '/';
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix, // Only list objects for the current user
      })
      
      const response = await s3Client.send(command)
      
      const mediaItems = response.Contents?.map(item => ({
        id: item.Key,
        user_id: user.id,
        name: item.Key?.split('/').pop() || 'Untitled',
        url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
        size: item.Size || 0,
        uploadDate: item.LastModified?.toISOString() || new Date().toISOString(),
        type: getFileType(item.Key || '')
      })) || []
      
      // If we got items from S3 but not from DB, sync them to the database
      if (mediaItems.length > 0 && (!dbMedia || dbMedia.length === 0)) {
        try {
          // Batch insert media items to database
          const { error: insertError } = await supabase
            .from('media_items')
            .upsert(mediaItems.map(item => ({
              id: item.id,
              user_id: user.id,
              name: item.name,
              url: item.url,
              type: item.type,
              size: item.size,
              upload_date: item.uploadDate
            })));
            
          if (insertError) {
            console.error('Error syncing S3 items to database:', insertError);
          }
        } catch (syncError) {
          console.error('Error in sync operation:', syncError);
        }
      }
      
      return new Response(JSON.stringify({ 
        media: mediaItems,
        source: 's3' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    } 
    else if (action === 'getUploadUrl') {
      // Get a pre-signed URL for uploading a file
      const fileName = actionData.fileName
      const contentType = actionData.contentType
      
      if (!fileName || !contentType) {
        return new Response(JSON.stringify({ error: 'Missing fileName or contentType' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Sanitize filename to prevent path traversal attacks and special character issues
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
      if (sanitizedFileName !== fileName) {
        console.warn('Filename sanitized:', fileName, '→', sanitizedFileName);
      }
      
      const key = `${user.id}/${Date.now()}-${sanitizedFileName}`;
      
      // Validate content type against allowed types
      const fileType = categorizeContentType(contentType);
      if (fileType === 'unknown') {
        return new Response(JSON.stringify({ 
          error: 'Unsupported file type',
          details: `Content type ${contentType} is not supported`
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: contentType
      })
      
      const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
      
      // Prepare response with file details
      const fileDetails = {
        uploadUrl: presignedUrl,
        fileKey: key,
        fileUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`,
        fileType: fileType
      };
      
      return new Response(JSON.stringify(fileDetails), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    else if (action === 'recordUpload') {
      // Record an upload in the database after it's completed
      const { fileKey, fileUrl, fileName, fileSize, fileType } = actionData;
      
      if (!fileKey || !fileUrl) {
        return new Response(JSON.stringify({ error: 'Missing file information' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Insert record into database
      const { data, error } = await supabase
        .from('media_items')
        .insert({
          id: fileKey,
          user_id: user.id,
          name: fileName || fileKey.split('/').pop(),
          url: fileUrl,
          type: fileType || getFileType(fileKey),
          size: fileSize || 0,
          upload_date: new Date().toISOString()
        })
        .select();
      
      if (error) {
        console.error('Error recording upload in database:', error);
        return new Response(JSON.stringify({ 
          error: 'Failed to record upload',
          details: error.message
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Upload recorded in database',
        media: data[0]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    else if (action === 'delete') {
      // Delete an object from the bucket
      const fileKey = actionData.fileKey
      
      if (!fileKey) {
        return new Response(JSON.stringify({ error: 'Missing fileKey' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Security check: ensure users can only delete their own files
      if (!fileKey.startsWith(user.id + '/')) {
        return new Response(JSON.stringify({ 
          error: 'Access denied',
          details: 'You can only delete your own files'
        }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Delete from S3
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey
      })
      
      await s3Client.send(command);
      
      // Also remove from database
      const { error: deleteError } = await supabase
        .from('media_items')
        .delete()
        .eq('id', fileKey);
      
      if (deleteError) {
        console.error('Error deleting from database:', deleteError);
        // Continue anyway since the S3 deletion was successful
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'File successfully deleted',
        fileKey: fileKey
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    else if (action === 'getStats') {
      // Get statistics about user's storage usage
      const prefix = user.id + '/';
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix: prefix,
      });
      
      const response = await s3Client.send(command);
      
      const totalFiles = response.Contents?.length || 0;
      const totalSize = response.Contents?.reduce((acc, item) => acc + (item.Size || 0), 0) || 0;
      
      // Count files by type
      const fileTypeCount = {
        image: 0,
        document: 0,
        other: 0
      };
      
      response.Contents?.forEach(item => {
        const type = getFileType(item.Key || '');
        fileTypeCount[type] += 1;
      });
      
      return new Response(JSON.stringify({
        totalFiles,
        totalSize,
        fileTypeCount,
        averageSize: totalFiles > 0 ? totalSize / totalFiles : 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    else if (actionData.name) {
      // This is for the test request
      return new Response(JSON.stringify({ 
        message: `Hello ${actionData.name}!`, 
        timestamp: new Date().toISOString(),
        user: user.email || user.id
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // If no valid action was provided
    return new Response(JSON.stringify({ 
      error: 'Invalid or missing action',
      receivedData: actionData,
      supportedActions: ['list', 'getUploadUrl', 'recordUpload', 'delete', 'getStats']
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } 
  catch (error) {
    console.error('Error:', error)
    
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: Deno.env.get('ENVIRONMENT') === 'development' ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to determine file type based on extension
function getFileType(key: string): string {
  const extension = key.split('.').pop()?.toLowerCase() || ''
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'tiff', 'bmp']
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv']
  
  if (imageExtensions.includes(extension)) {
    return 'image'
  } else if (documentExtensions.includes(extension)) {
    return 'document'
  } else {
    return 'other'
  }
}

// Helper function to categorize content type
function categorizeContentType(contentType: string): string {
  if (imageMimeTypes.includes(contentType)) {
    return 'image';
  } else if (documentMimeTypes.includes(contentType)) {
    return 'document';
  } else {
    return 'unknown';
  }
}
