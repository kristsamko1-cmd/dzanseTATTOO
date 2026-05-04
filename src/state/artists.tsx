import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as artistsService from '../services/artistsService'
import type { Artist, ID } from '../types/domain'

type ArtistsContextValue = {
  artists: Artist[]
  loading: boolean
  getArtist: (id: ID) => Artist | undefined
  refresh: () => Promise<void>
}

const ArtistsContext = createContext<ArtistsContextValue | null>(null)

export function ArtistsProvider({ children }: { children: React.ReactNode }) {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const next = await artistsService.listArtists()
    setArtists(next)
  }, [])

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const next = await artistsService.listArtists()
        if (active) setArtists(next)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<ArtistsContextValue>(() => {
    return {
      artists,
      loading,
      getArtist: (id) => artists.find((a) => a.id === id),
      refresh,
    }
  }, [artists, loading, refresh])

  return <ArtistsContext.Provider value={value}>{children}</ArtistsContext.Provider>
}

export function useArtists() {
  const ctx = useContext(ArtistsContext)
  if (!ctx) throw new Error('useArtists must be used within ArtistsProvider')
  return ctx
}

