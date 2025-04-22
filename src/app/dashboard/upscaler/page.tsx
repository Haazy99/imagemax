"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Upload, Download, FileImage } from 'lucide-react'
import Image from 'next/image'
import { Slider } from '@/components/ui/slider'
import { checkStorageQuota } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

type ProcessStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface ProcessedImage {
  success: boolean
  processedUrl?: string
  originalUrl?: string
  error?: string
  processId?: string
  metadata: {
    originalWidth: number;
    originalHeight: number;
    newWidth: number;
    newHeight: number;
    scale: number;
    format: string;
    originalSize: number;
    processedSize: number;
  }
}

export default function UpscalerPage() {
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('pending')
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [scale, setScale] = useState(2)
  const [metadata, setMetadata] = useState<ProcessedImage['metadata'] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const supabase = createClientComponentClient()

  // Poll for status updates when processing
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      if (currentProcessId && processStatus === 'processing') {
        const { data, error: queryError } = await supabase
          .from('processed_images')
          .select('id, status, processed_image_url, original_image_url, image_metadata, error_message')
          .eq('id', currentProcessId)
          .eq('tool_type', 'enhancement')
          .single()

        if (data) {
          setProcessStatus(data.status)
          if (data.status === 'completed') {
            setProcessedImage(data.processed_image_url)
            setOriginalUrl(data.original_image_url)
            setProcessedUrl(data.processed_image_url)
            setMetadata(data.image_metadata)
            success("Image upscaled successfully", "Your image is ready to download.")
          } else if (data.status === 'failed') {
            setErrorMessage(data.error_message || 'Processing failed')
            error("Processing failed", data.error_message || "Failed to upscale image")
          }
        }
      }
    }

    if (processStatus === 'processing') {
      intervalId = setInterval(checkStatus, 2000) // Poll every 2 seconds
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [currentProcessId, processStatus, supabase, success, error])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid file type', 'Please upload an image file')
      return
    }

    // Check storage quota
    const quotaCheck = await checkStorageQuota(file.size)
    if (!quotaCheck.allowed) {
      error('Storage quota exceeded', quotaCheck.message)
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      error('File too large', 'Please upload an image smaller than 10MB')
      return
    }

    setProcessStatus('pending')
    setSelectedFile(file)
    setCurrentProcessId(null)
    setProcessedImage(null)
    setOriginalUrl(null)
    setProcessedUrl(null)
    setMetadata(null)
    setErrorMessage(null)

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    setOriginalImage(imageUrl)
  }

  const handleUpscale = async () => {
    if (!selectedFile) {
      error("No image selected", "Please upload an image first.")
      return
    }

    try {
      setIsLoading(true)
      setProcessStatus('processing')
      setErrorMessage('')

      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('scale', scale.toString())

      const response = await fetch('/api/upscale', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upscale image')
      }

      if (!result.processedUrl) {
        throw new Error('No processed image URL received from API')
      }

      setProcessedImage(result.processedUrl)
      setOriginalUrl(result.originalUrl)
      setProcessedUrl(result.processedUrl)
      setMetadata(result.metadata)
      setProcessStatus('completed')
      success("Image upscaled successfully", "Your image is ready to download.")
    } catch (err) {
      console.error('Error upscaling image:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upscale image'
      setErrorMessage(errorMessage)
      setProcessStatus('failed')
      error("Processing failed", errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!processedUrl) return
    
    try {
      setIsDownloading(true)
      const response = await fetch(processedUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `upscaled-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      success(
        "Download started",
        "Your upscaled image is being downloaded."
      )
    } catch (err) {
      error(
        "Download failed",
        "Failed to download the image. Please try again."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const getStatusMessage = () => {
    switch (processStatus) {
      case 'pending':
        return 'Ready to process'
      case 'processing':
        return 'Upscaling image...'
      case 'completed':
        return 'Image upscaled successfully'
      case 'failed':
        return errorMessage || 'Processing failed'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Image Upscaler</h1>
        <p className="text-muted-foreground">
          Enhance your images with high-quality upscaling
        </p>
      </div>

      <StorageUsage />

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

              {originalImage ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-lg border">
                  <Image
                    src={originalImage}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <FileImage className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Upload an image to upscale
                  </p>
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
                  disabled={processStatus === 'processing'}
                />
              </div>

              <Button
                onClick={handleUpscale}
                disabled={!selectedFile || processStatus === 'processing'}
                className="w-full"
              >
                {processStatus === 'processing' ? (
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
              {processedImage ? (
                <>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={processedImage}
                      alt="Upscaled"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {metadata && (
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>Original size: {metadata.originalWidth} × {metadata.originalHeight}px</p>
                      <p>New size: {metadata.newWidth} × {metadata.newHeight}px</p>
                      <p>Scale factor: {metadata.scale}x</p>
                      <p>Original size: {(metadata.originalSize / 1024).toFixed(2)}KB</p>
                      <p>Processed size: {(metadata.processedSize / 1024).toFixed(2)}KB</p>
                    </div>
                  )}
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="w-full"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download Image
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="flex h-64 w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <FileImage className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Upscaled image will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Message */}
      {getStatusMessage() && (
        <div className="text-center text-sm text-muted-foreground">
          {getStatusMessage()}
        </div>
      )}
    </div>
  )
}