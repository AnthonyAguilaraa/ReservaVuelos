const express = require('express');
const router = express.Router();
const metodoPagoController = require('../controllers/metodoPagoController');
const authenticateToken = require('../middleware/auth');

// Ruta protegida para obtener los métodos de pago
router.get('/metodos-pago', authenticateToken, metodoPagoController.consultarMetodosPago);

module.exports = router;