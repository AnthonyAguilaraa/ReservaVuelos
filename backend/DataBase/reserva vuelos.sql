-- ============================
-- SCRIPT DE BASE DE DATOS NORMALIZADA
-- Sistema de Reserva de Vuelos (PostgreSQL)
-- ============================

-- ============================
-- LIMPIEZA (DROP si existen)
-- ============================
DROP TABLE IF EXISTS Billete CASCADE;
DROP TABLE IF EXISTS Asiento CASCADE;
DROP TABLE IF EXISTS Reserva_Vuelo CASCADE;
DROP TABLE IF EXISTS Reserva_Pasajero CASCADE;
DROP TABLE IF EXISTS Reserva CASCADE;
DROP TABLE IF EXISTS Pasajero CASCADE;
DROP TABLE IF EXISTS Vuelo CASCADE;
DROP TABLE IF EXISTS Ciudad CASCADE;
DROP TABLE IF EXISTS Aerolinea CASCADE;
DROP TABLE IF EXISTS Usuario CASCADE;
DROP TABLE IF EXISTS Tipo_Asiento CASCADE;
DROP TABLE IF EXISTS Categoria_Asiento CASCADE;
DROP TABLE IF EXISTS Metodo_Pago CASCADE;
DROP TABLE IF EXISTS Estado CASCADE;

