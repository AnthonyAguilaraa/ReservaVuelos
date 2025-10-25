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
    const {
        // 'usuario_id' YA NO SE LEE DE AQUÍ
        vuelos,       // Array de IDs de vuelo. Ej: [101]
        pasajeros,    // Array de objetos de pasajeros. Ej: [{nombre: "Ana", ...}, {nombre: "Juan", ...}]
        asientos      // Array de IDs de asiento. Ej: [20, 21]
    } = req.body;

    // --- INICIO DE LA CORRECCIÓN ---
    // 1.b. Obtener el 'usuario_id' desde el token (middleware)
    // Asumo que tu middleware 'authenticateToken' añade el objeto 'req.user'
    // AVISA: ajusta 'req.user.id_usuario' si tu token lo guarda con otro nombre (ej: req.user.id)
    const usuario_id = req.user.id; 

    if (!usuario_id) {
        return res.status(403).json({ error: 'Token inválido o no se pudo identificar al usuario.' });
    }
    // --- FIN DE LA CORRECCIÓN ---


    // 2. Validar que los datos coincidan
    if (!pasajeros || !asientos || pasajeros.length !== asientos.length) {
        return res.status(400).json({ error: 'El número de pasajeros no coincide con el número de asientos.' });
    }
    if (pasajeros.length === 0) {
        return res.status(400).json({ error: 'Debe haber al menos un pasajero.' });
    }

    const client = await pool.connect();

    try {
        // 3. ¡INICIAR TRANSACCIÓN!
        await client.query('BEGIN');

        // 4. Crear los pasajeros y guardar sus nuevos IDs
        const idsPasajeros = [];
        for (const pasajero of pasajeros) {
            const pasajeroQuery = 'INSERT INTO Pasajero (nombre, apellido, documento_identidad, fecha_nacimiento, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING id_pasajero';
            // Usamos el 'usuario_id' del token como el creador (opcional pero bueno)
            const pasajeroValues = [pasajero.nombre, pasajero.apellido, pasajero.documento_identidad, pasajero.fecha_nacimiento, usuario_id];
            const result = await client.query(pasajeroQuery, pasajeroValues);
            idsPasajeros.push(result.rows[0].id_pasajero);
        }

        // 5. Crear la Reserva (encabezado)
        const reservaQuery = 'INSERT INTO Reserva (usuario_id, num_pasajeros) VALUES ($1, $2) RETURNING id_reserva';
        
        // --- CORRECCIÓN ---
        // Usamos el 'usuario_id' extraído del token
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

        // 8. Ocupar los Asientos (Marcar como no disponibles)
        for (const asientoId of asientos) {
            const asientoQuery = 'UPDATE Asiento SET disponible = FALSE WHERE id_asiento = $1 AND disponible = TRUE RETURNING id_asiento';
            const asientoResult = await client.query(asientoQuery, [asientoId]);
            
            if (asientoResult.rowCount === 0) {
                throw new Error(`El asiento ID ${asientoId} ya no está disponible.`);
            }
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