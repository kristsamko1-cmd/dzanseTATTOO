import type { Category, Comment, ID, Post } from '../types/domain'
import { supabase } from '../lib/supabase'

type FeedRow = {
  id: string
  artist_id: string
  image_url: string
  gallery_image_urls: string[]
  title: string | null
  location: string | null
  style: string | null
  description: string
  created_at: string
  like_count: number
  comment_count: number
  category_ids: ID[]
  category_names: string[]
}

function mapPost(row: FeedRow): Post {
  return {
    id: row.id,
    artistId: row.artist_id,
    imageUrl: row.image_url,
    galleryImageUrls: row.gallery_image_urls ?? [],
    title: row.title,
    location: row.location,
    style: row.style,
    description: row.description,
    createdAtIso: row.created_at,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    categoryIds: row.category_ids ?? [],
    categoryNames: row.category_names ?? [],
  }
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

async function fetchLikeIdsByUser(userId: string | null) {
  if (!userId) return new Set<string>()
  const { data, error } = await supabase.from('post_likes').select('post_id').eq('user_id', userId)
  if (error) throw error
  return new Set((data ?? []).map((row) => row.post_id))
}

export async function listPosts() {
  const { data, error } = await supabase
    .from('posts_feed_v')
    .select(
      'id,artist_id,image_url,gallery_image_urls,title,location,style,description,created_at,like_count,comment_count,category_ids,category_names',
    )
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []).map((row) => mapPost(row as FeedRow))
}

export async function listFeedItems() {
  const [posts, userId] = await Promise.all([listPosts(), getCurrentUserId()])
  const likedIds = await fetchLikeIdsByUser(userId)
  return posts.map((post) => ({
    post,
    liked: likedIds.has(post.id),
  }))
}

export async function getPost(postId: ID) {
  const { data: postRow, error: postError } = await supabase
    .from('posts_feed_v')
    .select(
      'id,artist_id,image_url,gallery_image_urls,title,location,style,description,created_at,like_count,comment_count,category_ids,category_names',
    )
    .eq('id', postId)
    .maybeSingle()
  if (postError) throw postError
  if (!postRow) throw new Error('Post not found')

  const userId = await getCurrentUserId()
  const likedIds = await fetchLikeIdsByUser(userId)
  const { data: commentRows, error: commentError } = await supabase
    .from('post_comments')
    .select('id,author_label,message,created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: false })
  if (commentError) throw commentError

  const comments: Comment[] = (commentRows ?? []).map((row) => ({
    id: row.id,
    postId,
    authorLabel: row.author_label,
    message: row.message,
    createdAtIso: row.created_at,
  }))
  return {
    post: mapPost(postRow as FeedRow),
    liked: likedIds.has(postId),
    comments,
  }
}

export async function toggleLike(postId: ID) {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Na lajkovanie musíš byť prihlásený.')

  const { data, error } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error

  if (data) {
    const { error: deleteError } = await supabase.from('post_likes').delete().eq('id', data.id)
    if (deleteError) throw deleteError
    return false
  }

  const { error: insertError } = await supabase.from('post_likes').insert({ post_id: postId, user_id: userId })
  if (insertError) throw insertError
  return true
}

export async function addAnonymousComment(postId: ID, message: string) {
  const trimmed = message.trim()
  if (trimmed.length < 2) {
    throw new Error('Komentár je príliš krátky.')
  }

  const userId = await getCurrentUserId()
  const { data: userData } = await supabase.auth.getUser()
  const authorLabel = userId ? userData.user?.email ?? 'Prihlásený používateľ' : 'Anon'

  const { data, error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      author_label: authorLabel,
      message: trimmed,
      user_id: userId,
    })
    .select('id,created_at')
    .single()
  if (error) throw error

  const comment: Comment = {
    id: data.id,
    postId,
    authorLabel,
    message: trimmed,
    createdAtIso: data.created_at,
  }
  return comment
}

export async function createPost(input: {
  description: string
  galleryImageUrls: string[]
  title?: string
  location?: string
  style?: string
  categoryIds: ID[]
}) {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) throw new Error('Najprv sa prihlás ako tatér.')

  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (artistError) throw artistError
  if (!artist) throw new Error('Tento účet nie je tatér. Registruj sa ako tatér.')

  const firstImage = input.galleryImageUrls[0]
  if (!firstImage) throw new Error('Post musí mať aspoň 1 fotku.')

  const { data: inserted, error: postError } = await supabase
    .from('posts')
    .insert({
      artist_id: artist.id,
      image_url: firstImage,
      gallery_image_urls: input.galleryImageUrls,
      description: input.description.trim(),
      title: input.title?.trim() ? input.title.trim() : null,
      location: input.location?.trim() ? input.location.trim() : null,
      style: input.style?.trim() ? input.style.trim() : null,
    })
    .select('id')
    .single()

  if (postError) throw postError

  const postId = inserted.id as ID
  if (input.categoryIds.length > 0) {
    const rows = input.categoryIds.map((category_id) => ({
      post_id: postId,
      category_id,
    }))
    const { error: pcError } = await supabase.from('post_categories').insert(rows)
    if (pcError) throw pcError
  }

  const { data: full, error: fullError } = await supabase
    .from('posts_feed_v')
    .select(
      'id,artist_id,image_url,gallery_image_urls,title,location,style,description,created_at,like_count,comment_count,category_ids,category_names',
    )
    .eq('id', postId)
    .maybeSingle()

  if (fullError) throw fullError
  if (!full) throw new Error('Post nebol nájdený po vložení.')

  return mapPost(full as FeedRow)
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('id,name').order('name', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => ({ id: row.id, name: row.name }))
}

