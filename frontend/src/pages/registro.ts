import { registrarUsuario } from '../services/authService';
import { renderLogin } from './login';

/**
 * Valida la fortaleza de una contraseña.
 * Requisitos:
 * - Al menos 8 caracteres
 * - Al menos una mayúscula (A-Z)
 * - Al menos una minúscula (a-z)
 * - Al menos un número (0-9)
 * - Al menos un caracter especial (ej. !@#$%^&*)
 * @param clave - La contraseña a validar.
 * @returns {boolean} - true si la contraseña es válida, false si no.
 */
function validarClave(clave: string): boolean {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(clave);
  const hasLowercase = /[a-z]/.test(clave);
  const hasNumber = /[0-9]/.test(clave);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(clave); // Cualquier caracter no alfanumérico

  return (
    clave.length >= minLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialChar
  );
}

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
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="mb-4">
          <label for="correo-reg" class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico:</label>
          <input type="email" id="correo-reg" name="correo" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
        <div class="mb-4">
          <label for="clave-reg" class="block text-sm font-medium text-gray-700 mb-1">Contraseña:</label>
          
          <input type="password" id="clave-reg" name="clave" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                 aria-describedby="clave-hint">
          
          <p id="clave-hint" class="text-xs text-gray-500 mt-1">
            Mín. 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 caracter especial.
          </p>
        </div>
        <div class="mb-6">
          <label for="confirmar-clave-reg" class="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña:</label>
          
          <input type="password" id="confirmar-clave-reg" name="confirmarClave" required
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>
         <div class="mb-6">
          <label for="telefono" class="block text-sm font-medium text-gray-700 mb-1">Teléfono (Opcional):</label>
          <input type="tel" id="telefono" name="telefono"
                 class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
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
  
  // --- AÑADIDO: Event listener para el campo de contraseña ---
  const claveInput = container.querySelector<HTMLInputElement>('#clave-reg');

  claveInput?.addEventListener('input', () => {
      const clave = claveInput.value;
      
      // Quitar todas las clases de color de borde y foco
      claveInput.classList.remove(
          'border-gray-300', 'border-red-500', 'border-green-500',
          'focus:ring-blue-500', 'focus:ring-red-500', 'focus:ring-green-500'
      );

      if (clave.length === 0) {
          // Estado por defecto (cuando está vacío)
          claveInput.classList.add('border-gray-300', 'focus:ring-blue-500');
          return;
      }
      
      if (validarClave(clave)) {
          // Estado Válido (Verde)
          claveInput.classList.add('border-green-500', 'focus:ring-green-500');
      } else {
          // Estado Inválido (Rojo)
          claveInput.classList.add('border-red-500', 'focus:ring-red-500');
      }
  });

  // --- Manejador del SUBMIT del formulario (se mantiene igual) ---
  registroForm?.addEventListener('submit', async (e) => {
    e.preventDefault(); 
    if (!messageEl) return;

    const nombre = (container.querySelector<HTMLInputElement>('#nombre'))!.value;
    const correo = (container.querySelector<HTMLInputElement>('#correo-reg'))!.value;
    const clave = (container.querySelector<HTMLInputElement>('#clave-reg'))!.value;
    const confirmarClave = (container.querySelector<HTMLInputElement>('#confirmar-clave-reg'))!.value;
    const telefono = (container.querySelector<HTMLInputElement>('#telefono'))!.value.trim(); 

    messageEl.className = 'text-center text-sm mt-3 text-red-500'; 

    if (clave !== confirmarClave) {
      messageEl.textContent = 'Las contraseñas no coinciden.';
      return;
    }

    if (!validarClave(clave)) {
      messageEl.textContent = 'La contraseña no cumple con los requisitos de seguridad.';
      return;
    }

    messageEl.textContent = 'Registrando...';
    messageEl.className = 'text-center text-sm mt-3 text-gray-600';

    const datos = { nombre, correo, clave, telefono };
    const result = await registrarUsuario(datos);

    if (result.success) {
      messageEl.textContent = `${result.message}. Será redirigido al login.`;
      messageEl.className = 'text-center text-sm mt-3 text-green-600';
      
      setTimeout(() => {
        container.innerHTML = '';
        renderLogin(container);
      }, 3000);
    } else {
      messageEl.textContent = result.message;
      messageEl.className = 'text-center text-sm mt-3 text-red-500';
    }
  });

  btnVolverLogin?.addEventListener('click', () => {
    container.innerHTML = '';
    renderLogin(container);
  });
}