-- ============================
-- 1. Catálogo: Estado (uso genérico)
-- ============================
CREATE TABLE Estado (
    id_estado SERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Estados: id sugerido por orden (pero se generan automáticamente)
INSERT INTO Estado (nombre_estado, descripcion) VALUES
('activo', 'Registro activo'),
('reservado', 'Reserva realizada'),
('comprado', 'Billete comprado / emitido'),
('pendiente', 'Pendiente'),
('cancelado', 'Cancelado'),
('inactivo', 'Registro inactivo');

-- ============================
-- 2. Catálogo: Metodo_Pago
-- ============================
CREATE TABLE Metodo_Pago (
    id_metodo SERIAL PRIMARY KEY,
    nombre_metodo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Métodos de pago
INSERT INTO Metodo_Pago (nombre_metodo, descripcion) VALUES
('tarjeta_credito', 'Pago con tarjeta de crédito'),
('transferencia', 'Transferencia bancaria'),
('efectivo', 'Pago en efectivo'),
('paypal', 'Pago por PayPal');

-- ============================
-- 3. Catálogo: Categoria de Asiento
-- ============================
CREATE TABLE Categoria_Asiento (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Categoría de asiento
INSERT INTO Categoria_Asiento (nombre_categoria) VALUES
('Economica'),
('Premium Economy'),
('Business'),
('First');

-- ============================
-- 4. Catálogo: Tipo de Asiento (ventanilla/pasillo/etc)
-- ============================
CREATE TABLE Tipo_Asiento (
    id_tipo SERIAL PRIMARY KEY,
    nombre_tipo VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT
);

-- Tipo de asiento
INSERT INTO Tipo_Asiento (nombre_tipo) VALUES
('Ventanilla'),
('Pasillo'),
('Central');

-- ============================
-- 5. Usuario
-- ============================
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    fecha_registro TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_estado INT NOT NULL DEFAULT 1 REFERENCES Estado(id_estado)
);

CREATE EXTENSION IF NOT EXISTS pgcrypto;


INSERT INTO Usuario (nombre, correo_electronico, contrasena, telefono)
VALUES
('Juan Pérez', 'juanperez@example.com', crypt('juanSegura123', gen_salt('bf')), '123456789'),
('Ana García', 'anagarcia@example.com', crypt('anaSegura123', gen_salt('bf')), '234567890'),
('Carlos Sánchez', 'carlos@example.com', crypt('carlosSegura123', gen_salt('bf')), '345678901'),
('María López', 'maria@example.com', crypt('mariaSegura123', gen_salt('bf')), '456789012'),
('Pedro Díaz', 'pedro@example.com', crypt('pedroSegura123', gen_salt('bf')), '567890123'),
('Lucía Fernández', 'lucia@example.com', crypt('luciaSegura123.', gen_salt('bf')), '678901234'),
('Gonzalo Martínez', 'raul@example.com', crypt('gonzaloSegura123', gen_salt('bf')), '789012345'),
('Julia Sánchez', 'julia@example.com', crypt('juliaSegura123', gen_salt('bf')), '890123456'),
('David Ruiz', 'davidruiz@example.com', crypt('davidSegura123', gen_salt('bf')), '901234567'),
('Laura Gómez', 'laura@example.com', crypt('lauraSegura123', gen_salt('bf')), '012345678');


-- ============================
-- 6. Aerolinea
-- ============================
CREATE TABLE Aerolinea (
    id_aerolinea SERIAL PRIMARY KEY,
    nombre_aerolinea VARCHAR(100) NOT NULL,
    pais_origen VARCHAR(100),
    id_estado INT NOT NULL DEFAULT 1 REFERENCES Estado(id_estado)
);

-- 6. Insertar en Aerolinea
INSERT INTO Aerolinea (nombre_aerolinea, pais_origen) VALUES
('Aerolíneas Argentinas', 'Argentina'),
('LATAM Airlines', 'Chile'),
('Iberia', 'España'),
('Emirates', 'Emiratos Árabes Unidos'),
('Delta Airlines', 'Estados Unidos'),
('Qatar Airways', 'Qatar'),
('Air France', 'Francia'),
('United Airlines', 'Estados Unidos'),
('American Airlines', 'Estados Unidos'),
('Lufthansa', 'Alemania');

-- ============================
-- 7. Ciudad
-- ============================
CREATE TABLE Ciudad (
    id_ciudad SERIAL PRIMARY KEY,
    nombre_ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    codigo_iata CHAR(3) UNIQUE,
    zona_horaria VARCHAR(100),
    id_estado INT NOT NULL DEFAULT 1 REFERENCES Estado(id_estado)
);

-- 7. Insertar en Ciudad
INSERT INTO Ciudad (nombre_ciudad, pais, codigo_iata) VALUES
('Buenos Aires', 'Argentina', 'EZE'),
('Santiago', 'Chile', 'SCL'),
('Madrid', 'España', 'MAD'),
('Dubai', 'Emiratos Árabes Unidos', 'DXB'),
('Nueva York', 'Estados Unidos', 'JFK'),
('Doha', 'Qatar', 'DOH'),
('París', 'Francia', 'CDG'),
('Los Ángeles', 'Estados Unidos', 'LAX'),
('Miami', 'Estados Unidos', 'MIA'),
('Frankfurt', 'Alemania', 'FRA');

-- ============================
-- 8. Vuelo
-- ============================
CREATE TABLE Vuelo (
    id_vuelo SERIAL PRIMARY KEY,
    numero_vuelo VARCHAR(50) UNIQUE NOT NULL,
    ciudad_origen INT NOT NULL REFERENCES Ciudad(id_ciudad),
    ciudad_destino INT NOT NULL REFERENCES Ciudad(id_ciudad),
    fecha_salida DATE NOT NULL,
    hora_salida TIME NOT NULL,
    fecha_llegada DATE NOT NULL,
    hora_llegada TIME NOT NULL,
    aerolinea_id INT NOT NULL REFERENCES Aerolinea(id_aerolinea),
    precio DECIMAL(10,2) NOT NULL,
    id_estado INT NOT NULL DEFAULT 1 REFERENCES Estado(id_estado),
    CONSTRAINT chk_origen_destino CHECK (ciudad_origen <> ciudad_destino)
);

-- 8. Insertar en Vuelo
INSERT INTO Vuelo (numero_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, aerolinea_id, precio) VALUES
('AR102', 1, 2, '2025-12-01', '08:00', '2025-12-01', '11:00', 1, 500),
('LA200', 2, 3, '2025-12-02', '09:00', '2025-12-02', '12:00', 2, 600),
('IB400', 3, 4, '2025-12-03', '10:00', '2025-12-03', '14:00', 3, 700),
('EK500', 4, 5, '2025-12-04', '11:00', '2025-12-04', '15:00', 4, 800),
('DL600', 5, 6, '2025-12-05', '12:00', '2025-12-05', '16:00', 5, 900),
('QR700', 6, 7, '2025-12-06', '13:00', '2025-12-06', '17:00', 6, 1000),
('AF800', 7, 8, '2025-12-07', '14:00', '2025-12-07', '18:00', 7, 1100),
('UA900', 8, 9, '2025-12-08', '15:00', '2025-12-08', '19:00', 8, 1200),
('AA1000', 9, 10, '2025-12-09', '16:00', '2025-12-09', '20:00', 9, 1300),
('LH1100', 10, 1, '2025-12-10', '17:00', '2025-12-10', '21:00', 10, 1400),
('AM1200', 1, 3, '2025-12-11', '06:00', '2025-12-11', '09:00', 1, 400), -- id 11
('LA1300', 3, 5, '2025-12-11', '10:00', '2025-12-11', '13:00', 2, 450), -- id 12
('IB1400', 5, 7, '2025-12-12', '08:00', '2025-12-12', '11:00', 3, 500), -- id 13
('EK1500', 7, 9, '2025-12-13', '12:00', '2025-12-13', '15:00', 4, 550), -- id 14
('DL1600', 9, 1, '2025-12-14', '14:00', '2025-12-14', '17:00', 5, 600), -- id 15
('QR1700', 1, 4, '2025-12-15', '09:00', '2025-12-15', '12:00', 6, 620), -- id 16
('AF1800', 4, 6, '2025-12-16', '13:00', '2025-12-16', '16:00', 7, 650), -- id 17
('UA1900', 6, 8, '2025-12-17', '15:00', '2025-12-17', '18:00', 8, 670); -- id 18


-- ============================
-- 9. Reserva (encabezado)
-- ============================
CREATE TABLE Reserva (
    id_reserva SERIAL PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES Usuario(id_usuario) ON DELETE CASCADE,
    fecha_reserva TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_estado_reserva INT NOT NULL DEFAULT 2 REFERENCES Estado(id_estado), -- ej. 'reservado'
    num_pasajeros INT NOT NULL CHECK (num_pasajeros > 0)
);

-- 9. Insertar en Reserva
INSERT INTO Reserva (usuario_id, num_pasajeros, id_estado_reserva) VALUES
(1, 2, 2), -- Reserva de Juan Pérez con 2 pasajeros, estado 'reservado'
(2, 1, 2), -- Reserva de Ana García con 1 pasajero
(3, 3, 2), -- Reserva de Carlos Sánchez con 3 pasajeros
(4, 2, 2), -- Reserva de María López con 2 pasajeros
(5, 1, 2), -- Reserva de Pedro Díaz con 1 pasajero
(6, 1, 2), -- Reserva de Lucía Fernández con 1 pasajero
(7, 2, 2), -- Reserva de Raúl Martínez con 2 pasajeros
(8, 1, 2), -- Reserva de Julia Sánchez con 1 pasajero
(9, 3, 2), -- Reserva de David Ruiz con 3 pasajeros
(10, 2, 2); -- Reserva de Laura Gómez con 2 pasajeros

-- ============================
-- 10. Pasajero (persona que viaja)
-- ============================
CREATE TABLE Pasajero (
    id_pasajero SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    documento_identidad VARCHAR(50),
    fecha_nacimiento DATE,
    usuario_id INT REFERENCES Usuario(id_usuario), -- opcional: quien lo registró
	id_estado_pasajero INT NOT NULL DEFAULT 1 REFERENCES Estado(id_estado)
);

-- 10. Insertar en Pasajero
INSERT INTO Pasajero (nombre, apellido, documento_identidad, fecha_nacimiento, usuario_id) VALUES
('Carlos', 'Pérez', '12345678', '1980-03-15', 1), -- Pasajero de Juan Pérez
('Laura', 'González', '23456789', '1990-05-21', 2), -- Pasajero de Ana García
('Eduardo', 'López', '34567890', '1985-11-03', 3), -- Pasajero de Carlos Sánchez
('Mariana', 'Hernández', '45678901', '1995-07-22', 4), -- Pasajero de María López
('Javier', 'Moreno', '56789012', '1982-01-12', 5), -- Pasajero de Pedro Díaz
('Sofía', 'Vega', '67890123', '1992-04-30', 6), -- Pasajero de Lucía Fernández
('Martín', 'Sánchez', '78901234', '1978-09-07', 7), -- Pasajero de Gonzalo Martínez
('Isabel', 'Pérez', '89012345', '1988-06-15', 8), -- Pasajero de Julia Sánchez
('Antonio', 'Ruiz', '90123456', '1983-12-10', 9), -- Pasajero de David Ruiz
('Felipe', 'Gómez', '01234567', '1990-11-01', 10), -- Pasajero de Laura Gómez
('Camila', 'Martínez', '09876543', '1991-02-14', 7),  -- id 11
('Diego', 'Fernández', '11223344', '1993-08-25', 7),  -- id 12
('Elena', 'Navarro', '22334455', '1986-03-10', 8),     -- id 13
('Luis', 'Cruz', '33445566', '1980-07-04', 9),         -- id 14
('Natalia', 'Romero', '44556677', '1992-11-11', 9),    -- id 15
('Álvaro', 'Ríos', '55667788', '1985-01-01', 9),       -- id 16
('Valentina', 'Salas', '66778899', '1994-09-09', 10),  -- id 17
('Esteban', 'Ortega', '77889900', '1987-06-06', 10);   -- id 18


-- ============================
-- 11. Reserva_Pasajero (N:M reserva - pasajero)
-- ============================
CREATE TABLE Reserva_Pasajero (
    id_reserva INT REFERENCES Reserva(id_reserva) ON DELETE CASCADE,
    id_pasajero INT REFERENCES Pasajero(id_pasajero) ON DELETE CASCADE,
    PRIMARY KEY (id_reserva, id_pasajero)
);

-- 11. Insertar en Reserva_Pasajero
INSERT INTO Reserva_Pasajero (id_reserva, id_pasajero) VALUES
(1, 1), (1, 2), -- Reserva de Juan Pérez con 2 pasajeros
(2, 3), -- Reserva de Ana García con 1 pasajero
(3, 4), (3, 5), (3, 6), -- Reserva de Carlos Sánchez con 3 pasajeros
(4, 7), (4, 8), -- Reserva de María López con 2 pasajeros
(5, 9), -- Reserva de Pedro Díaz con 1 pasajero
(6, 10), -- Reserva de Lucía Fernández con 1 pasajero
(7, 10), (7, 12), -- Reserva de Gonzalo Martínez con 2 pasajeros
(8, 13), -- Reserva de Julia Sánchez con 1 pasajero
(9, 14), (9, 15), (9, 16), -- Reserva de David Ruiz con 3 pasajeros
(10, 17), (10, 18); -- Reserva de Laura Gómez con 2 pasajeros

-- ============================
-- 12. Reserva_Vuelo (itinerario: N:M Reserva - Vuelo)
-- ============================
CREATE TABLE Reserva_Vuelo (
    id_reserva INT REFERENCES Reserva(id_reserva) ON DELETE CASCADE,
    id_vuelo INT REFERENCES Vuelo(id_vuelo) ON DELETE CASCADE,
    orden INT DEFAULT 1, -- orden del tramo dentro del itinerario (1,2,...)
    PRIMARY KEY (id_reserva, id_vuelo)
);

-- 12. Insertar en Reserva_Vuelo
INSERT INTO Reserva_Vuelo (id_reserva, id_vuelo, orden) VALUES
(1, 1, 1), (1, 2, 2), -- Reserva de Juan Pérez con 2 vuelos
(2, 3, 1), -- Reserva de Ana García con 1 vuelo
(3, 4, 1), (3, 5, 2), (3, 6, 3), -- Reserva de Carlos Sánchez con 3 vuelos
(4, 7, 1), (4, 8, 2), -- Reserva de María López con 2 vuelos
(5, 9, 1), -- Reserva de Pedro Díaz con 1 vuelo
(6, 10, 1), -- Reserva de Lucía Fernández con 1 vuelo
(7, 11, 1), (7, 12, 2), -- Reserva de Gonzalo Martínez con 2 vuelos
(8, 13, 1), -- Reserva de Julia Sánchez con 1 vuelo
(9, 14, 1), (9, 15, 2), (9, 16, 3), -- Reserva de David Ruiz con 3 vuelos
(10, 17, 1), (10, 18, 2); -- Reserva de Laura Gómez con 2 vuelos

-- ============================
-- 13. Asiento
-- ============================
CREATE TABLE Asiento (
    id_asiento SERIAL PRIMARY KEY,
    id_vuelo INT NOT NULL REFERENCES Vuelo(id_vuelo) ON DELETE CASCADE,
    numero_asiento VARCHAR(10) NOT NULL,         -- Ejemplo: 1A, 2B
    id_categoria INT REFERENCES Categoria_Asiento(id_categoria),
    id_tipo INT REFERENCES Tipo_Asiento(id_tipo),
    disponible BOOLEAN DEFAULT TRUE,             -- TRUE = libre
    id_estado INT NOT NULL DEFAULT 1 REFERENCES Estado(id_estado),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_vuelo_numero_asiento UNIQUE (id_vuelo, numero_asiento)
);

-- 13. Insertar en Asiento
INSERT INTO Asiento (id_vuelo, numero_asiento, id_categoria, id_tipo) VALUES
(1, '1A', 1, 1), (1, '1B', 2, 2), -- Asientos para el vuelo AR102
(2, '2A', 3, 3), -- Asientos para el vuelo LA200
(3, '3A', 1, 1), (3, '3B', 2, 2), (3, '3C', 3, 3), -- Asientos para el vuelo IB400
(4, '4A', 1, 1), (4, '4B', 2, 2), -- Asientos para el vuelo EK500
(5, '5A', 3, 3), -- Asientos para el vuelo DL600
(6, '6A', 1, 1), (6, '6B', 2, 2), -- Asientos para el vuelo QR700
(7, '7A', 3, 3), (7, '7B', 2, 2), -- Asientos para el vuelo AF800
(8, '8A', 1, 1), (8, '8B', 2, 2), -- Asientos para el vuelo UA900
(9, '9A', 3, 3), (9, '9B', 2, 2), -- Asientos para el vuelo AA1000
(10, '10A', 1, 1), (10, '10B', 2, 2); -- Asientos para el vuelo LH1100

-- ============================
-- 14. Billete
-- ============================
CREATE TABLE Billete (
    id_billete SERIAL PRIMARY KEY,
    id_reserva INT NOT NULL REFERENCES Reserva(id_reserva) ON DELETE CASCADE,
    id_asiento INT NOT NULL REFERENCES Asiento(id_asiento) ON DELETE RESTRICT,
    id_metodo_pago INT REFERENCES Metodo_Pago(id_metodo),
    precio DECIMAL(10,2) NOT NULL,
    fecha_compra TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    id_estado_billete INT NOT NULL DEFAULT 3 REFERENCES Estado(id_estado), -- ej. 'comprado'
    numero_billete VARCHAR(50) UNIQUE NOT NULL,
    id_estado_pago INT REFERENCES Estado(id_estado) -- usa Estado para estados de pago (ej. pendiente, pagado)
);

INSERT INTO Billete (id_reserva, id_asiento, id_metodo_pago, precio, numero_billete) VALUES
(1, 1, 1, 500, 'BIL123456'),
(2, 3, 2, 600, 'BIL234567'),
(3, 4, 3, 700, 'BIL345678'),
(4, 6, 4, 800, 'BIL456789'),
(5, 7, 1, 900, 'BIL567890'),
(6, 8, 2, 1000, 'BIL678901'),
(7, 9, 3, 1100, 'BIL789012'),
(8, 10, 4, 1200, 'BIL890123'),
(9, 11, 1, 1300, 'BIL901234'),
(10, 12, 2, 1400, 'BIL012345');


--	Horarios de Vuelos. 
-- Parámetros de ejemplo:
-- ciudad_origen_nombre = 'Buenos Aires'
-- ciudad_destino_nombre = 'Santiago'
-- fecha_salida = '2025-12-01' (opcional)
-- aerolinea_nombre = 'LATAM Airlines' (opcional)
-- solo_directos = true (solo vuelos directos)

SELECT
    v.numero_vuelo,
    c_origen.nombre_ciudad AS ciudad_origen,
    c_destino.nombre_ciudad AS ciudad_destino,
    v.fecha_salida,
    v.hora_salida,
    v.fecha_llegada,
    v.hora_llegada,
    a.nombre_aerolinea
FROM Vuelo v
JOIN Ciudad c_origen ON v.ciudad_origen = c_origen.id_ciudad
JOIN Ciudad c_destino ON v.ciudad_destino = c_destino.id_ciudad
JOIN Aerolinea a ON v.aerolinea_id = a.id_aerolinea
WHERE c_origen.nombre_ciudad = 'Buenos Aires'
  AND c_destino.nombre_ciudad = 'Santiago'
  -- Opcional: Filtrar por fecha
  AND (v.fecha_salida = '2025-12-01' OR '2025-12-01' IS NULL)
  -- Opcional: Filtrar por aerolínea
  AND (a.nombre_aerolinea = 'Aerolíneas Argentinas' OR 'LATAM Airlines' IS NULL)
  -- En este esquema, todos los vuelos son directos (no hay conexiones registradas), 
  -- pero si existieran vuelos con conexiones, aquí se agregaría la lógica para filtrar vuelos directos.
ORDER BY v.hora_salida;



--	Tarifas de Vuelos.
SELECT
    v.numero_vuelo,
    c_origen.nombre_ciudad AS ciudad_origen,
    c_destino.nombre_ciudad AS ciudad_destino,
    v.fecha_salida,
    v.hora_salida,
    a.nombre_aerolinea,
    v.precio
FROM Vuelo v
JOIN Ciudad c_origen ON v.ciudad_origen = c_origen.id_ciudad
JOIN Ciudad c_destino ON v.ciudad_destino = c_destino.id_ciudad
JOIN Aerolinea a ON v.aerolinea_id = a.id_aerolinea
WHERE c_origen.nombre_ciudad = 'Buenos Aires'
  AND c_destino.nombre_ciudad = 'Santiago'
  -- Opcional: Filtrar por fecha
  AND (v.fecha_salida = '2025-12-01' OR '2025-12-01' IS NULL)
  -- Opcional: Filtrar por categoría de asiento
  -- Aquí se requeriría JOIN con Asiento y Categoria_Asiento si se quiere filtrar o mostrar la categoría
ORDER BY v.precio ASC;



--	Información de Vuelo 
SELECT
    v.numero_vuelo,
    c_origen.nombre_ciudad AS ciudad_origen,
    c_destino.nombre_ciudad AS ciudad_destino,
    v.fecha_salida,
    v.hora_salida,
    v.fecha_llegada,
    v.hora_llegada,
    a.nombre_aerolinea,
    e.nombre_estado AS estado_vuelo,
    COUNT(a1.id_asiento) AS total_asientos,
    SUM(CASE WHEN a1.disponible THEN 1 ELSE 0 END) AS asientos_disponibles,
    -- Para vuelos del mismo día, verificar si está en hora (ejemplo simple: hora actual < hora_salida)
    CASE 
        WHEN v.fecha_salida = CURRENT_DATE THEN
            CASE 
                WHEN CURRENT_TIME <= v.hora_salida THEN 'En hora'
                ELSE 'Retrasado'
            END
        ELSE 'No aplica'
    END AS estado_hora
FROM Vuelo v
JOIN Ciudad c_origen ON v.ciudad_origen = c_origen.id_ciudad
JOIN Ciudad c_destino ON v.ciudad_destino = c_destino.id_ciudad
JOIN Aerolinea a ON v.aerolinea_id = a.id_aerolinea
JOIN Estado e ON v.id_estado = e.id_estado
LEFT JOIN Asiento a1 ON a1.id_vuelo = v.id_vuelo
WHERE v.numero_vuelo = 'AR102' AND v.fecha_salida = '2025-12-01'
GROUP BY v.numero_vuelo, c_origen.nombre_ciudad, c_destino.nombre_ciudad, v.fecha_salida, v.hora_salida, v.fecha_llegada, v.hora_llegada, a.nombre_aerolinea, e.nombre_estado;

-- ============================
-- FIN DEL SCRIPT
-- ============================

