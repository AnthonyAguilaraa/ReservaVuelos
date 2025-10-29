// src/pages/reservaVuelos.ts

import { getCiudades, getAerolineas } from '../services/catalogService';
import { buscarVuelos, getConteoAsientosDisponibles } from '../services/vueloService'; // Importar el contador
import { crearReservaCompleta } from '../services/reservaService';

// --- Estado del Módulo ---
let wizardState = {
    selectedVuelo: null as any | null,
    pasajeros: [] as any[],
    // 'selectedAsientos' y 'disponibles' ya no se necesitan aquí
};

// --- Cache de Catálogos ---
let ciudadesCache: any[] = [];
let aerolineasCache: any[] = [];

/**
 * Punto de entrada principal para el módulo de Reservas.
 */
export async function renderReservaVuelos(container: HTMLDivElement) {
    // Reseteamos el estado
    wizardState = {
        selectedVuelo: null,
        pasajeros: [],
    };

    container.innerHTML = `<p class="text-center text-gray-600">Cargando catálogos...</p>`;
    // Cargar catálogos solo si no están en caché
    try {
        if (ciudadesCache.length === 0) {
            ciudadesCache = await getCiudades();
        }
        if (aerolineasCache.length === 0) {
            aerolineasCache = await getAerolineas();
        }
    } catch (error) {
         container.innerHTML = `<p class="text-red-500 text-center">No se pudieron cargar los catálogos necesarios.</p>`;
         return;
    }

    // Renderizar el primer paso
    renderStepSearch(container);
}

