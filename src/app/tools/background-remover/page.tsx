"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Loader2, FileImage, Wand2 } from "lucide-react"
import Image from "next/image"
import { createClient } from '@supabase/supabase-js'
import { checkStorageQuota } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'

interface ProcessedImage {
  success: boolean
  processedUrl?: string
  error?: string
  processId?: string
  metadata: {
    originalSize: number
    processedSize: number
    format: string
    width: number
    height: number
  }
  originalUrl?: string
}

type ProcessStatus = 'pending' | 'processing' | 'completed' | 'failed'

export default function BackgroundRemoverPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('pending')
  const [currentProcessId, setCurrentProcessId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<ProcessedImage['metadata'] | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  
  const { success, error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Poll for status updates when processing
  useEffect(() => {
    let intervalId: NodeJS.Timeout

    const checkStatus = async () => {
      if (currentProcessId && processStatus === 'processing') {
        const { data, error: queryError } = await supabase
          .from('processed_images')
          .select('*')
          .eq('id', currentProcessId)
          .single()

        if (data) {
          setProcessStatus(data.status)
          if (data.status === 'completed') {
            setProcessedImage(data.processed_image_url)
            setOriginalUrl(data.original_image_url)
            setProcessedUrl(data.processed_image_url)
            setMetadata(data.image_metadata)
            success("Background removed successfully", "Your image is ready to download.")
          } else if (data.status === 'failed') {
            setErrorMessage(data.error_message || 'Processing failed')
            error("Processing failed", data.error_message || "Failed to remove background")
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    setPreviewImage(imageUrl)
  }

  const handleRemoveBackground = async () => {
    if (!selectedFile) {
      error(
        "No image selected",
        "Please upload an image first."
      )
      return
    }

    setProcessStatus('processing')
    setErrorMessage(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/tools/background-remover', {
        method: 'POST',
        body: formData,
      })

      const result: ProcessedImage = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to remove background')
      }

      if (result.processId) {
        setCurrentProcessId(result.processId)
      }

      if (!result.processedUrl) {
        throw new Error('No processed image URL received from API')
      }

      // Set the processed image URL directly
      setProcessedImage(result.processedUrl)
      setProcessedUrl(result.processedUrl)
      setProcessStatus('completed')
      success('Background removed successfully', 'Your image is ready to download')
    } catch (err) {
      console.error('Error removing background:', err)
      setProcessStatus('failed')
      setErrorMessage(err instanceof Error ? err.message : "Failed to remove background")
      error(
        "Processing failed",
        err instanceof Error ? err.message : "Failed to remove background. Please try again."
      )
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
      link.download = `background-removed-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      success(
        "Download started",
        "Your processed image is being downloaded."
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
        return 'Removing background...'
      case 'completed':
        return 'Background removed successfully'
      case 'failed':
        return errorMessage || 'Processing failed'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Background Remover</h1>
        <p className="text-muted-foreground">
          Remove backgrounds from your images with AI
        </p>
      </div>

      <StorageUsage />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Original Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              {previewImage ? (
                <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg">
                  <Image
                    src={previewImage}
                    alt="Original"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-64 w-full max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                  <Upload className="h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    Drag and drop your image here, or click to select
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    ref={fileInputRef}
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                  >
                    Select Image
                  </label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Result Section */}
        <Card>
          <CardHeader>
            <CardTitle>Processed Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              {processedImage ? (
                <>
                  <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg">
                    <Image
                      src={processedImage}
                      alt="Processed"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {metadata && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Original size: {metadata.width} × {metadata.height}px</p>
                      <p>Format: {metadata.format.toUpperCase()}</p>
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
                    Processed image will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleRemoveBackground}
          disabled={!selectedFile || processStatus === 'processing'}
          className="w-full max-w-md"
        >
          {processStatus === 'processing' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Remove Background
            </>
          )}
        </Button>
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