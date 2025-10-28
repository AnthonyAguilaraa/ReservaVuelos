const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authenticateToken = require('../middleware/auth'); // Asegúrate que la ruta sea correcta

// --- Rutas Públicas ---
router.post('/usuario', usuariosController.insertarUsuario); // Crear usuario (Registro)
router.post('/login', usuariosController.iniciarSesion);     // Iniciar sesión

// --- Rutas Protegidas 
router.get('/usuario/me', authenticateToken, usuariosController.getMiPerfil);           // Obtener mi perfil
router.put('/usuario/me', authenticateToken, usuariosController.updateMiPerfil);        // Actualizar mi perfil (nombre, tel)
router.put('/usuario/cambiar-contrasena', authenticateToken, usuariosController.changeMyPassword); // Cambiar mi contraseña
router.delete('/usuario/me', authenticateToken, usuariosController.deactivateMyAccount); // Desactivar mi cuenta

// -- Rutas Generales 
router.put('/usuario/admin/:id', authenticateToken, usuariosController.modificarUsuario);        // Modificar CUALQUIER usuario por ID
router.delete('/usuario/admin/:id', authenticateToken, usuariosController.eliminarUsuario);      // Eliminar CUALQUIER usuario por ID
router.get('/usuarios', authenticateToken, usuariosController.consultarUsuarios);        // Consultar TODOS los usuarios
router.get('/usuario/admin/:id', authenticateToken, usuariosController.consultarUsuarioPorId); // Consultar CUALQUIER usuario por ID

module.exports = router;