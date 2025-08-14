import dynamic from "next/dynamic"

export default function Page() {
  const RouletteApp = dynamic(() => import("@/components/roulette-app"), { ssr: false })
  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Ruleta para ordenar nombres</h1>
          <p className="text-sm text-muted-foreground">
            Cargá nombres, girá la ruleta y obtené un orden aleatorio para todas las personas.
          </p>
        </header>
        <RouletteApp />
      </div>
    </main>
  )
}
