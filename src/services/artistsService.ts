import { supabase } from '../lib/supabase'
import type { Artist, ID } from '../types/domain'

type ArtistRow = {
  id: string
  user_id: string
  name: string
  avatar_url: string | null
  bio: string
  specialties: string[]   // ❗ nie null
  instagram_url: string | null
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
    instagramUrl: row.instagram_url ?? null,
    galleryImageUrls: row.gallery_image_urls ?? [],
  }
}

export async function listArtists() {
  const { data, error } = await supabase
    .from('artists_profile_v')
    .select('id,user_id,name,avatar_url,bio,specialties,instagram_url,gallery_image_urls')
    .order('name', { ascending: true })

  if (!error) return (data ?? []).map(mapArtist)
  if (error.code !== '42P01') throw error

  const fallback = await supabase
    .from('artists')
    .select('id,user_id,name,avatar_url,bio,specialties,instagram_url,gallery_image_urls')
    .order('name', { ascending: true })
  if (fallback.error) throw fallback.error
  return (fallback.data ?? []).map(mapArtist)
}

export async function getArtist(artistId: ID) {
  const { data, error } = await supabase
    .from('artists_profile_v')
    .select('id,user_id,name,avatar_url,bio,specialties,instagram_url,gallery_image_urls')
    .eq('id', artistId)
    .maybeSingle()

  if (!error) return data ? mapArtist(data) : null
  if (error.code !== '42P01') throw error

  const fallback = await supabase
    .from('artists')
    .select('id,user_id,name,avatar_url,bio,specialties,instagram_url,gallery_image_urls')
    .eq('id', artistId)
    .maybeSingle()
  if (fallback.error) throw fallback.error
  return fallback.data ? mapArtist(fallback.data) : null
}

export async function upsertArtistProfile(input: {
  name: string
  bio: string
  avatarUrl: string
  instagramUrl: string
  specialtyCategoryIds: ID[]
}) {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Nie ste prihlásený.')

  // Upsert base artist row; specialties are stored in artists_specialties join table.
  const { data: artistRow, error: upsertErr } = await supabase
    .from('artists')
    .upsert(
      {
        user_id: user.id,
        name: input.name.trim(),
        bio: input.bio.trim(),
        avatar_url: input.avatarUrl,
        instagram_url: input.instagramUrl,
      },
      { onConflict: 'user_id' },
    )
    .select('id')
    .single()

  if (upsertErr) throw upsertErr
  const artistId = artistRow.id as ID

  // Primary path: normalize via artists_specialties join table.
  const { error: delErr } = await supabase.from('artists_specialties').delete().eq('artist_id', artistId)
  if (!delErr) {
    if (input.specialtyCategoryIds.length > 0) {
      const rows = input.specialtyCategoryIds.map((category_id) => ({
        artist_id: artistId,
        category_id,
      }))
      const { error: insErr } = await supabase.from('artists_specialties').insert(rows)
      if (insErr) throw insErr
    }
    return
  }

  // Fallback path for current DB: write legacy artists.specialties text[] directly.
  if (!['42P01', 'PGRST205', 'PGRST204'].includes(delErr.code ?? '')) throw delErr
  const { data: catRows, error: catErr } = await supabase
    .from('categories')
    .select('id,name')
    .in('id', input.specialtyCategoryIds)
  if (catErr) throw catErr

  const specialtyNames = (catRows ?? []).map((c) => c.name)
  const { error: legacyErr } = await supabase.from('artists').update({ specialties: specialtyNames }).eq('id', artistId)
  if (legacyErr) throw legacyErr
}
