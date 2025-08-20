"use client"

import dynamic from "next/dynamic"

export default function Page() {
  const RouletteApp = dynamic(() => import("@/components/roulette-app"), { ssr: false })
  return (
    <main className="min-h-dvh bg-muted/30">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              {/* Ruleta con segmentos de colores */}
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-foreground relative">
                <div className="absolute inset-0 bg-gradient-conic from-red-500 via-yellow-500 via-green-500 via-blue-500 via-purple-500 to-red-500"></div>
                <div className="absolute inset-1 rounded-full bg-background/20"></div>
              </div>
              {/* Flecha indicadora */}
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                <div 
                  className="w-0 h-0"
                  style={{
                    borderLeft: "3px solid transparent",
                    borderRight: "3px solid transparent", 
                    borderTop: "4px solid hsl(var(--foreground))"
                  }}
                />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Ruletita</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Cargá nombres, girá la ruleta y obtené un orden aleatorio para todas las personas.
          </p>
        </header>
        <RouletteApp />
      </div>
    </main>
  )
}
