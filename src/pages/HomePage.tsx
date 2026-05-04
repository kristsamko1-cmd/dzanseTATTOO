import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function HomePage() {
  return (
    <div className="max-w-[1440px] mx-auto px-6 md:px-16">
      <section className="mb-24">
        <span className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.4em] mb-4 block">
          Sacred craft
        </span>
        <h1 className="font-[var(--font-display)] text-white text-5xl md:text-7xl leading-[1.05] mb-8">
          Tetovanie, ktoré
          <br />
          zostáva navždy.
        </h1>
        <p className="font-[var(--font-sans)] text-white/60 max-w-2xl leading-relaxed">
          Moderný ateliér, čistý proces a veľký dôraz na kompozíciu. Vyber si tatéra, pozri si práce
          a rezervuj si termín bez zbytočných krokov.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link
            to="/rezervacia"
            className="bg-[#d6a4a4] text-black px-10 py-4 font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm hover:opacity-90 transition-opacity text-center"
          >
            Rezervovať termín
          </Link>
          <Link
            to="/galeria"
            className="border border-white/10 px-10 py-4 font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm text-white/70 hover:text-[#d6a4a4] hover:border-[#d6a4a4] transition-colors text-center"
          >
            Pozrieť galériu
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="md:col-span-7 border border-white/10 bg-[#0a0a0a] overflow-hidden"
        >
          <Link to="/pribehy" className="block">
            <div className="p-10 border-b border-white/10">
              <h2 className="font-[var(--font-display)] text-white text-3xl">Príbehy z ateliéru</h2>
              <p className="mt-3 text-white/60 leading-relaxed max-w-xl">
                Zdieľame proces tvorby, starostlivosť a malé detaily, ktoré robia veľký rozdiel.
              </p>
            </div>
            <div className="p-10 flex items-center justify-between">
              <span className="font-[var(--font-serif)] text-[10px] uppercase tracking-[0.3em] text-white/40">
                Otvoriť feed
              </span>
              <span className="material-symbols-outlined text-white/40">arrow_forward</span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25 }}
          className="md:col-span-5 border border-white/10 bg-[#0a0a0a] overflow-hidden"
        >
          <Link to="/taters" className="block">
            <div className="p-10 border-b border-white/10">
              <h2 className="font-[var(--font-display)] text-white text-3xl">Tatéri</h2>
              <p className="mt-3 text-white/60 leading-relaxed">
                Profily, špecializácie a dostupnosť pre rezervácie.
              </p>
            </div>
            <div className="p-10 flex items-center justify-between">
              <span className="font-[var(--font-serif)] text-[10px] uppercase tracking-[0.3em] text-white/40">
                Vybrať tatéra
              </span>
              <span className="material-symbols-outlined text-white/40">arrow_forward</span>
            </div>
          </Link>
        </motion.div>
      </section>

      <section className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 border border-white/10 overflow-hidden">
          <img
            src="/images/taterky/janka.jpg"
            alt="Janka tatérka"
            className="w-full h-full object-cover min-h-[320px]"
            loading="lazy"
          />
        </div>
        <div className="md:col-span-7 border border-white/10 bg-[#0a0a0a] p-8 md:p-10">
          <span className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.3em]">
            Lead artist
          </span>
          <h2 className="mt-4 font-[var(--font-display)] text-white text-3xl md:text-5xl">Janka</h2>
          <p className="mt-4 text-white/60 leading-relaxed">
            Jemné linework, botanické motívy a čisté kompozície. V profile tatérky nájdeš ukážky práce,
            dostupnosť termínov aj možnosť okamžitej rezervácie.
          </p>
          <div className="mt-8">
            <Link
              to="/taters"
              className="border border-white/10 px-8 py-3 font-[var(--font-serif)] uppercase tracking-widest text-sm text-white/70 hover:text-[#d6a4a4] hover:border-[#d6a4a4] transition-colors"
            >
              Pozrieť profil tatérky
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

