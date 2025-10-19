const pool = require('../config/db');

// Crear vuelo
exports.insertarVuelo = async (req, res) => {
  const {
    numero_vuelo,
    ciudad_origen,
    ciudad_destino,
    fecha_salida,
    hora_salida,
    fecha_llegada,
    hora_llegada,
    aerolinea_id,
  } = req.body;

  try {
    if (!numero_vuelo || !ciudad_origen || !ciudad_destino || !fecha_salida || !hora_salida || !fecha_llegada || !hora_llegada || !aerolinea_id) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    if (ciudad_origen === ciudad_destino) {
      return res.status(400).json({ error: 'La ciudad de origen y destino no pueden ser iguales' });
    }

    const client = await pool.connect();

    // (Opcional) Validar FKs existan
    const fkChecks = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM Ciudades WHERE ciudad_id = $1) AS existe_origen,
         (SELECT COUNT(*) FROM Ciudades WHERE ciudad_id = $2) AS existe_destino,
         (SELECT COUNT(*) FROM Aerolinea WHERE id_aerolinea = $3 AND estado <> 'inactivo') AS existe_aerolinea`,
      [ciudad_origen, ciudad_destino, aerolinea_id]
    );
    const { existe_origen, existe_destino, existe_aerolinea } = fkChecks.rows[0];
    if (+existe_origen === 0 || +existe_destino === 0 || +existe_aerolinea === 0) {
      client.release();
      return res.status(400).json({ error: 'FK inválida: ciudad_origen, ciudad_destino o aerolinea_id' });
    }

    const query = `
      INSERT INTO Vuelo
        (numero_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, aerolinea_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id_vuelo
    `;
    const values = [numero_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, aerolinea_id];

    const result = await client.query(query, values);
    client.release();

    res.status(201).json({ message: 'Vuelo creado exitosamente', id: result.rows[0].id_vuelo });
  } catch (err) {
    console.error('Error en insertarVuelo:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Modificar vuelo
exports.modificarVuelo = async (req, res) => {
  const {
    id_vuelo,
    numero_vuelo,
    ciudad_origen,
    ciudad_destino,
    fecha_salida,
    hora_salida,
    fecha_llegada,
    hora_llegada,
    aerolinea_id,
    estado, // opcional para cambiar activo/inactivo
  } = req.body;

  try {
    if (!id_vuelo) return res.status(400).json({ error: 'id_vuelo es obligatorio' });
    if (ciudad_origen && ciudad_destino && ciudad_origen === ciudad_destino) {
      return res.status(400).json({ error: 'La ciudad de origen y destino no pueden ser iguales' });
    }

    const client = await pool.connect();

    // Armado dinámico de SET
    const fields = [];
    const values = [];
    let i = 1;

    const push = (col, val) => { fields.push(`${col} = $${i++}`); values.push(val); };

    if (numero_vuelo !== undefined) push('numero_vuelo', numero_vuelo);
    if (ciudad_origen !== undefined)  push('ciudad_origen', ciudad_origen);
    if (ciudad_destino !== undefined) push('ciudad_destino', ciudad_destino);
    if (fecha_salida !== undefined)   push('fecha_salida', fecha_salida);
    if (hora_salida !== undefined)    push('hora_salida', hora_salida);
    if (fecha_llegada !== undefined)  push('fecha_llegada', fecha_llegada);
    if (hora_llegada !== undefined)   push('hora_llegada', hora_llegada);
    if (aerolinea_id !== undefined)   push('aerolinea_id', aerolinea_id);
    if (estado !== undefined)         push('estado', estado);

    if (fields.length === 0) {
      client.release();
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    const query = `
      UPDATE Vuelo
      SET ${fields.join(', ')}
      WHERE id_vuelo = $${i}
      RETURNING *
    `;
    values.push(id_vuelo);

    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) return res.status(404).json({ error: 'Vuelo no encontrado' });

    res.status(200).json({ message: 'Vuelo modificado exitosamente' });
  } catch (err) {
    console.error('Error en modificarVuelo:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Borrado lógico (estado = 'inactivo')
exports.eliminarVuelo = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE Vuelo SET estado = 'inactivo' WHERE id_vuelo = $1 RETURNING *`,
      [id]
    );
    client.release();

    if (result.rowCount === 0) return res.status(404).json({ error: 'Vuelo no encontrado' });

    res.status(200).json({ message: 'Vuelo eliminado (inactivo)' });
  } catch (err) {
    console.error('Error en eliminarVuelo:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Listar vuelos (con filtros y paginación)
exports.consultarVuelos = async (req, res) => {
  const {
    origen,        // ?origen=ID
    destino,       // ?destino=ID
    fecha,         // ?fecha=YYYY-MM-DD (salida)
    estado = 'activo', // por defecto solo activos
    limit = 50,
    offset = 0,
  } = req.query;

  try {
    const where = [];
    const values = [];
    let i = 1;

    if (estado) { where.push(`v.estado = $${i}`); values.push(estado); i++; }
    if (origen) { where.push(`v.ciudad_origen = $${i}`); values.push(origen); i++; }
    if (destino){ where.push(`v.ciudad_destino = $${i}`); values.push(destino); i++; }
    if (fecha)  { where.push(`v.fecha_salida = $${i}`); values.push(fecha); i++; }

    const query = `
      SELECT
        v.*,
        co.nombre_ciudad AS nombre_origen,
        cd.nombre_ciudad AS nombre_destino,
        a.nombre_aerolinea
      FROM Vuelo v
      LEFT JOIN Ciudades co ON co.ciudad_id = v.ciudad_origen
      LEFT JOIN Ciudades cd ON cd.ciudad_id = v.ciudad_destino
      LEFT JOIN Aerolinea a ON a.id_aerolinea = v.aerolinea_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY v.id_vuelo ASC
      LIMIT ${Number(limit)} OFFSET ${Number(offset)}
    `;

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error en consultarVuelos:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Obtener vuelo por ID
exports.consultarVueloPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT
        v.*,
        co.nombre_ciudad AS nombre_origen,
        cd.nombre_ciudad AS nombre_destino,
        a.nombre_aerolinea
      FROM Vuelo v
      LEFT JOIN Ciudades co ON co.ciudad_id = v.ciudad_origen
      LEFT JOIN Ciudades cd ON cd.ciudad_id = v.ciudad_destino
      LEFT JOIN Aerolinea a ON a.id_aerolinea = v.aerolinea_id
      WHERE v.id_vuelo = $1
    `;
    const client = await pool.connect();
    const result = await client.query(query, [id]);
    client.release();

    if (result.rowCount === 0) return res.status(404).json({ error: 'Vuelo no encontrado' });

    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error en consultarVueloPorId:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
