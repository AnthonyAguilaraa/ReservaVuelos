const pool = require('../config/db');

// Insertar Aerolínea
exports.insertarAerolinea = async (req, res) => {
    const { nombre_aerolinea, pais_origen } = req.body;

    // Validación básica
    if (!nombre_aerolinea || !pais_origen) {
        return res.status(400).json({ error: 'El nombre de la aerolínea y el país de origen son obligatorios.' });
    }

    try {
        const query = 'INSERT INTO Aerolinea (nombre_aerolinea, pais_origen) VALUES ($1, $2) RETURNING id_aerolinea';
        const values = [nombre_aerolinea, pais_origen]; // Por defecto, el estado será "activo" (id_estado = 1)

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();   

        res.status(201).json({ message: 'Aerolínea creada exitosamente', id: result.rows[0].id_aerolinea });
    } catch (err) {
        console.error('Error en insertarAerolinea:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Modificar Aerolínea
exports.modificarAerolinea = async (req, res) => {
    const { id_aerolinea, nombre_aerolinea, pais_origen, estado } = req.body;

    // Validación básica
    if (!id_aerolinea || !nombre_aerolinea || !pais_origen) {
        return res.status(400).json({ error: 'El id de la aerolínea, nombre y país de origen son obligatorios.' });
    }

    try {
        // Si el estado es proporcionado, usamos el ID del estado en lugar de un texto
        const query = 'UPDATE Aerolinea SET nombre_aerolinea = $1, pais_origen = $2, id_estado = $3 WHERE id_aerolinea = $4 RETURNING *';
        const values = [nombre_aerolinea, pais_origen, estado, id_aerolinea];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Aerolínea no encontrada' });
        }

        res.status(200).json({ message: 'Aerolínea modificada exitosamente' });

    } catch (err) {
        console.error('Error en modificarAerolinea:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar Aerolínea lógicamente (actualizar estado)
exports.eliminarAerolinea = async (req, res) => {
    const { id } = req.params;

    try {
        // Cambiar el estado a "inactivo" (suponiendo que el ID de "inactivo" es 2)
        const query = 'UPDATE Aerolinea SET id_estado = $1 WHERE id_aerolinea = $2 RETURNING *';
        const values = [2, id]; // Estado inactivo

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();   

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Aerolínea no encontrada' });
        }   

        res.status(200).json({ message: 'Aerolínea eliminada exitosamente' });
    } catch (err) {
        console.error('Error en eliminarAerolinea:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Consultar todas las aerolíneas activas
exports.ConsultarAerolineas = async (req, res) => {
    try {
        // Filtramos las aerolíneas activas (id_estado = 1)
        const query = 'SELECT * FROM Aerolinea WHERE id_estado = 1 ORDER BY id_aerolinea ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en obtenerAerolineas:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// Consultar aerolínea por ID
exports.ConsultarAerolineaPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT * FROM Aerolinea WHERE id_aerolinea = $1';
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Aerolínea no encontrada' });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Error en obtenerAerolineaPorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }   
};

// const pool = require('../config/db');

// // Insertar Aerolínea
// exports.insertarAerolinea = async (req , res) => {
//     const { nombre_aerolinea, pais_origen } = req.body;

//     try {
//         const query = 'INSERT INTO Aerolinea (nombre_aerolinea, pais_origen) VALUES ($1, $2) RETURNING id_aerolinea';
//         const values = [nombre_aerolinea, pais_origen];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();   
//         res.status(201).json({ message: 'Aerolínea creada exitosamente', id: result.rows[0].id_aerolinea });
//     } catch (err) {
//         console.error('Error en insertarAerlinea:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }   
// };

// // Modificar Aerolínea

// exports.modificarAerolinea = async (req, res) => {
//     const { id_aerolinea, nombre_aerolinea, pais_origen, estado } = req.body;

//     try{
//         const query = 'UPDATE Aerolinea SET nombre_aerolinea = $1, pais_origen = $2, estado = $3 WHERE id_aerolinea = $4 RETURNING *';

//         const values = [nombre_aerolinea, pais_origen, estado, id_aerolinea]

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if(result.rowCount === 0){
//             return res.status(404).json({ error: 'Aerolínea no encontrada' });
//         }

//         res.status(200).json({ message: 'Aerolínea modificada exitosamente' });

//     } catch (err) {
//         console.error('Error en modificarAerolinea:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Eliminar Aerolínea lógicamente (cambiar estado a 'inactivo')

// exports.eliminarAerolinea = async (req, res) => {
//     const { id } = req.params;

//     try {
//         // Actualizar el estado de la aerolínea a 'inactivo'
//         const query = 'UPDATE Aerolinea SET estado = $1 WHERE id_aerolinea = $2 RETURNING *';
//         const values = ['inactivo', id];  

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();   

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Aerolínea no encontrada' });
//         }   
//         res.status(200).json({ message: 'Aerolínea eliminada exitosamente' });
//     } catch (err) {
//         console.error('Error en eliminarAerolinea:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }   
// };

// // Consultar todas las aerolíneas activas
// exports.ConsultarAerolineas = async (req, res) => {
//     try {
//         const query = 'SELECT * FROM Aerolinea ORDER BY id_aerolinea ASC';
        

//         const client = await pool.connect();
//         const result = await client.query(query);
//         client.release();

//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error en obtenerAerolineas:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }   
// };

// // Consultar aerolínea por ID
// exports.ConsultarAerolineaPorId = async (req, res) => {
//     const { id } = req.params;

//     try {
//         const query = 'SELECT * FROM Aerolinea WHERE id_aerolinea = $1 ORDER BY id_aerolinea ASC';
//         const values = [id];

//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rowCount === 0) {
//             return res.status(404).json({ error: 'Aerolínea no encontrada' });
//         }
//         res.status(200).json(result.rows[0]);

//     } catch (err) {
//         console.error('Error en obtenerAerolineaPorId:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }   
// };