import { formatDistanceToNow } from 'date-fns'
import { useMemo, useState } from 'react'
import type { ID } from '../../types/domain'

type CommentDTO = { id: ID; authorLabel: string; message: string; createdAtIso: string }

type Props = {
  comments: CommentDTO[]
  onAdd: (message: string) => Promise<void>
  canModerate?: boolean
  onEdit?: (commentId: ID, message: string) => Promise<void>
  onDelete?: (commentId: ID) => Promise<void>
}

export function CommentSection({ comments, onAdd, canModerate = false, onEdit, onDelete }: Props) {
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<ID | null>(null)
  const [editingMessage, setEditingMessage] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  const canSubmit = useMemo(() => message.trim().length >= 2 && !submitting, [message, submitting])

  return (
    <section className="border border-white/10 bg-[#0a0a0a] p-8">
      <h3 className="font-[var(--font-display)] text-white text-2xl mb-6">Komentáre</h3>

      <form
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!canSubmit) return
          setSubmitting(true)
          try {
            await onAdd(message.trim())
            setMessage('')
          } finally {
            setSubmitting(false)
          }
        }}
      >
        <div className="border-b border-white/20 pb-2">
          <label className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-widest block mb-1">
            Anonymný komentár
          </label>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="bg-transparent border-none w-full text-white placeholder:text-white/20 focus:ring-0 p-0 font-[var(--font-sans)]"
            placeholder="Napíš krátky odkaz..."
          />
        </div>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-[#d6a4a4] text-black py-4 font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {submitting ? 'Odosielam…' : 'Pridať komentár'}
        </button>
      </form>

      <div className="mt-10 flex flex-col gap-6">
        {comments.length === 0 ? (
          <p className="text-white/40 leading-relaxed">Zatiaľ bez komentárov. Buď prvý.</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <span className="font-[var(--font-serif)] text-[10px] text-white uppercase tracking-widest">
                  {c.authorLabel}
                </span>
                <span className="text-xs text-white/40">
                  {formatDistanceToNow(new Date(c.createdAtIso), { addSuffix: true })}
                </span>
              </div>
              {editingId === c.id ? (
                <div className="mt-3 flex flex-col gap-3">
                  <input
                    value={editingMessage}
                    onChange={(e) => setEditingMessage(e.target.value)}
                    className="bg-transparent border border-white/20 px-3 py-2 text-white"
                    placeholder="Uprav komentár"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={editingMessage.trim().length < 2 || savingEdit}
                      className="border border-[#d6a4a4] px-3 py-1 text-xs text-[#d6a4a4] disabled:opacity-40"
                      onClick={async () => {
                        if (!onEdit) return
                        setSavingEdit(true)
                        try {
                          await onEdit(c.id, editingMessage.trim())
                          setEditingId(null)
                          setEditingMessage('')
                        } finally {
                          setSavingEdit(false)
                        }
                      }}
                    >
                      Uložiť
                    </button>
                    <button
                      type="button"
                      className="border border-white/20 px-3 py-1 text-xs text-white/70"
                      onClick={() => {
                        setEditingId(null)
                        setEditingMessage('')
                      }}
                    >
                      Zrušiť
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-white/70 leading-relaxed">{c.message}</p>
              )}
              {canModerate && editingId !== c.id ? (
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    className="text-xs text-white/50 hover:text-[#d6a4a4]"
                    onClick={() => {
                      setEditingId(c.id)
                      setEditingMessage(c.message)
                    }}
                  >
                    Upraviť
                  </button>
                  <button
                    type="button"
                    className="text-xs text-white/50 hover:text-[#d6a4a4]"
                    onClick={() => {
                      if (!onDelete) return
                      void onDelete(c.id)
                    }}
                  >
                    Vymazať
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

