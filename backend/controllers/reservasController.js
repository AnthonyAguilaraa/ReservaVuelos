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
