import { iniciarSesion } from '../services/authService';
import { renderDashboard } from './dashboard';
import { renderRegistro } from './registro';

export function renderLogin(container: HTMLDivElement) {
  // HTML con clases de utilidad de Tailwind
  container.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">
        Terminal de Servicio de Reserva
      </h2>
      <p class="text-center text-gray-600 mb-6">
        Bienvenido. Ingrese a su cuenta o regístrese.
      </p>
      
      <form id="login-form">
        <h3 class="text-xl font-semibold text-center mb-4">Iniciar Sesión</h3>
        
        <div class="mb-4">
          <label for="correo" class="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico:
          </label>
          <input type="email" id="correo" name="correo" required 
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <div class="mb-6">
          <label for="clave" class="block text-sm font-medium text-gray-700 mb-1">
            Contraseña:
          </label>
          <input type="password" id="clave" name="clave" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <button type="submit" 
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
          Ingresar al Sistema
        </button>
        <p id="login-error-message" class="text-red-500 text-sm text-center mt-3"></p>
      </form>
      
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">o</span>
        </div>
      </div>

      <button type="button" id="btn-ir-registro" 
              class="w-full bg-gray-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200">
        Registrarse por primera vez
      </button>
    </div>
  `;

  // --- Lógica de eventos ---
  
  const loginForm = container.querySelector<HTMLFormElement>('#login-form');
  const errorMessage = container.querySelector<HTMLParagraphElement>('#login-error-message');
  const btnIrARegistro = container.querySelector<HTMLButtonElement>('#btn-ir-registro');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!errorMessage) return;

    const correo = (container.querySelector<HTMLInputElement>('#correo'))!.value;
    const clave = (container.querySelector<HTMLInputElement>('#clave'))!.value;

    errorMessage.textContent = 'Validando...';
    errorMessage.classList.remove('text-red-500'); // Quita color rojo
    errorMessage.classList.add('text-gray-600'); // Pone color gris

    const result = await iniciarSesion(correo, clave);

    if (result.success) {
      container.innerHTML = ''; 
      renderDashboard(container); // Muestra el dashboard
    } else {
      errorMessage.textContent = result.message; // Muestra error
      errorMessage.classList.add('text-red-500'); // Pone color rojo
      errorMessage.classList.remove('text-gray-600');
    }
  });

  btnIrARegistro?.addEventListener('click', () => {
    container.innerHTML = '';
    renderRegistro(container); // Muestra el formulario de registro
  });
}