"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { JSX } from "react/jsx-runtime"

type TabType = "inicio" | "menu" | "fila" | "reservas"

interface ReservaData {
  nombre: string
  email: string
  telefono: string
  fecha: string
  hora: string
  personas: string
}

export default function HomePage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabType>("inicio")

  const [cedula, setCedula] = useState<string>("")
  const [filaStatus, setFilaStatus] = useState<string>("")

  const [nombre, setNombre] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [telefono, setTelefono] = useState<string>("")
  const [fecha, setFecha] = useState<string>("")
  const [hora, setHora] = useState<string>("")
  const [personas, setPersonas] = useState<string>("")

  const consultarFila = (): void => {
    if (cedula.length === 10) {
      const posicion: number = Math.floor(Math.random() * 20) + 1
      setFilaStatus(`Tu posición en la fila: ${posicion}. Tiempo estimado: ${posicion * 5} minutos`)
    } else {
      setFilaStatus("Por favor ingresa una cédula válida de 10 dígitos")
    }
  }

  const hacerReserva = (): void => {
    const esEmailGmailValido: boolean = email.includes("@gmail.com")
    const sonCamposCompletos: boolean = !!(nombre && email && telefono && fecha && hora && personas)

    if (sonCamposCompletos && esEmailGmailValido) {
      alert("¡Reserva confirmada! Te enviaremos un email de confirmación.")
    } else {
      alert("Por favor completa todos los campos correctamente")
    }
  }

  const cambiarTab = (tab: TabType): void => {
    setActiveTab(tab)
  }

  const handleCedulaChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setCedula(e.target.value)
  }

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setNombre(e.target.value)
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setEmail(e.target.value)
  }

  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTelefono(e.target.value)
  }

  const handleFechaChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFecha(e.target.value)
  }

  const handleHoraChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setHora(e.target.value)
  }

  const handlePersonasChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPersonas(e.target.value)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-orange-600">🍽️ Restaurante Manta</h1>
          <p className="text-gray-600">Comida típica ecuatoriana</p>
        </div>
      </header>

      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-2">
          <div className="flex gap-4">
            <Button variant={activeTab === "inicio" ? "default" : "outline"} onClick={() => cambiarTab("inicio")}>
              Inicio
            </Button>
            <Button variant={activeTab === "menu" ? "default" : "outline"} onClick={() => cambiarTab("menu")}>
              Menú
            </Button>
            <Button variant={activeTab === "fila" ? "default" : "outline"} onClick={() => cambiarTab("fila")}>
              Fila Virtual
            </Button>
            <Button variant={activeTab === "reservas" ? "default" : "outline"} onClick={() => cambiarTab("reservas")}>
              Reservas
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "inicio" && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-4">Bienvenidos a Restaurante Manta</h2>
              <p className="text-xl text-gray-600">Los mejores sabores ecuatorianos en Manta</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>📍 Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Av. Principal 123, Manta, Ecuador</p>
                  <p>📞 +593 99 123 4567</p>
                  <p>📧 restaurante@gmail.com</p>
                  <p>🕐 11:00 AM - 10:00 PM</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🍽️ Especialidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Encebollado - $8.50</li>
                    <li>• Corvina Apanada - $12.00</li>
                    <li>• Seco de Cabrito - $15.00</li>
                    <li>• Ceviche de Camarón - $10.00</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-center">Nuestro Menú</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🌅 Desayunos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Encebollado</span>
                      <span>$8.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tigrillo</span>
                      <span>$6.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bolón de Verde</span>
                      <span>$5.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🍽️ Platos Principales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Corvina Apanada</span>
                      <span>$12.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Seco de Cabrito</span>
                      <span>$15.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arroz con Pollo</span>
                      <span>$9.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🦐 Mariscos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Ceviche de Camarón</span>
                      <span>$10.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cazuela de Mariscos</span>
                      <span>$18.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Langostinos al Ajillo</span>
                      <span>$16.00</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>🥤 Bebidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Chicha de Jora</span>
                      <span>$3.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jugo Natural</span>
                      <span>$2.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gaseosa</span>
                      <span>$1.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "fila" && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>👥 Fila Virtual</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cedula">Número de Cédula</Label>
                  <Input
                    id="cedula"
                    placeholder="Ingresa tu cédula (10 dígitos)"
                    value={cedula}
                    onChange={handleCedulaChange}
                    maxLength={10}
                  />
                </div>
                <Button onClick={consultarFila} className="w-full">
                  Consultar Posición
                </Button>
                {filaStatus && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-blue-800">{filaStatus}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "reservas" && (
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>📅 Hacer Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input id="nombre" value={nombre} onChange={handleNombreChange} />
                </div>

                <div>
                  <Label htmlFor="email">Email (Gmail)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@gmail.com"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono Ecuatoriano</Label>
                  <Input
                    id="telefono"
                    placeholder="09XXXXXXXX o +593XXXXXXXXX"
                    value={telefono}
                    onChange={handleTelefonoChange}
                  />
                </div>

                <div>
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input id="fecha" type="date" value={fecha} onChange={handleFechaChange} />
                </div>

                <div>
                  <Label htmlFor="hora">Hora</Label>
                  <Input id="hora" type="time" value={hora} onChange={handleHoraChange} />
                </div>

                <div>
                  <Label htmlFor="personas">Número de Personas</Label>
                  <Input
                    id="personas"
                    type="number"
                    min="1"
                    max="12"
                    value={personas}
                    onChange={handlePersonasChange}
                  />
                </div>

                <Button onClick={hacerReserva} className="w-full">
                  Confirmar Reserva
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center">
          <p>&copy; 2024 Restaurante Manta - Comida Típica Ecuatoriana</p>
          <p>Manta, Ecuador | +593 99 123 4567</p>
        </div>
      </footer>
    </div>
  )
}
