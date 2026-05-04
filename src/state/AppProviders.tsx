import { useEffect } from 'react'
import { ArtistsProvider } from './artists'
import { AuthProvider } from './auth'
import { BookingProvider } from './booking'
import { FeedProvider, useFeed } from './feed'

function FeedBootstrap({ children }: { children: React.ReactNode }) {
  const { refresh } = useFeed()
  useEffect(() => {
    void refresh()
  }, [refresh])
  return children
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ArtistsProvider>
        <BookingProvider>
          <FeedProvider>
            <FeedBootstrap>{children}</FeedBootstrap>
          </FeedProvider>
        </BookingProvider>
      </ArtistsProvider>
    </AuthProvider>
  )
}