// ----------------------------------------------------------------
// --- PASO 1: BÚSQUEDA DE VUELOS (Con validación de asientos) ---
// ----------------------------------------------------------------
function renderStepSearch(container: HTMLDivElement) {
    const opcionesCiudades = ciudadesCache.map(c => `<option value="${c.id_ciudad}">${c.nombre_ciudad}</option>`).join('');
    const opcionesAerolineas = aerolineasCache.map(a => `<option value="${a.id_aerolinea}">${a.nombre_aerolinea}</option>`).join('');
    // Clases reutilizables
    const inputClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const buttonClass = "w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200";

    container.innerHTML = `
        <div class="w-full max-w-4xl mx-auto"> <h2 class="text-2xl font-bold mb-4 text-gray-800">Paso 1: Buscar Vuelo para Reservar</h2>
            <form id="reserva-search-form" class="p-6 bg-gray-50 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200">
                <div>
                    <label for="origen" class="block text-sm font-medium text-gray-700">Origen:</label>
                    <select id="origen" required class="${inputClass}">${opcionesCiudades}</select>
                </div>
                <div>
                    <label for="destino" class="block text-sm font-medium text-gray-700">Destino:</label>
                    <select id="destino" required class="${inputClass}">${opcionesCiudades}</select>
                </div>
                <div>
                    <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha:</label>
                    <input type="date" id="fecha" required class="${inputClass}">
                </div>
                <div class="md:col-span-3">
                    <button type="submit" class="${buttonClass}">
                        Buscar Vuelos Disponibles
                    </button>
                </div>
                <p id="search-error" class="text-red-600 text-sm md:col-span-3 h-5"></p> </form>
            <div id="reserva-results" class="mt-6"></div>
        </div>
    `;

    const form = container.querySelector<HTMLFormElement>('#reserva-search-form')!;
    const errorEl = container.querySelector<HTMLParagraphElement>('#search-error')!;
    const resultsDiv = container.querySelector<HTMLDivElement>('#reserva-results')!;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        resultsDiv.innerHTML = `<p class="text-center py-4">Buscando vuelos...</p>`;
        errorEl.textContent = ''; // Limpiar errores previos

        const params = {
            origen: (form.querySelector<HTMLSelectElement>('#origen')!).value,
            destino: (form.querySelector<HTMLSelectElement>('#destino')!).value,
            fecha: (form.querySelector<HTMLInputElement>('#fecha')!).value,
            sortBy: 'precio_asc' // Ordenar por precio por defecto
        };

        if (!params.origen || !params.destino || !params.fecha) {
            errorEl.textContent = 'Por favor, seleccione origen, destino y fecha.';
            resultsDiv.innerHTML = '';
            return;
        }

        if (params.origen === params.destino) {
            errorEl.textContent = 'Origen y destino no pueden ser iguales.';
            resultsDiv.innerHTML = '';
            return;
        }

        const result = await buscarVuelos(params);

        if (result.success && result.data.length > 0) {
            resultsDiv.innerHTML = result.data.map((v: any) => `
                <div class="bg-white shadow p-4 mb-3 rounded-lg flex flex-col md:flex-row justify-between md:items-center border border-gray-200">
                    <div class="mb-3 md:mb-0 text-sm">
                        <div class="font-bold text-base text-blue-700">${v.nombre_aerolinea} (${v.numero_vuelo})</div>
                        <div class="text-gray-700">${v.nombre_origen} &rarr; ${v.nombre_destino}</div>
                        <div class="text-gray-600">Sale: ${v.hora_salida} | Llega: ${v.hora_llegada}</div>
                    </div>
                    <div class="text-left md:text-right w-full md:w-auto"> 
                        <div class="text-xl font-bold text-green-700 mb-2 md:mb-0">$ ${parseFloat(v.precio).toFixed(2)}</div>
                        <button class="btn-select-vuelo w-full md:w-auto mt-2 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
                                data-vuelo-id="${v.id_vuelo}"
                                data-vuelo-json='${JSON.stringify(v)}'>
                            Seleccionar Vuelo
                        </button>
                        <p data-feedback-for="${v.id_vuelo}" class="text-red-600 text-xs mt-1 h-4 md:text-right"> </p>
                    </div>
                </div>
            `).join('');

            // Añadir listeners a los botones "Seleccionar Vuelo"
            resultsDiv.querySelectorAll('.btn-select-vuelo').forEach(button => {
                button.addEventListener('click', async (ev) => {
                    const btn = ev.currentTarget as HTMLButtonElement;
                    const vueloId = parseInt(btn.dataset.vueloId!);
                    const vueloData = JSON.parse(btn.dataset.vueloJson!);

                    // Corrección: Buscar el párrafo hermano del botón presionado
                    const parentDiv = btn.parentElement; // El div que contiene el botón y el <p>
                    const feedbackP = parentDiv?.querySelector<HTMLParagraphElement>('p[data-feedback-for]')!; // Buscar DENTRO del padre

                    // Añadir un chequeo por si acaso no se encuentra el párrafo
                    if (!feedbackP) {
                        console.error('No se encontró el elemento de feedback para el vuelo ID:', vueloId);
                        alert('Error interno al seleccionar el vuelo.'); // Informar al usuario
                        return; // Detener la ejecución
                    }

                    // Deshabilitar botón mientras se verifica
                    btn.disabled = true;
                    btn.textContent = 'Verificando asientos...';
                    feedbackP.textContent = ''; // Esta línea ahora es segura

                    // Llamar al nuevo servicio para contar asientos
                    const conteoResult = await getConteoAsientosDisponibles(vueloId);

                    if (conteoResult.success && conteoResult.count > 0) {
                        // Sí hay asientos, proceder a añadir pasajeros
                        wizardState.selectedVuelo = vueloData;
                        renderStepPassengers(container); // Avanzar al Paso 2
                    } else if (conteoResult.success && conteoResult.count === 0) {
                        // No hay asientos, mostrar mensaje y deshabilitar visualmente
                        feedbackP.textContent = 'No quedan asientos disponibles para este vuelo.';
                        btn.textContent = 'No Disponible';
                        btn.classList.add('opacity-50', 'cursor-not-allowed', 'bg-gray-400');
                        btn.classList.remove('bg-green-600', 'hover:bg-green-700');
                        // Mantenemos btn.disabled = true;
                    } else {
                        // Hubo un error al verificar
                        feedbackP.textContent = `Error al verificar: ${conteoResult.message || 'desconocido'}`;
                        btn.disabled = false; // Rehabilitar para que pueda intentar de nuevo
                        btn.textContent = 'Seleccionar Vuelo';
                    }
                });
            });


        } else if (result.success) {
            resultsDiv.innerHTML = `<p class="text-center text-gray-600 py-4">No se encontraron vuelos para esta ruta y fecha.</p>`;
        } else {
            resultsDiv.innerHTML = `<p class="text-center text-red-600 py-4">Error al buscar vuelos: ${result.message}</p>`;
        }
    });
}

