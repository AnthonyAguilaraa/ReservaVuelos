const pool = require('../config/db');

// Consultar todos los métodos de pago
exports.consultarMetodosPago = async (req, res) => {
    try {
        const query = 'SELECT * FROM Metodo_Pago ORDER BY nombre_metodo';
        
        const client = await pool.connect();
        const result = await client.query(query);
        client.release();
        
        res.status(200).json(result.rows);
    
    } catch (err) {
        // Este 'console.error' aparecerá en tu terminal del backend
        console.error('Error en consultarMetodosPago:', err);
        // Esto es lo que ve el frontend
        res.status(500).json({ error: 'Error en el servidor' });
    }
};