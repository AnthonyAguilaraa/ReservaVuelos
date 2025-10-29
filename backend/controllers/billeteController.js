const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Insertar Billete
exports.insertarBillete = async (req, res) => {
    const {
        id_reserva,
        id_asiento,
        id_metodo_pago,
        precio,
        numero_billete,
        id_estado_pago
    } = req.body;

    if (!id_reserva || !id_asiento || !precio || !numero_billete) {
        return res.status(400).json({ error: 'Campos obligatorios: id_reserva, id_asiento, precio, numero_billete.' });
    }

    try {
        const query = `
            INSERT INTO Billete (id_reserva, id_asiento, id_metodo_pago, precio, numero_billete, id_estado_pago)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_billete
        `;
        const values = [id_reserva, id_asiento, id_metodo_pago || null, precio, numero_billete, id_estado_pago || null];

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
    const {
        id_billete,
        id_asiento,
        id_metodo_pago,
        precio,
        numero_billete,
        id_estado_billete,
        id_estado_pago
    } = req.body;

    if (!id_billete || !numero_billete || !precio) {
        return res.status(400).json({ error: 'Campos obligatorios: id_billete, numero_billete, precio.' });
    }

    try {
        const query = `
            UPDATE Billete SET
                id_asiento = $1,
                id_metodo_pago = $2,
                precio = $3,
                numero_billete = $4,
                id_estado_billete = $5,
                id_estado_pago = $6,
                fecha_compra = CURRENT_TIMESTAMP
            WHERE id_billete = $7
            RETURNING *
        `;
        const values = [
            id_asiento,
            id_metodo_pago,
            precio,
            numero_billete,
            id_estado_billete || 3,
            id_estado_pago,
            id_billete
        ];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Billete no encontrado' });
        }

        res.status(200).json({ message: 'Billete actualizado correctamente' });

    } catch (err) {
        console.error('Error en modificarBillete:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar Billete (lógico)
exports.eliminarBillete = async (req, res) => {
    const { id } = req.params;

    try {
        // Suponiendo que el estado 4 es "cancelado" o "eliminado"
        const query = `
            UPDATE Billete
            SET id_estado_billete = 4
            WHERE id_billete = $1
            RETURNING *
        `;
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Billete no encontrado' });
        }

        res.status(200).json({ message: 'Billete eliminado lógicamente' });

    } catch (err) {
        console.error('Error en eliminarBillete:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar todos los billetes activos
exports.consultarBilletes = async (req, res) => {
    try {
        const query = `
            SELECT * FROM Billete
            WHERE id_estado_billete = 3
            ORDER BY fecha_compra DESC
        `;

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
        const query = `
            SELECT * FROM Billete
            WHERE id_billete = $1
        `;
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

exports.comprarBilletes = async (req, res) => {
    // Datos que el frontend debe enviar
    const {
        id_reserva,
        id_metodo_pago,
        asientos // Array de IDs de asiento [101, 102]
    } = req.body;
    
    // Obtenemos el id del usuario desde el token
    const usuario_id = req.user.id; 

    const ID_ESTADO_RESERVADO = 2; // Asumimos 2 = 'reservado'
    const ID_ESTADO_COMPRADO = 3; // Asumimos 3 = 'comprado'
    const ID_PAGO_PAGADO = 5;     // Asumimos 5 = 'pagado' (en la tabla Estado)

    const client = await pool.connect();

    try {
        // 1. ¡INICIAR TRANSACCIÓN!
        await client.query('BEGIN');

        // 2. Verificar la Reserva
        const reservaQuery = `
            SELECT r.num_pasajeros, v.precio, v.id_vuelo
            FROM Reserva r
            JOIN Reserva_Vuelo rv ON r.id_reserva = rv.id_reserva
            JOIN Vuelo v ON rv.id_vuelo = v.id_vuelo
            WHERE r.id_reserva = $1 AND r.usuario_id = $2 AND r.id_estado_reserva = $3
        `;
        const reservaResult = await client.query(reservaQuery, [id_reserva, usuario_id, ID_ESTADO_RESERVADO]);

        if (reservaResult.rowCount === 0) {
            throw new Error('Reserva no válida, no encontrada, no pertenece al usuario o ya fue pagada.');
        }

        const { num_pasajeros, precio } = reservaResult.rows[0];

        // 3. Validar que el número de asientos coincida con los pasajeros
        if (asientos.length !== num_pasajeros) {
            throw new Error(`La reserva es para ${num_pasajeros} pasajeros, pero se seleccionaron ${asientos.length} asientos.`);
        }

        // 4. Procesar Billetes y Asientos (en un bucle)
        for (const id_asiento of asientos) {
            // 4a. Ocupar el asiento (esta es la lógica que movimos)
            const asientoQuery = 'UPDATE Asiento SET disponible = FALSE WHERE id_asiento = $1 AND disponible = TRUE RETURNING id_asiento';
            const asientoResult = await client.query(asientoQuery, [id_asiento]);
            
            if (asientoResult.rowCount === 0) {
                throw new Error(`El asiento ID ${id_asiento} ya no está disponible.`);
            }

            // 4b. Generar número de billete único
            const numero_billete = `TKT-${uuidv4().split('-')[0].toUpperCase()}`;

            // 4c. Crear el Billete
            const billeteQuery = `
                INSERT INTO Billete 
                (id_reserva, id_asiento, id_metodo_pago, precio, numero_billete, id_estado_billete, id_estado_pago)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await client.query(billeteQuery, [
                id_reserva, 
                id_asiento, 
                id_metodo_pago, 
                precio, // El precio se saca del Vuelo
                numero_billete,
                ID_ESTADO_COMPRADO, // 'comprado'
                ID_PAGO_PAGADO      // 'pagado'
            ]);
        }
        
        // 5. Actualizar el estado de la Reserva principal (marcar como 'comprada')
        await client.query('UPDATE Reserva SET id_estado_reserva = $1 WHERE id_reserva = $2', [ID_ESTADO_COMPRADO, id_reserva]);

        // 6. ¡ÉXITO! Confirmar la transacción
        await client.query('COMMIT');
        res.status(201).json({ message: 'Compra completada exitosamente', id_reserva: id_reserva });

    } catch (err) {
        // 7. ¡FALLO! Revertir todo
        await client.query('ROLLBACK');
        console.error('Error en transacción de compra:', err);
        res.status(500).json({ error: 'Error al procesar la compra', details: err.message });
    } finally {
        client.release();
    }
};

exports.consultarMiHistorial = async (req, res) => {
    // Obtenemos el id del usuario desde el token (inyectado por authenticateToken como req.user.id)
    const usuario_id = req.user.id;
    const ID_ESTADO_COMPRADO = 3; // Asumiendo 3 = 'comprado' para Billete.id_estado_billete

    try {
        const query = `
            SELECT
                b.id_billete,
                b.numero_billete,
                b.precio,
                b.fecha_compra,
                a.numero_asiento,
                v.numero_vuelo,
                v.fecha_salida,
                v.hora_salida,
                aer.nombre_aerolinea,
                co.nombre_ciudad AS ciudad_origen,
                cd.nombre_ciudad AS ciudad_destino
            FROM Billete b
            JOIN Asiento a ON b.id_asiento = a.id_asiento
            JOIN Reserva r ON b.id_reserva = r.id_reserva
            JOIN Reserva_Vuelo rv ON r.id_reserva = rv.id_reserva -- Asumiendo 1 billete por vuelo en reserva simple
            JOIN Vuelo v ON rv.id_vuelo = v.id_vuelo
            JOIN Aerolinea aer ON v.aerolinea_id = aer.id_aerolinea
            JOIN Ciudad co ON v.ciudad_origen = co.id_ciudad
            JOIN Ciudad cd ON v.ciudad_destino = cd.id_ciudad
            WHERE
                r.usuario_id = $1
                AND b.id_estado_billete = $2 -- Asegurarnos que solo traiga los comprados
            ORDER BY b.fecha_compra DESC; -- Más recientes primero
        `;

        const client = await pool.connect();
        const result = await client.query(query, [usuario_id, ID_ESTADO_COMPRADO]);
        client.release();

        res.status(200).json(result.rows);

    } catch (err) {
        console.error('Error en consultarMiHistorial:', err);
        res.status(500).json({ error: 'Error en el servidor al obtener el historial' });
    }
};


// const pool = require('../config/db');

// // Insertar Billete
// exports.insertarBillete = async (req, res) => {
//     const { reserva_id, asiento_id, precio, numero_billete, metodo_pago } = req.body;

//     try {
//         const query = `INSERT INTO Billete (reserva_id, asiento_id, precio, numero_billete, metodo_pago)
//                        VALUES ($1, $2, $3, $4, $5) RETURNING id_billete`;

//         const values = [reserva_id, asiento_id, precio, numero_billete, metodo_pago];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         res.status(201).json({
//             message: 'Billete creado exitosamente',
//             id: result.rows[0].id_billete
//         });
//     } catch (err) {
//         console.error('Error en insertarBillete:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Modificar Billete
// exports.modificarBillete = async (req, res) => {
//     const { id_billete, reserva_id, asiento_id, precio, numero_billete, metodo_pago, estado_billete, estado_pago } = req.body;

//     try {
//         const query = `UPDATE Billete
//                        SET reserva_id = $1, asiento_id = $2, precio = $3, numero_billete = $4,
//                            metodo_pago = $5, estado_billete = $6, estado_pago = $7
//                        WHERE id_billete = $8 RETURNING *`;

//         const values = [reserva_id, asiento_id, precio, numero_billete, metodo_pago, estado_billete, estado_pago, id_billete];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Billete no encontrado' });
//         }

//         res.status(200).json({ message: 'Billete modificado exitosamente' });
//     } catch (err) {
//         console.error('Error en modificarBillete:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Eliminar Billete (Lógicamente: Cambiar estado a 'inactivo')
// exports.eliminarBillete = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const query = `UPDATE Billete SET estado_billete = $1 WHERE id_billete = $2 RETURNING *`;
//         const values = ['inactivo', id];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Billete no encontrado' });
//         }

//         res.status(200).json({ message: 'Billete eliminado exitosamente' });
//     } catch (err) {
//         console.error('Error en eliminarBillete:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Consultar todos los billetes
// exports.consultarBilletes = async (req, res) => {
//     try {
//         const query = 'SELECT * FROM Billete ORDER BY id_billete ASC';

//         const client = await pool.connect();
//         const result = await client.query(query);
//         client.release();

//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error en consultarBilletes:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Consultar Billete por ID
// exports.consultarBilletePorId = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const query = 'SELECT * FROM Billete WHERE id_billete = $1';
//         const values = [id];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Billete no encontrado' });
//         }

//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         console.error('Error en consultarBilletePorId:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };
