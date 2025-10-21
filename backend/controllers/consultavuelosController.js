// const pool = require('../config/db');

// // Consulta: Horarios de vuelos entre dos ciudades
// exports.consultarHorariosVuelos = async (req, res) => {
//     const { ciudadOrigen, ciudadDestino } = req.query;

//     try {
//         const query = `
//             SELECT 
//                 v.numero_vuelo,
//                 ca.nombre_ciudad AS ciudad_origen,
//                 cd.nombre_ciudad AS ciudad_destino,
//                 v.fecha_salida,
//                 v.hora_salida,
//                 v.fecha_llegada,
//                 v.hora_llegada,
//                 a.nombre_aerolinea
//             FROM 
//                 Vuelo v
//             JOIN 
//                 Ciudades ca ON v.ciudad_origen = ca.ciudad_id
//             JOIN 
//                 Ciudades cd ON v.ciudad_destino = cd.ciudad_id
//             JOIN 
//                 Aerolinea a ON v.aerolinea_id = a.id_aerolinea
//             WHERE 
//                 ca.nombre_ciudad = $1
//                 AND cd.nombre_ciudad = $2
//                 AND v.fecha_salida >= CURRENT_DATE
//             ORDER BY 
//                 v.hora_salida;
//         `;
//         const values = [ciudadOrigen, ciudadDestino];
//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No se encontraron vuelos para estas ciudades.' });
//         }
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error en consultarHorariosVuelos:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Consulta: Tarifas de vuelos entre dos ciudades, ordenados por precio
// exports.consultarTarifasVuelos = async (req, res) => {
//     const { ciudadOrigen, ciudadDestino } = req.query;

//     try {
//         const query = `
//             SELECT 
//                 v.numero_vuelo,
//                 ca.nombre_ciudad AS ciudad_origen,
//                 cd.nombre_ciudad AS ciudad_destino,
//                 v.fecha_salida,
//                 v.hora_salida,
//                 v.fecha_llegada,
//                 v.hora_llegada,
//                 a.nombre_aerolinea,
//                 v.precio
//             FROM 
//                 Vuelo v
//             JOIN 
//                 Ciudades ca ON v.ciudad_origen = ca.ciudad_id
//             JOIN 
//                 Ciudades cd ON v.ciudad_destino = cd.ciudad_id
//             JOIN 
//                 Aerolinea a ON v.aerolinea_id = a.id_aerolinea
//             WHERE 
//                 ca.nombre_ciudad = $1
//                 AND cd.nombre_ciudad = $2
//                 AND v.fecha_salida >= CURRENT_DATE
//             ORDER BY 
//                 v.precio;
//         `;
//         const values = [ciudadOrigen, ciudadDestino];
//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No se encontraron vuelos con tarifas para estas ciudades.' });
//         }
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error en consultarTarifasVuelos:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };

// // Consulta: Información de vuelo con disponibilidad de asientos
// exports.consultarDisponibilidadVuelos = async (req, res) => {
//     const { numeroVuelo } = req.params;

//     try {
//         const query = `
//             SELECT 
//                 v.numero_vuelo,
//                 ca.nombre_ciudad AS ciudad_origen,
//                 cd.nombre_ciudad AS ciudad_destino,
//                 v.fecha_salida,
//                 v.hora_salida,
//                 v.fecha_llegada,
//                 v.hora_llegada,
//                 a.nombre_aerolinea,
//                 v.estado AS estado_vuelo,
//                 COUNT(ae.asiento_id) AS asientos_disponibles
//             FROM 
//                 Vuelo v
//             JOIN 
//                 Ciudades ca ON v.ciudad_origen = ca.ciudad_id
//             JOIN 
//                 Ciudades cd ON v.ciudad_destino = cd.ciudad_id
//             JOIN 
//                 Aerolinea a ON v.aerolinea_id = a.id_aerolinea
//             LEFT JOIN 
//                 Asientos ae ON ae.reserva_id IS NULL AND ae.asiento_id IN (SELECT asiento_id FROM Asientos WHERE reserva_id = v.id_vuelo)
//             WHERE 
//                 v.numero_vuelo = $1
//             GROUP BY 
//                 v.numero_vuelo, ca.nombre_ciudad, cd.nombre_ciudad, v.fecha_salida, v.hora_salida, v.fecha_llegada, v.hora_llegada, a.nombre_aerolinea, v.estado;
//         `;
//         const values = [numeroVuelo];
//         const client = await pool.connect();
//         const result = await client.query(query, values);
//         client.release();

//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'No se encontró el vuelo con este número.' });
//         }
//         res.status(200).json(result.rows[0]);
//     } catch (err) {
//         console.error('Error en consultarDisponibilidadVuelos:', err);
//         res.status(500).json({ error: 'Error en el servidor' });
//     }
// };
