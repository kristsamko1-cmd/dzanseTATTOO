import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ID, Post } from '../types/domain'
import * as feedService from '../services/feedService'

type FeedContextValue = {
  posts: Post[]
  likedByPostId: Record<ID, boolean>
  loading: boolean
  refresh: () => Promise<void>
  toggleLike: (postId: ID) => Promise<void>
  addComment: (postId: ID, message: string) => Promise<void>
  createPost: (input: { description: string; imageUrl: string }) => Promise<void>
  getPostDetails: (postId: ID) => Promise<{
    post: Post
    liked: boolean
    comments: Array<{ id: ID; authorLabel: string; message: string; createdAtIso: string }>
  }>
}

const FeedContext = createContext<FeedContextValue | null>(null)

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([])
  const [likedByPostId, setLikedByPostId] = useState<Record<ID, boolean>>({})
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const items = await feedService.listFeedItems()
      setPosts(items.map((i) => i.post))
      setLikedByPostId(
        items.reduce<Record<ID, boolean>>((acc, i) => {
          acc[i.post.id] = i.liked
          return acc
        }, {}),
      )
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleLike = useCallback(
    async (postId: ID) => {
      await feedService.toggleLike(postId)
      await refresh()
    },
    [refresh],
  )

  const addComment = useCallback(
    async (postId: ID, message: string) => {
      await feedService.addAnonymousComment(postId, message)
      await refresh()
    },
    [refresh],
  )

  const value = useMemo<FeedContextValue>(() => {
    return {
      posts,
      likedByPostId,
      loading,
      refresh,
      toggleLike,
      addComment,
      createPost: async (input) => {
        await feedService.createPost(input)
        await refresh()
      },
      getPostDetails: feedService.getPost,
    }
  }, [posts, likedByPostId, loading, refresh, toggleLike, addComment])

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>
}

export function useFeed() {
  const ctx = useContext(FeedContext)
  if (!ctx) throw new Error('useFeed must be used within FeedProvider')
  return ctx
}

