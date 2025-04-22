import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { getStorageUsage, cleanupOldFiles, STORAGE_WARNING_THRESHOLD } from '@/lib/storage'
import type { StorageUsage as StorageUsageType } from '@/lib/storage'
import { Trash2 } from 'lucide-react'

export function StorageUsage() {
  const { success, error } = useToast()
  const [usage, setUsage] = useState<StorageUsageType | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadStorageUsage()
  }, [])

  const loadStorageUsage = async () => {
    try {
      const data = await getStorageUsage()
      setUsage(data)
    } catch (err) {
      error('Error', 'Failed to load storage usage')
    }
  }

  const handleCleanup = async () => {
    try {
      setIsLoading(true)
      const result = await cleanupOldFiles()
      
      if (result.success) {
        success('Success', result.message)
        await loadStorageUsage()
      } else {
        error('Error', result.message)
      }
    } catch (err) {
      error('Error', 'Failed to clean up files')
    } finally {
      setIsLoading(false)
    }
  }

  if (!usage) return null

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Storage Usage</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCleanup}
          disabled={isLoading}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clean Up Old Files
        </Button>
      </div>
      
      <div className="space-y-2">
        <Progress value={usage.percentage} className="h-2" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{formatBytes(usage.used)} used</span>
          <span>{formatBytes(usage.total)} total</span>
        </div>
      </div>

      {usage.percentage > STORAGE_WARNING_THRESHOLD && (
        <p className="text-sm text-yellow-600">
          Warning: You are approaching your storage limit. Consider upgrading your plan or cleaning up old files.
        </p>
      )}
    </div>
  )
} 