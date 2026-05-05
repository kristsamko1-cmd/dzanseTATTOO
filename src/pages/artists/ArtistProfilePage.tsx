import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useArtists } from '../../state/artists'
import { formatISO } from 'date-fns'
import { useBooking } from '../../state/booking'

export function ArtistProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getArtist } = useArtists()
  const booking = useBooking()
  const artist = id ? getArtist(id) : undefined

  const [dayIso, setDayIso] = useState(() => formatISO(new Date(), { representation: 'date' }))
  const [availability, setAvailability] = useState<Array<{ startsAtIso: string; available: boolean }>>(
    [],
  )

  const preview = useMemo(() => (artist ? artist.galleryImageUrls.slice(0, 6) : []), [artist])

  if (!artist) {
    return (
      <div className="max-w-[1440px] mx-auto px-6 md:px-16">
        <div className="border border-white/10 bg-[#0a0a0a] p-10">
          <p className="text-white/60">Tatér sa nenašiel.</p>
          <Link className="text-[#d6a4a4] underline" to="/taters">
            Späť na zoznam
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 border border-white/10 bg-[#0a0a0a] overflow-hidden">
          <img
            src={artist.avatarUrl}
            alt={artist.name}
            className="w-full aspect-[4/3] object-cover grayscale"
          />
          <div className="p-10">
            <span className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.3em]">
              Profil tatéra
            </span>
            <h1 className="font-[var(--font-display)] text-white text-5xl mt-4">{artist.name}</h1>
            <p className="mt-6 text-white/60 leading-relaxed">{artist.bio}</p>
            <div className="mt-8 flex flex-wrap gap-2">
              {artist.specialties.map((s) => (
                <span
                  key={s}
                  className="border border-white/10 text-white/50 px-3 py-1 text-[10px] font-[var(--font-serif)] uppercase tracking-widest"
                >
                  {s}
                </span>
              ))}
            </div>

            <div className="mt-6">
              {artist.instagramUrl ? (
                <a
                  href={artist.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 border border-white/10 px-8 py-3 font-[var(--font-serif)] uppercase tracking-widest text-sm text-white/70 hover:text-[#d6a4a4] hover:border-[#d6a4a4] transition-colors"
                >
                  <span className="material-symbols-outlined">public</span>
                  Instagram
                </a>
              ) : null}
            </div>

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/rezervacia', { state: { artistId: artist.id } })}
                className="bg-[#d6a4a4] text-black px-8 py-3 font-[var(--font-serif)] uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
              >
                Rezervovať
              </button>
              <Link
                to="/galeria"
                className="border border-white/10 px-8 py-3 font-[var(--font-serif)] uppercase tracking-widest text-sm text-white/70 hover:text-[#d6a4a4] hover:border-[#d6a4a4] transition-colors"
              >
                Galéria
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="border border-white/10 bg-[#0a0a0a] p-10">
            <h2 className="font-[var(--font-display)] text-white text-3xl">Ukážka prác</h2>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
              {preview.map((url, idx) => (
                <div key={`${url}-${idx}`} className="border border-white/10 overflow-hidden">
                  <img
                    src={url}
                    alt=""
                    className="w-full aspect-square object-cover grayscale hover:grayscale-0 transition-all duration-700"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 border border-white/10 bg-[#0a0a0a] p-10">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <h2 className="font-[var(--font-display)] text-white text-3xl">Dostupnosť</h2>
                <p className="mt-2 text-white/50">Rýchly náhľad termínov pre vybraný deň.</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dayIso}
                  onChange={(e) => setDayIso(e.target.value)}
                  className="bg-transparent border border-white/10 px-4 py-3 text-white/80"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const slots = await booking.listAvailability(artist.id, dayIso)
                    setAvailability(slots)
                  }}
                  className="border border-white/10 px-6 py-3 font-[var(--font-serif)] uppercase tracking-widest text-xs text-white/70 hover:text-[#d6a4a4] hover:border-[#d6a4a4] transition-colors"
                >
                  Zobraziť
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              {availability.length === 0 ? (
                <p className="text-white/40 col-span-full">
                  Vyber dátum a klikni „Zobraziť“.
                </p>
              ) : (
                availability.map((s) => (
                  <div
                    key={s.startsAtIso}
                    className="border border-white/10 px-4 py-3 text-sm text-white/70 flex items-center justify-between"
                  >
                    <span>
                      {new Date(s.startsAtIso).toLocaleTimeString('sk-SK', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className={s.available ? 'text-[#d6a4a4]' : 'text-white/30'}>
                      {s.available ? 'voľné' : 'obsadené'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

