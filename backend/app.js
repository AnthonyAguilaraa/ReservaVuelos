const express = require('express'); 
const cors = require('cors');
require('dotenv').config(); 

const app = express();  

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// CORS 
app.use(cors({
    origin: ['http://localhost:5173'], 
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// RUTAS
const usuarioRoutes = require('./routes/usuariosRoutes');
const aerolineaRoutes = require('./routes/AerolineaRoute');
const ciudadRoutes = require('./routes/CiudadRoutes');
const vueloRoutes = require('./routes/VueloRoutes');
const reservasRoutes = require('./routes/ReservasRoutes');
const pasajeroRoutes = require('./routes/PasajeroRoutes');
const asientosRoutes = require('./routes/AsientosRoutes');
const billeteRoutes = require('./routes/BilleteRoutes');




const reservaVueloRoutes = require('./routes/ReservaVueloRoutes');
//const consultavuelosRoutes = require('./routes/ConsultavuelosRoutes');


app.use('/api', usuarioRoutes);
app.use('/api', aerolineaRoutes);
app.use('/api', ciudadRoutes);
app.use('/api', vueloRoutes);
app.use('/api', reservasRoutes);
app.use('/api', pasajeroRoutes);
app.use('/api', asientosRoutes);
app.use('/api', billeteRoutes);



app.use('/api', reservaVueloRoutes);
//app.use('/api', consultavuelosRoutes);

// Example route
app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

module.exports = app;  // Export the app for use in server.js
