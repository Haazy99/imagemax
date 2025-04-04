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

export default function ConverterPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [outputFormat, setOutputFormat] = useState("webp")
  const [quality, setQuality] = useState(80)
  const [metadata, setMetadata] = useState<{
    width: number;
    height: number;
    inputFormat: string;
    outputFormat: string;
    quality: number;
  } | null>(null)
  const { success, error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploading(true)
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
        setIsUploading(false)
        setProcessedImage(null)
        setMetadata(null)
        success("Image uploaded successfully", "You can now convert the image")
      }
      reader.onerror = () => {
        setIsUploading(false)
        error("Upload failed", "Please try uploading the image again")
      }
      reader.readAsDataURL(file)
    }
  }

  const handleConvert = async () => {
    if (!selectedFile) {
      error("No image selected", "Please upload an image first")
      return
    }

    setIsProcessing(true)
    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('format', outputFormat)
      formData.append('quality', quality.toString())

      // Call the API
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to convert image')
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
      const blob = new Blob([bytes], { type: `image/${data.metadata.outputFormat}` })
      const url = URL.createObjectURL(blob)
      
      setProcessedImage(url)
      setMetadata(data.metadata)
      success("Image converted successfully", "Your image is ready to download")
    } catch (err) {
      console.error('Error converting image:', err)
      error(
        "Conversion failed", 
        err instanceof Error ? err.message : "Failed to convert image. Please try again."
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.href = processedImage
    link.download = `converted-image.${metadata?.outputFormat || 'webp'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    success("Download started", "Your converted image is being downloaded")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Format Converter</h2>
        <p className="text-muted-foreground">
          Convert your images to different formats with customizable quality
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
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
                    </div>
                  )}
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

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleConvert}
          disabled={!selectedFile || isProcessing}
          className="min-w-[200px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Converting...
            </>
          ) : (
            "Convert Image"
          )}
        </Button>
        <Button
          onClick={handleDownload}
          disabled={!processedImage}
          variant="outline"
          className="min-w-[200px]"
        >
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>
    </div>
  )
} 