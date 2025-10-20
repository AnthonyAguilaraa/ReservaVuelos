// src/pages/dashboard.ts

import { cerrarSesion } from '../services/authService';
// 1. IMPORTA la nueva función
import { renderConsultaVuelos } from './consultaVuelos';
// (Importa aquí tus otras funciones: renderReserva, renderPerfil, etc.)

export function renderDashboard(container: HTMLDivElement) {
container.innerHTML = `
  <div class="bg-white p-8 rounded-lg shadow-md max-w-4xl w-full mx-auto relative"> <!-- Make the container relative -->
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">
      Sistema de Reservas
    </h1>
    
    <!-- Place "Cerrar Sesión" at the top right -->
    <button id="btn-logout" 
            class="absolute top-8 right-8 bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200">
      Cerrar Sesión
    </button>
    
    <p class="text-center text-lg text-green-600 mb-8">
      ¡Autenticación exitosa!
    </p>
    
    <nav>
      <ul class="flex space-x-4 justify-center mb-8"> <!-- Horizontal layout for buttons -->
        <li>
          <button id="btn-consulta" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-40">
            Consulta de vuelos
          </button>
        </li>
        <li>
          <button id="btn-reserva" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-40">
            Reserva de vuelos
          </button>
        </li>
        <li>
          <button id="btn-compra" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-40">
            Compra de billetes
          </button>
        </li>
        <li>
          <button id="btn-perfil" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-40">
            Modificar mi registro
          </button>
        </li>
      </ul>
    </nav>

    <div id="content-area" class="mt-6 border-t pt-6"></div>
  </div>
`;



  // --- Lógica de eventos ---

  const contentArea = container.querySelector<HTMLDivElement>('#content-area');
  if (!contentArea) return; // Salir si no existe el content-area

  // Manejador de Cerrar Sesión
  container.querySelector('#btn-logout')?.addEventListener('click', () => {
    cerrarSesion();
  });

  // 2. MODIFICA el listener del botón de consulta
  container.querySelector('#btn-consulta')?.addEventListener('click', () => {
    // Limpiar área de contenido y renderizar el módulo de consulta
    contentArea.innerHTML = '';
    renderConsultaVuelos(contentArea);
  });

  container.querySelector('#btn-reserva')?.addEventListener('click', () => {
    contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Reserva de vuelos' irá aquí.</p>`;
  });

  container.querySelector('#btn-compra')?.addEventListener('click', () => {
    contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Compra de billetes' irá aquí.</p>`;
  });

  container.querySelector('#btn-perfil')?.addEventListener('click', () => {
    contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Formulario de 'Modificar mi registro' irá aquí.t</p>`;
  });
}