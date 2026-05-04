import { supabase } from '../lib/supabase'

export async function uploadPostImage(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const path = `posts/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('post-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw error

  const { data } = supabase.storage.from('post-images').getPublicUrl(path)
  return data.publicUrl
}
