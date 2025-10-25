// Asumimos que tienes un authService para manejar el logout
import { cerrarSesion } from '../services/authService'; 
// Importamos el módulo que acabamos de crear
import { renderConsultaVuelos } from './consultaVuelos';
import { renderReservaVuelos } from './reservaVuelos';
import { renderCompraBilletes } from './compraBilletes';

export function renderDashboard(container: HTMLDivElement) {
    container.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-md max-w-5xl w-full mx-auto relative">
        <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">
            Sistema de Reservas
        </h1>
        
        <button id="btn-logout" 
                class="absolute top-8 right-8 bg-red-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition duration-200">
            Cerrar Sesión
        </button>
        
        <p class="text-center text-lg text-green-600 mb-8">
            ¡Autenticación exitosa!
        </p>
        
        <nav>
            <ul class="flex space-x-4 justify-center mb-8">
                <li>
                    <button id="btn-consulta" class="text-left p-4 bg-blue-100 hover:bg-blue-200 rounded-md font-medium text-blue-800 transition duration-200 w-44">
                        Consulta de Vuelos
                    </button>
                </li>
                <li>
                    <button id="btn-reserva" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-44">
                        Reserva de Vuelos
                    </button>
                </li>
                <li>
                    <button id="btn-compra" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-44">
                        Compra de Billetes
                    </button>
                </li>
                <li>
                    <button id="btn-perfil" class="text-left p-4 bg-gray-100 hover:bg-gray-200 rounded-md font-medium text-gray-700 transition duration-200 w-44">
                        Modificar mi Registro
                    </button>
                </li>
            </ul>
        </nav>

        <div id="content-area" class="mt-6 border-t pt-6 min-h-[300px]">
            <p class="text-center text-gray-500">Seleccione una opción del menú para comenzar.</p>
        </div>
    </div>
    `;

    // --- Lógica de eventos ---

    const contentArea = container.querySelector<HTMLDivElement>('#content-area');
    if (!contentArea) return;

    // Manejador de Cerrar Sesión
    container.querySelector('#btn-logout')?.addEventListener('click', () => {
        cerrarSesion();
    });

    // Cargar el módulo de Consulta de Vuelos
    container.querySelector('#btn-consulta')?.addEventListener('click', () => {
        // Resaltar botón activo (opcional)
        document.querySelectorAll('nav button').forEach(btn => btn.classList.replace('bg-blue-100', 'bg-gray-100'));
        container.querySelector('#btn-consulta')?.classList.replace('bg-gray-100', 'bg-blue-100');
        
        contentArea.innerHTML = ''; // Limpiar área
        renderConsultaVuelos(contentArea); // Cargar el módulo
    });

    container.querySelector('#btn-reserva')?.addEventListener('click', () => {
        // Resaltar botón activo (opcional)
        document.querySelectorAll('nav button').forEach(btn => btn.classList.replace('bg-blue-100', 'bg-gray-100'));
        container.querySelector('#btn-reserva')?.classList.replace('bg-gray-100', 'bg-blue-100');
        
        contentArea.innerHTML = ''; // Limpiar área
        renderReservaVuelos(contentArea); // Llamar al nuevo módulo
 });

    container.querySelector('#btn-compra')?.addEventListener('click', () => {
        document.querySelectorAll('nav button').forEach(btn => btn.classList.replace('bg-blue-100', 'bg-gray-100'));
        container.querySelector('#btn-compra')?.classList.replace('bg-gray-100', 'bg-blue-100');
        
        contentArea.innerHTML = '';
        renderCompraBilletes(contentArea); // Llamar al nuevo módulo
    });

    container.querySelector('#btn-perfil')?.addEventListener('click', () => {
        document.querySelectorAll('nav button').forEach(btn => btn.classList.replace('bg-blue-100', 'bg-gray-100'));
        container.querySelector('#btn-perfil')?.classList.replace('bg-gray-100', 'bg-blue-100');
        contentArea.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">Módulo 'Modificar mi registro' (próximamente).</p>`;
    });
}