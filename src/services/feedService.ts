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

type LegacyFeedRow = {
  id: string
  artist_id: string
  image_url: string
  gallery_image_urls: string[] | null
  description: string
  created_at: string
  likes: Array<{ id: string }>
  comments: Array<{ id: string }>
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

function mapLegacyPost(row: LegacyFeedRow): Post {
  return {
    id: row.id,
    artistId: row.artist_id,
    imageUrl: row.image_url,
    galleryImageUrls: row.gallery_image_urls ?? [row.image_url],
    title: null,
    location: null,
    style: null,
    description: row.description,
    createdAtIso: row.created_at,
    likeCount: row.likes.length,
    commentCount: row.comments.length,
    categoryIds: [],
    categoryNames: [],
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

  if (!error) return (data ?? []).map((row) => mapPost(row as FeedRow))
  if (!['42P01', '42703'].includes(error.code ?? '')) throw error

  const legacy = await supabase
    .from('posts')
    .select('id,artist_id,image_url,gallery_image_urls,description,created_at,likes:post_likes(id),comments:post_comments(id)')
    .order('created_at', { ascending: false })
  if (legacy.error) throw legacy.error
  return (legacy.data ?? []).map((row) => mapLegacyPost(row as LegacyFeedRow))
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
  let mappedPost: Post | null = null
  if (!postError) {
    if (!postRow) throw new Error('Post not found')
    mappedPost = mapPost(postRow as FeedRow)
  } else if (['42P01', '42703'].includes(postError.code ?? '')) {
    const legacyPost = await supabase
      .from('posts')
      .select('id,artist_id,image_url,gallery_image_urls,description,created_at,likes:post_likes(id),comments:post_comments(id)')
      .eq('id', postId)
      .maybeSingle()
    if (legacyPost.error) throw legacyPost.error
    if (!legacyPost.data) throw new Error('Post not found')
    mappedPost = mapLegacyPost(legacyPost.data as LegacyFeedRow)
  } else {
    throw postError
  }

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
    post: mappedPost,
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

export async function updateComment(commentId: ID, message: string) {
  const trimmed = message.trim()
  if (trimmed.length < 2) {
    throw new Error('Komentár je príliš krátky.')
  }

  const { error } = await supabase.from('post_comments').update({ message: trimmed }).eq('id', commentId)
  if (error) throw error
}

export async function deleteComment(commentId: ID) {
  const { error } = await supabase.from('post_comments').delete().eq('id', commentId)
  if (error) throw error
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

  const payload = {
    artist_id: artist.id,
    image_url: firstImage,
    gallery_image_urls: input.galleryImageUrls,
    description: input.description.trim(),
    title: input.title?.trim() ? input.title.trim() : null,
    location: input.location?.trim() ? input.location.trim() : null,
    style: input.style?.trim() ? input.style.trim() : null,
  }

  let inserted: { id: ID } | null = null
  let postError: { code?: string; message?: string } | null = null
  const createRich = await supabase.from('posts').insert(payload).select('id').single()
  inserted = createRich.data as { id: ID } | null
  postError = createRich.error

  if (postError && postError.code === '42703') {
    // Legacy schema without title/location/style columns.
    const legacyInsert = await supabase
      .from('posts')
      .insert({
        artist_id: artist.id,
        image_url: firstImage,
        gallery_image_urls: input.galleryImageUrls,
        description: input.description.trim(),
        tags: [],
      })
      .select('id')
      .single()
    inserted = legacyInsert.data as { id: ID } | null
    postError = legacyInsert.error
  }

  if (postError) throw postError
  if (!inserted) throw new Error('Nepodarilo sa vytvoriť post.')

  const postId = inserted.id as ID
  if (input.categoryIds.length > 0) {
    const rows = input.categoryIds.map((category_id) => ({
      post_id: postId,
      category_id,
    }))
    const { error: pcError } = await supabase.from('post_categories').insert(rows)
    if (pcError) throw pcError
  }

  const details = await getPost(postId)
  return details.post
}

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('id,name').order('name', { ascending: true })
  if (!error) return (data ?? []).map((row) => ({ id: row.id, name: row.name }))

  if (error.code !== '42501') throw error
  const fallback = await supabase.from('posts_feed_v').select('category_ids,category_names')
  if (fallback.error) throw fallback.error

  const byName = new Map<string, Category>()
  for (const row of fallback.data ?? []) {
    const ids = (row.category_ids ?? []) as string[]
    const names = (row.category_names ?? []) as string[]
    for (let i = 0; i < Math.min(ids.length, names.length); i++) {
      const id = ids[i]
      const name = names[i]
      if (id && name && !byName.has(name)) byName.set(name, { id, name })
    }
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, 'sk'))
}

export async function listMyPosts() {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) throw new Error('Najprv sa prihlás ako tatér.')

  const { data: artist, error: artistError } = await supabase
    .from('artists')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()
  if (artistError) throw artistError
  if (!artist) return []

  const { data, error } = await supabase
    .from('posts_feed_v')
    .select('id,artist_id,image_url,gallery_image_urls,description,created_at,like_count,comment_count,category_ids,category_names')
    .eq('artist_id', artist.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row) => mapPost(row as FeedRow))
}

export async function updatePost(postId: ID, input: { description: string }) {
  const description = input.description.trim()
  if (description.length < 10) throw new Error('Popis postu musí mať aspoň 10 znakov.')
  const { error } = await supabase.from('posts').update({ description }).eq('id', postId)
  if (error) throw error
}

export async function deletePost(postId: ID) {
  const { error } = await supabase.from('posts').delete().eq('id', postId)
  if (error) throw error
}

