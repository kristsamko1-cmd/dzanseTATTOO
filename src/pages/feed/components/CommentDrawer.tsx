import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { CommentSection } from '../../../components/feed/CommentSection'
import { useFeed } from '../../../state/feed'
import type { ID } from '../../../types/domain'

export function CommentDrawer({
  postId,
  onClose,
  onAdd,
  canModerate,
  onEdit,
  onDelete,
}: {
  postId: ID | null
  onClose: () => void
  onAdd: (postId: ID, message: string) => Promise<void>
  canModerate?: boolean
  onEdit?: (commentId: ID, message: string) => Promise<void>
  onDelete?: (commentId: ID) => Promise<void>
}) {
  const { getPostDetails } = useFeed()
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState<
    Array<{ id: ID; authorLabel: string; message: string; createdAtIso: string }>
  >([])

  useEffect(() => {
    let cancelled = false
    if (!postId) return

    setLoading(true)
    void (async () => {
      try {
        const details = await getPostDetails(postId)
        if (!cancelled) setComments(details.comments)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [getPostDetails, postId])

  return (
    <AnimatePresence>
      {postId ? (
        <>
          <motion.button
            aria-label="Close comments"
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-xl overflow-y-auto custom-scrollbar bg-[#0a0a0a] border-l border-white/10 p-6 md:p-10"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="font-[var(--font-serif)] text-[10px] uppercase tracking-[0.3em] text-white/40">
                Komentáre
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white/40 hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {loading ? (
              <div className="border border-white/10 bg-[#0a0a0a] p-8">
                <p className="text-white/40">Načítavam…</p>
              </div>
            ) : (
              <CommentSection
                comments={comments}
                canModerate={canModerate}
                onAdd={async (message) => {
                  if (!postId) return
                  await onAdd(postId, message)
                  const details = await getPostDetails(postId)
                  setComments(details.comments)
                }}
                onEdit={
                  onEdit
                    ? async (commentId, message) => {
                        if (!postId) return
                        await onEdit(commentId, message)
                        const details = await getPostDetails(postId)
                        setComments(details.comments)
                      }
                    : undefined
                }
                onDelete={
                  onDelete
                    ? async (commentId) => {
                        if (!postId) return
                        await onDelete(commentId)
                        const details = await getPostDetails(postId)
                        setComments(details.comments)
                      }
                    : undefined
                }
              />
            )}
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  )
}

