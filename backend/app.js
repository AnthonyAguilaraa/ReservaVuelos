const express = require('express'); 
const cors = require('cors');
require('dotenv').config(); 

const app = express();  

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

// CORS configuration
app.use(cors({
    origin: ['http://localhost:4200'], 
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Define your routes here
// Example route
app.get('/', (req, res) => {
    res.send('Hola Mundo');
});

module.exports = app;  // Export the app for use in server.js
