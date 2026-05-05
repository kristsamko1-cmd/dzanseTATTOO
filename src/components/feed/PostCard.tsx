import { format } from 'date-fns'
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import type { Artist, Post } from '../../types/domain'

type Props = {
  post: Post
  artist: Artist
  liked: boolean
  onToggleLike: () => void
  onOpenComments: () => void
}

export function PostCard({ post, artist, liked, onToggleLike, onOpenComments }: Props) {
  const images = useMemo(() => {
    const gallery = post.galleryImageUrls?.filter(Boolean) ?? []
    if (gallery.length > 0) return gallery
    return [post.imageUrl]
  }, [post.galleryImageUrls, post.imageUrl])

  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const activeImage = images[Math.min(activeImageIndex, images.length - 1)]

  return (
    <article className="group">
      <div className="flex items-center gap-4 mb-8">
        <img
          alt=""
          className="w-12 h-12 rounded-full grayscale border border-white/10 object-cover"
          src={artist.avatarUrl}
          loading="lazy"
        />
        <div>
          <h4 className="font-[var(--font-serif)] text-[10px] text-white uppercase tracking-widest">
            {artist.name}
          </h4>
          <p className="text-xs text-white/40 font-[var(--font-sans)]">
            {format(new Date(post.createdAtIso), 'd. MMM yyyy')}
          </p>
        </div>
      </div>

      <div className="relative overflow-hidden mb-8 border border-white/5">
        <img
          alt=""
          className="w-full aspect-[16/9] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
          src={activeImage}
          loading="lazy"
        />
      </div>

      {images.length > 1 ? (
        <div className="flex gap-2 mb-8">
          {images.slice(0, 5).map((url, idx) => (
            <button
              key={url + idx}
              type="button"
              onClick={() => setActiveImageIndex(idx)}
              className="w-16 h-12 overflow-hidden border border-white/10 hover:border-[#d6a4a4] transition-colors"
              aria-label={`Gallery image ${idx + 1}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover grayscale" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="max-w-2xl">
        {post.categoryNames.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.categoryNames.slice(0, 4).map((c) => (
              <span
                key={c}
                className="border border-white/10 text-white/50 px-3 py-1 text-[10px] font-[var(--font-serif)] uppercase tracking-widest"
              >
                {c}
              </span>
            ))}
          </div>
        ) : null}

        <p className="font-[var(--font-sans)] text-white/70 mb-8 leading-relaxed">{post.description}</p>

        <div className="flex items-center justify-between py-6 border-t border-white/10">
          <div className="flex items-center gap-8">
            <motion.button
              type="button"
              onClick={onToggleLike}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-white/40 hover:text-[#d6a4a4] transition-colors"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: `'FILL' ${liked ? 1 : 0}, 'wght' 300, 'GRAD' 0, 'opsz' 24` }}
              >
                favorite
              </span>
              <span className="text-xs font-[var(--font-serif)]">{post.likeCount}</span>
            </motion.button>

            <button
              type="button"
              onClick={onOpenComments}
              className="flex items-center gap-2 text-white/40 hover:text-[#d6a4a4] transition-colors"
            >
              <span className="material-symbols-outlined">chat_bubble</span>
              <span className="text-xs font-[var(--font-serif)]">{post.commentCount}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenComments}
            className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.2em] flex items-center gap-2 group/link"
          >
            Komentáre
            <span className="material-symbols-outlined text-sm transition-transform group-hover/link:translate-x-2">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}

