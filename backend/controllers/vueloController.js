const pool = require('../config/db');

// Función de validación para el número de vuelo (Formato específico)
function validarNumeroVuelo(numero_vuelo) {
  return /^[A-Za-z0-9-]+$/.test(numero_vuelo);  // Permite letras, números y guiones
}

// Insertar vuelo
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
    precio
  } = req.body;

  try {
    if (!numero_vuelo || !ciudad_origen || !ciudad_destino || !fecha_salida || !hora_salida || !fecha_llegada || !hora_llegada || !aerolinea_id || precio === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (!validarNumeroVuelo(numero_vuelo)) {
      return res.status(400).json({ error: 'Número de vuelo no válido. Debe contener letras, números y guiones.' });
    }

    if (ciudad_origen === ciudad_destino) {
      return res.status(400).json({ error: 'La ciudad de origen y destino no pueden ser iguales' });
    }

    const client = await pool.connect();

    // Validar que las claves foráneas existan (ciudades y aerolínea)
    const fkChecks = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM Ciudad WHERE id_ciudad = $1) AS existe_origen,
         (SELECT COUNT(*) FROM Ciudad WHERE id_ciudad = $2) AS existe_destino,
         (SELECT COUNT(*) FROM Aerolinea WHERE id_aerolinea = $3 AND id_estado = 1) AS existe_aerolinea`,
      [ciudad_origen, ciudad_destino, aerolinea_id]
    );
    
    const { existe_origen, existe_destino, existe_aerolinea } = fkChecks.rows[0];
    
    if (+existe_origen === 0 || +existe_destino === 0 || +existe_aerolinea === 0) {
      client.release();
      return res.status(400).json({ error: 'FK inválida: ciudad_origen, ciudad_destino o aerolinea_id' });
    }

    // Realizar la inserción del vuelo
    const query = `
      INSERT INTO Vuelo
        (numero_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, aerolinea_id, precio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)  -- Suponiendo 1 = 'activo'
      RETURNING id_vuelo
    `;
    const values = [numero_vuelo, ciudad_origen, ciudad_destino, fecha_salida, hora_salida, fecha_llegada, hora_llegada, aerolinea_id, precio];

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
    precio
  } = req.body;

  try {
    if (!id_vuelo) return res.status(400).json({ error: 'id_vuelo es obligatorio' });

    if (ciudad_origen && ciudad_destino && ciudad_origen === ciudad_destino) {
      return res.status(400).json({ error: 'La ciudad de origen y destino no pueden ser iguales' });
    }

    const client = await pool.connect();

    // Validar las claves foráneas antes de realizar la actualización
    const fkChecks = await client.query(
      `SELECT
         (SELECT COUNT(*) FROM Ciudad WHERE id_ciudad = $1) AS existe_origen,
         (SELECT COUNT(*) FROM Ciudad WHERE id_ciudad = $2) AS existe_destino,
         (SELECT COUNT(*) FROM Aerolinea WHERE id_aerolinea = $3 AND id_estado = 1) AS existe_aerolinea`,
      [ciudad_origen, ciudad_destino, aerolinea_id]
    );
    const { existe_origen, existe_destino, existe_aerolinea } = fkChecks.rows[0];

    if (+existe_origen === 0 || +existe_destino === 0 || +existe_aerolinea === 0) {
      client.release();
      return res.status(400).json({ error: 'FK inválida: ciudad_origen, ciudad_destino o aerolinea_id' });
    }

    // Armado dinámico de SET para la actualización
    const fields = [];
    const values = [];
    let i = 1;

    const push = (col, val) => { fields.push(`${col} = $${i++}`); values.push(val); };

    if (numero_vuelo) push('numero_vuelo', numero_vuelo);
    if (ciudad_origen) push('ciudad_origen', ciudad_origen);
    if (ciudad_destino) push('ciudad_destino', ciudad_destino);
    if (fecha_salida) push('fecha_salida', fecha_salida);
    if (hora_salida) push('hora_salida', hora_salida);
    if (fecha_llegada) push('fecha_llegada', fecha_llegada);
    if (hora_llegada) push('hora_llegada', hora_llegada);
    if (aerolinea_id) push('aerolinea_id', aerolinea_id);
    if (estado) push('id_estado', estado);  // Asumimos 1 = 'activo', 2 = 'inactivo'
    if (precio !== undefined) push('precio', precio);

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

// Borrado lógico de vuelo (estado = inactivo)
exports.eliminarVuelo = async (req, res) => {
  const { id } = req.params;
  try {
    const client = await pool.connect();
    const result = await client.query(
      `UPDATE Vuelo SET id_estado = 2 WHERE id_vuelo = $1 RETURNING *`,  // 2 = 'inactivo'
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

exports.consultarVuelos = async (req, res) => {
  const {
    origen,
    destino,
    fecha,
    aerolinea_id,
    sortBy,
    estado = 1,  // Por defecto solo activos
    limit = 50,
    offset = 0,
  } = req.query;

  try {
    const where = [];
    const values = [];
    let i = 1;

    if (estado)       { where.push(`v.id_estado = $${i++}`);       values.push(estado); }
    if (origen)       { where.push(`v.ciudad_origen = $${i++}`); values.push(origen); }
    if (destino)      { where.push(`v.ciudad_destino = $${i++}`);values.push(destino); }
    if (fecha)        { where.push(`v.fecha_salida = $${i++}`);  values.push(fecha); }
    if (aerolinea_id) { where.push(`v.aerolinea_id = $${i++}`);  values.push(aerolinea_id); }

    let orderBy = 'ORDER BY v.id_vuelo ASC';
    if (sortBy === 'precio_asc') orderBy = 'ORDER BY v.precio ASC';
    else if (sortBy === 'hora_asc') orderBy = 'ORDER BY v.hora_salida ASC';

    const base = [
      'SELECT',
      '  v.*,',
      '  co.nombre_ciudad AS nombre_origen,',
      '  cd.nombre_ciudad AS nombre_destino,',
      '  a.nombre_aerolinea',
      'FROM Vuelo v',
      'LEFT JOIN Ciudad co ON co.id_ciudad = v.ciudad_origen',
      'LEFT JOIN Ciudad cd ON cd.id_ciudad = v.ciudad_destino',
      'LEFT JOIN Aerolinea a ON a.id_aerolinea = v.aerolinea_id',
      where.length ? `WHERE ${where.join(' AND ')}` : '',
      orderBy,
      `LIMIT $${i++} OFFSET $${i++}`
    ].filter(Boolean).join(' ');

    values.push(Number(limit), Number(offset));

    const client = await pool.connect();
    try {
      // Útil para depurar si vuelve a fallar:
      // console.log(base, values);
      const result = await client.query(base, values);
      res.status(200).json(result.rows);
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error en consultarVuelos:', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};


// Obtener vuelo por ID
/*exports.consultarVueloPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT
        v.*,
        co.nombre_ciudad AS nombre_origen,
        cd.nombre_ciudad AS nombre_destino,
        a.nombre_aerolinea
      FROM Vuelo v
      LEFT JOIN Ciudad co ON co.id_ciudad = v.ciudad_origen
      LEFT JOIN Ciudad cd ON cd.id_ciudad = v.ciudad_destino
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
};*/

exports.consultarVueloPorId = async (req, res) => {
  const { id } = req.params;  // El "id" será ahora el numero_vuelo

  try {
    const query = `
      SELECT
        v.*,
        co.nombre_ciudad AS nombre_origen,
        cd.nombre_ciudad AS nombre_destino,
        a.nombre_aerolinea
      FROM Vuelo v
      LEFT JOIN Ciudad co ON co.id_ciudad = v.ciudad_origen
      LEFT JOIN Ciudad cd ON cd.id_ciudad = v.ciudad_destino
      LEFT JOIN Aerolinea a ON a.id_aerolinea = v.aerolinea_id
      WHERE v.numero_vuelo = $1  -- Buscar por numero_vuelo
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

