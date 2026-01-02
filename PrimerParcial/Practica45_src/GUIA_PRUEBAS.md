# 🧪 Guía de Pruebas - Restaurante API

## 📋 Requisitos
- API REST corriendo en: `http://localhost:3000`
- GraphQL Gateway corriendo en: `http://localhost:3001/graphql`
- Thunder Client instalado en VS Code

## 🚀 Cómo Importar en Thunder Client

1. Abre VS Code
2. Ve a la extensión de Thunder Client (icono del rayo ⚡)
3. Click en "Collections"
4. Click en el menú (...) y selecciona "Import"
5. Selecciona el archivo `thunder-tests.json`

---

## 📍 Endpoints REST API (Puerto 3000)

### **RESTAURANTES** `/restaurantes`

#### GET - Obtener todos los restaurantes
```
GET http://localhost:3000/restaurantes
```

#### GET - Obtener restaurante por ID
```
GET http://localhost:3000/restaurantes/1
```

#### POST - Crear restaurante
```
POST http://localhost:3000/restaurantes
Content-Type: application/json

{
  "nombre": "Nuevo Restaurante",
  "direccion": "Calle Nueva 456",
  "telefono": "555-9999"
}
```

#### PATCH - Actualizar restaurante
```
PATCH http://localhost:3000/restaurantes/1
Content-Type: application/json

{
  "telefono": "555-0000"
}
```

#### DELETE - Eliminar restaurante
```
DELETE http://localhost:3000/restaurantes/1
```

---

### **CATEGORÍAS** `/categoria-menu`

#### GET - Obtener todas las categorías
```
GET http://localhost:3000/categoria-menu
```

#### GET - Obtener categoría por ID
```
GET http://localhost:3000/categoria-menu/1
```

#### POST - Crear categoría
```
POST http://localhost:3000/categoria-menu
Content-Type: application/json

{
  "nombre": "Sopas"
}
```

---

### **PLATOS** `/platos`

#### GET - Obtener todos los platos
```
GET http://localhost:3000/platos
```

#### GET - Obtener plato por ID
```
GET http://localhost:3000/platos/1
```

#### POST - Crear plato
```
POST http://localhost:3000/platos
Content-Type: application/json

{
  "nombre": "Pizza Margarita",
  "descripcion": "Pizza clásica con tomate, mozzarella y albahaca",
  "precio": 14.99,
  "disponible": true,
  "id_menu": 1,
  "id_categoria": 2
}
```

#### PATCH - Actualizar plato
```
PATCH http://localhost:3000/platos/1
Content-Type: application/json

{
  "precio": 9.99,
  "disponible": false
}
```

---

### **MESAS** `/mesas`

#### GET - Obtener todas las mesas
```
GET http://localhost:3000/mesas
```

#### GET - Obtener mesa por ID
```
GET http://localhost:3000/mesas/1
```

#### POST - Crear mesa
```
POST http://localhost:3000/mesas
Content-Type: application/json

{
  "numero": 11,
  "capacidad": 8,
  "estado": "disponible",
  "id_restaurante": 1
}
```

#### PATCH - Actualizar estado de mesa
```
PATCH http://localhost:3000/mesas/1
Content-Type: application/json

{
  "estado": "ocupada"
}
```

---

### **CLIENTES** `/clientes`

#### GET - Obtener todos los clientes
```
GET http://localhost:3000/clientes
```

#### POST - Crear cliente
```
POST http://localhost:3000/clientes
Content-Type: application/json

{
  "nombre": "Laura Fernández",
  "correo": "laura.fernandez@email.com",
  "telefono": "555-6666"
}
```

---

### **RESERVAS** `/reservas`

#### GET - Obtener todas las reservas
```
GET http://localhost:3000/reservas
```

#### POST - Crear reserva
```
POST http://localhost:3000/reservas
Content-Type: application/json

{
  "id_cliente": 1,
  "id_mesa": 5,
  "fecha": "2025-10-25",
  "hora_inicio": "2025-10-25T19:00:00",
  "hora_fin": "2025-10-25T21:00:00",
  "estado": "confirmada"
}
```

