import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../state/auth'
import { useArtists } from '../../state/artists'
import { useFeed } from '../../state/feed'
import { PostCard } from '../../components/feed/PostCard'
import type { ID } from '../../types/domain'
import type { Category } from '../../types/domain'
import { listCategories } from '../../services/feedService'
import { CommentDrawer } from './components/CommentDrawer'

export function FeedPage() {
  const auth = useAuth()
  const { getArtist } = useArtists()
  const feed = useFeed()
  const [openPostId, setOpenPostId] = useState<ID | null>(null)

  const posts = feed.posts
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<ID | null>(null)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await listCategories()
        if (!cancelled) setCategories(res)
      } catch {
        // UI ostane funkčné aj keď kategórie nie sú načítané.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const filteredPosts = useMemo(() => {
    if (!selectedCategoryId) return posts
    return posts.filter((p) => p.categoryIds.includes(selectedCategoryId))
  }, [posts, selectedCategoryId])

  const countsByCategoryId = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of posts) {
      for (const cid of p.categoryIds) {
        counts.set(cid, (counts.get(cid) ?? 0) + 1)
      }
    }
    return counts
  }, [posts])

  const sidebarTrending = useMemo(() => filteredPosts.slice(0, 2), [filteredPosts])

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <section className="mb-24">
        <div className="max-w-4xl">
          <span className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.4em] mb-4 block">
            Eseje & Inšpirácia
          </span>
          <h1 className="font-[var(--font-display)] text-white text-6xl md:text-7xl mb-8">
            Príbehy z Ateliéru
          </h1>
          <p className="font-[var(--font-sans)] text-white/60 max-w-2xl">
            Nahliadnite pod povrch našej práce. Od prvých skíc až po finálne zahojenie — zdieľame
            proces tvorby umenia, ktoré zostáva navždy.
          </p>
          <Link
            to="/tater"
            className="inline-block mt-6 border border-white/10 px-6 py-3 text-[10px] font-[var(--font-serif)] uppercase tracking-[0.25em] text-white/70 hover:text-[#d6a4a4] hover:border-[#d6a4a4] transition-colors"
          >
            Prihlásenie tatéra a nový post
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-32">
          {feed.loading && posts.length === 0 ? (
            <div className="border border-white/10 bg-[#0a0a0a] p-10">
              <p className="text-white/40">Načítavam feed…</p>
            </div>
          ) : (
            filteredPosts.map((p) => {
              const artist = getArtist(p.artistId)
              if (!artist) return null

              return (
                <PostCard
                  key={p.id}
                  post={p}
                  artist={artist}
                  liked={feed.likedByPostId[p.id] ?? false}
                  onToggleLike={() => {
                    void feed.toggleLike(p.id).catch((error: unknown) => {
                      const message = error instanceof Error ? error.message : 'Nepodarilo sa uložiť like.'
                      window.alert(message)
                    })
                  }}
                  onOpenComments={() => setOpenPostId(p.id)}
                />
              )
            })
          )}
        </div>

        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-16 lg:pl-12">
          <div>
            <h3 className="font-[var(--font-serif)] text-[10px] text-white uppercase tracking-[0.3em] mb-8 pb-4 border-b border-white/10">
              Kategórie
            </h3>
            <ul className="flex flex-col gap-4">
              <li>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="w-full text-left font-[var(--font-sans)] text-white/60 hover:text-[#d6a4a4] transition-colors flex justify-between"
                >
                  <span>Všetko</span>
                  <span className="text-xs opacity-50">{posts.length}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(c.id)}
                    aria-pressed={selectedCategoryId === c.id}
                    className="w-full text-left font-[var(--font-sans)] text-white/60 hover:text-[#d6a4a4] transition-colors flex justify-between"
                  >
                    <span>{c.name}</span>
                    <span className="text-xs opacity-50">{countsByCategoryId.get(c.id) ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#1a1a1a] p-10 border border-white/5">
            <h3 className="font-[var(--font-display)] text-white text-3xl mb-4">Zostaňte v kontakte</h3>
            <p className="font-[var(--font-sans)] text-white/50 mb-8">
              Dostávajte upozornenia o nových príspevkoch a voľných termínoch priamo do schránky.
            </p>
            <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
              <div className="border-b border-white/20 pb-2">
                <label className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-widest block mb-1">
                  Váš Email
                </label>
                <input
                  className="bg-transparent border-none w-full text-white placeholder:text-white/20 focus:ring-0 p-0 font-[var(--font-sans)]"
                  placeholder="email@example.com"
                  type="email"
                />
              </div>
              <button className="w-full bg-[#d6a4a4] text-black py-4 font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-opacity">
                Odoberať novinky
              </button>
            </form>
          </div>

          <div>
            <h3 className="font-[var(--font-serif)] text-[10px] text-white uppercase tracking-[0.3em] mb-8 pb-4 border-b border-white/10">
              Populárne
            </h3>
            <div className="flex flex-col gap-8">
              {sidebarTrending.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setOpenPostId(p.id)}
                  className="group flex gap-4 text-left"
                >
                  <img
                    alt=""
                    className="w-20 h-20 object-cover grayscale group-hover:grayscale-0 transition-all border border-white/10"
                    src={p.galleryImageUrls[0] ?? p.imageUrl}
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <h5 className="text-sm text-white font-[var(--font-display)] leading-tight group-hover:text-[#d6a4a4] transition-colors">
                      {p.description.slice(0, 52)}…
                    </h5>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-2">
                      {new Date(p.createdAtIso).toLocaleDateString('sk-SK')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <CommentDrawer
        postId={openPostId}
        onClose={() => setOpenPostId(null)}
        canModerate={Boolean(
          openPostId &&
            auth.user?.role === 'tattooer' &&
            auth.user.artistId &&
            posts.find((p) => p.id === openPostId)?.artistId === auth.user.artistId,
        )}
        onAdd={async (postId, message) => {
          await feed.addComment(postId, message)
        }}
        onEdit={async (commentId, message) => {
          await feed.updateComment(commentId, message)
        }}
        onDelete={async (commentId) => {
          await feed.deleteComment(commentId)
        }}
      />
    </div>
  )
}

