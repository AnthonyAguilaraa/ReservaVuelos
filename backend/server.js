const app = require('./app');  // Import the app configuration
const PORT = process.env.PORT || 5000;  // Use environment port or default to 5000

app.listen(PORT, () => { 
    console.log(`Servidor escuchando en el puerto: ${PORT}`); 
});
