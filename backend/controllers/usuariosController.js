const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET; // Asegúrate de tener JWT_SECRET en tu .env

// Iniciar sesión
exports.iniciarSesion = async (req, res) => {
    const { correo, clave } = req.body;

    if (!correo || !clave) {
        return res.status(400).json({ error: 'Correo electrónico y contraseña son requeridos.' });
    }

    try {
        const client = await pool.connect();
        const userResult = await client.query('SELECT id_usuario, contrasena, id_estado FROM Usuario WHERE correo_electronico = $1', [correo]);

        if (userResult.rows.length === 0) {
            client.release();
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = userResult.rows[0];

        // Verificar si la cuenta está activa (asumiendo 1 = activo, 6 = inactivo)
        if (user.id_estado !== 1) {
             client.release();
             return res.status(403).json({ error: 'La cuenta está inactiva o deshabilitada.' });
        }


        const esValida = await bcrypt.compare(clave, user.contrasena);

        if (!esValida) {
            client.release();
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Generar token con el ID del usuario
        // Incluir solo información no sensible. El estado se puede verificar en cada petición si es necesario.
        const token = jwt.sign({ id: user.id_usuario }, JWT_SECRET, { expiresIn: '2h' }); // 'id' es estándar en JWT

        client.release();
        res.status(200).json({ message: 'Autenticación exitosa', token });

    } catch (err) {
        console.error('Error en iniciarSesion:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Insertar usuario (Registro)
exports.insertarUsuario = async (req, res) => {
    const { nombre, correo, clave, telefono } = req.body;

    if (!nombre || !correo || !clave) {
        return res.status(400).json({ error: 'Nombre, correo electrónico y contraseña son requeridos.' });
    }
    if (clave.length < 6) {
         return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }


    try {
        const hashedPassword = await bcrypt.hash(clave, 10);

        const query = 'INSERT INTO Usuario (nombre, correo_electronico, contrasena, telefono) VALUES ($1, $2, $3, $4) RETURNING id_usuario';
        // El id_estado usará el DEFAULT 1 (activo) de la tabla
        const values = [nombre, correo, hashedPassword, telefono || null]; // Permitir teléfono nulo si es opcional

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        res.status(201).json({ message: 'Usuario creado exitosamente', id: result.rows[0].id_usuario });
    } catch (err) {
        console.error('Error en insertarUsuario:', err);
        // Manejar error de correo duplicado (código 23505 en PostgreSQL)
        if (err.code === '23505') {
            return res.status(409).json({ error: 'El correo electrónico ya está registrado.' });
        }
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Modificar CUALQUIER usuario (Ruta de Admin)
exports.modificarUsuario = async (req, res) => {
    // Esta función debería ser usada con cuidado, idealmente solo por administradores
    const { id_usuario, nombre, correo, clave, telefono, estado } = req.body;

     if (!id_usuario) {
        return res.status(400).json({ error: 'El id_usuario es obligatorio para modificar.' });
    }

    try {
        const client = await pool.connect();
        let query = 'UPDATE Usuario SET ';
        const values = [];
        let i = 1;

        if (nombre !== undefined) { query += `nombre = $${i++}, `; values.push(nombre); }
        if (correo !== undefined) { query += `correo_electronico = $${i++}, `; values.push(correo); }
        if (telefono !== undefined) { query += `telefono = $${i++}, `; values.push(telefono); }
        if (estado !== undefined) { query += `id_estado = $${i++}, `; values.push(estado); }

        // Solo hashear y actualizar contraseña SI se proporciona una nueva
        if (clave) {
             if (clave.length < 6) {
                 client.release();
                 return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
            }
            const hashedPassword = await bcrypt.hash(clave, 10);
            query += `contrasena = $${i++}, `;
            values.push(hashedPassword);
        }

        // Quitar la última coma y espacio
        query = query.slice(0, -2);
        query += ` WHERE id_usuario = $${i} RETURNING id_usuario, nombre, correo_electronico, telefono, id_estado`;
        values.push(id_usuario);

         if (values.length === 1) { // Solo id_usuario
             client.release();
             return res.status(400).json({ error: 'No hay campos para actualizar.' });
         }


        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario modificado exitosamente', usuario: result.rows[0] });
    } catch (err) {
        console.error('Error en modificarUsuario:', err);
         if (err.code === '23505') { // Correo duplicado
            return res.status(409).json({ error: 'El correo electrónico ya está en uso por otro usuario.' });
        }
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Eliminar CUALQUIER usuario lógicamente (Ruta de Admin)
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    const ID_ESTADO_INACTIVO = 6; // Confirma ID para 'inactivo'

    try {
        const query = 'UPDATE Usuario SET id_estado = $1 WHERE id_usuario = $2 RETURNING id_usuario';
        const values = [ID_ESTADO_INACTIVO, id];

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario desactivado lógicamente' });
    } catch (err) {
        console.error('Error en eliminarUsuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar todos los usuarios (Ruta de Admin)
exports.consultarUsuarios = async (req, res) => {
    try {
        const query = 'SELECT id_usuario, nombre, correo_electronico, telefono, fecha_registro, id_estado FROM Usuario ORDER BY id_usuario ASC';

        const client = await pool.connect();
        const result = await client.query(query);
        client.release();

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error en consultarUsuarios:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Consultar un usuario por ID (Ruta de Admin)
exports.consultarUsuarioPorId = async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'SELECT id_usuario, nombre, correo_electronico, telefono, fecha_registro, id_estado FROM Usuario WHERE id_usuario = $1';
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

// Obtener el perfil del usuario logueado
exports.getMiPerfil = async (req, res) => {
    // El ID del usuario viene del token (inyectado por authenticateToken como req.user.id)
    const userId = req.user.id;

    try {
        const query = 'SELECT id_usuario, nombre, correo_electronico, telefono, fecha_registro FROM Usuario WHERE id_usuario = $1 AND id_estado = 1'; // Solo usuarios activos
        const client = await pool.connect();
        const result = await client.query(query, [userId]);
        client.release();

        if (result.rows.length === 0) {
            // Esto podría pasar si el token es válido pero el usuario fue desactivado después
            return res.status(404).json({ error: 'Usuario no encontrado o inactivo' });
        }

        res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error('Error en getMiPerfil:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Actualizar el perfil del usuario logueado (solo nombre y teléfono)
exports.updateMiPerfil = async (req, res) => {
    const userId = req.user.id;
    const { nombre, telefono } = req.body;

    // Permitir actualizar uno o ambos
    if (nombre === undefined && telefono === undefined) {
        return res.status(400).json({ error: 'Se requiere al menos un campo (nombre o teléfono) para actualizar.' });
    }

    try {
        const fields = [];
        const values = [];
        let i = 1;

        if (nombre !== undefined) {
            fields.push(`nombre = $${i++}`);
            values.push(nombre);
        }
        // Permitir poner el teléfono en blanco (null)
        if (telefono !== undefined) {
            fields.push(`telefono = $${i++}`);
            values.push(telefono === '' ? null : telefono); // Guardar null si está vacío
        }

        const query = `UPDATE Usuario SET ${fields.join(', ')} WHERE id_usuario = $${i} RETURNING id_usuario, nombre, telefono`;
        values.push(userId);

        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Perfil actualizado exitosamente', usuario: result.rows[0] });

    } catch (err) {
        console.error('Error en updateMiPerfil:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Cambiar la contraseña del usuario logueado
exports.changeMyPassword = async (req, res) => {
    const userId = req.user.id;
    const { contrasenaActual, nuevaContrasena } = req.body;

    if (!contrasenaActual || !nuevaContrasena) {
        return res.status(400).json({ error: 'Se requiere la contraseña actual y la nueva contraseña.' });
    }
    if (nuevaContrasena.length < 6) {
         return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });
    }

    try {
        const client = await pool.connect();

        // 1. Obtener la contraseña actual hasheada
        const userResult = await client.query('SELECT contrasena FROM Usuario WHERE id_usuario = $1', [userId]);
        if (userResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        const currentHashedPassword = userResult.rows[0].contrasena;

        // 2. Comparar la contraseña actual proporcionada
        const isMatch = await bcrypt.compare(contrasenaActual, currentHashedPassword);
        if (!isMatch) {
            client.release();
            return res.status(401).json({ error: 'La contraseña actual es incorrecta.' });
        }

        // 3. Hashear la nueva contraseña
        const newHashedPassword = await bcrypt.hash(nuevaContrasena, 10);

        // 4. Actualizar la contraseña en la BD
        await client.query('UPDATE Usuario SET contrasena = $1 WHERE id_usuario = $2', [newHashedPassword, userId]);

        client.release();
        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });

    } catch (err) {
        console.error('Error en changeMyPassword:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Desactivar (borrado lógico) la cuenta del usuario logueado
exports.deactivateMyAccount = async (req, res) => {
    const userId = req.user.id;
    const ID_ESTADO_INACTIVO = 6; // Confirma que 6 es el ID para 'inactivo' en tu tabla Estado

    try {
        const query = 'UPDATE Usuario SET id_estado = $1 WHERE id_usuario = $2 RETURNING id_usuario';
        const client = await pool.connect();
        const result = await client.query(query, [ID_ESTADO_INACTIVO, userId]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Cuenta desactivada exitosamente.' });

    } catch (err) {
        console.error('Error en deactivateMyAccount:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};