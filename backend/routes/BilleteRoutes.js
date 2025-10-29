const express = require('express');
const router = express.Router();
const billeteController = require('../controllers/billeteController');
const authenticateToken = require('../middleware/auth');

// Rutas protegidas (requieren token)
router.post('/billete', authenticateToken, billeteController.insertarBillete); // Insertar Billete
router.put('/billete', authenticateToken, billeteController.modificarBillete); // Modificar Billete
router.delete('/billete/:id', authenticateToken, billeteController.eliminarBillete); // Eliminar Billete
router.get('/billetes', authenticateToken, billeteController.consultarBilletes); // Consultar todos los Billetes
router.get('/billete/:id', authenticateToken, billeteController.consultarBilletePorId); // Consultar Billete por ID
router.post('/billete/comprar', authenticateToken, billeteController.comprarBilletes); // Comprar Billetes
router.get('/billetes/mi-historial', authenticateToken, billeteController.consultarMiHistorial); // Obtener mi historial de compras
module.exports = router;
