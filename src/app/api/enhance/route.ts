import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const enhancementType = formData.get('type') as string || 'auto'
    const intensity = parseInt(formData.get('intensity') as string || '50')

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

    // Calculate intensity factor (0.5 to 1.5)
    const intensityFactor = 0.5 + (intensity / 100)

    // Apply enhancements based on type
    let processedBuffer: Buffer

    switch (enhancementType) {
      case 'portrait':
        // Portrait enhancement: soft skin, enhanced eyes, balanced lighting
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.05 * intensityFactor,
            saturation: 1.1 * intensityFactor
          })
          .sharpen({
            sigma: 1.2,
            m1: 1.5,
            m2: 0.7
          })
          .gamma(1.05)
          .toFormat(format === 'jpeg' ? 'jpeg' : 'png', {
            quality: 100,
            effort: 10
          })
          .toBuffer()
        break

      case 'landscape':
        // Landscape enhancement: enhanced colors, improved clarity, balanced exposure
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.02 * intensityFactor,
            saturation: 1.15 * intensityFactor
          })
          .sharpen({
            sigma: 1.5,
            m1: 1.5,
            m2: 0.7
          })
          .gamma(1.1)
          .toFormat(format === 'jpeg' ? 'jpeg' : 'png', {
            quality: 100,
            effort: 10
          })
          .toBuffer()
        break

      case 'low-light':
        // Low light enhancement: reduce noise, improve brightness, maintain details
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.2 * intensityFactor,
            saturation: 1.05 * intensityFactor
          })
          .sharpen({
            sigma: 1.0,
            m1: 1.2,
            m2: 0.5
          })
          .gamma(1.15)
          .toFormat(format === 'jpeg' ? 'jpeg' : 'png', {
            quality: 100,
            effort: 10
          })
          .toBuffer()
        break

      case 'auto':
      default:
        // Auto enhancement: balanced approach for all image types
        processedBuffer = await sharp(buffer)
          .modulate({
            brightness: 1.05 * intensityFactor,
            saturation: 1.1 * intensityFactor
          })
          .sharpen({
            sigma: 1.3,
            m1: 1.4,
            m2: 0.6
          })
          .gamma(1.08)
          .toFormat(format === 'jpeg' ? 'jpeg' : 'png', {
            quality: 100,
            effort: 10
          })
          .toBuffer()
        break
    }

    // Convert to base64
    const base64Image = processedBuffer.toString('base64')

    return NextResponse.json({ 
      data: base64Image,
      metadata: {
        width,
        height,
        format: format || 'png',
        enhancementType,
        intensity
      }
    })
  } catch (error) {
    console.error('Error enhancing image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    )
  }
} 