const pool = require('../config/db');

// Helper de validación
function validarIATA(codigo) {
  if (codigo == null || codigo === '') return true; // opcional
  return typeof codigo === 'string' && /^[A-Za-z]{3}$/.test(codigo);
}

// Insertar Ciudad
exports.insertarCiudad = async (req, res) => {
  try {
    let { nombre_ciudad, pais, codigo_iata, zona_horaria } = req.body;

    if (!nombre_ciudad || !pais) {
      return res.status(400).json({ error: 'nombre_ciudad y pais son obligatorios' });
    }

    if (codigo_iata && !validarIATA(codigo_iata)) {
      return res.status(400).json({ error: 'codigo_iata debe tener exactamente 3 letras (ej. MEX, MAD, JFK)' });
    }

    // Normalizar IATA en mayúsculas si viene
    if (codigo_iata) codigo_iata = codigo_iata.toUpperCase();

    const query = `
      INSERT INTO Ciudad (nombre_ciudad, pais, codigo_iata, zona_horaria)
      VALUES ($1, $2, $3, $4) RETURNING id_ciudad
    `;
    const values = [nombre_ciudad, pais, codigo_iata || null, zona_horaria || null]; // Asumimos estado activo por defecto

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    return res.status(201).json({
      message: 'Ciudad creada exitosamente',
      id: result.rows[0].id_ciudad
    });
  } catch (err) {
    // Manejo de UNIQUE en codigo_iata
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El codigo_iata ya existe' });
    }
    console.error('Error en insertarCiudad:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Modificar Ciudad
exports.modificarCiudad = async (req, res) => {
  try {
    let { ciudad_id, nombre_ciudad, pais, codigo_iata, zona_horaria, estado } = req.body;

    if (!ciudad_id) {
      return res.status(400).json({ error: 'ciudad_id es obligatorio' });
    }

    if (codigo_iata && !validarIATA(codigo_iata)) {
      return res.status(400).json({ error: 'codigo_iata debe tener exactamente 3 letras' });
    }

    if (codigo_iata) codigo_iata = codigo_iata.toUpperCase();

    // Se usan COALESCE para solo actualizar campos si se proporcionan
    const query = `
      UPDATE Ciudad
      SET 
        nombre_ciudad = COALESCE($1, nombre_ciudad),
        pais = COALESCE($2, pais),
        codigo_iata = COALESCE($3, codigo_iata),
        zona_horaria = COALESCE($4, zona_horaria),
        id_estado = COALESCE($5, id_estado)
      WHERE id_ciudad = $6
      RETURNING *
    `;
    const values = [
      nombre_ciudad ?? null,
      pais ?? null,
      (codigo_iata === '' ? null : (codigo_iata ?? null)),
      zona_horaria ?? null,
      estado ?? null,
      ciudad_id
    ];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    return res.status(200).json({ message: 'Ciudad modificada exitosamente' });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El codigo_iata ya existe' });
    }
    console.error('Error en modificarCiudad:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Eliminar Ciudad lógicamente (estado = 'inactivo')
exports.eliminarCiudad = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      UPDATE Ciudad
      SET id_estado = $1
      WHERE id_ciudad = $2
      RETURNING *
    `;
    const values = [2, id]; // Suponemos que 2 es el id_estado para "inactivo"

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    return res.status(200).json({ message: 'Ciudad eliminada (inactivada) exitosamente' });
  } catch (err) {
    console.error('Error en eliminarCiudad:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Consultar todas las ciudades (ordenadas por id)
exports.consultarCiudades = async (_req, res) => {
  try {
    const query = 'SELECT * FROM Ciudad ORDER BY id_ciudad ASC';

    const client = await pool.connect();
    const result = await client.query(query);
    client.release();

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error en consultarCiudades:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

// Consultar ciudad por ID
exports.consultarCiudadPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT * FROM Ciudad WHERE id_ciudad = $1';
    const values = [id];

    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Ciudad no encontrada' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error en consultarCiudadPorId:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};
