import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AppFooter } from './components/layout/AppFooter'
import { AppHeader } from './components/layout/AppHeader'
import { BookingPage } from './pages/BookingPage'
import { GalleryPage } from './pages/GalleryPage'
import { HomePage } from './pages/HomePage'
import { ArtistProfilePage } from './pages/artists/ArtistProfilePage'
import { ArtistsPage } from './pages/artists/ArtistsPage'
import { FeedPage } from './pages/feed/FeedPage'
import { TattooerPortalPage } from './pages/TattooerPortalPage'
import { AppProviders } from './state/AppProviders'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="min-h-[calc(100svh-120px)]"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/pribehy" element={<FeedPage />} />
          <Route path="/taters" element={<ArtistsPage />} />
          <Route path="/artist/:id" element={<ArtistProfilePage />} />
          <Route path="/rezervacia" element={<BookingPage />} />
          <Route path="/tater" element={<TattooerPortalPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProviders>
        <div className="min-h-[100svh] bg-[#0a0a0a] text-[var(--color-on-surface)]">
          <AppHeader />
          <main className="pt-40 pb-32">
            <AnimatedRoutes />
          </main>
          <AppFooter />
        </div>
      </AppProviders>
    </BrowserRouter>
  )
}
