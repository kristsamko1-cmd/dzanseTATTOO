import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../state/auth'
import { useFeed } from '../state/feed'
import { uploadArtistAvatar, uploadPostImages } from '../services/storageService'
import { upsertArtistProfile } from '../services/artistsService'
import { listCategories } from '../services/feedService'
import type { Category, ID } from '../types/domain'

export function TattooerPortalPage() {
  const auth = useAuth()
  const feed = useFeed()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [instagramUrl, setInstagramUrl] = useState('https://www.instagram.com/dzanes_tattoo/')
  const [categories, setCategories] = useState<Category[]>([])
  const [specialtyCategoryIds, setSpecialtyCategoryIds] = useState<ID[]>([])

  const [description, setDescription] = useState('')
  const [title, setTitle] = useState('')
  const [location, setLocation] = useState('')
  const [style, setStyle] = useState('')
  const [postFiles, setPostFiles] = useState<File[]>([])
  const [postCategoryIds, setPostCategoryIds] = useState<ID[]>([])
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const canRegister = useMemo(() => {
    return (
      email.includes('@') &&
      password.length >= 6 &&
      name.trim().length >= 2 &&
      bio.trim().length >= 10 &&
      avatarFile !== null &&
      specialtyCategoryIds.length > 0 &&
      instagramUrl.trim().length > 5 &&
      !busy
    )
  }, [email, password, name, bio, avatarFile, specialtyCategoryIds.length, instagramUrl, busy])

  const canLogin = useMemo(() => email.includes('@') && password.length >= 6 && !busy, [email, password, busy])
  const canCreatePost = useMemo(
    () =>
      auth.user?.role === 'tattooer' &&
      description.trim().length >= 10 &&
      postFiles.length > 0 &&
      postCategoryIds.length > 0 &&
      !busy,
    [auth.user?.role, description, postFiles.length, postCategoryIds.length, busy],
  )

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const res = await listCategories()
        if (!cancelled) setCategories(res)
      } catch {
        // If categories fail to load, registration/post creation UI will be disabled.
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <section className="mb-10 border-b border-white/10 pb-8">
        <h1 className="font-[var(--font-display)] text-white text-4xl md:text-6xl">Portál tatéra</h1>
        <p className="mt-4 text-white/60 max-w-3xl">
          Registrácia a prihlásenie pre tatérov, ktorí môžu pridávať nové posty. Fotky sa uploadujú do
          Supabase Storage a posty sa ukladajú do databázy.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="border border-white/10 bg-[#0a0a0a] p-6 md:p-8">
          <h2 className="font-[var(--font-display)] text-white text-2xl">Registrácia tatéra</h2>
          <form
            className="mt-6 flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!canRegister) return
              setBusy(true)
              setStatus(null)
              try {
                await auth.signUpTattooer({
                  email: email.trim(),
                  password,
                  name,
                  bio,
                })

                if (!avatarFile) throw new Error('Nahraj avatara.')
                const avatarUrl = await uploadArtistAvatar(avatarFile)

                await upsertArtistProfile({
                  name,
                  bio,
                  avatarUrl,
                  instagramUrl: instagramUrl.trim(),
                  specialtyCategoryIds: specialtyCategoryIds,
                })

                await auth.refresh()
                setStatus('Profil tatéra je vytvorený. Teraz si môžeš pridávať posty.')
              } catch (error) {
                setStatus(error instanceof Error ? error.message : 'Registrácia zlyhala.')
              } finally {
                setBusy(false)
              }
            }}
          >
            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Meno tatéra"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <textarea
              className="bg-black/40 border border-white/10 px-4 py-3 text-white min-h-28"
              placeholder="Krátke bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
            />

            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Instagram URL"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
            />

            <div className="flex flex-col gap-2">
              {categories.length === 0 ? (
                <p className="text-white/40 text-sm">Načítavam kategórie…</p>
              ) : null}
              {categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-white/70">
                  <input
                    type="checkbox"
                    checked={specialtyCategoryIds.includes(c.id)}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setSpecialtyCategoryIds((prev) =>
                        checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                      )
                    }}
                  />
                  <span className="text-sm">{c.name}</span>
                </label>
              ))}
            </div>
            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Heslo (min 6 znakov)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
            />
            <button
              type="submit"
              disabled={!canRegister}
              className="bg-[#d6a4a4] text-black px-6 py-3 uppercase tracking-widest text-xs disabled:opacity-40"
            >
              Registrovať sa ako tatér
            </button>
          </form>
        </section>

        <section className="border border-white/10 bg-[#0a0a0a] p-6 md:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-[var(--font-display)] text-white text-2xl">Prihlásenie</h2>
            {auth.user ? (
              <button
                type="button"
                onClick={() => void auth.signOut()}
                className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest text-white/70"
              >
                Odhlásiť
              </button>
            ) : null}
          </div>

          {auth.user ? (
            <p className="mt-4 text-white/60">
              Prihlásený: {auth.user.email} ({auth.user.role === 'tattooer' ? 'tatér' : 'klient'})
            </p>
          ) : (
            <form
              className="mt-6 flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault()
                if (!canLogin) return
                setBusy(true)
                setStatus(null)
                try {
                  await auth.signIn(email.trim(), password)
                  setStatus('Prihlásenie úspešné.')
                } catch (error) {
                  setStatus(error instanceof Error ? error.message : 'Prihlásenie zlyhalo.')
                } finally {
                  setBusy(false)
                }
              }}
            >
              <input
                className="bg-black/40 border border-white/10 px-4 py-3 text-white"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
              />
              <input
                className="bg-black/40 border border-white/10 px-4 py-3 text-white"
                placeholder="Heslo"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />
              <button
                type="submit"
                disabled={!canLogin}
                className="bg-[#d6a4a4] text-black px-6 py-3 uppercase tracking-widest text-xs disabled:opacity-40"
              >
                Prihlásiť sa
              </button>
            </form>
          )}
        </section>
      </div>

      <section className="mt-6 border border-white/10 bg-[#0a0a0a] p-6 md:p-8">
        <h2 className="font-[var(--font-display)] text-white text-2xl">Nový post</h2>
        <p className="mt-2 text-white/50">
          Len účet s rolou tatér môže uložiť nový post. Fotka sa uloží do bucketu `post-images`.
        </p>
        <form
          className="mt-6 flex flex-col gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!canCreatePost) return
            setBusy(true)
            setStatus(null)
            try {
              const galleryImageUrls = await uploadPostImages(postFiles)
              await feed.createPost({
                description: description.trim(),
                galleryImageUrls,
                title: title.trim() ? title.trim() : undefined,
                location: location.trim() ? location.trim() : undefined,
                style: style.trim() ? style.trim() : undefined,
                categoryIds: postCategoryIds,
              })
              setDescription('')
              setPostFiles([])
              setTitle('')
              setLocation('')
              setStyle('')
              setPostCategoryIds([])
              setStatus('Post bol uložený.')
            } catch (error) {
              setStatus(error instanceof Error ? error.message : 'Nepodarilo sa vytvoriť post.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Názov postu (voliteľné)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Lokalita (voliteľné)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <input
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Štýl (voliteľné)"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>

          <textarea
            className="bg-black/40 border border-white/10 px-4 py-3 text-white min-h-28"
            placeholder="Popis postu"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            multiple
            onChange={(e) => setPostFiles(Array.from(e.target.files ?? []))}
            className="bg-black/40 border border-white/10 px-4 py-3 text-white"
          />

          <div className="flex flex-col gap-2">
            {categories.length === 0 ? (
              <p className="text-white/40 text-sm">Načítavam kategórie…</p>
            ) : null}
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-white/70">
                <input
                  type="checkbox"
                  checked={postCategoryIds.includes(c.id)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setPostCategoryIds((prev) =>
                      checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                    )
                  }}
                />
                <span className="text-sm">{c.name}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            disabled={!canCreatePost}
            className="bg-[#d6a4a4] text-black px-6 py-3 uppercase tracking-widest text-xs disabled:opacity-40"
          >
            Nahrať a publikovať
          </button>
        </form>
      </section>

      {status ? <p className="mt-6 text-sm text-[#d6a4a4]">{status}</p> : null}
    </div>
  )
}
