const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Iniciar sesión
exports.iniciarSesion = async (req, res) => {
    const { correo, clave } = req.body;

    try {
        const client = await pool.connect();
        const userResult = await client.query('SELECT id_usuario, contrasena FROM Usuario WHERE correo_electronico = $1', [correo]);

        if (userResult.rows.length === 0) {
            client.release();
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = userResult.rows[0];
        const esValida = await bcrypt.compare(clave, user.contrasena);

        if (!esValida) {
            client.release();
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // Generar token
        const token = jwt.sign({ id: user.id_usuario, correo }, JWT_SECRET, { expiresIn: '2h' });

        client.release();
        res.status(200).json({ message: 'Autenticación exitosa', token });

    } catch (err) {
        console.error('Error en iniciarSesion:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Insertar usuario
exports.insertarUsuario = async (req, res) => {
    const { nombre, correo, clave, telefono } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(clave, 10);

        const query = 'INSERT INTO Usuario (nombre, correo_electronico, contrasena, telefono) VALUES ($1, $2, $3, $4) RETURNING id_usuario';
        const values = [nombre, correo, hashedPassword, telefono];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.status(201).json({ message: 'Usuario creado exitosamente', id: result.rows[0].id_usuario });
    } catch (err) {
        console.error('Error en insertarUsuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Modificar usuario
exports.modificarUsuario = async (req, res) => {
    const { id_usuario, nombre, correo, clave, telefono, estado } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(clave, 10);

        const query = 'UPDATE Usuario SET nombre = $1, correo_electronico = $2, contrasena = $3, telefono = $4, estado = $5 WHERE id_usuario = $6 RETURNING *';
        const values = [nombre, correo, hashedPassword, telefono, estado, id_usuario];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario modificado exitosamente' });
    } catch (err) {
        console.error('Error en modificarUsuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar usuario lógicamente (cambiar estado a 'inactivo')
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        // Actualizar el estado del usuario a 'inactivo'
        const query = 'UPDATE Usuario SET estado = $1 WHERE id_usuario = $2 RETURNING *';
        const values = ['inactivo', id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado lógicamente' });
    } catch (err) {
        console.error('Error en eliminarUsuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};


// Consultar todos los usuarios
exports.consultarUsuarios = async (req, res) => {
    try {
        const query = 'SELECT id_usuario, nombre, correo_electronico, telefono, fecha_registro, estado FROM Usuario ORDER BY id_usuario ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en consultarUsuarios:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar usuario por ID
exports.consultarUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT id_usuario, nombre, correo_electronico, telefono, fecha_registro,estado FROM Usuario WHERE id_usuario = $1 ORDER BY id_usuario ASC';
        const values = [id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error en consultarUsuarioPorId:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};
