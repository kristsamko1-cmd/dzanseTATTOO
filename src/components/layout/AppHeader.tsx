import { NavLink, useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useState } from 'react'

function HeaderLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        clsx(
          'text-white/70 hover:text-white transition-all duration-500 font-[var(--font-serif)] tracking-tight',
          isActive && 'text-[#d6a4a4] border-b border-[#d6a4a4] pb-1',
        )
      }
    >
      {children}
    </NavLink>
  )
}

export function AppHeader() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/10">
      <nav className="flex justify-between items-center w-full px-6 md:px-16 py-6 max-w-[1440px] mx-auto">
        <NavLink
          to="/"
          className="text-2xl font-[var(--font-serif)] tracking-[0.2em] uppercase text-white"
        >
          DŽANES
        </NavLink>

        <div className="hidden md:flex items-center gap-10">
          <HeaderLink to="/galeria">Galéria</HeaderLink>
          <HeaderLink to="/pribehy">Príbehy</HeaderLink>
          <HeaderLink to="/taters">Tatéri</HeaderLink>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/rezervacia')}
            className="bg-[#d6a4a4] text-black px-5 md:px-8 py-3 font-[var(--font-serif)] tracking-widest uppercase text-[10px] md:text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            Rezervácia
          </button>
          <button
            type="button"
            className="md:hidden border border-white/20 p-2 text-white/80"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Otvoriť menu"
          >
            <span className="material-symbols-outlined">{open ? 'close' : 'menu'}</span>
          </button>
        </div>
      </nav>
      {open ? (
        <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]">
          <div className="max-w-[1440px] mx-auto px-6 py-4 flex flex-col gap-4">
            <NavLink to="/galeria" onClick={() => setOpen(false)} className="text-white/80 uppercase tracking-widest">
              Galéria
            </NavLink>
            <NavLink to="/pribehy" onClick={() => setOpen(false)} className="text-white/80 uppercase tracking-widest">
              Príbehy
            </NavLink>
            <NavLink to="/taters" onClick={() => setOpen(false)} className="text-white/80 uppercase tracking-widest">
              Tatéri
            </NavLink>
          </div>
        </div>
      ) : null}
    </header>
  )
}

