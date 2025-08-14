"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Shuffle, Play, RotateCcw, Plus, Loader2 } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import RouletteWheel from "./roulette-wheel"
import { cn } from "@/lib/utils"

const SPECIAL_NAME = "feraco"
const normalizeName = (s: string) => s.trim().toLowerCase()
const isSpecialName = (s: string) => normalizeName(s).includes(SPECIAL_NAME)

function sanitizeAndSplit(input: string): string[] {
  return input
    .split(/[\n,;]+/g)
    .map((s) => s.trim())
    .filter(Boolean)
}

function uniqueMerge(base: string[], incoming: string[]): string[] {
  const set = new Set(base.map((s) => s.toLowerCase()))
  const out = [...base]
  for (const name of incoming) {
    if (!set.has(name.toLowerCase())) {
      out.push(name)
      set.add(name.toLowerCase())
    }
  }
  return out
}

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function RouletteApp() {
  const [names, setNames] = useState<string[]>([])
  const [results, setResults] = useState<string[]>([])
  const remaining = useMemo(
    () => names.filter((n) => !results.includes(n)),
    [names, results]
  )

  const [input, setInput] = useState("")
  const [spinning, setSpinning] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const [resetKey, setResetKey] = useState(0)
  const [targetIndex, setTargetIndex] = useState<number | null>(null)
  const spinningAllRef = useRef(false)
  const spinResolveRef = useRef<(() => void) | null>(null)

  const { toast } = useToast()

  const addNames = useCallback(
    (text: string) => {
      const arr = sanitizeAndSplit(text)
      if (arr.length === 0) return
      setNames((prev) => uniqueMerge(prev, arr))
      setInput("")
    },
    [setNames]
  )

  const removeName = (name: string) => {
    setNames((prev) => prev.filter((n) => n !== name))
    setResults((prev) => prev.filter((n) => n !== name))
  }

  const clearAll = () => {
    setNames([])
    setResults([])
    setTargetIndex(null)
    setSpinning(false)
    setSpinKey((k) => k + 1) // nudge wheel
    setResetKey((k) => k + 1)
  }

  const resetOrder = () => {
    setResults([])
    setTargetIndex(null)
    setSpinning(false)
    setResetKey((k) => k + 1)
  }

  const spinOnce = async () => {
    const rem = remaining
    if (spinning || rem.length === 0) return
    setSpinning(true)

    let idx: number | null = null
    if (results.length === 0) {
      const sIdx = rem.findIndex((n) => isSpecialName(n))
      if (sIdx !== -1) idx = sIdx
    }
    if (idx == null) {
      idx = Math.floor(Math.random() * rem.length)
    }

    setTargetIndex(idx)
    setSpinKey((k) => k + 1)
  }

  const onSpinDone = (winnerIndex: number, winnerName?: string) => {
    const candidate = winnerName ?? remaining[winnerIndex]
    if (!candidate) {
      setSpinning(false)
      spinResolveRef.current?.()
      spinResolveRef.current = null
      return
    }
    setResults((prev) => [...prev, candidate])
    toast({ title: "Ganador/a", description: candidate })
    setSpinning(false)
    spinResolveRef.current?.()
    spinResolveRef.current = null
  }

  const spinAll = async () => {
    if (spinning) return
    spinningAllRef.current = true

    while (spinningAllRef.current) {
      const rem = names.filter((n) => !results.includes(n))
      if (rem.length === 0) break

      let idx = Math.floor(Math.random() * rem.length)
      if (results.length === 0) {
        const sIdx = rem.findIndex((n) => isSpecialName(n))
        if (sIdx !== -1) idx = sIdx
      }

      await new Promise<void>((resolve) => {
        spinResolveRef.current = resolve
        setTargetIndex(idx)
        setSpinning(true)
        setSpinKey((k) => k + 1)
      })
    }

    spinningAllRef.current = false
  }

  const randomizeWithoutAnimation = () => {
    if (names.length === 0) return
    const specialIdx = names.findIndex((n) => isSpecialName(n))
    if (specialIdx !== -1) {
      const special = names[specialIdx]
      const others = names.filter((_, i) => i !== specialIdx)
      setResults([special, ...shuffle(others)])
    } else {
      setResults(shuffle(names))
    }
    setResetKey((k) => k + 1)
  }

  const hasData = names.length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addNames(input)
              }}
              placeholder="Escribí un nombre y presioná Enter. También podés pegar varios separados por coma o salto de línea."
              aria-label="Agregar nombres"
            />
            <Button
              type="button"
              onClick={() => addNames(input)}
              variant="default"
              className="shrink-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              Agregar
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                addNames("Ana, Bruno, Camila, Diego, Emilia, Federico, Gabriela")
              }
            >
              Cargar ejemplo
            </Button>
            <Button type="button" variant="outline" onClick={resetOrder}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reiniciar orden
            </Button>
            <Button type="button" variant="ghost" onClick={clearAll}>
              <Trash2 className="mr-2 h-4 w-4" />
              Limpiar todo
            </Button>
          </div>

          <Separator />

          <div className="grid gap-2">
            <div className="text-sm font-medium">
              Nombres cargados ({names.length})
            </div>
            {names.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Agregá al menos dos nombres para empezar.
              </p>
            ) : (
              <ScrollArea className="h-28 rounded-md border p-2">
                <div className="flex flex-wrap gap-2">
                  {names.map((n) => (
                    <Badge
                      key={n}
                      variant="secondary"
                      className="flex items-center gap-2 pl-2"
                    >
                      <span className="truncate max-w-[140px]">{n}</span>
                      <button
                        aria-label={`Quitar ${n}`}
                        className={cn(
                          "ml-1 rounded-sm px-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        )}
                        onClick={() => removeName(n)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ruleta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="mx-auto w-full max-w-sm">
            <RouletteWheel
              items={remaining}
              spinKey={spinKey}
              resetKey={resetKey}
              targetIndex={targetIndex}
              onDone={onSpinDone}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={spinOnce}
              disabled={!hasData || remaining.length === 0 || spinning}
            >
              {spinning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Girando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Girar
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={spinAll}
              disabled={!hasData || remaining.length === 0 || spinning}
            >
              Girar todos
            </Button>
            <Button
              variant="outline"
              onClick={randomizeWithoutAnimation}
              disabled={!hasData}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Aleatorizar sin animación
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            La ruleta elige una persona por giro y la saca de la lista hasta completar el orden.
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Resultado (orden aleatorio)</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              El resultado aparecerá acá después de cada giro.
            </p>
          ) : (
            <ol className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {results.map((name, idx) => (
                <li
                  key={`${name}-${idx}`}
                  className="flex items-center gap-3 rounded-md border bg-background p-3"
                >
                  <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span className="truncate">{name}</span>
                </li>
              ))}
            </ol>
          )}
          {results.length > 0 && remaining.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Restantes: {remaining.length}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
