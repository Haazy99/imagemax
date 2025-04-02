import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Convert File to Buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Create form data for Remove.bg API
    const apiFormData = new FormData()
    apiFormData.append('image_file', new Blob([buffer]))
    apiFormData.append('size', 'auto')

    // Call Remove.bg API
    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY || '',
      },
      body: apiFormData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Remove.bg API error:', errorData)
      return NextResponse.json(
        { error: errorData.errors?.[0]?.title || 'Failed to remove background' },
        { status: response.status }
      )
    }

    // Get the processed image as binary data
    const imageBuffer = await response.arrayBuffer()
    const base64Image = Buffer.from(imageBuffer).toString('base64')

    return NextResponse.json({ data: base64Image })
  } catch (error) {
    console.error('Error removing background:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 }
    )
  }
} 