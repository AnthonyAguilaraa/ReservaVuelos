const express = require('express');
const router = express.Router();
const pasajeroController = require('../controllers/pasajeroController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/pasajero', authenticateToken, pasajeroController.insertarPasajero); // Insertar Pasajero
router.put('/pasajero', authenticateToken, pasajeroController.modificarPasajero); // Modificar Pasajero
router.delete('/pasajero/:id', authenticateToken, pasajeroController.eliminarPasajero); // Eliminar Pasajero
router.get('/pasajeros', authenticateToken, pasajeroController.consultarPasajeros); // Consultar todos los Pasajeros
router.get('/pasajero/:id', authenticateToken, pasajeroController.consultarPasajeroPorId); // Consultar Pasajero por ID

module.exports = router;
