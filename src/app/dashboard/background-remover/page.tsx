"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Loader2 } from "lucide-react"
import Image from "next/image"

export default function BackgroundRemoverPage() {
  const { success, error } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Invalid file type', 'Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      error('File too large', 'Please upload an image smaller than 5MB')
      return
    }

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    setOriginalImage(imageUrl)
    setProcessedImage(null)
  }

  const handleRemoveBackground = async () => {
    if (!originalImage) return

    try {
      setIsLoading(true)

      // Get the file from the input
      const file = fileInputRef.current?.files?.[0]
      if (!file) {
        error('No file selected', 'Please select an image first')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        error('File too large', 'Please upload an image smaller than 5MB')
        return
      }

      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        error('Invalid file type', 'Please upload a JPG, PNG, or WebP image')
        return
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)

      // Call the API
      const response = await fetch('/api/remove-background', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove background')
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
      success('Background removed successfully', 'Your image is ready to download')
    } catch (err) {
      console.error('Error removing background:', err)
      error(
        'Failed to remove background',
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
    link.download = 'removed-background.png'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Background Remover</h1>
        <p className="text-muted-foreground">
          Remove backgrounds from your images with AI-powered precision
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Original Image</CardTitle>
            <CardDescription>
              Upload an image to remove its background
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

              <Button
                onClick={handleRemoveBackground}
                disabled={!originalImage || isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Removing Background...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Remove Background
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Processed Image</CardTitle>
            <CardDescription>
              Your image with the background removed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedImage ? (
                <>
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={processedImage}
                      alt="Processed"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Image
                  </Button>
                </>
              ) : (
                <div className="flex h-[300px] items-center justify-center rounded-lg border bg-muted">
                  <p className="text-sm text-muted-foreground">
                    Processed image will appear here
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 