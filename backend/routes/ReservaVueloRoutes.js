const express = require('express');
const router = express.Router();
const reservaVueloController = require('../controllers/reservaVueloController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/reserva-vuelo', authenticateToken, reservaVueloController.insertarReservaVuelo); // Insertar Reserva-Vuelo
router.put('/reserva-vuelo', authenticateToken, reservaVueloController.modificarReservaVuelo); // Modificar Reserva-Vuelo
router.delete('/reserva-vuelo/:reserva_id/:vuelo_id', authenticateToken, reservaVueloController.eliminarReservaVuelo); // Eliminar Reserva-Vuelo (cambiar estado)
router.get('/reservas-vuelos', authenticateToken, reservaVueloController.ConsultarReservasVuelos); // Consultar todas las Reservas-Vuelo
router.get('/reserva-vuelo/:reserva_id/:vuelo_id', authenticateToken, reservaVueloController.ConsultarReservaVueloPorId); // Consultar Reserva-Vuelo por ID

module.exports = router;
