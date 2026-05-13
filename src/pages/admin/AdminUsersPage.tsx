import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { AdminUserRow } from '../../services/adminUsersService'
import * as adminUsersService from '../../services/adminUsersService'
import { useAdminAuth } from '../../state/adminAuth'

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString('sk-SK')
  } catch {
    return iso
  }
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const { isAdmin, signOut, authHeader } = useAdminAuth()

  const [rows, setRows] = useState<AdminUserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login', { replace: true })
      return
    }
    if (!authHeader) return

    let active = true
    setLoading(true)
    setError(null)
    void (async () => {
      try {
        const data = await adminUsersService.listUsers(authHeader)
        if (!active) return
        setRows(data)
      } catch (e) {
        if (!active) return
        setError(e instanceof Error ? e.message : 'Nepodarilo sa načítať účty.')
      } finally {
        if (!active) return
        setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [isAdmin, authHeader, navigate])

  const total = useMemo(() => rows.length, [rows])

  if (!isAdmin) return null

  return (
    <div className="max-w-[1100px] mx-auto px-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-[var(--font-serif)] tracking-tight text-white">Správa účtov</h1>
          <p className="mt-2 text-white/70">Počet účtov: {total}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            signOut()
            navigate('/admin/login', { replace: true })
          }}
          className="border border-white/15 text-white/80 px-4 py-2 text-xs tracking-widest uppercase hover:border-white/30 hover:text-white transition-all"
        >
          Odhlásiť
        </button>
      </div>

      {error ? <div className="mt-6 text-red-300 text-sm">{error}</div> : null}
      {loading ? <div className="mt-6 text-white/70">Načítavam…</div> : null}

      {!loading ? (
        <div className="mt-8 overflow-x-auto border border-white/10">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Meno</th>
                <th className="text-left p-3">Rola</th>
                <th className="text-left p-3">Vytvorené</th>
                <th className="text-right p-3">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((u) => (
                <tr key={u.id} className="text-white/85">
                  <td className="p-3 font-mono text-xs text-white/60">{u.id}</td>
                  <td className="p-3">
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 outline-none focus:border-[#d6a4a4]"
                      value={u.email}
                      onChange={(e) => {
                        const v = e.target.value
                        setRows((prev) => prev.map((x) => (x.id === u.id ? { ...x, email: v } : x)))
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 outline-none focus:border-[#d6a4a4]"
                      value={u.full_name ?? ''}
                      onChange={(e) => {
                        const v = e.target.value
                        setRows((prev) => prev.map((x) => (x.id === u.id ? { ...x, full_name: v } : x)))
                      }}
                    />
                  </td>
                  <td className="p-3">
                    <input
                      className="w-full bg-white/5 border border-white/10 text-white px-3 py-2 outline-none focus:border-[#d6a4a4]"
                      value={u.role}
                      onChange={(e) => {
                        const v = e.target.value
                        setRows((prev) => prev.map((x) => (x.id === u.id ? { ...x, role: v } : x)))
                      }}
                    />
                  </td>
                  <td className="p-3 text-white/60">{formatDate(u.created_at)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        disabled={!authHeader || savingId === u.id}
                        onClick={() => {
                          if (!authHeader) return
                          setSavingId(u.id)
                          setError(null)
                          void (async () => {
                            try {
                              await adminUsersService.updateUser(authHeader, u.id, {
                                email: u.email,
                                full_name: u.full_name,
                                role: u.role,
                              })
                            } catch (e) {
                              setError(e instanceof Error ? e.message : 'Nepodarilo sa uložiť zmeny.')
                            } finally {
                              setSavingId(null)
                            }
                          })()
                        }}
                        className="bg-[#d6a4a4] disabled:opacity-40 disabled:cursor-not-allowed text-black px-3 py-2 text-xs tracking-widest uppercase hover:opacity-90 transition-all"
                      >
                        Uložiť
                      </button>
                      <button
                        type="button"
                        disabled={!authHeader || savingId === u.id}
                        onClick={() => {
                          if (!authHeader) return
                          const ok = confirm('Naozaj vymazať účet?')
                          if (!ok) return
                          setSavingId(u.id)
                          setError(null)
                          void (async () => {
                            try {
                              await adminUsersService.deleteUser(authHeader, u.id)
                              setRows((prev) => prev.filter((x) => x.id !== u.id))
                            } catch (e) {
                              setError(e instanceof Error ? e.message : 'Nepodarilo sa vymazať účet.')
                            } finally {
                              setSavingId(null)
                            }
                          })()
                        }}
                        className="border border-red-400/40 text-red-200 px-3 py-2 text-xs tracking-widest uppercase hover:border-red-300/70 hover:text-red-100 transition-all"
                      >
                        Vymazať
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-white/60">
                    Žiadne účty.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}

