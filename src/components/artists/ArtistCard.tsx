import type { Artist } from '../../types/domain'
import { Link } from 'react-router-dom'

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      to={`/artist/${artist.id}`}
      className="group border border-white/10 bg-[#0a0a0a] overflow-hidden hover:border-white/20 transition-colors"
    >
      <div className="relative overflow-hidden">
        <img
          src={artist.avatarUrl}
          alt={artist.name}
          className="w-full aspect-[4/3] object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-8">
        <h3 className="font-[var(--font-display)] text-white text-2xl mb-3 group-hover:text-[#d6a4a4] transition-colors duration-500">
          {artist.name}
        </h3>
        <p className="text-white/60 leading-relaxed">{artist.bio}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {artist.specialties.slice(0, 3).map((s) => (
            <span
              key={s}
              className="border border-white/10 text-white/50 px-3 py-1 text-[10px] font-[var(--font-serif)] uppercase tracking-widest"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}

