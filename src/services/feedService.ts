import type { Comment, ID, Post } from '../types/domain'
import { supabase } from '../lib/supabase'

type FeedRow = {
  id: string
  artist_id: string
  image_url: string
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
    description: row.description,
    createdAtIso: row.created_at,
    likeCount: row.likes.length,
    commentCount: row.comments.length,
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
    .from('posts')
    .select('id,artist_id,image_url,description,created_at,likes:post_likes(id),comments:post_comments(id)')
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
    .from('posts')
    .select('id,artist_id,image_url,description,created_at,likes:post_likes(id),comments:post_comments(id)')
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
  const authorLabel = userData.user?.user_metadata?.artist_name || (userId ? 'Prihlásený používateľ' : 'Anon')

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

export async function createPost(input: { description: string; imageUrl: string }) {
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

  const { data, error } = await supabase
    .from('posts')
    .insert({
      artist_id: artist.id,
      image_url: input.imageUrl,
      description: input.description.trim(),
    })
    .select('id,artist_id,image_url,description,created_at,likes:post_likes(id),comments:post_comments(id)')
    .single()
  if (error) throw error
  return mapPost(data as FeedRow)
}

