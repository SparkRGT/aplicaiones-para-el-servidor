-- Script de inicialización para la base de datos de Menú
-- Este script se ejecuta automáticamente al crear el contenedor

-- Crear tabla categoria_menu
CREATE TABLE IF NOT EXISTS categoria_menu (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

-- Crear tabla menu
CREATE TABLE IF NOT EXISTS menu (
    id_menu SERIAL PRIMARY KEY,
    fecha DATE NOT NULL
);

-- Crear tabla plato
CREATE TABLE IF NOT EXISTS plato (
    id_plato SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    id_categoria INTEGER REFERENCES categoria_menu(id_categoria),
    id_menu INTEGER REFERENCES menu(id_menu)
);

-- Insertar datos de ejemplo
INSERT INTO categoria_menu (nombre) VALUES
    ('Entrantes'),
    ('Platos Principales'),
    ('Postres'),
    ('Bebidas')
ON CONFLICT DO NOTHING;

-- Insertar menú de ejemplo
INSERT INTO menu (fecha) VALUES (CURRENT_DATE)
ON CONFLICT DO NOTHING;

