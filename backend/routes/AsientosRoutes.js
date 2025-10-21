const express = require('express');
const router = express.Router();
const asientoController = require('../controllers/asientosController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/asiento', authenticateToken, asientoController.insertarAsiento); // Insertar Asiento
router.put('/asiento', authenticateToken, asientoController.modificarAsiento); // Modificar Asiento
router.delete('/asiento/:id', authenticateToken, asientoController.eliminarAsiento); // Eliminar Asiento
router.get('/asientos/:id_vuelo', authenticateToken, asientoController.consultarAsientos); // Consultar todos los Asientos de un Vuelo
router.get('/asiento/:id', authenticateToken, asientoController.consultarAsientoPorId); // Consultar Asiento por ID

module.exports = router;
