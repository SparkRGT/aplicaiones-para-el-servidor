"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Leaf, Flame } from "lucide-react"

interface PlatoMenu {
  id: string
  nombre: string
  descripcion: string
  precio: number
  imagen: string
  categoria: "desayunos" | "entradas" | "principales" | "postres" | "bebidas"
  esVegetariano?: boolean
  esPicante?: boolean
  esEspecialidad?: boolean
}

export function MenuSection() {
  const [categoriaActiva, setCategoriaActiva] = useState("principales")

  // Menú completo del restaurante
  const menuCompleto: PlatoMenu[] = [
    // Desayunos
    {
      id: "enc-001",
      nombre: "Encebollado Manabita",
      descripcion:
        "Tradicional sopa de pescado con yuca, cebolla encurtida y cilantro. El desayuno por excelencia de la costa ecuatoriana.",
      precio: 8.5,
      imagen: "encebollado tradicional ecuatoriano con yuca y pescado fresco",
      categoria: "desayunos",
      esEspecialidad: true,
    },
    {
      id: "bol-001",
      nombre: "Bolón de Verde",
      descripcion: "Masa de plátano verde rellena de chicharrón o queso, acompañada de café o chocolate caliente.",
      precio: 6.0,
      imagen: "bolón de verde ecuatoriano con chicharrón",
      categoria: "desayunos",
    },
    {
      id: "tir-001",
      nombre: "Tigrillo",
      descripcion:
        "Plátano verde majado con huevos revueltos, chicharrón y queso fresco. Típico de la región amazónica.",
      precio: 7.5,
      imagen: "tigrillo ecuatoriano con huevos y chicharrón",
      categoria: "desayunos",
    },

    // Entradas
    {
      id: "pat-001",
      nombre: "Patacones con Encurtido",
      descripcion: "Plátano verde frito aplastado, acompañado de encurtido de cebolla y tomate.",
      precio: 5.5,
      imagen: "patacones ecuatorianos con encurtido de cebolla",
      categoria: "entradas",
      esVegetariano: true,
    },
    {
      id: "emp-001",
      nombre: "Empanadas de Viento",
      descripcion: "Empanadas fritas rellenas de queso fresco, espolvoreadas con azúcar. Tradición quiteña.",
      precio: 4.0,
      imagen: "empanadas de viento ecuatorianas con queso",
      categoria: "entradas",
      esVegetariano: true,
    },
    {
      id: "ceb-001",
      nombre: "Ceviche de Camarón",
      descripción: "Camarones frescos marinados en limón con cebolla morada, cilantro y ají.",
      precio: 12.0,
      imagen: "ceviche de camarón ecuatoriano con limón y cilantro",
      categoria: "entradas",
      esPicante: true,
    },

    // Platos Principales
    {
      id: "cor-001",
      nombre: "Corvina Apanada",
      descripcion: "Filete de corvina fresca empanizada, servida con arroz, menestra de frejoles y patacones.",
      precio: 15.0,
      imagen: "corvina apanada ecuatoriana con arroz y menestra",
      categoria: "principales",
      esEspecialidad: true,
    },
    {
      id: "sec-001",
      nombre: "Seco de Cabrito",
      descripcion: "Guiso tradicional norteño con cilantro, chicha de jora y frejoles canarios.",
      precio: 18.0,
      imagen: "seco de cabrito peruano con cilantro y frejoles",
      categoria: "principales",
      esEspecialidad: true,
    },
    {
      id: "arr-001",
      nombre: "Arroz con Pollo",
      descripcion: "Arroz amarillo con pollo desmechado, arvejas, zanahoria y pimiento rojo.",
      precio: 12.5,
      imagen: "arroz con pollo ecuatoriano tradicional",
      categoria: "principales",
    },
    {
      id: "gua-001",
      nombre: "Guatita",
      descripcion: "Estofado de mondongo con papas, servido con arroz blanco y yuca hervida.",
      precio: 14.0,
      imagen: "guatita ecuatoriana con papas y mondongo",
      categoria: "principales",
    },
    {
      id: "loc-001",
      nombre: "Locro de Papa",
      descripcion: "Sopa cremosa de papas con queso fresco, aguacate y ají criollo.",
      precio: 9.5,
      imagen: "locro de papa ecuatoriano con queso y aguacate",
      categoria: "principales",
      esVegetariano: true,
    },

    // Postres
    {
      id: "pri-001",
      nombre: "Pristiños",
      descripcion: "Masa frita en forma de espiral, bañada en miel de panela con canela.",
      precio: 4.5,
      imagen: "pristiños ecuatorianos con miel de panela",
      categoria: "postres",
      esVegetariano: true,
    },
    {
      id: "qui-001",
      nombre: "Quimbolitos",
      descripcion: "Bizcocho al vapor envuelto en hoja de achira, con pasas y queso.",
      precio: 3.5,
      imagen: "quimbolitos ecuatorianos envueltos en hoja",
      categoria: "postres",
      esVegetariano: true,
    },
    {
      id: "hel-001",
      nombre: "Helado de Paila",
      descripcion: "Helado artesanal preparado en paila de bronce. Sabores: mora, coco, limón.",
      precio: 5.0,
      imagen: "helado de paila ecuatoriano artesanal",
      categoria: "postres",
      esVegetariano: true,
    },

    // Bebidas
    {
      id: "chi-001",
      nombre: "Chicha Morada",
      descripcion: "Bebida refrescante de maíz morado con piña, canela y clavo de olor.",
      precio: 3.5,
      imagen: "chicha morada ecuatoriana con especias",
      categoria: "bebidas",
      esVegetariano: true,
    },
    {
      id: "col-001",
      nombre: "Colada Morada",
      descripcion: "Bebida tradicional de Día de Difuntos con frutas, especias y harina de maíz morado.",
      precio: 4.0,
      imagen: "colada morada ecuatoriana tradicional",
      categoria: "bebidas",
      esVegetariano: true,
    },
    {
      id: "nar-001",
      nombre: "Jugo de Naranjilla",
      descripcion: "Jugo natural de naranjilla, fruta cítrica típica del Ecuador.",
      precio: 3.0,
      imagen: "jugo de naranjilla ecuatoriano natural",
      categoria: "bebidas",
      esVegetariano: true,
    },
  ]

  const categorias = [
    { id: "desayunos", nombre: "Desayunos", icono: "🌅" },
    { id: "entradas", nombre: "Entradas", icono: "🥗" },
    { id: "principales", nombre: "Platos Principales", icono: "🍽️" },
    { id: "postres", nombre: "Postres", icono: "🍰" },
    { id: "bebidas", nombre: "Bebidas", icono: "🥤" },
  ]

  const platosPorCategoria = (categoria: string) => {
    return menuCompleto.filter((plato) => plato.categoria === categoria)
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-balance">Nuestro Menú</h2>
        <p className="text-muted-foreground text-pretty max-w-2xl mx-auto">
          Descubra los auténticos sabores de Ecuador. Cada plato está preparado con ingredientes frescos y recetas
          tradicionales transmitidas por generaciones.
        </p>
      </div>

      <Tabs value={categoriaActiva} onValueChange={setCategoriaActiva} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categorias.map((categoria) => (
            <TabsTrigger key={categoria.id} value={categoria.id} className="text-xs sm:text-sm">
              <span className="mr-1">{categoria.icono}</span>
              <span className="hidden sm:inline">{categoria.nombre}</span>
              <span className="sm:hidden">{categoria.nombre.split(" ")[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {categorias.map((categoria) => (
          <TabsContent key={categoria.id} value={categoria.id} className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-semibold mb-2">
                {categoria.icono} {categoria.nombre}
              </h3>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platosPorCategoria(categoria.id).map((plato) => (
                <Card key={plato.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 overflow-hidden">
                    <img
                      src={`/abstract-geometric-shapes.png?height=200&width=300&query=${plato.imagen}`}
                      alt={plato.nombre}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg leading-tight">{plato.nombre}</CardTitle>
                      <Badge variant="secondary" className="text-lg font-bold ml-2">
                        ${plato.precio.toFixed(2)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <CardDescription className="text-sm leading-relaxed mb-4">{plato.descripcion}</CardDescription>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {plato.esEspecialidad && (
                        <Badge variant="default" className="text-xs">
                          <ChefHat className="w-3 h-3 mr-1" />
                          Especialidad
                        </Badge>
                      )}
                      {plato.esVegetariano && (
                        <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                          <Leaf className="w-3 h-3 mr-1" />
                          Vegetariano
                        </Badge>
                      )}
                      {plato.esPicante && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-600">
                          <Flame className="w-3 h-3 mr-1" />
                          Picante
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Información adicional */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h4 className="text-xl font-semibold">Información Importante</h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                <span>Opciones vegetarianas disponibles</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-4 w-4 text-red-600" />
                <span>Nivel de picante ajustable</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ChefHat className="h-4 w-4 text-primary" />
                <span>Ingredientes frescos diarios</span>
              </div>
            </div>
            <p className="text-muted-foreground">
              Todos nuestros platos pueden ser modificados según sus preferencias alimentarias. Por favor informe a
              nuestro personal sobre alergias o restricciones dietéticas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
