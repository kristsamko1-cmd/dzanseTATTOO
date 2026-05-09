import { addMinutes, formatISO, isSameDay, parseISO, setHours, setMinutes } from 'date-fns'
import type { Booking, ID } from '../types/domain'
import { supabase } from '../lib/supabase'

type CreateBookingInput = {
  artistId: ID
  clientName: string
  clientEmail: string
  note?: string
  startsAtIso: string
}

let bookingSlotsMissing = false

function mapBooking(row: {
  id: string
  artist_id: string
  client_name: string
  client_email: string
  note: string | null
  starts_at: string
  created_at: string
}): Booking {
  return {
    id: row.id,
    artistId: row.artist_id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    note: row.note ?? undefined,
    startsAtIso: row.starts_at,
    createdAtIso: row.created_at,
  }
}

export async function listBookingsByArtist(artistId: ID) {
  const { data, error } = await supabase
    .from('bookings')
    .select('id,artist_id,client_name,client_email,note,starts_at,created_at')
    .eq('artist_id', artistId)
    .order('starts_at', { ascending: true })
  if (error) throw error
  return (data ?? []).map(mapBooking)
}

export function buildDailySlots(dayIso: string) {
  const day = parseISO(dayIso)
  const start = setMinutes(setHours(day, 10), 0)
  const end = setMinutes(setHours(day, 18), 0)

  const slots: string[] = []
  for (let t = start; t < end; t = addMinutes(t, 60)) {
    slots.push(formatISO(t))
  }
  return slots
}

export async function listAvailability(artistId: ID, dayIso: string) {
  const day = parseISO(dayIso)
  const slots = buildDailySlots(dayIso)
  const fromIso = setMinutes(setHours(day, 0), 0).toISOString()
  const toIso = setMinutes(setHours(day, 23), 59).toISOString()

  let takenRows: Array<{ starts_at: string }> | null = null
  if (!bookingSlotsMissing) {
    const { data, error } = await supabase
      .from('booking_slots')
      .select('starts_at')
      .eq('artist_id', artistId)
      .gte('starts_at', fromIso)
      .lt('starts_at', toIso)

    if (!error) {
      takenRows = data
    } else {
      // Fallback for DBs where booking_slots table was not created yet.
      if (!['42P01', '42501', 'PGRST205', 'PGRST204'].includes(error.code ?? '')) throw error
      bookingSlotsMissing = true
    }
  }

  if (!takenRows) {
    const fallback = await supabase
      .from('bookings')
      .select('starts_at')
      .eq('artist_id', artistId)
      .gte('starts_at', fromIso)
      .lt('starts_at', toIso)
    if (fallback.error && !['42P01', '42501'].includes(fallback.error.code ?? '')) throw fallback.error
    takenRows = fallback.data
  }

  const takenTimestamps = new Set(
    (takenRows ?? [])
    .map((b) => b.starts_at)
    .filter((iso) => isSameDay(parseISO(iso), day))
      .map((iso) => new Date(iso).getTime()),
  )

  return slots.map((iso) => ({
    startsAtIso: iso,
    available: !takenTimestamps.has(new Date(iso).getTime()),
  }))
}

export async function createBooking(input: CreateBookingInput) {
  const { error } = await supabase
    .from('bookings')
    .insert({
      artist_id: input.artistId,
      client_name: input.clientName,
      client_email: input.clientEmail,
      note: input.note ?? null,
      starts_at: input.startsAtIso,
    })
  if (error) {
    // Unique constraint collision (slot already taken) is expected occasionally.
    if (error.code === '23505') {
      throw new Error('Tento termín už nie je dostupný. Vyber si prosím iný čas.')
    }
    if (error.code === '42501') {
      throw new Error('Rezerváciu sa nepodarilo uložiť kvôli prístupovým pravidlám. Skús to znova o chvíľu.')
    }
    throw error
  }
  return {
    id: crypto.randomUUID(),
    artistId: input.artistId,
    clientName: input.clientName,
    clientEmail: input.clientEmail,
    note: input.note,
    startsAtIso: input.startsAtIso,
    createdAtIso: new Date().toISOString(),
  }
}

