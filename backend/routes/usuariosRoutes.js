const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authenticateToken = require('../middleware/auth');

// Rutas públicas
router.post('/usuario', usuariosController.insertarUsuario); // Crear usuario
router.post('/login', usuariosController.iniciarSesion); // Iniciar sesión

// Rutas protegidas (requieren token)
router.put('/usuario', authenticateToken, usuariosController.modificarUsuario); // Modificar usuario
router.delete('/usuario/:id', authenticateToken, usuariosController.eliminarUsuario); // Eliminar usuario
router.get('/usuarios', authenticateToken, usuariosController.consultarUsuarios); // Consultar todos los usuarios
router.get('/usuario/:id', authenticateToken, usuariosController.consultarUsuarioPorId); // Consultar usuario por ID

module.exports = router;