#### PATCH - Actualizar estado de reserva
```
PATCH http://localhost:3000/reservas/1
Content-Type: application/json

{
  "estado": "cancelada"
}
```

---

### **MENÚS** `/menus`

#### GET - Obtener todos los menús
```
GET http://localhost:3000/menus
```

---

### **FILA VIRTUAL** `/fila-virtual`

#### GET - Obtener fila virtual
```
GET http://localhost:3000/fila-virtual
```

---

## 🔷 GraphQL Queries (Puerto 3001)

Todas las consultas GraphQL van a: `POST http://localhost:3001/graphql`

### Obtener todos los restaurantes
```graphql
query {
  restaurantes {
    id_restaurante
    nombre
    direccion
    telefono
  }
}
```

### Obtener restaurante por ID
```graphql
query {
  restaurante(id: 1) {
    id_restaurante
    nombre
    direccion
    telefono
  }
}
```

### Obtener todas las categorías
```graphql
query {
  categorias {
    id_categoria
    nombre
  }
}
```

### Obtener categoría por ID
```graphql
query {
  categoria(id: 1) {
    id_categoria
    nombre
  }
}
```

### Obtener todos los platos
```graphql
query {
  platos {
    id_plato
    nombre
    descripcion
    precio
    disponible
  }
}
```

### Obtener plato por ID
```graphql
query {
  plato(id: 1) {
    id_plato
    nombre
    descripcion
    precio
    disponible
  }
}
```

### Obtener platos por categoría
```graphql
query {
  platosPorCategoria(categoriaId: 2) {
    id_plato
    nombre
    descripcion
    precio
    disponible
  }
}
```

### Buscar platos con filtros
```graphql
query {
  buscarPlatos(filtros: {
    nombre: "Sal"
    precioMin: 5
    precioMax: 25
    disponible: true
  }) {
    id_plato
    nombre
    descripcion
    precio
    disponible
  }
}
```

### Buscar platos con paginación
```graphql
query {
  buscarPlatos(
    filtros: {
      disponible: true
    }
    paginacion: {
      pagina: 1
      limite: 5
    }
  ) {
    id_plato
    nombre
    precio
  }
}
```

---

## 🧪 Datos de Prueba Insertados

### Restaurante
- **ID:** 1
- **Nombre:** El Buen Sabor
- **Dirección:** Av. Principal 123, Ciudad
- **Teléfono:** 555-0123

### Categorías
1. Entradas
2. Platos Principales
3. Postres
4. Bebidas

### Platos (9 platos)
- Ensalada César ($8.99)
- Bruschetta ($6.50)
- Filete de Res ($24.99)
- Salmón a la Parrilla ($22.50)
- Pasta Carbonara ($16.99)
- Tiramisu ($7.50)
- Cheesecake ($6.99)
- Limonada Natural ($3.50)
- Vino Tinto ($8.00)

### Mesas (10 mesas)
- Mesas 1-4: Capacidad 2 personas
- Mesas 5-8: Capacidad 4 personas
- Mesas 9-10: Capacidad 6 personas

### Clientes (5 clientes)
1. Juan Pérez
2. María García
3. Carlos López
4. Ana Martínez
5. Pedro Sánchez

### Reservas (3 reservas)
- Cliente 1 en Mesa 1
- Cliente 2 en Mesa 3
- Cliente 3 en Mesa 6

---

## 🌐 URLs Importantes

- **API REST:** http://localhost:3000
- **GraphQL Playground:** http://localhost:3001/graphql
- **GraphQL Endpoint:** http://localhost:3001/graphql

---

## 💡 Consejos

1. **GraphQL Playground:** Abre http://localhost:3001/graphql en tu navegador para una interfaz visual interactiva
2. **Thunder Client:** Usa la colección importada para probar rápidamente todos los endpoints
3. **Estados de Mesa:** disponible, ocupada, reservada
4. **Estados de Reserva:** confirmada, pendiente, cancelada

---

## 🐛 Troubleshooting

Si los servidores no están corriendo:

```bash
# Terminal 1 - API REST
cd restaurante-api
npm run start:dev

# Terminal 2 - GraphQL Gateway
cd proyecto-graphql-gateway
npm run start:dev
```
