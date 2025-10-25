const express = require('express');
const router = express.Router();
const reservasController = require('../controllers/reservasController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/reserva', authenticateToken, reservasController.insertarReserva); // Insertar Reserva
router.put('/reserva', authenticateToken, reservasController.modificarReserva); // Modificar Reserva
router.delete('/reserva/:id', authenticateToken, reservasController.eliminarReserva); // Eliminar Reserva (cambiar estado)
router.get('/reservas', authenticateToken, reservasController.consultarReservas); // Consultar todas las Reservas
router.get('/reserva/:id', authenticateToken, reservasController.consultarReservaPorId); // Consultar Reserva por ID
router.post('/reserva/completa', authenticateToken, reservasController.crearReservaCompleta);
router.get('/reservas/mis-reservas', authenticateToken, reservasController.consultarMisReservas);

module.exports = router;
