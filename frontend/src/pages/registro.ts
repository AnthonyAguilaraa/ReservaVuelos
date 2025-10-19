import { registrarUsuario } from '../services/authService';
import { renderLogin }from './login';

export function renderRegistro(container: HTMLDivElement) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 class="text-2xl font-bold text-center text-gray-800 mb-2">
        Registro de Nuevo Usuario
      </h2>
      <p class="text-center text-gray-600 mb-6">
        Complete sus datos para crear una cuenta.
      </p>
      
      <form id="registro-form">
        <div class="mb-4">
          <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre Completo:</label>
          <input type="text" id="nombre" name="nombre" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="mb-4">
          <label for="correo-reg" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico:</label>
          <input type="email" id="correo-reg" name="correo" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div class="mb-4">
          <label for="clave-reg" class="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
          <input type="password" id="clave-reg" name="clave" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
         <div class="mb-6">
          <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional):</label>
          <input type="tel" id="telefono" name="telefono"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        
        <button type="submit"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
          Crear Cuenta
        </button>
        <p id="registro-message" class="text-sm text-center mt-3"></p>
      </form>
      
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">o</span>
        </div>
      </div>

      <button type="button" id="btn-volver-login" 
              class="w-full bg-gray-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200">
        Volver a Iniciar Sesión
      </button>
    </div>
  `;

  // --- Lógica de eventos ---
  
  const registroForm = container.querySelector<HTMLFormElement>('#registro-form');
  const messageEl = container.querySelector<HTMLParagraphElement>('#registro-message');
  const btnVolverLogin = container.querySelector<HTMLButtonElement>('#btn-volver-login');

  registroForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!messageEl) return;

    // Recolectar datos del formulario
    const datos = {
        nombre: (container.querySelector<HTMLInputElement>('#nombre'))!.value,
        correo: (container.querySelector<HTMLInputElement>('#correo-reg'))!.value,
        clave: (container.querySelector<HTMLInputElement>('#clave-reg'))!.value,
        telefono: (container.querySelector<HTMLInputElement>('#telefono'))!.value
    };

    messageEl.textContent = 'Registrando...';
    messageEl.className = 'text-center text-sm mt-3 text-gray-600';

    const result = await registrarUsuario(datos);

    if (result.success) {
      messageEl.textContent = `${result.message}. Será redirigido al login.`;
      messageEl.className = 'text-center text-sm mt-3 text-green-600'; // Color verde
      // Esperar 3 segundos y enviar al login
      setTimeout(() => {
        container.innerHTML = '';
        renderLogin(container);
      }, 3000);
    } else {
      messageEl.textContent = result.message;
      messageEl.className = 'text-center text-sm mt-3 text-red-500'; // Color rojo
    }
  });

  btnVolverLogin?.addEventListener('click', () => {
    container.innerHTML = '';
    renderLogin(container);
  });
}