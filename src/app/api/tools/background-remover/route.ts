import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { RemoveBgService } from '@/lib/services/removebg'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    // Get user session using the route handler client
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the uploaded file
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Process image with Remove.bg
    const removeBg = new RemoveBgService(process.env.REMOVE_BG_API_KEY!)
    const startTime = Date.now()
    
    const result = await removeBg.removeBackground(file, {
      outputFormat: 'png',
      size: 'auto',
      type: 'auto',
    })

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to process image')
    }

    const processingDuration = Date.now() - startTime

    // Upload original and processed images to storage
    const originalBuffer = Buffer.from(await file.arrayBuffer())
    const processedBuffer = Buffer.from(result.data, 'base64')

    const originalPath = `${session.user.id}/background-removal/${Date.now()}-original.${file.type.split('/')[1]}`
    const processedPath = `${session.user.id}/background-removal/${Date.now()}-processed.png`

    // Upload original image
    const { error: originalUploadError } = await supabase.storage
      .from('images')
      .upload(originalPath, originalBuffer, {
        contentType: file.type,
        cacheControl: '3600',
      })

    if (originalUploadError) {
      throw new Error('Failed to upload original image')
    }

    // Upload processed image
    const { error: processedUploadError } = await supabase.storage
      .from('images')
      .upload(processedPath, processedBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      })

    if (processedUploadError) {
      throw new Error('Failed to upload processed image')
    }

    // Get public URLs
    const { data: originalUrl } = supabase.storage
      .from('images')
      .getPublicUrl(originalPath)

    const { data: processedUrl } = supabase.storage
      .from('images')
      .getPublicUrl(processedPath)

    // Save to database
    const { error: dbError } = await supabase
      .from('processed_images')
      .insert({
        user_id: session.user.id,
        original_image_url: originalUrl.publicUrl,
        processed_image_url: processedUrl.publicUrl,
        tool_type: 'background-removal',
        settings: {
          outputFormat: 'png',
          size: 'auto',
          type: 'auto',
        },
        file_size: processedBuffer.length,
        image_metadata: result.metadata,
        status: 'completed',
        processing_duration: processingDuration,
      })

    if (dbError) {
      throw new Error('Failed to save to database')
    }

    return NextResponse.json({
      success: true,
      processedUrl: processedUrl.publicUrl,
      metadata: result.metadata,
    })
  } catch (error) {
    console.error('Background removal error:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process image',
      },
      { status: 500 }
    )
  }
} 