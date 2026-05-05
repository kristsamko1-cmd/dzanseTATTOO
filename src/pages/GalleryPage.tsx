import { useMemo, useState } from 'react'
import clsx from 'clsx'

type Filter = 'Všetko' | 'Linework' | 'Realism' | 'Custom sleeves'

const galleryImages = [
  '/images/fotky-tetovani/1.webp',
  '/images/fotky-tetovani/2.webp',
  '/images/fotky-tetovani/3.webp',
  '/images/fotky-tetovani/4.webp',
  '/images/fotky-tetovani/5.webp',
  '/images/fotky-tetovani/6.webp',
  '/images/fotky-tetovani/7.webp',
]

export function GalleryPage() {
  const [filter, setFilter] = useState<Filter>('Všetko')

  const items = useMemo(() => {
    const base = [
      {
        title: 'Mýtus',
        tag: 'Mythology',
        filter: 'Realism' as const,
        span: 'md:col-span-4 md:row-span-2',
        image: galleryImages[0],
      },
      { title: 'Pohľad', tag: 'Architecture', filter: 'Linework' as const, span: 'md:col-span-8', image: galleryImages[1] },
      { title: 'Flóra', tag: 'Nature', filter: 'Linework' as const, span: 'md:col-span-4', image: galleryImages[2] },
      { title: 'Geometria', tag: 'Modernism', filter: 'Custom sleeves' as const, span: 'md:col-span-4', image: galleryImages[3] },
      { title: 'Kráľ', tag: 'Majesty', filter: 'Realism' as const, span: 'md:col-span-8', image: galleryImages[4] },
      { title: 'Ornament', tag: 'Custom', filter: 'Custom sleeves' as const, span: 'md:col-span-6', image: galleryImages[5] },
    ]
    if (filter === 'Všetko') return base
    return base.filter((i) => i.filter === filter)
  }, [filter])

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-white/5 pb-8">
        <h1 className="font-[var(--font-display)] text-white text-6xl md:text-7xl mb-6 md:mb-0">
          Galéria
        </h1>

        <div className="flex flex-wrap gap-4">
          {(['Všetko', 'Linework', 'Realism', 'Custom sleeves'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={clsx(
                'border px-6 py-2 font-[var(--font-serif)] text-[10px] uppercase tracking-widest transition-colors',
                filter === f
                  ? 'border-[#d6a4a4] text-[#d6a4a4] bg-white/5'
                  : 'border-white/10 text-white/50 hover:border-white/30 hover:text-white',
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {items.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className={clsx(
              item.span,
              'group relative overflow-hidden bg-[var(--color-surface-container)] border border-white/5',
            )}
          >
            <img
              className={clsx(
                'w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700',
                idx === 0 ? 'h-[420px] md:h-[600px]' : idx === 4 ? 'h-[320px] md:h-[400px]' : 'h-[260px] md:h-[288px]',
              )}
              src={item.image}
              alt={item.title}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
              <span className="text-[#d6a4a4] font-[var(--font-serif)] text-[10px] uppercase tracking-[0.2em] mb-2">
                {item.tag}
              </span>
              <h3 className="font-[var(--font-display)] text-white text-3xl">{item.title}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 flex justify-center">
        <button className="group flex items-center gap-4 border border-white/10 px-12 py-5 font-[var(--font-serif)] tracking-[0.3em] uppercase text-sm hover:border-[#d6a4a4] hover:text-[#d6a4a4] transition-all duration-500">
          ĎALŠIE PRÁCE
          <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-y-1">
            expand_more
          </span>
        </button>
      </div>
    </div>
  )
}

