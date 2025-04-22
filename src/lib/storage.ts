import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Storage quota limits (in bytes)
export const STORAGE_QUOTA_LIMITS = {
  FREE: 100 * 1024 * 1024, // 100MB
  PRO: 1024 * 1024 * 1024, // 1GB
}

// Warning threshold percentage
export const STORAGE_WARNING_THRESHOLD = 80

export interface StorageUsage {
  total: number
  used: number
  remaining: number
  percentage: number
}

interface ProcessedImage {
  file_size: number | null
  image_metadata: {
    originalSize?: number;
    processedSize?: number;
  } | null;
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const supabase = createClientComponentClient()
  
  // Get user's subscription tier
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  const quotaLimit = profile?.subscription_tier === 'pro' 
    ? STORAGE_QUOTA_LIMITS.PRO 
    : STORAGE_QUOTA_LIMITS.FREE

  // Get total storage used
  const { data: files, error: filesError } = await supabase
    .from('processed_images')
    .select('file_size, image_metadata')
    .eq('user_id', user.id)

  if (filesError) {
    throw filesError
  }

  const totalUsed = (files as ProcessedImage[]).reduce((acc: number, file: ProcessedImage) => {
    // Use file_size if available, otherwise try to extract from metadata
    if (file.file_size) {
      return acc + file.file_size;
    }
    
    // Fallback to metadata if available
    if (file.image_metadata) {
      const originalSize = file.image_metadata.originalSize || 0;
      const processedSize = file.image_metadata.processedSize || 0;
      return acc + originalSize + processedSize;
    }
    
    return acc;
  }, 0);

  return {
    total: quotaLimit,
    used: totalUsed,
    remaining: Math.max(0, quotaLimit - totalUsed),
    percentage: (totalUsed / quotaLimit) * 100
  }
}

export async function checkStorageQuota(fileSize: number): Promise<{
  allowed: boolean
  remaining: number
  message?: string
}> {
  const usage = await getStorageUsage()
  
  if (usage.remaining < fileSize) {
    return {
      allowed: false,
      remaining: usage.remaining,
      message: 'Storage quota exceeded. Please upgrade your plan or delete some files.'
    }
  }

  return {
    allowed: true,
    remaining: usage.remaining
  }
}

export async function cleanupOldFiles(): Promise<{
  success: boolean
  message: string
  errors?: any[]
}> {
  try {
    const response = await fetch('/api/storage/cleanup', {
      method: 'POST',
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to clean up files')
    }

    return {
      success: true,
      message: data.message,
      errors: data.storageErrors
    }
  } catch (error) {
    console.error('Error cleaning up files:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to clean up files'
    }
  }
} 