const pool = require('../config/db');

// Insertar Billete
exports.insertarBillete = async (req, res) => {
    const { reserva_id, asiento_id, precio, numero_billete, metodo_pago } = req.body;

    try {
        const query = `INSERT INTO Billete (reserva_id, asiento_id, precio, numero_billete, metodo_pago)
                       VALUES ($1, $2, $3, $4, $5) RETURNING id_billete`;

        const values = [reserva_id, asiento_id, precio, numero_billete, metodo_pago];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.status(201).json({
            message: 'Billete creado exitosamente',
            id: result.rows[0].id_billete
        });
    } catch (err) {
        console.error('Error en insertarBillete:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Modificar Billete
exports.modificarBillete = async (req, res) => {
    const { id_billete, reserva_id, asiento_id, precio, numero_billete, metodo_pago, estado_billete, estado_pago } = req.body;

    try {
        const query = `UPDATE Billete
                       SET reserva_id = $1, asiento_id = $2, precio = $3, numero_billete = $4,
                           metodo_pago = $5, estado_billete = $6, estado_pago = $7
                       WHERE id_billete = $8 RETURNING *`;

        const values = [reserva_id, asiento_id, precio, numero_billete, metodo_pago, estado_billete, estado_pago, id_billete];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Billete no encontrado' });
        }

        res.status(200).json({ message: 'Billete modificado exitosamente' });
    } catch (err) {
        console.error('Error en modificarBillete:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar Billete (Lógicamente: Cambiar estado a 'inactivo')
exports.eliminarBillete = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `UPDATE Billete SET estado_billete = $1 WHERE id_billete = $2 RETURNING *`;
        const values = ['inactivo', id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Billete no encontrado' });
        }

        res.status(200).json({ message: 'Billete eliminado exitosamente' });
    } catch (err) {
        console.error('Error en eliminarBillete:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar todos los billetes
exports.consultarBilletes = async (req, res) => {
    try {
        const query = 'SELECT * FROM Billete ORDER BY id_billete ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en consultarBilletes:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar Billete por ID
exports.consultarBilletePorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM Billete WHERE id_billete = $1';
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Billete no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error en consultarBilletePorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
