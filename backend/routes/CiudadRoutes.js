const express = require('express');
const router = express.Router();
const ciudadController = require('../controllers/ciudadController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/ciudad', authenticateToken, ciudadController.insertarCiudad);               // Crear Ciudad
router.put('/ciudad', authenticateToken, ciudadController.modificarCiudad);              // Modificar Ciudad
router.delete('/ciudad/:id', authenticateToken, ciudadController.eliminarCiudad);        // Eliminar lógica
router.get('/ciudades', authenticateToken, ciudadController.consultarCiudades);          // Listado
router.get('/ciudad/:id', authenticateToken, ciudadController.consultarCiudadPorId);     // Detalle por ID

module.exports = router;
