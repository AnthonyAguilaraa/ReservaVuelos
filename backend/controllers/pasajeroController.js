const pool = require('../config/db');

// Insertar Pasajero
exports.insertarPasajero = async (req, res) => {
    const { nombre, apellido, documento_identidad, fecha_nacimiento, usuario_id } = req.body;

    // Validación básica
    if (!nombre || !apellido || !documento_identidad || !fecha_nacimiento) {
        return res.status(400).json({ error: 'Los campos nombre, apellido, documento de identidad y fecha de nacimiento son obligatorios.' });
    }

    try {
        const query = 'INSERT INTO Pasajero (nombre, apellido, documento_identidad, fecha_nacimiento, usuario_id) VALUES ($1, $2, $3, $4, $5) RETURNING id_pasajero';
        const values = [nombre, apellido, documento_identidad, fecha_nacimiento, usuario_id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.status(201).json({ message: 'Pasajero creado exitosamente', id: result.rows[0].id_pasajero });
    } catch (err) {
        console.error('Error en insertarPasajero:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Modificar Pasajero
exports.modificarPasajero = async (req, res) => {
    const { id_pasajero, nombre, apellido, documento_identidad, fecha_nacimiento, id_estado_pasajero } = req.body;

    // Validación básica
    if (!id_pasajero || !nombre || !apellido || !documento_identidad || !fecha_nacimiento) {
        return res.status(400).json({ error: 'El id de pasajero, nombre, apellido, documento de identidad y fecha de nacimiento son obligatorios.' });
    }

    try {
        const query = 'UPDATE Pasajero SET nombre = $1, apellido = $2, documento_identidad = $3, fecha_nacimiento = $4, id_estado_pasajero = $5 WHERE id_pasajero = $6 RETURNING *';
        const values = [nombre, apellido, documento_identidad, fecha_nacimiento, id_estado_pasajero, id_pasajero];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pasajero no encontrado' });
        }

        res.status(200).json({ message: 'Pasajero modificado exitosamente' });

    } catch (err) {
        console.error('Error en modificarPasajero:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar Pasajero (lógicamente, cambiando su estado)
exports.eliminarPasajero = async (req, res) => {
    const { id } = req.params;

    try {
        // Cambiar el estado del pasajero a "inactivo" (suponiendo que el ID de "inactivo" es 2)
        const query = 'UPDATE Pasajero SET id_estado_pasajero = $1 WHERE id_pasajero = $2 RETURNING *';
        const values = [2, id]; // Estado inactivo

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pasajero no encontrado' });
        }

        res.status(200).json({ message: 'Pasajero eliminado exitosamente' });
    } catch (err) {
        console.error('Error en eliminarPasajero:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar todos los pasajeros
exports.consultarPasajeros = async (req, res) => {
    try {
        const query = 'SELECT * FROM Pasajero WHERE id_estado_pasajero = 1 ORDER BY id_pasajero ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en consultarPasajeros:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar pasajero por ID
exports.consultarPasajeroPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM Pasajero WHERE id_pasajero = $1';
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Pasajero no encontrado' });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Error en consultarPasajeroPorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
