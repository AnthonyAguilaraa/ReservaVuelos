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

CREATE TABLE ciudades (
    ciudad_id SERIAL PRIMARY KEY,
    nombre_ciudad VARCHAR(100) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    codigo_iata CHAR(3) UNIQUE,       -- Ej: MEX, MAD, JFK
    zona_horaria VARCHAR(100),         -- Ej: America/Mexico_City
	estado VARCHAR(100) DEFAULT 'activo' -- Estado de usuario (activo o inactivo)
);

select * from ciudades;


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
    FOREIGN KEY (ciudad_origen) REFERENCES Ciudades(ciudad_id),
    FOREIGN KEY (ciudad_destino) REFERENCES Ciudades(ciudad_id)
);
	

select * from vuelo;

