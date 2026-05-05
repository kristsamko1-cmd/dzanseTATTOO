export type ID = string

export type UserRole = 'tattooer' | 'client'

export type Category = {
  id: ID
  name: string
}

export type Artist = {
  id: ID
  userId: ID
  name: string
  avatarUrl: string
  bio: string
  specialties: string[]
  instagramUrl?: string | null
  galleryImageUrls: string[]
}

export type Booking = {
  id: ID
  artistId: ID
  clientName: string
  clientEmail: string
  note?: string
  startsAtIso: string
  createdAtIso: string
}

export type Post = {
  id: ID
  artistId: ID
  imageUrl: string // legacy: first image in gallery
  galleryImageUrls: string[]
  title?: string | null
  location?: string | null
  style?: string | null
  description: string
  createdAtIso: string
  likeCount: number
  commentCount: number
  categoryIds: ID[]
  categoryNames: string[]
}

export type Comment = {
  id: ID
  postId: ID
  authorLabel: string
  message: string
  createdAtIso: string
}

export type AuthUser = {
  id: ID
  email: string
  role: UserRole
  artistId: ID | null
}
