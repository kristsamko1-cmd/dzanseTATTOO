import { supabase } from '../lib/supabase'

function getFileExt(fileName: string) {
  const ext = fileName.split('.').pop()?.toLowerCase()
  return ext || 'jpg'
}

async function uploadToPublicBucket(bucket: string, prefix: string, file: File): Promise<string> {
  const ext = getFileExt(file.name)
  const path = `${prefix}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function uploadPostImage(file: File) {
  return uploadToPublicBucket('post-images', 'posts', file)
}

export async function uploadPostImages(files: File[]) {
  if (files.length === 0) return []
  return Promise.all(files.map((f) => uploadToPublicBucket('post-images', 'posts', f)))
}

export async function uploadArtistAvatar(file: File) {
  // Reuse existing bucket to avoid extra storage setup.
  // Store under `posts/...` prefix to match existing upload policies.
  return uploadToPublicBucket('post-images', 'posts/avatars', file)
}
