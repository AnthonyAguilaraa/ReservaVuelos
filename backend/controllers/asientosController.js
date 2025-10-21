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
        const query = 'SELECT * FROM Asiento WHERE id_vuelo = $1 ORDER BY numero_asiento';
        const values = [id_vuelo];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

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



// const pool = require('../config/db');

// // Insertar Asiento
// exports.insertarAsiento = async (req, res) => {
//     const { numero_asiento, categoria_asiento, tipo_asiento, disponible } = req.body;

//     try {
//         const query = 'INSERT INTO asientos (numero_asiento, categoria_asiento, tipo_asiento, disponible) VALUES ($1, $2, $3, $4) RETURNING *';
//         const values = [numero_asiento, categoria_asiento, tipo_asiento, disponible];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         res.status(201).json({ message: 'Asiento creado exitosamente', asiento: result.rows[0] });
//     } catch (err) {
//         console.error('Error en insertarAsiento:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Modificar Asiento
// exports.modificarAsiento = async (req, res) => {
//     const { asiento_id, numero_asiento, categoria_asiento, tipo_asiento, disponible, estado_asiento } = req.body;

//     try {
//         const query = 'UPDATE asientos SET numero_asiento = $1, categoria_asiento = $2, tipo_asiento = $3, disponible = $4, estado_asiento = $5 WHERE asiento_id = $6 RETURNING *';
//         const values = [numero_asiento, categoria_asiento, tipo_asiento, disponible, estado_asiento, asiento_id];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Asiento no encontrado' });
//         }

//         res.status(200).json({ message: 'Asiento modificado exitosamente' });
//     } catch (err) {
//         console.error('Error en modificarAsiento:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Eliminar Asiento (cambiar estado a 'eliminado')
// exports.eliminarAsiento = async (req, res) => {
//     const { asiento_id } = req.params;

//     try {
//         const query = 'UPDATE asientos SET estado_asiento = $1 WHERE asiento_id = $2 RETURNING *';
//         const values = ['eliminado', asiento_id];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Asiento no encontrado' });
//         }

//         res.status(200).json({ message: 'Asiento eliminado exitosamente' });
//     } catch (err) {
//         console.error('Error en eliminarAsiento:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Consultar todos los asientos disponibles
// exports.consultarAsientosDisponibles = async (req, res) => {
//     try {
//         const query = 'SELECT * FROM asientos WHERE disponible = TRUE ORDER BY numero_asiento ASC';

//         const client = await pool.connect();
//         const result = await client.query(query);
//         client.release();

//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error en obtenerAsientosDisponibles:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Consultar asiento por ID
// exports.consultarAsientoPorId = async (req, res) => {
//     const { asiento_id } = req.params;

//     try {
//         const query = 'SELECT * FROM asientos WHERE asiento_id = $1';
//         const values = [asiento_id];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Asiento no encontrado' });
//         }

//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         console.error('Error en obtenerAsientoPorId:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Reservar Asiento (marcar como no disponible)
// exports.reservarAsiento = async (req, res) => {
//     const { asiento_id, reserva_id } = req.body;

//     try {
//         // Verificar si el asiento ya está reservado (no disponible)
//         const checkQuery = 'SELECT * FROM asientos WHERE asiento_id = $1 AND disponible = FALSE';
//         const checkValues = [asiento_id];

//         const client = await pool.connect();
//         const checkResult = await client.query(checkQuery, checkValues);

//         if (checkResult.rowCount > 0) {
//             return res.status(400).json({ error: 'Este asiento ya está reservado' });
//         }

//         // Reservar el asiento (marcar como no disponible)
//         const query = 'UPDATE asientos SET disponible = FALSE, reserva_id = $1 WHERE asiento_id = $2 RETURNING *';
//         const values = [reserva_id, asiento_id];

//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Asiento no encontrado' });
//         }

//         res.status(200).json({ message: 'Asiento reservado exitosamente', asiento: result.rows[0] });
//     } catch (err) {
//         console.error('Error en reservarAsiento:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };
