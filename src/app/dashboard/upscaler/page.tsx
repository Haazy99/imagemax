"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Download } from 'lucide-react'
import Image from 'next/image'
import { Slider } from '@/components/ui/slider'

export default function UpscalerPage() {
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [scale, setScale] = useState(2)
  const [metadata, setMetadata] = useState<{
    originalWidth: number;
    originalHeight: number;
    newWidth: number;
    newHeight: number;
    scale: number;
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid file type', 'Please upload an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File too large', 'Please upload an image smaller than 10MB')
      return
    }

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    setOriginalImage(imageUrl)
    setProcessedImage(null)
  }

  const handleUpscale = async () => {
    if (!originalImage) return

    try {
      setIsLoading(true)
      setMetadata(null)

      // Get the file from the input
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        error('No file selected', 'Please select an image first')
        return
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('scale', scale.toString())

      // Call the API
      const response = await fetch('/api/upscale', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upscale image')
      }

      if (!data.data) {
        throw new Error('No image data received from API')
      }

      // Create blob URL from base64
      const binaryString = atob(data.data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'image/png' })
      const url = URL.createObjectURL(blob)
      
      setProcessedImage(url)
      setMetadata(data.metadata)
      success('Image upscaled successfully', 'Your image is ready to download')
    } catch (err) {
      console.error('Error upscaling image:', err)
      error(
        'Failed to upscale image',
        err instanceof Error ? err.message : 'Please try again'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return

    const link = document.createElement('a')
    link.href = processedImage
    link.download = 'upscaled-image.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Image Upscaler</h1>
        <p className="text-muted-foreground">
          Enhance your images with high-quality upscaling
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Original Image</CardTitle>
            <CardDescription>
              Upload an image to upscale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  className="cursor-pointer"
                />
              </div>

              {originalImage && (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                  <Image
                    src={originalImage}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Upscale Factor: {scale}x</Label>
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={2}
                  max={4}
                  step={1}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleUpscale}
                disabled={!originalImage || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upscaling...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upscale Image
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upscaled Image</CardTitle>
            <CardDescription>
              Your enhanced image
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedImage && metadata && (
                <>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={processedImage}
                      alt="Upscaled"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Original size: {metadata.originalWidth} × {metadata.originalHeight}px</p>
                    <p>New size: {metadata.newWidth} × {metadata.newHeight}px</p>
                    <p>Scale factor: {metadata.scale}x</p>
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}