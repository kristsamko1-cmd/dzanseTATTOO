import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../state/adminAuth'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const { signIn } = useAdminAuth()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const canSubmit = useMemo(() => username.trim().length > 0 && password.length > 0, [username, password])

  return (
    <div className="max-w-[720px] mx-auto px-6">
      <h1 className="text-3xl md:text-4xl font-[var(--font-serif)] tracking-tight text-white">
        Admin prihlásenie
      </h1>
      <p className="mt-3 text-white/70">Zadaj admin meno a heslo.</p>

      <form
        className="mt-10 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          try {
            signIn(username, password)
            navigate('/admin', { replace: true })
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Nepodarilo sa prihlásiť.')
          }
        }}
      >
        <div className="space-y-2">
          <label className="text-white/70 text-sm tracking-widest uppercase">Meno</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#d6a4a4]"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <label className="text-white/70 text-sm tracking-widest uppercase">Heslo</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 outline-none focus:border-[#d6a4a4]"
            autoComplete="current-password"
          />
        </div>

        {error ? <div className="text-red-300 text-sm">{error}</div> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="bg-[#d6a4a4] disabled:opacity-40 disabled:cursor-not-allowed text-black px-6 py-3 font-[var(--font-serif)] tracking-widest uppercase text-[10px] md:text-sm hover:opacity-90 active:scale-95 transition-all"
        >
          Prihlásiť
        </button>
      </form>
    </div>
  )
}

