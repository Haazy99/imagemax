import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface ModulateOptions {
  brightness?: number
  saturation?: number
  hue?: number
}

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024

export async function POST(request: Request) {
  try {
    console.log('Starting image enhancement process...')
    
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
    const formData = await request.formData()
    const file = formData.get('file') as File
    const settingsStr = formData.get('settings') as string

    if (!file) {
      console.error('No file provided in form data')
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!settingsStr) {
      console.error('No settings provided in form data')
      return NextResponse.json(
        { error: 'No settings provided' },
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

    console.log('Received settings:', settingsStr)
    const settings = JSON.parse(settingsStr)
    console.log('Parsed settings:', settings)

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
    
    // Get original image metadata
    console.log('Getting original image metadata...')
    let metadata
    try {
      metadata = await sharp(originalBuffer).metadata()
      console.log('Original metadata:', metadata)
    } catch (error) {
      console.error('Error getting image metadata:', error)
      return NextResponse.json(
        { error: 'Failed to process image: Invalid image format' },
        { status: 400 }
      )
    }

    // Create a new Sharp instance for processing
    let processedBuffer = originalBuffer;
    
    // Apply filters
    if (settings.filter && settings.filter !== 'none') {
      console.log('Applying filter:', settings.filter)
      try {
        // Create a new Sharp instance for each filter
        let filterProcess = sharp(processedBuffer)
        
        switch (settings.filter) {
          case 'vintage':
            console.log('Applying vintage filter...')
            filterProcess = filterProcess
              .tint({ r: 255, g: 240, b: 192 })
              .gamma(1.1)
              .modulate({ saturation: 0.8, brightness: 1.1 })
            break
          case 'noir':
            console.log('Applying noir filter...')
            filterProcess = filterProcess
              .grayscale()
              .modulate({ brightness: 1.1 })
              .gamma(1.2)
            break
          case 'sepia':
            console.log('Applying sepia filter...')
            filterProcess = filterProcess
              .tint({ r: 112, g: 66, b: 20 })
              .modulate({ saturation: 0.8, brightness: 1.1 })
            break
          case 'vivid':
            console.log('Applying vivid filter...')
            filterProcess = filterProcess
              .modulate({ saturation: 1.5, brightness: 1.1 })
              .gamma(0.9)
            break
          case 'cool':
            console.log('Applying cool filter...')
            filterProcess = filterProcess
              .tint({ r: 200, g: 220, b: 255 })
              .modulate({ saturation: 0.9 })
            break
          case 'warm':
            console.log('Applying warm filter...')
            filterProcess = filterProcess
              .tint({ r: 255, g: 220, b: 180 })
              .modulate({ saturation: 0.9 })
            break
          default:
            console.log('Unknown filter type:', settings.filter)
            // Don't apply any filter for unknown types
            break
        }
        
        // Process the image with the filter
        console.log('Processing image with filter...')
        processedBuffer = await filterProcess.toBuffer()
        console.log('Filter applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying filter:', error)
        if (error instanceof Error) {
          console.error('Filter error details:', error.message)
          console.error('Filter error stack:', error.stack)
        }
        return NextResponse.json(
          { 
            error: 'Failed to apply filter to image',
            details: error instanceof Error ? error.message : 'Unknown error',
            filter: settings.filter
          },
          { status: 500 }
        )
      }
    }

    // Apply color adjustments
    if (settings.saturation !== 0) {
      console.log('Applying saturation adjustment:', settings.saturation)
      try {
        const saturationProcess = sharp(processedBuffer)
          .modulate({
            saturation: 1 + (settings.saturation / 100)
          })
        processedBuffer = await saturationProcess.toBuffer()
        console.log('Saturation applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying saturation:', error)
        return NextResponse.json(
          { error: 'Failed to adjust saturation' },
          { status: 500 }
        )
      }
    }

    if (settings.temperature !== 0) {
      console.log('Applying temperature adjustment:', settings.temperature)
      try {
        const temp = settings.temperature / 100
        const temperatureProcess = sharp(processedBuffer)
        if (temp > 0) {
          // Warmer
          temperatureProcess.tint({ r: 255, g: 240, b: 200 })
        } else {
          // Cooler
          temperatureProcess.tint({ r: 200, g: 240, b: 255 })
        }
        processedBuffer = await temperatureProcess.toBuffer()
        console.log('Temperature applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying temperature:', error)
        return NextResponse.json(
          { error: 'Failed to adjust temperature' },
          { status: 500 }
        )
      }
    }

    if (settings.hue !== 0) {
      console.log('Applying hue adjustment:', settings.hue)
      try {
        const hueProcess = sharp(processedBuffer)
          .modulate({
            hue: settings.hue
          })
        processedBuffer = await hueProcess.toBuffer()
        console.log('Hue applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying hue:', error)
        return NextResponse.json(
          { error: 'Failed to adjust hue' },
          { status: 500 }
        )
      }
    }

    if (settings.vibrance !== 0) {
      console.log('Applying vibrance adjustment:', settings.vibrance)
      try {
        // Simulate vibrance by selectively boosting less saturated colors
        const vibrance = settings.vibrance / 100
        const vibranceProcess = sharp(processedBuffer)
          .modulate({
            saturation: 1 + vibrance
          })
        processedBuffer = await vibranceProcess.toBuffer()
        console.log('Vibrance applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying vibrance:', error)
        return NextResponse.json(
          { error: 'Failed to adjust vibrance' },
          { status: 500 }
        )
      }
    }

    // Apply effects
    if (settings.blur > 0) {
      console.log('Applying blur effect:', settings.blur)
      try {
        const blurProcess = sharp(processedBuffer)
          .blur(settings.blur)
        processedBuffer = await blurProcess.toBuffer()
        console.log('Blur applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying blur:', error)
        return NextResponse.json(
          { error: 'Failed to apply blur effect' },
          { status: 500 }
        )
      }
    }

    if (settings.sharpen > 0) {
      console.log('Applying sharpen effect:', settings.sharpen)
      try {
        const sharpenProcess = sharp(processedBuffer)
          .sharpen({
            sigma: settings.sharpen / 10
          })
        processedBuffer = await sharpenProcess.toBuffer()
        console.log('Sharpen applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying sharpen:', error)
        return NextResponse.json(
          { error: 'Failed to apply sharpen effect' },
          { status: 500 }
        )
      }
    }

    if (settings.vignette > 0) {
      console.log('Applying vignette effect:', settings.vignette)
      try {
        // Create a vignette effect by overlaying a gradient
        const vignetteStrength = settings.vignette / 100
        const { width = 100, height = 100 } = metadata
        const gradient = await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          }
        })
        .composite([{
          input: Buffer.from([0, 0, 0, Math.round(255 * vignetteStrength)]),
          raw: { width: 1, height: 1, channels: 4 },
          tile: true,
          blend: 'multiply'
        }])
        .toBuffer()

        const vignetteProcess = sharp(processedBuffer)
          .composite([{
            input: gradient,
            blend: 'multiply'
          }])
        processedBuffer = await vignetteProcess.toBuffer()
        console.log('Vignette applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying vignette:', error)
        return NextResponse.json(
          { error: 'Failed to apply vignette effect' },
          { status: 500 }
        )
      }
    }

    // Apply detail adjustments
    if (settings.clarity !== 0) {
      console.log('Applying clarity adjustment:', settings.clarity)
      try {
        const clarityAmount = 1 + (Math.abs(settings.clarity) / 100)
        const clarityProcess = sharp(processedBuffer)
          .modulate({
            brightness: settings.clarity > 0 ? clarityAmount : 1
          })
          .gamma(settings.clarity > 0 ? 1 : 1/clarityAmount)
        processedBuffer = await clarityProcess.toBuffer()
        console.log('Clarity applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying clarity:', error)
        return NextResponse.json(
          { error: 'Failed to adjust clarity' },
          { status: 500 }
        )
      }
    }

    if (settings.structure !== 0) {
      console.log('Applying structure adjustment:', settings.structure)
      try {
        const structureAmount = settings.structure / 100
        const structureProcess = sharp(processedBuffer)
          .sharpen({
            sigma: Math.abs(structureAmount) * 2,
            m1: structureAmount > 0 ? 1 : -1
          })
        processedBuffer = await structureProcess.toBuffer()
        console.log('Structure applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying structure:', error)
        return NextResponse.json(
          { error: 'Failed to adjust structure' },
          { status: 500 }
        )
      }
    }

    if (settings.denoise > 0) {
      console.log('Applying denoise adjustment:', settings.denoise)
      try {
        const denoiseProcess = sharp(processedBuffer)
          .median(Math.ceil(settings.denoise / 20))
        processedBuffer = await denoiseProcess.toBuffer()
        console.log('Denoise applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying denoise:', error)
        return NextResponse.json(
          { error: 'Failed to apply denoise effect' },
          { status: 500 }
        )
      }
    }

    if (settings.sharpness > 0) {
      console.log('Applying sharpness adjustment:', settings.sharpness)
      try {
        const sharpnessProcess = sharp(processedBuffer)
          .sharpen({
            sigma: settings.sharpness / 10,
            m1: 1.5,
            m2: 0.7
          })
        processedBuffer = await sharpnessProcess.toBuffer()
        console.log('Sharpness applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying sharpness:', error)
        return NextResponse.json(
          { error: 'Failed to adjust sharpness' },
          { status: 500 }
        )
      }
    }

    // Apply light adjustments
    console.log('Applying light adjustments...')
    const lightAdjustments: ModulateOptions = {
      brightness: 1 + (settings.brightness / 100)
    }

    if (settings.exposure !== 0) {
      console.log('Applying exposure adjustment:', settings.exposure)
      try {
        lightAdjustments.brightness = 1 + (settings.exposure / 100)
      } catch (error) {
        console.error('Error applying exposure:', error)
        return NextResponse.json(
          { error: 'Failed to adjust exposure' },
          { status: 500 }
        )
      }
    }

    if (settings.highlights !== 0 || settings.shadows !== 0) {
      console.log('Applying highlights/shadows adjustment:', settings.highlights, settings.shadows)
      try {
        const lightProcess = sharp(processedBuffer)
          .linear(
            // Highlights adjustment
            settings.highlights > 0 
              ? [1 + (settings.highlights / 200), 0] 
              : [1, -(Math.abs(settings.highlights) / 200)],
            // Shadows adjustment
            settings.shadows > 0
              ? [1 + (settings.shadows / 200), 0]
              : [1, -(Math.abs(settings.shadows) / 200)]
          )
        processedBuffer = await lightProcess.toBuffer()
        console.log('Highlights/shadows applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying highlights/shadows:', error)
        return NextResponse.json(
          { error: 'Failed to adjust highlights/shadows' },
          { status: 500 }
        )
      }
    }

    if (settings.gamma !== 1) {
      console.log('Applying gamma adjustment:', settings.gamma)
      try {
        // Create a new Sharp instance for gamma adjustment
        const gammaProcess = sharp(processedBuffer)
        
        // Apply gamma adjustment with a safer approach
        // Limit gamma to a reasonable range to avoid memory issues
        const safeGamma = Math.max(0.1, Math.min(10, settings.gamma))
        console.log('Using safe gamma value:', safeGamma)
        
        // Apply gamma adjustment
        gammaProcess.gamma(safeGamma)
        
        // Process the image with gamma adjustment
        console.log('Processing image with gamma adjustment...')
        processedBuffer = await gammaProcess.toBuffer()
        console.log('Gamma adjustment applied successfully, buffer size:', processedBuffer.length)
      } catch (error) {
        console.error('Error applying gamma:', error)
        if (error instanceof Error) {
          console.error('Gamma error details:', error.message)
          console.error('Gamma error stack:', error.stack)
        }
        
        // Try a fallback approach with a simpler gamma adjustment
        try {
          console.log('Attempting fallback gamma adjustment...')
          const fallbackProcess = sharp(processedBuffer)
            .linear(1, 0) // Reset any previous adjustments
            .gamma(1.0)   // Reset to default gamma
            .modulate({ brightness: settings.gamma > 1 ? 1.2 : 0.8 }) // Approximate gamma with brightness
          
          processedBuffer = await fallbackProcess.toBuffer()
          console.log('Fallback gamma adjustment applied successfully, buffer size:', processedBuffer.length)
        } catch (fallbackError) {
          console.error('Fallback gamma adjustment also failed:', fallbackError)
          return NextResponse.json(
            { 
              error: 'Failed to adjust gamma',
              details: error instanceof Error ? error.message : 'Unknown error',
              gamma: settings.gamma,
              fallbackError: fallbackError instanceof Error ? fallbackError.message : 'Unknown error'
            },
            { status: 500 }
          )
        }
      }
    }

    // Apply final light adjustments
    try {
      const finalLightProcess = sharp(processedBuffer)
        .modulate(lightAdjustments)
      processedBuffer = await finalLightProcess.toBuffer()
      console.log('Final light adjustments applied successfully, buffer size:', processedBuffer.length)
    } catch (error) {
      console.error('Error applying final light adjustments:', error)
      return NextResponse.json(
        { error: 'Failed to apply final light adjustments' },
        { status: 500 }
      )
    }

    // Convert to PNG format
    console.log('Converting to PNG format...')
    try {
      const finalProcess = sharp(processedBuffer)
        .toFormat('png')
      processedBuffer = await finalProcess.toBuffer()
      console.log('Final image processed successfully, buffer size:', processedBuffer.length)
    } catch (error) {
      console.error('Error processing final image:', error)
      return NextResponse.json(
        { error: 'Failed to process image: Memory allocation error' },
        { status: 500 }
      )
    }

    // Get final metadata
    console.log('Getting final metadata...')
    let finalMetadata
    try {
      finalMetadata = await sharp(processedBuffer).metadata()
      console.log('Final metadata:', finalMetadata)
    } catch (error) {
      console.error('Error getting final metadata:', error)
      return NextResponse.json(
        { error: 'Failed to get final image metadata' },
        { status: 500 }
      )
    }

    // Upload original image to Supabase storage
    console.log('Uploading original image to storage...')
    const timestamp = Date.now()
    const originalPath = `${session.user.id}/enhancement/${timestamp}-original.${metadata.format || 'png'}`
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

    // Upload processed image to Supabase storage
    console.log('Uploading processed image to storage...')
    const processedPath = `${session.user.id}/enhancement/${timestamp}-processed.png`
    console.log('Processed path:', processedPath)
    
    const { error: processedUploadError } = await supabase.storage
      .from(bucketName)
      .upload(processedPath, processedBuffer, {
        contentType: 'image/png',
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
        tool_type: 'enhancement',
        image_metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          size: metadata.size,
          settings: settings
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

    console.log('Enhancement process completed successfully')
    return NextResponse.json({
      originalUrl,
      processedUrl,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        originalSize: metadata.size,
        processedSize: processedBuffer.length
      }
    })
  } catch (error) {
    console.error('Error processing image:', error)
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