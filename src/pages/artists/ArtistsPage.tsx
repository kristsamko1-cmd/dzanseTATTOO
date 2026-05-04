import { ArtistCard } from '../../components/artists/ArtistCard'
import { useArtists } from '../../state/artists'

export function ArtistsPage() {
  const { artists, loading } = useArtists()

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-8">
        <h1 className="font-[var(--font-display)] text-white text-6xl md:text-7xl mb-6 md:mb-0">
          Tatéri
        </h1>
        <p className="text-white/50 max-w-xl leading-relaxed">
          Vyber si štýl a tatéra. Profily sú prepojené s dostupnosťou v rezerváciách.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? <p className="text-white/50">Načítavam tatérov…</p> : null}
        {!loading && artists.length === 0 ? <p className="text-white/50">Zatiaľ bez tatérov.</p> : null}
        {artists.map((a) => (
          <ArtistCard key={a.id} artist={a} />
        ))}
      </div>
    </div>
  )
}

