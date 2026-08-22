import imageCompression from 'browser-image-compression'
import { SupabaseClient } from '@supabase/supabase-js'

export const BUCKET_NAME = 'gym_images'
export const MAX_FILE_SIZE_BYTES = 200 * 1024 // 200KB strict limit

/**
 * Client-Side Image Compression under 200KB using browser-image-compression
 */
export async function compressImageTo200KB(file: File): Promise<File> {
  let options = {
    maxSizeMB: 0.19, // ~194KB
    maxWidthOrHeight: 1280,
    useWebWorker: true,
    initialQuality: 0.8,
  }

  try {
    let compressed = await imageCompression(file, options)

    // Iterative compression if still >= 200KB
    let quality = 0.7
    let maxDim = 1000

    while (compressed.size > MAX_FILE_SIZE_BYTES && quality > 0.1) {
      options = {
        maxSizeMB: 0.18,
        maxWidthOrHeight: maxDim,
        useWebWorker: true,
        initialQuality: quality,
      }
      compressed = await imageCompression(file, options)
      quality -= 0.15
      maxDim -= 200
    }

    console.log(`📷 Image compressed from ${(file.size / 1024).toFixed(1)}KB to ${(compressed.size / 1024).toFixed(1)}KB`)
    return compressed
  } catch (err) {
    console.error('Error during browser-image-compression:', err)
    return file
  }
}

/**
 * Extracts storage relative file path from a Supabase storage public URL
 */
export function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null
  try {
    const publicPattern = `/public/${BUCKET_NAME}/`
    if (url.includes(publicPattern)) {
      const parts = url.split(publicPattern)
      const rawPath = parts[parts.length - 1]
      return decodeURIComponent(rawPath.split('?')[0])
    }

    const searchPattern = `/${BUCKET_NAME}/`
    if (url.includes(searchPattern)) {
      const parts = url.split(searchPattern)
      const rawPath = parts[parts.length - 1]
      return decodeURIComponent(rawPath.split('?')[0])
    }
  } catch (e) {
    console.error('Error parsing storage URL path:', e)
  }
  return null
}

/**
 * Uploads image to `gym_images` bucket with Storage Cleanup (deleting old file first)
 */
export async function uploadAndReplaceImage({
  supabase,
  file,
  memberId,
  fieldName,
  oldPhotoUrl,
}: {
  supabase: SupabaseClient
  file: File
  memberId: string
  fieldName: 'profile_pic_url' | 'before_photo_url' | 'current_photo_url'
  oldPhotoUrl?: string | null
}): Promise<{ publicUrl: string | null; error: Error | null }> {
  try {
    // 1. Strict Client-Side Compression under 200KB
    const compressedFile = await compressImageTo200KB(file)

    // 2. Storage Cleanup: Delete old photo from `gym_images` bucket if user already has a URL
    const oldStoragePath = extractStoragePath(oldPhotoUrl)
    if (oldStoragePath) {
      console.log(`🗑️ Storage Cleanup: Deleting old image from ${BUCKET_NAME} (${oldStoragePath})...`)
      const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([oldStoragePath])
      if (removeError) {
        console.warn(`⚠️ Notice removing old image (${oldStoragePath}):`, removeError.message)
      } else {
        console.log(`✅ Storage Cleanup: Successfully deleted old photo (${oldStoragePath})`)
      }
    }

    // 3. Cache Busting: `${member.id}/current_${Date.now()}.jpg`
    const cleanMemberId = (memberId || 'member').replace(/[^a-zA-Z0-9_-]/g, '_')
    const fileExt = compressedFile.name.split('.').pop() || 'jpg'
    const prefix = fieldName === 'before_photo_url' ? 'before' : fieldName === 'current_photo_url' ? 'current' : 'profile'
    const filePath = `${cleanMemberId}/${prefix}_${Date.now()}.${fileExt}`

    // 4. Upload new compressed file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedFile, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase Storage Upload Error:', uploadError)
      return { publicUrl: null, error: uploadError }
    }

    // 5. Get Public URL
    const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)
    const publicUrl = publicUrlData.publicUrl

    return { publicUrl, error: null }
  } catch (err: any) {
    console.error('Exception in uploadAndReplaceImage:', err)
    return { publicUrl: null, error: err }
  }
}
