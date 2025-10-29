import { cerrarSesion } from '../services/authService';
import { renderConsultaVuelos } from './consultaVuelos';
import { renderReservaVuelos } from './reservaVuelos';
import { renderCompraBilletes } from './compraBilletes';
import { renderHistorialCompras } from './historialCompras';
import { renderPerfilUsuario } from './perfilUsuario';

export function renderDashboard(container: HTMLDivElement) {
    const buttonBaseClass = "text-left p-4 rounded-md font-medium transition duration-200 w-44"; // Base button style
    const buttonInactiveClass = "bg-gray-100 hover:bg-gray-200 text-gray-700";
    const buttonActiveClass = "bg-blue-100 hover:bg-blue-200 text-blue-800";

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
            <ul class="flex flex-wrap gap-4 justify-center mb-8"> <li>
                    <button id="btn-consulta" class="${buttonBaseClass} ${buttonInactiveClass}">
                        Consulta de Vuelos
                    </button>
                </li>
                <li>
                    <button id="btn-reserva" class="${buttonBaseClass} ${buttonInactiveClass}">
                        Reserva de Vuelos
                    </button>
                </li>
                <li>
                    <button id="btn-compra" class="${buttonBaseClass} ${buttonInactiveClass}">
                        Compra de Billetes
                    </button>
                </li>
                <li>
                    <button id="btn-historial" class="${buttonBaseClass} ${buttonInactiveClass}"> Mi Historial
                    </button>
                </li>
                <li>
                    <button id="btn-perfil" class="${buttonBaseClass} ${buttonInactiveClass}">
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

    // --- Event Logic ---
    const contentArea = container.querySelector<HTMLDivElement>('#content-area');
    if (!contentArea) return;

    // Helper to manage active button state
    const setActiveButton = (activeButtonId: string) => {
         document.querySelectorAll('nav button').forEach(btn => {
            if (btn.id === activeButtonId) {
                // Remove inactive, add active
                btn.classList.remove(...buttonInactiveClass.split(' ').filter(c => c)); // Remove only existing inactive classes
                btn.classList.add(...buttonActiveClass.split(' ').filter(c => c)); // Add only existing active classes
            } else {
                // Remove active, add inactive
                 btn.classList.remove(...buttonActiveClass.split(' ').filter(c => c));
                btn.classList.add(...buttonInactiveClass.split(' ').filter(c => c));
            }
        });
    };


    // Logout Handler
    container.querySelector('#btn-logout')?.addEventListener('click', () => {
        cerrarSesion();
    });

    // Load Flight Consultation Module
    container.querySelector('#btn-consulta')?.addEventListener('click', () => {
        setActiveButton('btn-consulta');
        contentArea.innerHTML = '';
        renderConsultaVuelos(contentArea);
    });

    // Load Flight Reservation Module
     container.querySelector('#btn-reserva')?.addEventListener('click', () => {
        setActiveButton('btn-reserva');
        contentArea.innerHTML = '';
        renderReservaVuelos(contentArea);
    });

    // Load Ticket Purchase Module
    container.querySelector('#btn-compra')?.addEventListener('click', () => {
       setActiveButton('btn-compra');
        contentArea.innerHTML = '';
        renderCompraBilletes(contentArea);
    });

    container.querySelector('#btn-historial')?.addEventListener('click', () => {
        setActiveButton('btn-historial');
        contentArea.innerHTML = '';
        renderHistorialCompras(contentArea); // Llamar al nuevo módulo
    });

    // 2. MODIFY 'btn-perfil' listener
    container.querySelector('#btn-perfil')?.addEventListener('click', () => {
        setActiveButton('btn-perfil');
        contentArea.innerHTML = '';
        renderPerfilUsuario(contentArea); // Call the new profile module
    });
}