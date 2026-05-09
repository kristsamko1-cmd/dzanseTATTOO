export function TermsPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-6 md:px-16">
      <div className="border border-white/10 bg-[#0a0a0a] p-8 md:p-12">
        <span className="font-[var(--font-serif)] text-[10px] text-[#d6a4a4] uppercase tracking-[0.35em]">
          Právne informácie
        </span>
        <h1 className="mt-4 font-[var(--font-display)] text-white text-4xl md:text-6xl">Podmienky</h1>

        <div className="mt-8 space-y-8 text-white/70 leading-relaxed">
          <section>
            <h2 className="font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm text-white">1. Rezervácie</h2>
            <p className="mt-3">
              Rezervácia termínu je záväzná po potvrdení zo strany štúdia. V prípade potreby zmeny alebo zrušenia
              termínu nás kontaktujte čo najskôr.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm text-white">
              2. Individuálny návrh
            </h2>
            <p className="mt-3">
              Každé tetovanie je autorská práca pripravená na mieru podľa konzultácie. Finálny návrh sa môže upraviť
              pred samotným tetovaním.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm text-white">
              3. Starostlivosť po tetovaní
            </h2>
            <p className="mt-3">
              Klient je povinný dodržiavať odporúčanú starostlivosť po tetovaní. Nedodržanie pokynov môže ovplyvniť
              výsledný vzhľad a hojenie.
            </p>
          </section>

          <section>
            <h2 className="font-[var(--font-serif)] uppercase tracking-[0.2em] text-sm text-white">
              4. Ochrana údajov
            </h2>
            <p className="mt-3">
              Osobné údaje spracúvame výlučne na účely komunikácie, rezervácie a poskytovania služieb. Údaje neposkytujeme
              tretím stranám mimo nevyhnutných technických poskytovateľov.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
