import { useMemo, useState } from 'react'
import { useAuth } from '../state/auth'
import { useFeed } from '../state/feed'
import { uploadPostImage } from '../services/storageService'

export function TattooerPortalPage() {
  const auth = useAuth()
  const feed = useFeed()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [specialties, setSpecialties] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const canRegister = useMemo(() => {
    return (
      email.includes('@') &&
      password.length >= 6 &&
      name.trim().length >= 2 &&
      bio.trim().length >= 10 &&
      !busy
    )
  }, [email, password, name, bio, busy])

  const canLogin = useMemo(() => email.includes('@') && password.length >= 6 && !busy, [email, password, busy])
  const canCreatePost = useMemo(
    () => auth.user?.role === 'tattooer' && description.trim().length >= 10 && !!file && !busy,
    [auth.user?.role, description, file, busy],
  )

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
                  name: name.trim(),
                  bio: bio.trim(),
                  specialties: specialties
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
                })
                await auth.refresh()
                setStatus('Účet tatéra je vytvorený. Ak máš zapnuté email potvrdenie, potvrď email.')
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
              className="bg-black/40 border border-white/10 px-4 py-3 text-white"
              placeholder="Špecializácie (oddel čiarkou)"
              value={specialties}
              onChange={(e) => setSpecialties(e.target.value)}
            />
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
            if (!canCreatePost || !file) return
            setBusy(true)
            setStatus(null)
            try {
              const imageUrl = await uploadPostImage(file)
              await feed.createPost({ description: description.trim(), imageUrl })
              setDescription('')
              setFile(null)
              setStatus('Post bol uložený.')
            } catch (error) {
              setStatus(error instanceof Error ? error.message : 'Nepodarilo sa vytvoriť post.')
            } finally {
              setBusy(false)
            }
          }}
        >
          <textarea
            className="bg-black/40 border border-white/10 px-4 py-3 text-white min-h-28"
            placeholder="Popis postu"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="bg-black/40 border border-white/10 px-4 py-3 text-white"
          />
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
