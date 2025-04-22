import { createClient } from '@supabase/supabase-js'

// Types
export interface RemoveBgConfig {
  apiKey: string
  outputFormat: 'png' | 'jpg' | 'zip'
  size: 'preview' | 'full' | 'auto'
  type: 'auto' | 'person' | 'product' | 'car'
  channels: 'rgba' | 'alpha'
}

export interface ProcessingResult {
  success: boolean
  data?: string // base64 image data
  error?: string
  metadata: {
    originalSize: number
    processedSize: number
    format: string
    width: number
    height: number
    settings: Partial<RemoveBgConfig>
  }
}

export interface RemoveBgError extends Error {
  code: string
  status: number
}

export class RemoveBgService {
  private readonly apiKey: string
  private readonly supabase
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async removeBackground(
    imageFile: File,
    config: Partial<RemoveBgConfig> = {}
  ): Promise<ProcessingResult> {
    const startTime = Date.now()
    
    try {
      const formData = new FormData()
      formData.append('image_file', imageFile)
      
      const settings = {
        outputFormat: config.outputFormat || 'png',
        size: config.size || 'auto',
        type: config.type || 'auto',
        channels: config.channels || 'rgba'
      }

      formData.append('size', settings.size)
      formData.append('type', settings.type)
      formData.append('format', settings.outputFormat)
      formData.append('channels', settings.channels)

      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.apiKey,
        },
        body: formData,
      })

      const processingDuration = Date.now() - startTime

      if (!response.ok) {
        const error = await response.json()
        throw {
          message: error.errors?.[0]?.title || 'Failed to remove background',
          code: error.errors?.[0]?.code || 'UNKNOWN_ERROR',
          status: response.status,
        } as RemoveBgError
      }

      const arrayBuffer = await response.arrayBuffer()
      const base64Image = Buffer.from(arrayBuffer).toString('base64')
      
      // Get image metadata
      const metadata = {
        originalSize: imageFile.size,
        processedSize: arrayBuffer.byteLength,
        format: settings.outputFormat,
        width: 0, // We don't have dimensions in server context
        height: 0, // We don't have dimensions in server context
        settings
      }

      // Log usage in database
      await this.logToolUsage({
        success: true,
        processingTime: processingDuration,
        metadata: {
          originalSize: metadata.originalSize,
          processedSize: metadata.processedSize,
          format: metadata.format,
          settings
        },
      })

      return {
        success: true,
        data: base64Image,
        metadata,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      
      // Log failed attempt
      await this.logToolUsage({
        success: false,
        error: errorMessage,
        processingTime: Date.now() - startTime,
        metadata: {
          originalSize: imageFile.size,
          settings: {
            outputFormat: config.outputFormat || 'png',
            size: config.size || 'auto',
            type: config.type || 'auto',
            channels: config.channels || 'rgba'
          }
        },
      })

      throw error
    }
  }

  private async logToolUsage({
    success,
    error,
    processingTime,
    metadata,
  }: {
    success: boolean
    error?: string
    processingTime: number
    metadata: Record<string, any>
  }) {
    const { error: dbError } = await this.supabase
      .from('tool_usage')
      .insert({
        tool_type: 'background-removal',
        success,
        error_message: error,
        processing_time: processingTime,
        request_metadata: metadata,
      })

    if (dbError) {
      console.error('Failed to log tool usage:', dbError)
    }
  }
} 