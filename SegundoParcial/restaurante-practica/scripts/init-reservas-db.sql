-- Script de inicialización para la base de datos de Reservas
-- Este script se ejecuta automáticamente al crear el contenedor

-- Crear tabla mesa
CREATE TABLE IF NOT EXISTS mesa (
    id_mesa SERIAL PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    capacidad INTEGER NOT NULL,
    estado VARCHAR(50) DEFAULT 'disponible'
);

-- Crear tabla reserva
CREATE TABLE IF NOT EXISTS reserva (
    id_reserva SERIAL PRIMARY KEY,
    id_cliente INTEGER NOT NULL,
    id_mesa INTEGER NOT NULL REFERENCES mesa(id_mesa),
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    estado VARCHAR(50) DEFAULT 'pendiente'
);

-- Insertar mesas de ejemplo
INSERT INTO mesa (numero, capacidad, estado) VALUES
    ('M-01', 2, 'disponible'),
    ('M-02', 4, 'disponible'),
    ('M-03', 4, 'disponible'),
    ('M-04', 6, 'disponible'),
    ('M-05', 8, 'disponible')
ON CONFLICT (numero) DO NOTHING;

