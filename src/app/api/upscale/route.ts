import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const scale = parseInt(formData.get('scale') as string || '2')

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Get image metadata
    const metadata = await sharp(buffer).metadata()
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
    // For larger scale factors, we'll upscale in steps
    let currentBuffer: Buffer = buffer
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

    // Convert to base64
    const base64Image = processedBuffer.toString('base64')

    return NextResponse.json({ 
      data: base64Image,
      metadata: {
        originalWidth: width,
        originalHeight: height,
        newWidth,
        newHeight,
        scale,
        format: format || 'png'
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