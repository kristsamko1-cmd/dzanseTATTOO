import { Link } from 'react-router-dom'

export function AppFooter() {
  return (
    <footer className="w-full mt-32 bg-[#0a0a0a] border-t border-white/10">
      <div className="max-w-[1440px] mx-auto px-6 md:px-16 py-20 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="flex flex-col gap-6">
          <div className="text-lg font-[var(--font-serif)] tracking-[0.3em] text-white uppercase">
            DŽANES
          </div>
          <p className="font-[var(--font-serif)] text-sm tracking-widest uppercase text-white/40 max-w-xs leading-loose">
            SACRED CRAFT. ESTABLISHED IN SILENCE. CREATED FOR ETERNITY.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-16 md:gap-x-24 gap-y-4 font-[var(--font-serif)] text-sm tracking-widest uppercase">
          <a className="text-white/40 hover:text-white transition-colors duration-300" href="#">
            Instagram
          </a>
          <a className="text-white/40 hover:text-white transition-colors duration-300" href="#">
            Facebook
          </a>
          <Link
            className="text-white/40 hover:text-white transition-colors duration-300"
            to="/rezervacia"
          >
            Rezervácia
          </Link>
          <a className="text-white/40 hover:text-white transition-colors duration-300" href="#">
            Podmienky
          </a>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 md:px-16 pb-10 text-center md:text-left">
        <p className="font-[var(--font-serif)] text-[10px] tracking-[0.3em] text-white/20 uppercase">
          © {new Date().getFullYear()} DŽANES TATTOO. SACRED CRAFT. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  )
}

