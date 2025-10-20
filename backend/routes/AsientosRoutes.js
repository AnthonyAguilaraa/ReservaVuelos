const express = require('express');
const router = express.Router();
const asientosController = require('../controllers/asientosController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/asiento', authenticateToken, asientosController.insertarAsiento); // Insertar Asiento
router.put('/asiento', authenticateToken, asientosController.modificarAsiento); // Modificar Asiento
router.delete('/asiento/:asiento_id', authenticateToken, asientosController.eliminarAsiento); // Eliminar Asiento (cambiar estado)
router.get('/asientos', authenticateToken, asientosController.consultarAsientosDisponibles); // Consultar todos los asientos disponibles
router.get('/asiento/:asiento_id', authenticateToken, asientosController.consultarAsientoPorId); // Consultar Asiento por ID
router.post('/reservar-asiento', authenticateToken, asientosController.reservarAsiento); // Reservar Asiento

module.exports = router;
