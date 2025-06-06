"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Loader2, FileImage } from "lucide-react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { checkStorageQuota } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'

type ProcessStatus = 'pending' | 'processing' | 'completed' | 'failed'

export default function ConverterPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('pending')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState("webp")
  const [quality, setQuality] = useState(80)
  const [metadata, setMetadata] = useState<{
    width: number;
    height: number;
    inputFormat: string;
    outputFormat: string;
    quality: number;
    originalSize: number;
    processedSize: number;
  } | null>(null)
  const { success, error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
    setProcessedImage(null)
    setOriginalUrl(null)
    setProcessedUrl(null)
    setMetadata(null)
    setErrorMessage(null)

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    setPreviewImage(imageUrl)
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      error("No image selected", "Please upload an image first")
      return
    }

    setProcessStatus('processing')
    setErrorMessage(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('format', outputFormat)
      formData.append('quality', quality.toString())

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.details || 'Failed to convert image')
      }

      setProcessStatus('completed')
      setProcessedImage(data.processedUrl)
      setOriginalUrl(data.originalUrl)
      setProcessedUrl(data.processedUrl)
      setMetadata(data.metadata)
      success("Image converted successfully", "Your image is ready to download")
    } catch (err) {
      console.error('Error converting image:', err)
      setProcessStatus('failed')
      const errorMsg = err instanceof Error ? err.message : "Failed to convert image. Please try again."
      setErrorMessage(errorMsg)
      error("Conversion failed", errorMsg)
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
      link.download = `converted-image.${metadata?.outputFormat || 'webp'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      success("Download started", "Your converted image is being downloaded")
    } catch (err) {
      error(
        "Download failed",
        "Failed to download the image. Please try again."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Image Converter</h1>
        <p className="text-muted-foreground">
          Convert your images to different formats
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
                    alt="Preview"
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

        {/* Processing Section */}
        <Card>
          <CardHeader>
            <CardTitle>Converted Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-4">
              {processedImage ? (
                <>
                  <div className="relative aspect-square w-full max-w-md overflow-hidden rounded-lg">
                    <Image
                      src={processedImage}
                      alt="Converted"
                      fill
                      className="object-contain"
                    />
                  </div>
                  {metadata && (
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Original size: {metadata.width} × {metadata.height}px</p>
                      <p>Original format: {metadata.inputFormat.toUpperCase()}</p>
                      <p>Converted to: {metadata.outputFormat.toUpperCase()} ({metadata.quality}% quality)</p>
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
                    Converted image will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Output Format</label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select output format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="webp">WebP</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPEG</SelectItem>
                  <SelectItem value="avif">AVIF</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quality</label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[quality]}
                  onValueChange={(value) => setQuality(value[0])}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="min-w-[3rem] text-sm">{quality}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleConvert}
          disabled={!selectedFile || processStatus === 'processing'}
          className="w-full max-w-md"
        >
          {processStatus === 'processing' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <FileImage className="mr-2 h-4 w-4" />
              Convert Image
            </>
          )}
        </Button>
      </div>

      {/* Status Message */}
      {processStatus !== 'pending' && (
        <div className="text-center text-sm text-muted-foreground">
          {processStatus === 'processing' && 'Converting image...'}
          {processStatus === 'completed' && 'Image converted successfully'}
          {processStatus === 'failed' && (
            <div className="text-red-500">
              <p>Failed to convert image</p>
              {errorMessage && <p className="mt-1 text-xs">{errorMessage}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
} 