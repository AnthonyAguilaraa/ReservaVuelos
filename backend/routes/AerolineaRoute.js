const express = require('express');
const router = express.Router();
const aerolineaController = require('../controllers/aerolineaController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/aerolinea', authenticateToken, aerolineaController.insertarAerolinea); // Insertar Aerolínea
router.put('/aerolinea', authenticateToken, aerolineaController.modificarAerolinea); // Modificar Aerolínea
router.delete('/aerolinea/:id', authenticateToken, aerolineaController.eliminarAerolinea); // Eliminar Aerolínea
router.get('/aerolineas', authenticateToken, aerolineaController.ConsultarAerolineas); // Consultar todas las Aerolíneas
router.get('/aerolinea/:id', authenticateToken, aerolineaController.ConsultarAerolineaPorId); // Consultar Aerolínea por ID


module.exports = router;