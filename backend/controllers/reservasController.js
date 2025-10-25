const pool = require('../config/db');


// Función para validar los datos de la reserva
function validarReservaData(usuario_id, num_pasajeros) {
  if (!usuario_id  || !num_pasajeros) {
    return { error: 'Faltan datos obligatorios' };
  }
  if (num_pasajeros <= 0) {
    return { error: 'El número de pasajeros debe ser mayor que 0' };
  }
  return { error: null };
}

// Insertar Reserva
exports.insertarReserva = async (req, res) => {
  const { usuario_id, num_pasajeros } = req.body;

  try {
    // Validar los datos
    const validacion = validarReservaData(usuario_id, num_pasajeros);
    if (validacion.error) {
      return res.status(400).json({ error: validacion.error });
    }

    const query = 'INSERT INTO Reserva (usuario_id, num_pasajeros) VALUES ($1, $2) RETURNING id_reserva';
    const values = [usuario_id, num_pasajeros];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    res.status(201).json({ message: 'Reserva creada exitosamente', id_reserva: result.rows[0].id_reserva });
  } catch (err) {
    console.error('Error en insertarReserva:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Modificar Reserva
exports.modificarReserva = async (req, res) => {
  const { reserva_id, estado_reserva, num_pasajeros } = req.body;

  try {
    // Verificar si la reserva existe antes de modificar
    const queryExist = 'SELECT * FROM Reserva WHERE id_reserva = $1';
    const resultExist = await pool.query(queryExist, [reserva_id]);

    if (resultExist.rowCount === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Validar los datos
    const validacion = num_pasajeros && num_pasajeros <= 0 ? { error: 'El número de pasajeros debe ser mayor que 0' } : null;
    if (validacion) {
      return res.status(400).json(validacion);
    }

    const queryUpdate = 'UPDATE Reserva SET id_estado_reserva = $1, num_pasajeros = $2 WHERE id_reserva = $3 RETURNING *';
    const values = [estado_reserva, num_pasajeros, reserva_id];

    const client = await pool.connect();
    const result = await client.query(queryUpdate, values);
    client.release();

    res.status(200).json({ message: 'Reserva modificada exitosamente', reserva: result.rows[0] });
  } catch (err) {
    console.error('Error en modificarReserva:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Eliminar Reserva lógicamente (cambiar estado a 'cancelada')
exports.eliminarReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const queryExist = 'SELECT * FROM Reserva WHERE id_reserva = $1';
    const resultExist = await pool.query(queryExist, [id]);

    if (resultExist.rowCount === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Realizamos la actualización del estado
    const queryUpdate = 'UPDATE Reserva SET id_estado_reserva = $1 WHERE id_reserva = $2 RETURNING *';
    const values = [ESTADOS_RESERVA.CANCELADO, id];

    const client = await pool.connect();
    const result = await client.query(queryUpdate, values);
    client.release();

    res.status(200).json({ message: 'Reserva cancelada exitosamente', reserva: result.rows[0] });
  } catch (err) {
    console.error('Error en eliminarReserva:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Consultar todas las reservas
exports.consultarReservas = async (req, res) => {
  try {
    const query = 'SELECT * FROM Reserva ORDER BY id_reserva ASC';
    const client = await pool.connect();
    const result = await client.query(query);
    client.release();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error en consultarReservas:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Consultar reserva por ID
exports.consultarReservaPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'SELECT * FROM Reserva WHERE id_reserva = $1';
    const values = [id];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error en consultarReservaPorId:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.crearReservaCompleta = async (req, res) => {
    // 1. Datos que el frontend envía (Body)
    // Nota: 'asientos' se ha eliminado de aquí
    const {
        vuelos,       // Array de IDs de vuelo. Ej: [101]
        pasajeros     // Array de objetos de pasajeros. Ej: [{nombre: "Ana", ...}]
    } = req.body;

    // 1.b. Obtener el 'usuario_id' desde el token (middleware)
    const usuario_id = req.user.id; // Confirmado que usas 'req.user.id'

    if (!usuario_id) {
        return res.status(403).json({ error: 'Token inválido o no se pudo identificar al usuario.' });
    }

    // 2. Validar que los datos existan
    if (!pasajeros || pasajeros.length === 0) {
        return res.status(400).json({ error: 'Debe haber al menos un pasajero.' });
    }
    if (!vuelos || vuelos.length === 0) {
        return res.status(400).json({ error: 'Debe seleccionar al menos un vuelo.' });
    }

    const client = await pool.connect();

    try {
        // 3. ¡INICIAR TRANSACCIÓN!
        await client.query('BEGIN');

        // 4. Crear los pasajeros y guardar sus nuevos IDs
        const idsPasajeros = [];
        for (const pasajero of pasajeros) {
            const pasajeroQuery = 'INSERT INTO Pasajero (nombre, apellido, documento_identidad, fecha_nacimiento, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING id_pasajero';
            // Usamos el 'usuario_id' del token como el creador
            const pasajeroValues = [pasajero.nombre, pasajero.apellido, pasajero.documento_identidad, pasajero.fecha_nacimiento, usuario_id];
            const result = await client.query(pasajeroQuery, pasajeroValues);
            idsPasajeros.push(result.rows[0].id_pasajero);
        }

        // 5. Crear la Reserva (encabezado)
        const reservaQuery = 'INSERT INTO Reserva (usuario_id, num_pasajeros) VALUES ($1, $2) RETURNING id_reserva';
        // El 'id_estado_reserva' usará el DEFAULT 2 (pendiente)
        const reservaResult = await client.query(reservaQuery, [usuario_id, pasajeros.length]);
        const newReservaId = reservaResult.rows[0].id_reserva;

        // 6. Vincular Vuelos con la Reserva (Tabla: Reserva_Vuelo)
        for (const vueloId of vuelos) {
            const rvQuery = 'INSERT INTO Reserva_Vuelo (id_reserva, id_vuelo) VALUES ($1, $2)';
            await client.query(rvQuery, [newReservaId, vueloId]);
        }

        // 7. Vincular Pasajeros con la Reserva (Tabla: Reserva_Pasajero)
        for (const pasajeroId of idsPasajeros) {
            const rpQuery = 'INSERT INTO Reserva_Pasajero (id_reserva, id_pasajero) VALUES ($1, $2)';
            await client.query(rpQuery, [newReservaId, pasajeroId]);
        }

        // 9. ¡ÉXITO! Confirmar la transacción
        await client.query('COMMIT');
        res.status(201).json({ message: 'Reserva creada exitosamente', id_reserva: newReservaId });

    } catch (err) {
        // 10. ¡FALLO! Revertir todo
        await client.query('ROLLBACK');
        console.error('Error en transacción de reserva:', err);
        res.status(500).json({ error: 'Error al crear la reserva', details: err.message });
    } finally {
        client.release();
    }
};

exports.consultarMisReservas = async (req, res) => {
    // Obtenemos el id del usuario desde el token
    const usuario_id = req.user.id; 
    
    // Asumimos que el estado 2 = 'reservado' (pendiente de pago)
    const ID_ESTADO_PENDIENTE = 2; 

    try {
        const query = `
            SELECT 
                r.id_reserva, r.num_pasajeros, r.fecha_reserva,
                v.id_vuelo, v.numero_vuelo, v.precio,
                c1.nombre_ciudad AS origen, 
                c2.nombre_ciudad AS destino,
                a.nombre_aerolinea
            FROM Reserva r
            JOIN Reserva_Vuelo rv ON r.id_reserva = rv.id_reserva
            JOIN Vuelo v ON rv.id_vuelo = v.id_vuelo
            JOIN Ciudad c1 ON v.ciudad_origen = c1.id_ciudad
            JOIN Ciudad c2 ON v.ciudad_destino = c2.id_ciudad
            JOIN Aerolinea a ON v.aerolinea_id = a.id_aerolinea
            WHERE 
                r.usuario_id = $1 AND r.id_estado_reserva = $2
            ORDER BY r.fecha_reserva DESC;
        `;
        
        const client = await pool.connect();
        const result = await client.query(query, [usuario_id, ID_ESTADO_PENDIENTE]);
        client.release();
        
        res.status(200).json(result.rows);
        
    } catch (err) {
        console.error('Error en consultarMisReservas:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};