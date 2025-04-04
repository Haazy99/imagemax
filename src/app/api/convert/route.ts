import { NextResponse } from 'next/server'
import sharp from 'sharp'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const outputFormat = formData.get('format') as string || 'webp'
    const quality = parseInt(formData.get('quality') as string || '80')

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
    const { width = 0, height = 0, format: inputFormat } = metadata

    if (width === 0 || height === 0) {
      return NextResponse.json(
        { error: 'Invalid image dimensions' },
        { status: 400 }
      )
    }

    // Process image with Sharp based on output format
    let processedBuffer: Buffer

    switch (outputFormat) {
      case 'webp':
        processedBuffer = await sharp(buffer)
          .webp({
            quality,
            effort: 6,
            lossless: false
          })
          .toBuffer()
        break

      case 'png':
        processedBuffer = await sharp(buffer)
          .png({
            quality,
            effort: 10,
            compressionLevel: 9
          })
          .toBuffer()
        break

      case 'jpg':
      case 'jpeg':
        processedBuffer = await sharp(buffer)
          .jpeg({
            quality,
            mozjpeg: true,
            chromaSubsampling: '4:4:4'
          })
          .toBuffer()
        break

      case 'avif':
        processedBuffer = await sharp(buffer)
          .avif({
            quality,
            effort: 6,
            lossless: false
          })
          .toBuffer()
        break

      case 'gif':
        // For GIF, we need to handle it differently as Sharp doesn't support direct GIF conversion
        // We'll convert to PNG first and then use a different approach if needed
        processedBuffer = await sharp(buffer)
          .png({
            quality: 100,
            effort: 10
          })
          .toBuffer()
        break

      default:
        return NextResponse.json(
          { error: 'Unsupported output format' },
          { status: 400 }
        )
    }

    // Convert to base64
    const base64Image = processedBuffer.toString('base64')

    return NextResponse.json({ 
      data: base64Image,
      metadata: {
        width,
        height,
        inputFormat: inputFormat || 'unknown',
        outputFormat,
        quality
      }
    })
  } catch (error) {
    console.error('Error converting image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process image' },
      { status: 500 }
    )
  }
} 