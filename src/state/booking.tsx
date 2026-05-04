import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { Booking, ID } from '../types/domain'
import * as bookingService from '../services/bookingService'

type AvailabilitySlot = { startsAtIso: string; available: boolean }

type BookingContextValue = {
  listBookingsByArtist: (artistId: ID) => Promise<Booking[]>
  listAvailability: (artistId: ID, dayIso: string) => Promise<AvailabilitySlot[]>
  createBooking: (input: {
    artistId: ID
    clientName: string
    clientEmail: string
    note?: string
    startsAtIso: string
  }) => Promise<Booking>
  lastCreatedBooking: Booking | null
}

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [lastCreatedBooking, setLastCreatedBooking] = useState<Booking | null>(null)

  const createBooking = useCallback<BookingContextValue['createBooking']>(async (input) => {
    const booking = await bookingService.createBooking(input)
    setLastCreatedBooking(booking)
    return booking
  }, [])

  const value = useMemo<BookingContextValue>(() => {
    return {
      listBookingsByArtist: bookingService.listBookingsByArtist,
      listAvailability: bookingService.listAvailability,
      createBooking,
      lastCreatedBooking,
    }
  }, [createBooking, lastCreatedBooking])

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}

