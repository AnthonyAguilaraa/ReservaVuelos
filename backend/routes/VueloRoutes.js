const express = require('express');
const router = express.Router();
const vueloController = require('../controllers/vueloController');
const authenticateToken = require('../middleware/auth');

// Protegidas con token
router.post('/vuelo', authenticateToken, vueloController.insertarVuelo);             // Crear
router.put('/vuelo', authenticateToken, vueloController.modificarVuelo);             // Modificar
router.delete('/vuelo/:id', authenticateToken, vueloController.eliminarVuelo);       // Borrado lógico
router.get('/vuelos', authenticateToken, vueloController.consultarVuelos);           // Listar (filtros/paginación)
router.get('/vuelo/:id', authenticateToken, vueloController.consultarVueloPorId);    // Por ID

module.exports = router;
