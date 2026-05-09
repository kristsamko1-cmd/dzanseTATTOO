import { format, formatISO } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Calendar } from '../components/booking/Calendar'
import { useArtists } from '../state/artists'
import { useBooking } from '../state/booking'
import type { ID } from '../types/domain'
import clsx from 'clsx'

type LocationState = { artistId?: ID } | null

export function BookingPage() {
  const location = useLocation()
  const state = (location.state as LocationState) ?? null

  const { artists } = useArtists()
  const { listAvailability, createBooking, lastCreatedBooking } = useBooking()

  const [artistId, setArtistId] = useState<ID>(state?.artistId ?? artists[0]?.id ?? '')
  const [month, setMonth] = useState(() => new Date())
  const [day, setDay] = useState(() => new Date())
  const [slots, setSlots] = useState<Array<{ startsAtIso: string; available: boolean }>>([])
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const dayIso = useMemo(() => formatISO(day, { representation: 'date' }), [day])

  const markedDays = useMemo(() => {
    const base = []
    const today = new Date()
    for (let i = 0; i < 14; i++) base.push(new Date(today.getFullYear(), today.getMonth(), today.getDate() + i))
    return base
  }, [])

  useEffect(() => {
    if (!artistId) {
      setSlots([])
      return
    }
    let cancelled = false
    setLoadingSlots(true)
    setSelectedSlotIso(null)
    void (async () => {
      try {
        const next = await listAvailability(artistId, dayIso)
        if (!cancelled) setSlots(next)
      } finally {
        if (!cancelled) setLoadingSlots(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [artistId, listAvailability, dayIso])

  useEffect(() => {
    if (!artistId && artists.length > 0) {
      setArtistId(artists[0].id)
    }
  }, [artistId, artists])

  const canSubmit = useMemo(() => {
    if (!artistId) return false
    if (!selectedSlotIso) return false
    if (clientName.trim().length < 2) return false
    if (!clientEmail.includes('@')) return false
    return !submitting
  }, [artistId, selectedSlotIso, clientName, clientEmail, submitting])

  const last = lastCreatedBooking

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <section className="mb-16 border-b border-white/5 pb-8">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <div>
            <span className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.4em] mb-4 block">
              Rezervácia
            </span>
            <h1 className="font-[var(--font-display)] text-white text-6xl md:text-7xl">Termín</h1>
            <p className="mt-6 text-white/60 max-w-2xl leading-relaxed">
              Vyber si tatéra, dátum a čas. Rezervácia sa po odoslaní uloží priamo do databázy.
            </p>
          </div>

          <div className="w-full md:w-auto">
            <label className="font-[var(--font-serif)] text-[10px] text-white/40 uppercase tracking-widest block mb-2">
              Tatér
            </label>
            <select
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
              className="w-full md:w-[260px] bg-transparent border border-white/10 px-4 py-3 text-white/80"
            >
              {artists.length === 0 ? <option className="text-black" value="">Žiadny tatér</option> : null}
              {artists.map((a) => (
                <option key={a.id} value={a.id} className="text-black">
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <Calendar
            month={month}
            selectedDay={day}
            onMonthChange={setMonth}
            onSelectDay={(d) => setDay(d)}
            markedDays={markedDays}
          />

          <div className="mt-6 border border-white/10 bg-[#0a0a0a] p-10">
            <h2 className="font-[var(--font-display)] text-white text-3xl">Časy</h2>
            <p className="mt-2 text-white/50">
              {format(day, 'EEEE, d. MMMM yyyy')}
            </p>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {loadingSlots ? (
                <p className="text-white/40 col-span-full">Načítavam dostupnosť…</p>
              ) : (
                slots.map((s) => {
                  const label = new Date(s.startsAtIso).toLocaleTimeString('sk-SK', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                  const selected = selectedSlotIso === s.startsAtIso
                  return (
                    <button
                      key={s.startsAtIso}
                      type="button"
                      disabled={!s.available}
                      onClick={() => setSelectedSlotIso(s.startsAtIso)}
                      aria-pressed={selected}
                      className={clsx(
                        'border px-4 py-3 text-sm flex items-center justify-between transition-all duration-150',
                        'border-white/10 text-white/70 hover:border-white/30 hover:bg-white/[0.03]',
                        selected &&
                          'border-[#d6a4a4] text-[#d6a4a4] bg-[#d6a4a4]/10 scale-[1.02] shadow-[0_0_0_1px_rgba(214,164,164,0.35)]',
                        !s.available && 'opacity-40 cursor-not-allowed hover:border-white/10',
                      )}
                    >
                      <span className="font-[var(--font-serif)]">{label}</span>
                      <span className="text-[10px] uppercase tracking-widest flex items-center gap-1">
                        {selected ? (
                          <span className="material-symbols-outlined text-sm leading-none">check</span>
                        ) : null}
                        {s.available ? 'voľné' : 'obs.'}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
            {selectedSlotIso ? (
              <p className="mt-4 text-[#d6a4a4] text-sm">
                Vybraný čas:{' '}
                {new Date(selectedSlotIso).toLocaleTimeString('sk-SK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="border border-white/10 bg-[#0a0a0a] p-10">
            <h2 className="font-[var(--font-display)] text-white text-3xl">Detaily</h2>
            <p className="mt-2 text-white/50">Vyplň len základné údaje. Potvrdenie si pripravíme neskôr cez databázu.</p>

            <form
              className="mt-8 flex flex-col gap-6"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!canSubmit || !selectedSlotIso || !artistId) return
                setSubmitting(true)
                  setSubmitError(null)
                try {
                  await createBooking({
                    artistId,
                    clientName: clientName.trim(),
                    clientEmail: clientEmail.trim(),
                    note: note.trim() ? note.trim() : undefined,
                    startsAtIso: selectedSlotIso,
                  })
                  const refreshed = await listAvailability(artistId, dayIso)
                  setSlots(refreshed)
                  setSelectedSlotIso(null)
                  setNote('')
                } catch (error) {
                  setSubmitError(error instanceof Error ? error.message : 'Nepodarilo sa odoslať rezerváciu.')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              <div className="border-b border-white/20 pb-2">
                <label className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-widest block mb-1">
                  Meno
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-transparent border-none w-full text-white placeholder:text-white/20 focus:ring-0 p-0 font-[var(--font-sans)]"
                  placeholder="Vaše meno"
                  autoComplete="name"
                />
              </div>

              <div className="border-b border-white/20 pb-2">
                <label className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-widest block mb-1">
                  Email
                </label>
                <input
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="bg-transparent border-none w-full text-white placeholder:text-white/20 focus:ring-0 p-0 font-[var(--font-sans)]"
                  placeholder="email@example.com"
                  type="email"
                  autoComplete="email"
                />
              </div>

              <div className="border-b border-white/20 pb-2">
                <label className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-widest block mb-1">
                  Poznámka (voliteľné)
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="bg-transparent border-none w-full text-white placeholder:text-white/20 focus:ring-0 p-0 font-[var(--font-sans)]"
                  placeholder="Motív, veľkosť, umiestnenie…"
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmit}
                className="w-full bg-[#d6a4a4] text-black py-4 font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submitting ? 'Odosielam…' : 'Odoslať rezerváciu'}
              </button>

              {last ? (
                <div className="border border-white/10 bg-[#0a0a0a] p-6">
                  <p className="text-white/80 font-[var(--font-display)] text-xl">Rezervácia prijatá.</p>
                  <p className="mt-2 text-white/50">
                    {new Date(last.startsAtIso).toLocaleString('sk-SK')} • {last.clientEmail}
                  </p>
                </div>
              ) : null}

              {submitError ? <p className="text-[#d6a4a4] text-sm">{submitError}</p> : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

