"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, Clock, CheckCircle, AlertCircle } from "lucide-react"

interface PersonaEnFila {
  cedula: string
  posicion: number
  tiempoEstimado: number
  estado: "esperando" | "llamado" | "atendido"
}

export function FilaVirtual() {
  const [cedula, setCedula] = useState("")
  const [personaEnFila, setPersonaEnFila] = useState<PersonaEnFila | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Simulación de datos de la fila virtual
  const [filaActual] = useState([
    { cedula: "1234567890", posicion: 1, tiempoEstimado: 5, estado: "llamado" as const },
    { cedula: "0987654321", posicion: 2, tiempoEstimado: 15, estado: "esperando" as const },
    { cedula: "1122334455", posicion: 3, tiempoEstimado: 25, estado: "esperando" as const },
  ])

  // Validación de cédula ecuatoriana básica
  const validarCedula = (cedula: string): boolean => {
    if (cedula.length !== 10) return false
    if (!/^\d+$/.test(cedula)) return false

    // Validación básica del dígito verificador
    const digitos = cedula.split("").map(Number)
    const provincia = Number.parseInt(cedula.substring(0, 2))

    if (provincia < 1 || provincia > 24) return false

    const tercerDigito = digitos[2]
    if (tercerDigito > 6) return false

    return true
  }

  const unirseAFila = async () => {
    setError("")
    setLoading(true)

    // Validar cédula
    if (!validarCedula(cedula)) {
      setError("Por favor ingrese una cédula ecuatoriana válida (10 dígitos)")
      setLoading(false)
      return
    }

    // Verificar si ya está en la fila
    const yaEnFila = filaActual.find((p) => p.cedula === cedula)
    if (yaEnFila) {
      setPersonaEnFila(yaEnFila)
      setLoading(false)
      return
    }

    // Simular proceso de unirse a la fila
    setTimeout(() => {
      const nuevaPosicion = filaActual.length + 1
      const tiempoEstimado = nuevaPosicion * 10 // 10 minutos por persona aproximadamente

      const nuevaPersona: PersonaEnFila = {
        cedula,
        posicion: nuevaPosicion,
        tiempoEstimado,
        estado: "esperando",
      }

      setPersonaEnFila(nuevaPersona)
      setLoading(false)
    }, 1500)
  }

  const consultarEstado = () => {
    setError("")

    if (!validarCedula(cedula)) {
      setError("Por favor ingrese una cédula ecuatoriana válida (10 dígitos)")
      return
    }

    const persona = filaActual.find((p) => p.cedula === cedula)
    if (persona) {
      setPersonaEnFila(persona)
    } else {
      setError("No se encontró su cédula en la fila virtual")
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-balance">Fila Virtual</h2>
        <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
          Únase a nuestra fila virtual y evite las esperas. Solo necesita su número de cédula para reservar su lugar y
          recibir actualizaciones en tiempo real.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Formulario de ingreso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Unirse a la Fila
            </CardTitle>
            <CardDescription>Ingrese su número de cédula ecuatoriana para unirse a la fila virtual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cedula">Número de Cédula</Label>
              <Input
                id="cedula"
                type="text"
                placeholder="Ej: 1234567890"
                value={cedula}
                onChange={(e) => setCedula(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
              />
              <p className="text-xs text-muted-foreground">Ingrese su cédula ecuatoriana de 10 dígitos</p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={unirseAFila} disabled={loading || cedula.length !== 10} className="flex-1">
                {loading ? "Procesando..." : "Unirse a la Fila"}
              </Button>
              <Button variant="outline" onClick={consultarEstado} disabled={cedula.length !== 10}>
                Consultar Estado
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estado actual */}
        {personaEnFila && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Su Estado en la Fila
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">#{personaEnFila.posicion}</div>
                  <div className="text-sm text-muted-foreground">Posición en la fila</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{personaEnFila.tiempoEstimado} min</div>
                  <div className="text-sm text-muted-foreground">Tiempo estimado</div>
                </div>
              </div>

              <div className="flex justify-center">
                <Badge
                  variant={
                    personaEnFila.estado === "llamado"
                      ? "default"
                      : personaEnFila.estado === "atendido"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-sm px-4 py-2"
                >
                  {personaEnFila.estado === "esperando" && "En Espera"}
                  {personaEnFila.estado === "llamado" && "¡Su turno está listo!"}
                  {personaEnFila.estado === "atendido" && "Atendido"}
                </Badge>
              </div>

              {personaEnFila.estado === "llamado" && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    ¡Su mesa está lista! Por favor diríjase al restaurante en los próximos 10 minutos.
                  </AlertDescription>
                </Alert>
              )}

              <div className="text-xs text-muted-foreground text-center">Cédula: {personaEnFila.cedula}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estado general de la fila */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Estado Actual del Restaurante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">{filaActual.length}</div>
              <div className="text-sm text-muted-foreground">Personas en fila</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-secondary">~{filaActual.length * 10} min</div>
              <div className="text-sm text-muted-foreground">Tiempo de espera</div>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-600">Abierto</div>
              <div className="text-sm text-muted-foreground">Estado del restaurante</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
