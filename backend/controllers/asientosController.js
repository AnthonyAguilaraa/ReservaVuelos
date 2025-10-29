const pool = require('../config/db');

// Insertar Asiento
exports.insertarAsiento = async (req, res) => {
    const { id_vuelo, numero_asiento, id_categoria, id_tipo, disponible } = req.body;

    // Validación básica
    if (!id_vuelo || !numero_asiento || !id_categoria || !id_tipo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const query = 'INSERT INTO Asiento (id_vuelo, numero_asiento, id_categoria, id_tipo, disponible) VALUES ($1, $2, $3, $4, $5) RETURNING id_asiento';
        const values = [id_vuelo, numero_asiento, id_categoria, id_tipo, disponible !== undefined ? disponible : true]; // Si no se proporciona disponible, por defecto será TRUE

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.status(201).json({ message: 'Asiento creado exitosamente', id: result.rows[0].id_asiento });
    } catch (err) {
        console.error('Error en insertarAsiento:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Modificar Asiento
exports.modificarAsiento = async (req, res) => {
    const { id_asiento, id_vuelo, numero_asiento, id_categoria, id_tipo, disponible } = req.body;

    // Validación básica
    if (!id_asiento || !id_vuelo || !numero_asiento || !id_categoria || !id_tipo) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const query = 'UPDATE Asiento SET id_vuelo = $1, numero_asiento = $2, id_categoria = $3, id_tipo = $4, disponible = $5 WHERE id_asiento = $6 RETURNING *';
        const values = [id_vuelo, numero_asiento, id_categoria, id_tipo, disponible, id_asiento];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Asiento no encontrado' });
        }

        res.status(200).json({ message: 'Asiento modificado exitosamente' });
    } catch (err) {
        console.error('Error en modificarAsiento:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar Asiento lógicamente (actualizar estado)
exports.eliminarAsiento = async (req, res) => {
    const { id } = req.params;

    try {
        // Cambiar el estado a "eliminado" (suponiendo que el ID de "eliminado" es 3)
        const query = 'UPDATE Asiento SET id_estado = $1 WHERE id_asiento = $2 RETURNING *';
        const values = [3, id]; // Estado eliminado

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Asiento no encontrado' });
        }

        res.status(200).json({ message: 'Asiento eliminado exitosamente' });
    } catch (err) {
        console.error('Error en eliminarAsiento:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar todos los asientos de un vuelo
exports.consultarAsientos = async (req, res) => {
    const { id_vuelo } = req.params;

    try {
        // Se añaden las condiciones AND disponible = TRUE y id_estado = 1
        const query = 'SELECT * FROM Asiento WHERE id_vuelo = $1 AND disponible = TRUE AND id_estado = 1 ORDER BY numero_asiento';
        const values = [id_vuelo];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        // Si no hay asientos disponibles, devolvemos un array vacío (lo cual es correcto)
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en consultarAsientos:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar Asiento por ID
exports.consultarAsientoPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM Asiento WHERE id_asiento = $1';
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Asiento no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error en consultarAsientoPorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

exports.contarAsientosDisponibles = async (req, res) => {
    const { id_vuelo } = req.params;
    const ID_ESTADO_ACTIVO = 1; // Asumiendo 1 = 'activo'

    try {
        const query = `
            SELECT COUNT(*) AS disponibles 
            FROM Asiento 
            WHERE id_vuelo = $1 
              AND disponible = TRUE 
              AND id_estado = $2
        `;
        const values = [id_vuelo, ID_ESTADO_ACTIVO];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        const count = parseInt(result.rows[0].disponibles, 10);
        res.status(200).json({ count }); // Devuelve ej: { "count": 15 }

    } catch (err) {
        console.error('Error en contarAsientosDisponibles:', err);
        res.status(500).json({ error: 'Error en el servidor al contar asientos' });
    }
};