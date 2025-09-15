"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, Users, Mail, Phone, CheckCircle, AlertCircle } from "lucide-react"

interface DatosReserva {
  nombre: string
  email: string
  telefono: string
  fecha: string
  hora: string
  personas: string
  comentarios: string
}

export function SistemaReservas() {
  const [datosReserva, setDatosReserva] = useState<DatosReserva>({
    nombre: "",
    email: "",
    telefono: "",
    fecha: "",
    hora: "",
    personas: "",
    comentarios: "",
  })

  const [errors, setErrors] = useState<Partial<DatosReserva>>({})
  const [loading, setLoading] = useState(false)
  const [reservaExitosa, setReservaExitosa] = useState(false)

  // Validación de teléfono ecuatoriano
  const validarTelefonoEcuatoriano = (telefono: string): boolean => {
    // Formato: +593 9 XXXX XXXX o 09 XXXX XXXX
    const regex = /^(\+593|0)?[9][0-9]{8}$/
    return regex.test(telefono.replace(/\s/g, ""))
  }

  // Validación de email Gmail
  const validarEmailGmail = (email: string): boolean => {
    const regex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/
    return regex.test(email)
  }

  const validarFormulario = (): boolean => {
    const nuevosErrors: Partial<DatosReserva> = {}

    // Validar nombre
    if (!datosReserva.nombre.trim()) {
      nuevosErrors.nombre = "El nombre es requerido"
    }

    // Validar email Gmail
    if (!datosReserva.email) {
      nuevosErrors.email = "El email es requerido"
    } else if (!validarEmailGmail(datosReserva.email)) {
      nuevosErrors.email = "Por favor ingrese un email de Gmail válido (@gmail.com)"
    }

    // Validar teléfono ecuatoriano
    if (!datosReserva.telefono) {
      nuevosErrors.telefono = "El teléfono es requerido"
    } else if (!validarTelefonoEcuatoriano(datosReserva.telefono)) {
      nuevosErrors.telefono = "Ingrese un número ecuatoriano válido (Ej: 0987654321 o +593987654321)"
    }

    // Validar fecha
    if (!datosReserva.fecha) {
      nuevosErrors.fecha = "La fecha es requerida"
    } else {
      const fechaSeleccionada = new Date(datosReserva.fecha)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      if (fechaSeleccionada < hoy) {
        nuevosErrors.fecha = "La fecha no puede ser anterior a hoy"
      }
    }

    // Validar hora
    if (!datosReserva.hora) {
      nuevosErrors.hora = "La hora es requerida"
    }

    // Validar número de personas
    if (!datosReserva.personas) {
      nuevosErrors.personas = "El número de personas es requerido"
    }

    setErrors(nuevosErrors)
    return Object.keys(nuevosErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setLoading(true)

    // Simular envío de reserva
    setTimeout(() => {
      setReservaExitosa(true)
      setLoading(false)

      // Limpiar formulario después de 3 segundos
      setTimeout(() => {
        setReservaExitosa(false)
        setDatosReserva({
          nombre: "",
          email: "",
          telefono: "",
          fecha: "",
          hora: "",
          personas: "",
          comentarios: "",
        })
      }, 3000)
    }, 2000)
  }

  const handleInputChange = (field: keyof DatosReserva, value: string) => {
    setDatosReserva((prev) => ({ ...prev, [field]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  // Generar opciones de hora
  const generarOpcionesHora = () => {
    const opciones = []
    for (let hora = 11; hora <= 22; hora++) {
      for (let minuto = 0; minuto < 60; minuto += 30) {
        const horaFormateada = `${hora.toString().padStart(2, "0")}:${minuto.toString().padStart(2, "0")}`
        opciones.push(horaFormateada)
      }
    }
    return opciones
  }

  if (reservaExitosa) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardContent className="pt-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-green-600 mb-2">¡Reserva Confirmada!</h3>
            <p className="text-muted-foreground mb-4">
              Su reserva ha sido registrada exitosamente. Recibirá un email de confirmación en {datosReserva.email} con
              todos los detalles.
            </p>
            <div className="bg-muted p-4 rounded-lg text-left space-y-2">
              <p>
                <strong>Nombre:</strong> {datosReserva.nombre}
              </p>
              <p>
                <strong>Fecha:</strong> {new Date(datosReserva.fecha).toLocaleDateString("es-EC")}
              </p>
              <p>
                <strong>Hora:</strong> {datosReserva.hora}
              </p>
              <p>
                <strong>Personas:</strong> {datosReserva.personas}
              </p>
              <p>
                <strong>Teléfono:</strong> {datosReserva.telefono}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-balance">Sistema de Reservas</h2>
        <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
          Reserve su mesa con anticipación y garantice su lugar en nuestro restaurante. Complete el formulario con sus
          datos y preferencias.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Nueva Reserva
            </CardTitle>
            <CardDescription>Complete todos los campos para confirmar su reserva</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información personal */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Información Personal</h4>

                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Ej: Juan Pérez García"
                    value={datosReserva.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    className={errors.nombre ? "border-destructive" : ""}
                  />
                  {errors.nombre && <p className="text-sm text-destructive">{errors.nombre}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email de Gmail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@gmail.com"
                      value={datosReserva.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono Ecuatoriano *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="0987654321 o +593987654321"
                      value={datosReserva.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      className={`pl-10 ${errors.telefono ? "border-destructive" : ""}`}
                    />
                  </div>
                  {errors.telefono && <p className="text-sm text-destructive">{errors.telefono}</p>}
                </div>
              </div>

              {/* Detalles de la reserva */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg">Detalles de la Reserva</h4>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={datosReserva.fecha}
                      onChange={(e) => handleInputChange("fecha", e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className={errors.fecha ? "border-destructive" : ""}
                    />
                    {errors.fecha && <p className="text-sm text-destructive">{errors.fecha}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hora">Hora *</Label>
                    <Select value={datosReserva.hora} onValueChange={(value) => handleInputChange("hora", value)}>
                      <SelectTrigger className={errors.hora ? "border-destructive" : ""}>
                        <Clock className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Seleccionar hora" />
                      </SelectTrigger>
                      <SelectContent>
                        {generarOpcionesHora().map((hora) => (
                          <SelectItem key={hora} value={hora}>
                            {hora}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.hora && <p className="text-sm text-destructive">{errors.hora}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="personas">Número de Personas *</Label>
                  <Select value={datosReserva.personas} onValueChange={(value) => handleInputChange("personas", value)}>
                    <SelectTrigger className={errors.personas ? "border-destructive" : ""}>
                      <Users className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Seleccionar cantidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "persona" : "personas"}
                        </SelectItem>
                      ))}
                      <SelectItem value="mas-10">Más de 10 personas</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.personas && <p className="text-sm text-destructive">{errors.personas}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comentarios">Comentarios Adicionales</Label>
                  <Textarea
                    id="comentarios"
                    placeholder="Ocasión especial, preferencias alimentarias, solicitudes especiales..."
                    value={datosReserva.comentarios}
                    onChange={(e) => handleInputChange("comentarios", e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Información importante */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Política de Reservas:</strong> Las reservas se confirman por email. Por favor llegue 10
                  minutos antes de su hora reservada. Para cancelaciones, contacte al +593 5 262-3456 con al menos 2
                  horas de anticipación.
                </AlertDescription>
              </Alert>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "Procesando Reserva..." : "Confirmar Reserva"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
