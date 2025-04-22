import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    // Get user session
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const scale = parseInt(formData.get('scale') as string || '2')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    // Get original image buffer
    const originalBuffer = Buffer.from(await file.arrayBuffer())

    // Get image metadata
    const metadata = await sharp(originalBuffer).metadata()
    const { width = 0, height = 0, format } = metadata

    if (width === 0 || height === 0) {
      return NextResponse.json(
        { error: 'Invalid image dimensions' },
        { status: 400 }
      )
    }

    // Calculate new dimensions
    const newWidth = width * scale
    const newHeight = height * scale

    // Implement progressive upscaling for better quality
    let currentBuffer: Buffer = originalBuffer
    let currentWidth = width
    let currentHeight = height
    
    // Determine the number of steps based on scale factor
    const steps = scale > 2 ? Math.ceil(Math.log2(scale)) : 1
    
    for (let i = 0; i < steps; i++) {
      // Calculate intermediate dimensions
      const stepScale = i === steps - 1 ? 
        (scale / Math.pow(2, steps - 1)) : 2
      
      const stepWidth = Math.round(currentWidth * stepScale)
      const stepHeight = Math.round(currentHeight * stepScale)
      
      // Process image with advanced Sharp settings
      currentBuffer = await sharp(currentBuffer)
        .resize(stepWidth, stepHeight, {
          fit: 'fill',
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: false,
          position: 'center',
          fastShrinkOnLoad: false
        })
        .sharpen({
          sigma: 1.2,
          m1: 1.5,
          m2: 0.7
        })
        .modulate({
          brightness: 1.02,
          saturation: 1.05
        })
        .toBuffer()
      
      currentWidth = stepWidth
      currentHeight = stepHeight
    }

    // Final processing for optimal quality
    const processedBuffer = await sharp(currentBuffer)
      .resize(newWidth, newHeight, {
        fit: 'fill',
        kernel: sharp.kernel.lanczos3,
        withoutEnlargement: false,
        position: 'center',
        fastShrinkOnLoad: false
      })
      .sharpen({
        sigma: 1.5,
        m1: 1.5,
        m2: 0.7
      })
      .modulate({
        brightness: 1.02,
        saturation: 1.05
      })
      // Preserve original format or use PNG for best quality
      .toFormat(format === 'jpeg' ? 'jpeg' : 'png', {
        quality: 100,
        effort: 10
      })
      .toBuffer()

    // Upload original and processed images to storage
    const originalPath = `${session.user.id}/upscaler/${Date.now()}-original.${file.type.split('/')[1]}`
    const processedPath = `${session.user.id}/upscaler/${Date.now()}-processed.${format === 'jpeg' ? 'jpg' : 'png'}`

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
        contentType: format === 'jpeg' ? 'image/jpeg' : 'image/png',
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
        tool_type: 'upscaler',
        settings: {
          scale,
          format: format === 'jpeg' ? 'jpg' : 'png'
        },
        file_size: processedBuffer.length,
        image_metadata: {
          ...metadata,
          originalSize: originalBuffer.length,
          processedSize: processedBuffer.length
        },
        status: 'completed',
        processing_duration: Date.now() - startTime,
      })

    if (dbError) {
      throw new Error('Failed to save to database')
    }

    return NextResponse.json({ 
      success: true,
      originalUrl: originalUrl.publicUrl,
      processedUrl: processedUrl.publicUrl,
      metadata: {
        originalWidth: width,
        originalHeight: height,
        newWidth,
        newHeight,
        scale,
        format: format || 'png',
        originalSize: originalBuffer.length,
        processedSize: processedBuffer.length
      }
    })
  } catch (error) {
    console.error('Error upscaling image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    )
  }
} 