import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(req: Request) {
  try {
    console.log('Starting image conversion process...')
    
    // Get user session
    console.log('Getting user session...')
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
      console.error('No user session found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    console.log('User session found:', session.user.id)

    // Check if the images bucket exists
    console.log('Checking for storage buckets...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError)
      return NextResponse.json(
        { error: 'Failed to check storage buckets' },
        { status: 500 }
      )
    }

    // Log information about existing buckets
    console.log('Existing buckets:', buckets)
    
    // Check if any bucket exists that we can use
    const existingBucket = buckets && buckets.length > 0 ? buckets[0] : null
    console.log('Using existing bucket:', existingBucket)
    
    // Use the first available bucket or 'images' if none exist
    const bucketName = existingBucket ? existingBucket.name : 'images'
    console.log('Using bucket name:', bucketName)

    console.log('Parsing form data...')
    const formData = await req.formData()
    const file = formData.get('file') as File
    const outputFormat = formData.get('format') as string || 'webp'
    const quality = parseInt(formData.get('quality') as string || '80')

    if (!file) {
      console.error('No file provided in form data')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      console.error('File size exceeds limit:', file.size, 'bytes')
      return NextResponse.json(
        { error: 'File size exceeds the maximum limit of 10MB' },
        { status: 400 }
      )
    }

    console.log('Output format:', outputFormat)
    console.log('Quality:', quality)

    const startTime = Date.now()

    // Get original image buffer
    console.log('Converting file to buffer...')
    let originalBuffer: Buffer
    try {
      originalBuffer = Buffer.from(await file.arrayBuffer())
      console.log('Original buffer size:', originalBuffer.length, 'bytes')
    } catch (error) {
      console.error('Error converting file to buffer:', error)
      return NextResponse.json(
        { error: 'Failed to process image: Memory allocation error' },
        { status: 500 }
      )
    }

    // Get image metadata
    console.log('Getting image metadata...')
    let metadata
    try {
      metadata = await sharp(originalBuffer).metadata()
      console.log('Image metadata:', metadata)
    } catch (error) {
      console.error('Error getting image metadata:', error)
      return NextResponse.json(
        { error: 'Failed to process image: Invalid image format' },
        { status: 400 }
      )
    }

    const { width = 0, height = 0, format: inputFormat } = metadata

    if (width === 0 || height === 0) {
      console.error('Invalid image dimensions:', width, height)
      return NextResponse.json(
        { error: 'Invalid image dimensions' },
        { status: 400 }
      )
    }

    // Process image with Sharp based on output format
    console.log('Processing image with format:', outputFormat)
    let processedBuffer: Buffer

    try {
      switch (outputFormat) {
        case 'webp':
          console.log('Converting to WebP format...')
          processedBuffer = await sharp(originalBuffer)
            .webp({
              quality,
              effort: 6,
              lossless: false
            })
            .toBuffer()
          console.log('WebP conversion successful, buffer size:', processedBuffer.length)
          break

        case 'png':
          console.log('Converting to PNG format...')
          processedBuffer = await sharp(originalBuffer)
            .png({
              quality,
              effort: 10,
              compressionLevel: 9
            })
            .toBuffer()
          console.log('PNG conversion successful, buffer size:', processedBuffer.length)
          break

        case 'jpg':
        case 'jpeg':
          console.log('Converting to JPEG format...')
          processedBuffer = await sharp(originalBuffer)
            .jpeg({
              quality,
              mozjpeg: true,
              chromaSubsampling: '4:4:4'
            })
            .toBuffer()
          console.log('JPEG conversion successful, buffer size:', processedBuffer.length)
          break

        case 'avif':
          console.log('Converting to AVIF format...')
          processedBuffer = await sharp(originalBuffer)
            .avif({
              quality,
              effort: 6,
              lossless: false
            })
            .toBuffer()
          console.log('AVIF conversion successful, buffer size:', processedBuffer.length)
          break

        case 'gif':
          console.log('Converting to GIF format...')
          processedBuffer = await sharp(originalBuffer)
            .png({
              quality: 100,
              effort: 10
            })
            .toBuffer()
          console.log('GIF conversion successful, buffer size:', processedBuffer.length)
          break

        default:
          console.error('Unsupported output format:', outputFormat)
          return NextResponse.json(
            { error: 'Unsupported output format' },
            { status: 400 }
          )
      }
    } catch (error) {
      console.error('Error processing image:', error)
      if (error instanceof Error) {
        console.error('Processing error details:', error.message)
        console.error('Processing error stack:', error.stack)
      }
      return NextResponse.json(
        { 
          error: 'Failed to process image',
          details: error instanceof Error ? error.message : 'Unknown error',
          format: outputFormat
        },
        { status: 500 }
      )
    }

    // Upload original and processed images to storage
    console.log('Uploading original image to storage...')
    const timestamp = Date.now()
    const originalPath = `${session.user.id}/converter/${timestamp}-original.${file.type.split('/')[1]}`
    console.log('Original path:', originalPath)
    
    const { error: originalUploadError } = await supabase.storage
      .from(bucketName)
      .upload(originalPath, originalBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (originalUploadError) {
      console.error('Error uploading original image:', originalUploadError)
      return NextResponse.json(
        { error: 'Failed to upload original image', details: originalUploadError },
        { status: 500 }
      )
    }
    console.log('Original image uploaded successfully')

    // Upload processed image
    console.log('Uploading processed image to storage...')
    const processedPath = `${session.user.id}/converter/${timestamp}-processed.${outputFormat}`
    console.log('Processed path:', processedPath)
    
    const { error: processedUploadError } = await supabase.storage
      .from(bucketName)
      .upload(processedPath, processedBuffer, {
        contentType: `image/${outputFormat}`,
        upsert: false
      })

    if (processedUploadError) {
      console.error('Error uploading processed image:', processedUploadError)
      return NextResponse.json(
        { error: 'Failed to upload processed image', details: processedUploadError },
        { status: 500 }
      )
    }
    console.log('Processed image uploaded successfully')

    // Get public URLs
    console.log('Getting public URLs...')
    const { data: originalUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(originalPath)

    const { data: processedUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(processedPath)

    const originalUrl = originalUrlData.publicUrl
    const processedUrl = processedUrlData.publicUrl
    console.log('Original URL:', originalUrl)
    console.log('Processed URL:', processedUrl)

    // Save to database
    console.log('Saving to database...')
    const { error: dbError } = await supabase
      .from('processed_images')
      .insert({
        user_id: session.user.id,
        original_image_url: originalUrl,
        processed_image_url: processedUrl,
        tool_type: 'format-conversion',
        image_metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          settings: {
            outputFormat,
            quality
          }
        },
        processing_duration: Date.now() - startTime,
        status: 'completed'
      })

    if (dbError) {
      console.error('Error saving to database:', dbError)
      return NextResponse.json(
        { error: 'Failed to save image data', details: dbError },
        { status: 500 }
      )
    }
    console.log('Saved to database successfully')

    console.log('Conversion process completed successfully')
    return NextResponse.json({
      originalUrl,
      processedUrl,
      metadata: {
        width,
        height,
        inputFormat: inputFormat || 'unknown',
        outputFormat,
        quality,
        originalSize: originalBuffer.length,
        processedSize: processedBuffer.length
      }
    })
  } catch (error) {
    console.error('Error converting image:', error)
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    
    // Return a more detailed error message
    return NextResponse.json(
      { 
        error: 'Failed to process image',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 