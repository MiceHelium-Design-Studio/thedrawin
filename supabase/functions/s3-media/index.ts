
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
  region: "us-east-2", // Updated region
  endpoint: "https://vfmulngualkzxwdzcbwb.supabase.co/storage/v1/s3", // Added endpoint
  credentials: {
    accessKeyId: Deno.env.get('S3_ACCESS_KEY') as string,
    secretAccessKey: Deno.env.get('S3_SECRET_ACCESS_KEY') as string,
  }
})

// Configuration for the S3 bucket
const BUCKET_NAME = "thedrawwin-media"

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
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Parse request URL
    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // Handle different S3 operations based on action parameter
    if (req.method === 'GET') {
      if (action === 'list') {
        // List objects in the bucket
        const command = new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
        })
        
        const response = await s3Client.send(command)
        
        const mediaItems = response.Contents?.map(item => ({
          id: item.Key,
          name: item.Key?.split('/').pop() || 'Untitled',
          url: `https://${BUCKET_NAME}.s3.amazonaws.com/${item.Key}`,
          size: item.Size || 0,
          uploadDate: item.LastModified?.toISOString() || new Date().toISOString(),
          type: getFileType(item.Key || '')
        })) || []
        
        return new Response(JSON.stringify({ media: mediaItems }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      } 
      else if (action === 'getUploadUrl') {
        // Get a pre-signed URL for uploading a file
        const fileName = url.searchParams.get('fileName')
        const contentType = url.searchParams.get('contentType')
        
        if (!fileName || !contentType) {
          return new Response(JSON.stringify({ error: 'Missing fileName or contentType' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const key = `${user.id}/${Date.now()}-${fileName}`
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          ContentType: contentType
        })
        
        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
        
        return new Response(JSON.stringify({ 
          uploadUrl: presignedUrl,
          fileKey: key,
          fileUrl: `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    } 
    else if (req.method === 'DELETE') {
      if (action === 'delete') {
        // Delete an object from the bucket
        const fileKey = url.searchParams.get('fileKey')
        
        if (!fileKey) {
          return new Response(JSON.stringify({ error: 'Missing fileKey' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        const command = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey
        })
        
        await s3Client.send(command)
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
    }

    // If no valid action was provided
    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } 
  catch (error) {
    console.error('Error:', error)
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

// Helper function to determine file type based on extension
function getFileType(key: string): string {
  const extension = key.split('.').pop()?.toLowerCase() || ''
  
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp']
  const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  
  if (imageExtensions.includes(extension)) {
    return 'image'
  } else if (documentExtensions.includes(extension)) {
    return 'document'
  } else {
    return 'other'
  }
}
