import { cerrarSesion } from '../services/authService';
// Importa aquí las funciones de tus otras páginas (consulta, reserva, etc.)
// import { renderConsulta } from './consultaVuelos';

export function renderDashboard(container: HTMLDivElement) {
  container.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
      <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">
        Sistema de Reservas
      </h1>
      <p class="text-center text-lg text-green-600 mb-8">
        ¡Autenticación exitosa!
      </p>
      
      <nav>
        <ul class="space-y-4">
          <li>
            <button id="btn-consulta" class="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200">
              Consulta de vuelos
            </button>
          </li>
          <li>
            <button id="btn-reserva" class="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200">
              Reserva de vuelos
            </button>
          </li>
          <li>
            <button id="btn-compra" class="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200">
              Compra de billetes
            </button>
          </li>
          <li>
            <button id="btn-perfil" class="w-full text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200">
              Modificar mi registro
            </button>
          </li>
        </ul>
      </nav>
      
      <button id="btn-logout" 
              class="w-full bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200 mt-8">
        Cerrar Sesión
      </button>
      
      <div id="content-area" class="mt-6"></div>
    </div>
  `;

  // --- Lógica de eventos ---

  const contentArea = container.querySelector<HTMLDivElement>('#content-area');

  // Manejador de Cerrar Sesión
  container.querySelector('#btn-logout')?.addEventListener('click', () => {
    cerrarSesion();
  });

  // Manejadores para los botones de navegación
  // (Aquí es donde cargarás tus otros formularios)
  
  container.querySelector('#btn-consulta')?.addEventListener('click', () => {
    if (contentArea) {
      // Por ejemplo:
      // renderConsulta(contentArea);
      contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Consulta de vuelos' irá aquí.</p>`;
    }
  });

  container.querySelector('#btn-reserva')?.addEventListener('click', () => {
    if (contentArea) {
      contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Reserva de vuelos' irá aquí.</p>`;
    }
  });

   container.querySelector('#btn-compra')?.addEventListener('click', () => {
    if (contentArea) {
      contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Compra de billetes' irá aquí.</p>`;
    }
  });

   container.querySelector('#btn-perfil')?.addEventListener('click', () => {
    if (contentArea) {
      contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Modificar mi registro' irá aquí.</t>`;
    }
  });
} 