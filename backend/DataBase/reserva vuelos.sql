-- Tabla Usuario
CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    correo_electronico VARCHAR(100) UNIQUE NOT NULL,
    contrasena VARCHAR(255) NOT NULL,
    telefono VARCHAR(200),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(100) DEFAULT 'activo' -- Estado de usuario (activo o inactivo)
);


SELECT * FROM USUARIO;


-- Tabla Aerolinea
CREATE TABLE Aerolinea (
    id_aerolinea SERIAL PRIMARY KEY,
    nombre_aerolinea VARCHAR(100),
    pais_origen VARCHAR(200),
    estado VARCHAR(100) DEFAULT 'activo' -- Estado de usuario (activo o inactivo)
);

SELECT * FROM Aerolinea ORDER BY id_aerolinea ASC;

INSERT INTO Aerolinea (nombre_aerolinea, pais_origen, estado)
VALUES ('Aerolíneas Argentinas', 'Argentina', 'activo'),
 ('American Airlines', 'Estados Unidos', 'activo'),
 ('Emirates', 'Emiratos Árabes Unidos', 'activo');


-- Tabla Ciudades
CREATE TABLE ciudades (
    ciudad_id SERIAL PRIMARY KEY,
    nombre_ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    codigo_iata CHAR(3) UNIQUE,       -- Ej: MEX, MAD, JFK
    zona_horaria VARCHAR(100),         -- Ej: America/Mexico_City
	estado VARCHAR(100) DEFAULT 'activo' -- Estado de usuario (activo o inactivo)
);

select * from ciudades;

INSERT INTO ciudades (nombre_ciudad, pais, codigo_iata, zona_horaria, estado)
VALUES 
('Ciudad de México', 'México', 'MEX', 'America/Mexico_City', 'activo'),
 ('Madrid', 'España', 'MAD', 'Europe/Madrid', 'activo'),
('Nueva York', 'Estados Unidos', 'JFK', 'America/New_York', 'activo');


-- Tabla Vuelo
CREATE TABLE Vuelo (
    id_vuelo SERIAL PRIMARY KEY,
    numero_vuelo VARCHAR(100),
    ciudad_origen INT,                    -- Referencia a la ciudad de origen
    ciudad_destino INT,                   -- Referencia a la ciudad de destino
    fecha_salida DATE,
    hora_salida TIME,
    fecha_llegada DATE,
    hora_llegada TIME,
    aerolinea_id INT REFERENCES Aerolinea(id_aerolinea),
	estado VARCHAR(100) DEFAULT 'activo', -- Estado de usuario (activo o inactivo)
	precio DECIMAL(10, 2),
    FOREIGN KEY (ciudad_origen) REFERENCES Ciudades(ciudad_id),
    FOREIGN KEY (ciudad_destino) REFERENCES Ciudades(ciudad_id)
);

INSERT INTO Vuelo (numero_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, aerolinea_id, estado, precio)
VALUES ('AA100', 1, 2, '2025-10-30', '08:00:00', '2025-10-30', '12:30:00', 1, 'activo', 450.00),
 ('UA200', 3, 3, '2025-11-05', '14:00:00', '2025-11-05', '18:45:00', 2, 'activo', 550.00),
 ('EK300', 3, 1, '2025-11-12', '20:30:00', '2025-11-13', '06:00:00', 3, 'activo', 900.00);
	

select * from vuelo;

-- Tabla Aeropuerto
CREATE TABLE aeropuerto (
    ID_aeropuerto INT PRIMARY KEY, 
    aerop_codig_aita VARCHAR(10) NOT NULL, )
    aerop_nombre VARCHAR(255) NOT NULL, 
    aerop_ciudad VARCHAR(255) NOT NULL 
);
	
INSERT INTO aeropuerto (ID_aeropuerto, aerop_codig_aita, aerop_nombre, aerop_ciudad)
VALUES
(1, 'UIO', 'Aeropuerto Mariscal Sucre', 'Quito'),
(2, 'GYE', 'Aeropuerto José Joaquín de Olmedo', 'Guayaquil'),
(3, 'CUE', 'Aeropuerto Mariscal La Mar', 'Cuenca');