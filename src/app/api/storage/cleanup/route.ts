import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Maximum age for files in days
const MAX_FILE_AGE_DAYS = 7

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get files older than MAX_FILE_AGE_DAYS
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - MAX_FILE_AGE_DAYS)

    // Get old files from all tool tables
    const { data: oldFiles, error: dbError } = await supabase
      .from('processed_images')
      .select('id, original_url, processed_url, created_at')
      .eq('user_id', user.id)
      .lt('created_at', cutoffDate.toISOString())

    if (dbError) {
      throw dbError
    }

    if (!oldFiles || oldFiles.length === 0) {
      return NextResponse.json({ message: 'No files to clean up' })
    }

    // Delete files from storage
    const storageErrors = []
    for (const file of oldFiles) {
      if (file.original_url) {
        const { error: originalError } = await supabase.storage
          .from('images')
          .remove([file.original_url])
        if (originalError) storageErrors.push(originalError)
      }
      if (file.processed_url) {
        const { error: processedError } = await supabase.storage
          .from('images')
          .remove([file.processed_url])
        if (processedError) storageErrors.push(processedError)
      }
    }

    // Delete records from database
    const { error: deleteError } = await supabase
      .from('processed_images')
      .delete()
      .in('id', oldFiles.map(f => f.id))

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({
      message: `Cleaned up ${oldFiles.length} files`,
      storageErrors: storageErrors.length > 0 ? storageErrors : undefined
    })
  } catch (error) {
    console.error('Error cleaning up files:', error)
    return NextResponse.json(
      { error: 'Failed to clean up files' },
      { status: 500 }
    )
  }
} 