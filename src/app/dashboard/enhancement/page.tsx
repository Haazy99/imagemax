"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Upload, Download, Loader2, Wand2, Palette, Sparkles, Focus, Sun, FileImage } from "lucide-react"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { checkStorageQuota } from '@/lib/storage'
import { StorageUsage } from '@/components/storage-usage'

interface EnhancementSettings {
  // Filters
  filter: string;
  filterIntensity: number;
  
  // Colors
  saturation: number;
  temperature: number;
  hue: number;
  vibrance: number;
  
  // Effects
  blur: number;
  sharpen: number;
  vignette: number;
  grain: number;
  
  // Details
  clarity: number;
  structure: number;
  denoise: number;
  sharpness: number;
  
  // Light
  exposure: number;
  contrast: number;
  highlights: number;
  shadows: number;
  brightness: number;
  gamma: number;
}

type UpdateSettingsValue = number | string;
type ProcessStatus = 'pending' | 'processing' | 'completed' | 'failed'

export default function EnhancementPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [processStatus, setProcessStatus] = useState<ProcessStatus>('pending')
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [processedUrl, setProcessedUrl] = useState<string | null>(null)
  const [selectedTab, setSelectedTab] = useState("filters")
  const [settings, setSettings] = useState<EnhancementSettings>({
    // Filters
    filter: "none",
    filterIntensity: 100,
    
    // Colors
    saturation: 0,
    temperature: 0,
    hue: 0,
    vibrance: 0,
    
    // Effects
    blur: 0,
    sharpen: 0,
    vignette: 0,
    grain: 0,
    
    // Details
    clarity: 0,
    structure: 0,
    denoise: 0,
    sharpness: 0,
    
    // Light
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    brightness: 0,
    gamma: 0,
  })
  
  const [metadata, setMetadata] = useState<{
    width: number;
    height: number;
    format: string;
    originalSize: number;
    processedSize: number;
  } | null>(null)
  
  const { success, error } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

    setIsUploading(true)
    setSelectedFile(file)
    setProcessStatus('pending')
    setProcessedImage(null)
    setOriginalUrl(null)
    setProcessedUrl(null)
    setMetadata(null)

    // Create URL for preview
    const imageUrl = URL.createObjectURL(file)
    setPreviewImage(imageUrl)

    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewImage(reader.result as string)
      setIsUploading(false)
      success("Image uploaded successfully", "You can now enhance the image")
    }
    reader.onerror = () => {
      setIsUploading(false)
      error("Upload failed", "Please try uploading the image again")
    }
    reader.readAsDataURL(file)
  }

  const handleEnhance = async () => {
    if (!selectedFile) {
      error("No image selected", "Please upload an image first")
      return
    }

    setProcessStatus('processing')
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('settings', JSON.stringify(settings))

      const response = await fetch('/api/enhance', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to enhance image')
      }

      setProcessStatus('completed')
      setPreviewImage(result.originalUrl)
      setProcessedImage(result.processedUrl)
      setOriginalUrl(result.originalUrl)
      setProcessedUrl(result.processedUrl)
      setMetadata(result.metadata)
      success("Image enhanced successfully", "Your image is ready to download")
    } catch (err) {
      console.error('Error enhancing image:', err)
      setProcessStatus('failed')
      error(
        "Processing failed", 
        err instanceof Error ? err.message : "Failed to enhance image. Please try again."
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
      link.download = `enhanced-image.${metadata?.format || 'png'}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      success("Download started", "Your enhanced image is being downloaded")
    } catch (err) {
      error(
        "Download failed",
        "Failed to download the image. Please try again."
      )
    } finally {
      setIsDownloading(false)
    }
  }

  const updateSettings = (key: keyof EnhancementSettings, value: UpdateSettingsValue) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Image Enhancement</h1>
        <p className="text-muted-foreground">
          Enhance your images with AI-powered adjustments
        </p>
      </div>

      <StorageUsage />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Original Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>Original Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={previewImage}
                    alt="Original image"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <FileImage className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      No image selected
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Image Section */}
        <Card>
          <CardHeader>
            <CardTitle>Enhanced Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processedImage ? (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
                  <Image
                    src={processedImage}
                    alt="Enhanced image"
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      {processStatus === 'processing' ? 'Processing...' : 'No enhanced image yet'}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-center gap-2">
                <Button
                  onClick={handleEnhance}
                  disabled={!selectedFile || processStatus === 'processing'}
                >
                  {processStatus === 'processing' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Enhance Image
                    </>
                  )}
                </Button>
                {processedImage && (
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Enhancement Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="effects">Effects</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <RadioGroup
                    value={settings.filter}
                    onValueChange={(value: string) => updateSettings('filter', value)}
                    className="grid grid-cols-3 gap-4"
                  >
                    {['none', 'vintage', 'noir', 'sepia', 'vivid', 'cool', 'warm'].map((filter) => (
                      <div key={filter} className="flex items-center space-x-2">
                        <RadioGroupItem value={filter} id={`filter-${filter}`} />
                        <Label htmlFor={`filter-${filter}`} className="capitalize">
                          {filter}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter Intensity</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.filterIntensity]}
                      onValueChange={(value) => updateSettings('filterIntensity', value[0])}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.filterIntensity}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Saturation</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.saturation]}
                      onValueChange={(value) => updateSettings('saturation', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.saturation}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Temperature</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.temperature]}
                      onValueChange={(value) => updateSettings('temperature', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.temperature}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Hue</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.hue]}
                      onValueChange={(value) => updateSettings('hue', value[0])}
                      min={-180}
                      max={180}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.hue}°</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vibrance</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.vibrance]}
                      onValueChange={(value) => updateSettings('vibrance', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.vibrance}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="effects" className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Blur</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.blur]}
                      onValueChange={(value) => updateSettings('blur', value[0])}
                      min={0}
                      max={20}
                      step={0.1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.blur.toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sharpen</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.sharpen]}
                      onValueChange={(value) => updateSettings('sharpen', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.sharpen}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vignette</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.vignette]}
                      onValueChange={(value) => updateSettings('vignette', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.vignette}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Grain</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.grain]}
                      onValueChange={(value) => updateSettings('grain', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.grain}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Clarity</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.clarity]}
                      onValueChange={(value) => updateSettings('clarity', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.clarity}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Structure</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.structure]}
                      onValueChange={(value) => updateSettings('structure', value[0])}
                      min={-100}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.structure}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Noise Reduction</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.denoise]}
                      onValueChange={(value) => updateSettings('denoise', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.denoise}%</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Sharpness</label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.sharpness]}
                      onValueChange={(value) => updateSettings('sharpness', value[0])}
                      min={0}
                      max={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="min-w-[3rem] text-sm">{settings.sharpness}%</span>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Status Message */}
      {processStatus !== 'pending' && (
        <div className="text-center text-sm text-muted-foreground">
          {processStatus === 'processing' && 'Enhancing image...'}
          {processStatus === 'completed' && 'Image enhanced successfully'}
          {processStatus === 'failed' && 'Failed to enhance image'}
        </div>
      )}
    </div>
  )
} 