// ----------------------------------------------------------------
// --- PASO 2: AÑADIR PASAJEROS ---
// ----------------------------------------------------------------
function renderStepPassengers(container: HTMLDivElement) {
    const inputClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const buttonClass = "w-full py-2 px-4 rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200";

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto"> <button id="btn-back-step1" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Búsqueda de Vuelos</button>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Paso 2: Añadir Pasajeros</h2>

        <div class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
            <strong>Vuelo Seleccionado:</strong> ${wizardState.selectedVuelo.numero_vuelo}
            (${wizardState.selectedVuelo.nombre_origen} &rarr; ${wizardState.selectedVuelo.nombre_destino})
        </div>

        <form id="form-add-pasajero" class="p-6 bg-gray-50 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200">
            <h3 class="text-lg font-semibold md:col-span-3 text-gray-700">Nuevo Pasajero</h3>
            <div>
                <label for="p-nombre" class="block text-sm font-medium text-gray-700">Nombre:</label>
                <input type="text" id="p-nombre" required class="${inputClass}">
            </div>
            <div>
                <label for="p-apellido" class="block text-sm font-medium text-gray-700">Apellido:</label>
                <input type="text" id="p-apellido" required class="${inputClass}">
            </div>
            <div>
                <label for="p-documento" class="block text-sm font-medium text-gray-700">Documento Identidad:</label>
                <input type="text" id="p-documento" required class="${inputClass}">
            </div>
            <div class="md:col-span-3">
                <label for="p-nacimiento" class="block text-sm font-medium text-gray-700">Fecha Nacimiento:</label>
                <input type="date" id="p-nacimiento" required class="${inputClass}">
            </div>
            <div class="md:col-span-3">
                <button type="submit" class="${buttonClass} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
                    Añadir Pasajero a la Lista
                </button>
            </div>
        </form>

        <h3 class="text-xl font-semibold mt-6 mb-2 text-gray-700">Pasajeros Añadidos (${wizardState.pasajeros.length})</h3>
        <div id="pasajeros-list" class="mb-6 space-y-2">
            ${wizardState.pasajeros.length === 0 ? '<p class="text-gray-500">Añada al menos un pasajero usando el formulario de arriba.</p>' : ''}
            </div>

        <button id="btn-goto-step3" class="${buttonClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 text-lg">
            Siguiente: Revisar Reserva
        </button>
      </div> `;

    const listDiv = container.querySelector<HTMLDivElement>('#pasajeros-list')!;
    const nextButton = container.querySelector<HTMLButtonElement>('#btn-goto-step3')!;

    // Función para re-dibujar la lista de pasajeros
    const updatePasajerosList = () => {
        if (wizardState.pasajeros.length === 0) {
            listDiv.innerHTML = '<p class="text-gray-500">Añada al menos un pasajero usando el formulario de arriba.</p>';
        } else {
            listDiv.innerHTML = wizardState.pasajeros.map((p, index) => `
                <div class="bg-white shadow p-3 rounded flex justify-between items-center border border-gray-200">
                    <span><strong>${p.nombre} ${p.apellido}</strong> (${p.documento_identidad})</span>
                    <button class="btn-remove-pasajero text-red-500 hover:text-red-700 text-sm font-medium" data-index="${index}">Quitar</button>
                </div>
            `).join('');
        }

        // Habilitar/Deshabilitar botón "Siguiente"
        nextButton.disabled = wizardState.pasajeros.length === 0;
        nextButton.classList.toggle('opacity-50', nextButton.disabled);
        nextButton.classList.toggle('cursor-not-allowed', nextButton.disabled);

        // Listeners para botones "Quitar"
        listDiv.querySelectorAll('.btn-remove-pasajero').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.currentTarget as HTMLElement).dataset.index!);
                wizardState.pasajeros.splice(index, 1); // Eliminar pasajero del array
                updatePasajerosList(); // Volver a dibujar la lista
            });
        });
    };

    updatePasajerosList(); // Renderizar la lista inicial

    // Listener para volver al paso anterior
    container.querySelector('#btn-back-step1')!.addEventListener('click', () => {
        renderStepSearch(container); // Vuelve al paso 1 (búsqueda)
    });

    // Listener para formulario "Añadir Pasajero"
    container.querySelector<HTMLFormElement>('#form-add-pasajero')!.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const pasajero = {
            nombre: (form.querySelector<HTMLInputElement>('#p-nombre')!).value.trim(),
            apellido: (form.querySelector<HTMLInputElement>('#p-apellido')!).value.trim(),
            documento_identidad: (form.querySelector<HTMLInputElement>('#p-documento')!).value.trim(),
            fecha_nacimiento: (form.querySelector<HTMLInputElement>('#p-nacimiento')!).value,
        };
        // Validación simple
        if (!pasajero.nombre || !pasajero.apellido || !pasajero.documento_identidad || !pasajero.fecha_nacimiento) {
             alert("Por favor, complete todos los campos del pasajero.");
             return;
        }

        wizardState.pasajeros.push(pasajero); // Añadir al array
        updatePasajerosList(); // Actualizar la lista visual
        form.reset(); // Limpiar el formulario
        (form.querySelector<HTMLInputElement>('#p-nombre')!).focus(); // Poner foco en el nombre para el siguiente
    });

    // Listener para botón "Siguiente"
    nextButton.addEventListener('click', () => {
        if (wizardState.pasajeros.length > 0) {
            renderStepReview(container); // Avanzar al Paso 3 (Revisar)
        }
    });
}


// ----------------------------------------------------------------
// --- PASO 3: REVISAR Y CONFIRMAR ---
// ----------------------------------------------------------------
function renderStepReview(container: HTMLDivElement) {
    const vuelo = wizardState.selectedVuelo;
    const precioUnitario = parseFloat(vuelo.precio);
    const numPasajeros = wizardState.pasajeros.length;
    const precioTotal = (precioUnitario * numPasajeros).toFixed(2);
    const buttonClass = "w-full py-3 px-4 text-lg rounded font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200";

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto"> <button id="btn-back-step2" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Añadir Pasajeros</button>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Paso 3: Revisar y Confirmar Reserva</h2>

        <div class="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <div class="border-b border-gray-200 pb-4 mb-4">
                <h3 class="text-xl font-semibold text-blue-700">Vuelo Seleccionado</h3>
                <p><strong>${vuelo.numero_vuelo}</strong> - ${vuelo.nombre_aerolinea}</p>
                <p>${vuelo.nombre_origen} &rarr; ${vuelo.nombre_destino}</p>
                <p><strong>Fecha:</strong> ${new Date(vuelo.fecha_salida).toLocaleDateString()} | <strong>Hora:</strong> ${vuelo.hora_salida}</p>
                <p><strong>Precio por pasajero:</strong> $ ${precioUnitario.toFixed(2)}</p>
            </div>

            <div class="border-b border-gray-200 pb-4 mb-4">
                <h3 class="text-xl font-semibold text-blue-700">Pasajeros (${numPasajeros})</h3>
                <ul class="list-disc list-inside pl-5 space-y-1">
                    ${wizardState.pasajeros.map((p: any) => `
                        <li>
                            <strong>${p.nombre} ${p.apellido}</strong> (Doc: ${p.documento_identidad})
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="text-right mb-6">
                <div class="text-3xl font-bold text-green-700">
                    TOTAL ESTIMADO: $ ${precioTotal}
                </div>
                 <p class="text-sm text-gray-500">(Selección de asientos y pago final en el siguiente paso)</p>
            </div>

            <button id="btn-confirmar-reserva" class="${buttonClass} bg-green-600 text-white hover:bg-green-700 focus:ring-green-500">
                Confirmar Reserva Ahora
            </button>
            <p id="confirm-error" class="text-red-600 text-sm text-center mt-3 h-5"></p> </div>
      </div> `;

    // Listener para volver al paso anterior
    container.querySelector('#btn-back-step2')!.addEventListener('click', () => {
        renderStepPassengers(container); // Vuelve al paso 2 (pasajeros)
    });

    // Listener para el botón Confirmar Reserva
    container.querySelector('#btn-confirmar-reserva')!.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const errorEl = container.querySelector<HTMLParagraphElement>('#confirm-error')!;

        btn.disabled = true;
        btn.textContent = 'Procesando Reserva...';
        errorEl.textContent = ''; // Limpiar errores

        // Preparar datos para el backend (sin asientos)
        const payload = {
            vuelos: [Number(wizardState.selectedVuelo.id_vuelo)], // ID del vuelo
            pasajeros: wizardState.pasajeros, // Array de objetos de pasajero
            asientos: [] as number[] // Enviar array vacío como placeholder
        };

        // Llamar al servicio para crear la reserva
        const result = await crearReservaCompleta(payload);

        if (result.success) {
            // Ir a la pantalla de éxito
            renderStepSuccess(container, result.data.id_reserva);
        } else {
            // Mostrar error del backend
            errorEl.textContent = result.message ?? 'Ocurrió un error desconocido al confirmar la reserva.';
            btn.disabled = false; // Rehabilitar botón
            btn.textContent = 'Confirmar Reserva Ahora';
        }
    });
}

// ----------------------------------------------------------------
// --- PASO 4: ÉXITO ---
// ----------------------------------------------------------------
function renderStepSuccess(container: HTMLDivElement, id_reserva: number) {
     const buttonClass = "bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200";

    container.innerHTML = `
      <div class="w-full max-w-3xl mx-auto"> <div class="text-center p-10 bg-green-50 rounded-lg border border-green-200">
             <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 class="text-3xl font-bold text-green-700 mb-4">¡Reserva Confirmada!</h2>
            <p class="text-lg text-gray-800">Su reserva ha sido registrada exitosamente.</p>
            <p class="text-lg text-gray-800 mt-2">
                Su código de reserva es:
                <strong class="text-2xl text-black font-mono">${id_reserva}</strong>
            </p>

            <p class="mt-6 text-gray-700">El siguiente paso es ir a <strong>Compra de Billetes</strong> para seleccionar sus asientos y realizar el pago final.</p>

            <div class="mt-8 space-x-4">
                <button id="btn-ir-a-comprar" class="bg-green-600 text-white py-2 px-6 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200">
                    Ir a Comprar Billetes
                </button>
                <button id="btn-nueva-reserva" class="${buttonClass}">
                    Hacer Otra Reserva
                </button>
            </div>
        </div>
      </div> `;

    // Botón para ir a Comprar (simula clic en el botón del dashboard)
     container.querySelector('#btn-ir-a-comprar')!.addEventListener('click', () => {
         // Busca el botón "Compra de Billetes" en el dashboard y simula un clic
         const compraButton = document.getElementById('btn-compra');
         compraButton?.click(); // Esto activará el listener en dashboard.ts
    });


    // Botón para hacer otra reserva
    container.querySelector('#btn-nueva-reserva')!.addEventListener('click', () => {
        renderReservaVuelos(container); // Reinicia este módulo
    });
}