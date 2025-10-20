const pool = require('../config/db');

// Insertar Reserva-Vuelo
exports.insertarReservaVuelo = async (req, res) => {
    const { reserva_id, vuelo_id, estado_reserva } = req.body;

    try {
        const query = 'INSERT INTO reserva_vuelo (reserva_id, vuelo_id, estado_reserva) VALUES ($1, $2, $3) RETURNING *';
        const values = [reserva_id, vuelo_id, estado_reserva];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.status(201).json({ message: 'Reserva-Vuelo creada exitosamente', reserva_vuelo: result.rows[0] });
    } catch (err) {
        console.error('Error en insertarReservaVuelo:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Modificar Reserva-Vuelo
exports.modificarReservaVuelo = async (req, res) => {
    const { reserva_id, vuelo_id, estado_reserva } = req.body;

    try {
        const query = 'UPDATE reserva_vuelo SET estado_reserva = $1 WHERE reserva_id = $2 AND vuelo_id = $3 RETURNING *';
        const values = [estado_reserva, reserva_id, vuelo_id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva-Vuelo no encontrada' });
        }

        res.status(200).json({ message: 'Reserva-Vuelo modificada exitosamente' });
    } catch (err) {
        console.error('Error en modificarReservaVuelo:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }  
};

// Eliminar Reserva-Vuelo (cambiar estado a 'cancelado')
exports.eliminarReservaVuelo = async (req, res) => {
    const { reserva_id, vuelo_id } = req.params;

    try {
        const query = 'UPDATE reserva_vuelo SET estado_reserva = $1 WHERE reserva_id = $2 AND vuelo_id = $3 RETURNING *';
        const values = ['cancelado', reserva_id, vuelo_id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva-Vuelo no encontrada' });
        }

        res.status(200).json({ message: 'Reserva-Vuelo cancelada exitosamente' });
    } catch (err) {
        console.error('Error en eliminarReservaVuelo:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Consultar todas las reservas de vuelo
exports.ConsultarReservasVuelos = async (req, res) => {
    try {
        const query = 'SELECT * FROM reserva_vuelo ORDER BY reserva_id ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en obtenerReservasVuelos:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Consultar reserva de vuelo por ID (reserva_id y vuelo_id)
exports.ConsultarReservaVueloPorId = async (req, res) => {
    const { reserva_id, vuelo_id } = req.params;

    try {
        const query = 'SELECT * FROM reserva_vuelo WHERE reserva_id = $1 AND vuelo_id = $2';
        const values = [reserva_id, vuelo_id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva-Vuelo no encontrada' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error en obtenerReservaVueloPorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};
