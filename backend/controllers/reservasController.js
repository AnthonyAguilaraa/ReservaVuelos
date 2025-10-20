const pool = require('../config/db');

// Insertar Reserva
exports.insertarReserva = async (req, res) => {
    const { usuario_id, vuelo_id, estado_reserva, num_pasajeros } = req.body;

    try {
        const query = 'INSERT INTO reservas (usuario_id, vuelo_id, estado_reserva, num_pasajeros) VALUES ($1, $2, $3, $4) RETURNING reserva_id';
        const values = [usuario_id, vuelo_id, estado_reserva, num_pasajeros];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        
        res.status(201).json({ message: 'Reserva creada exitosamente', reserva_id: result.rows[0].reserva_id });
    } catch (err) {
        console.error('Error en insertarReserva:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Modificar Reserva
exports.modificarReserva = async (req, res) => {
    const { reserva_id, estado_reserva, num_pasajeros } = req.body;

    try {
        const query = 'UPDATE reservas SET estado_reserva = $1, num_pasajeros = $2 WHERE reserva_id = $3 RETURNING *';
        const values = [estado_reserva, num_pasajeros, reserva_id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if(result.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }

        res.status(200).json({ message: 'Reserva modificada exitosamente' });
    } catch (err) {
        console.error('Error en modificarReserva:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }  
};

// Eliminar Reserva lógicamente (cambiar estado a 'cancelada')
exports.eliminarReserva = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'UPDATE reservas SET estado_reserva = $1 WHERE reserva_id = $2 RETURNING *';
        const values = ['cancelada', id];  

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();   

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.status(200).json({ message: 'Reserva cancelada exitosamente' });
    } catch (err) {
        console.error('Error en eliminarReserva:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Consultar todas las reservas
exports.ConsultarReservas = async (req, res) => {
    try {
        const query = 'SELECT * FROM reservas ORDER BY reserva_id ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en obtenerReservas:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Consultar reserva por ID
exports.ConsultarReservaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM reservas WHERE reserva_id = $1';
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Reserva no encontrada' });
        }
        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Error en obtenerReservaPorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};
