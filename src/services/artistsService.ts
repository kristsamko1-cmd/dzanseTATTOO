import { supabase } from '../lib/supabase'
import type { Artist, ID } from '../types/domain'

type ArtistRow = {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  bio: string
  specialties: string[]   // ❗ nie null
  gallery_image_urls: string[]
}
function mapArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    avatarUrl: row.avatar_url ?? '/images/fotky-tetovani/1.jpg',
    bio: row.bio,
    specialties: row.specialties ?? [],
    galleryImageUrls: row.gallery_image_urls ?? [],
  }
}

export async function listArtists() {
  const { data, error } = await supabase
    .from('artists')
    .select('id,user_id,name,avatar_url,bio,specialties,gallery_image_urls')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapArtist)
}

export async function getArtist(artistId: ID) {
  const { data, error } = await supabase
    .from('artists')
    .select('id,user_id,name,avatar_url,bio,specialties,gallery_image_urls')
    .eq('id', artistId)
    .maybeSingle()

  if (error) throw error
  return data ? mapArtist(data) : null
}
