import './style.css'; // Importa el style.css (que debe estar vacío)
import { renderLogin } from './pages/login';
import { renderDashboard } from './pages/dashboard';

// --- Punto de entrada de la aplicación ---

// 1. Obtener el contenedor principal de index.html
const appContainer = document.querySelector<HTMLDivElement>('#app');

if (appContainer) {
  // 2. Revisar si ya existe un token de sesión
  const token = localStorage.getItem('token');

  if (token) {
    // 3. Si hay token, el usuario ya está logueado
    renderDashboard(appContainer);
  } else {
    // 4. Si NO hay token, mostrar la página de login
    renderLogin(appContainer);
  }
} else {
  console.error('Error: No se encontró el elemento #app en el DOM.');
}