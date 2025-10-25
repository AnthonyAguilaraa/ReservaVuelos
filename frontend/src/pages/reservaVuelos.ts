// src/pages/reservaVuelos.ts

import { getCiudades, getAerolineas } from '../services/catalogService';
import { buscarVuelos, getAsientosDisponibles } from '../services/vueloService';
import { crearReservaCompleta } from '../services/reservaService';

// --- Estado del Módulo ---
// Guardaremos el estado del wizard en este objeto
let wizardState = {
    selectedVuelo: null as any | null,
    pasajeros: [] as any[],
    selectedAsientos: [] as any[],
    disponibles: [] as any[], // Caché de asientos disponibles
};

// --- Cache de Catálogos ---
let ciudadesCache: any[] = [];
let aerolineasCache: any[] = [];

/**
 * Punto de entrada principal para el módulo de Reservas.
 * Inicia en el Paso 1: Búsqueda.
 */
export async function renderReservaVuelos(container: HTMLDivElement) {
    // Reseteamos el estado cada vez que se carga el módulo
    wizardState = {
        selectedVuelo: null,
        pasajeros: [],
        selectedAsientos: [],
        disponibles: [],
    };
    
    // Cargar catálogos
    container.innerHTML = `<p class="text-center text-gray-600">Cargando catálogos...</p>`;
    if (ciudadesCache.length === 0) {
        ciudadesCache = await getCiudades();
    }
    if (aerolineasCache.length === 0) {
        aerolineasCache = await getAerolineas();
    }
    
    // Renderizar el primer paso
    renderStepSearch(container);
}

// ----------------------------------------------------------------
// --- PASO 1: BÚSQUEDA DE VUELOS ---
// ----------------------------------------------------------------
function renderStepSearch(container: HTMLDivElement) {
    const opcionesCiudades = ciudadesCache.map(c => `<option value="${c.id_ciudad}">${c.nombre_ciudad}</option>`).join('');
    const opcionesAerolineas = aerolineasCache.map(a => `<option value="${a.id_aerolinea}">${a.nombre_aerolinea}</option>`).join('');

    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Paso 1: Buscar Vuelo</h2>
        <form id="reserva-search-form" class="p-6 bg-gray-50 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label for="origen" class="block text-sm font-medium text-gray-700">Origen:</label>
                <select id="origen" required class="w-full mt-1 ...">${opcionesCiudades}</select>
            </div>
            <div>
                <label for="destino" class="block text-sm font-medium text-gray-700">Destino:</label>
                <select id="destino" required class="w-full mt-1 ...">${opcionesCiudades}</select>
            </div>
            <div>
                <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha:</label>
                <input type="date" id="fecha" required class="w-full mt-1 ...">
            </div>
            <div class="md:col-span-3">
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 ...">
                    Buscar Vuelos
                </button>
            </div>
            <p id="search-error" class="text-red-500 text-sm md:col-span-3"></p>
        </form>
        <div id="reserva-results" class="mt-6"></div>
    `;

    const form = container.querySelector<HTMLFormElement>('#reserva-search-form')!;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resultsDiv = container.querySelector<HTMLDivElement>('#reserva-results')!;
        resultsDiv.innerHTML = `<p class="text-center">Buscando...</p>`;
        
        const params = {
            origen: (form.querySelector<HTMLSelectElement>('#origen')!).value,
            destino: (form.querySelector<HTMLSelectElement>('#destino')!).value,
            fecha: (form.querySelector<HTMLInputElement>('#fecha')!).value,
            sortBy: 'precio_asc' // Forzamos orden por precio
        };

        if (params.origen === params.destino) {
            (form.querySelector<HTMLParagraphElement>('#search-error')!).textContent = 'Origen y destino no pueden ser iguales.';
            return;
        }

        const result = await buscarVuelos(params);
        
        if (result.success && result.data.length > 0) {
            // Renderizar resultados con un botón "Seleccionar"
            resultsDiv.innerHTML = result.data.map((v: any) => `
                <div class="bg-white shadow p-4 mb-3 rounded-lg flex justify-between items-center">
                    <div>
                        <div class="font-bold text-blue-600">${v.nombre_aerolinea} (${v.numero_vuelo})</div>
                        <div>${v.nombre_origen} &rarr; ${v.nombre_destino}</div>
                        <div>Sale: ${v.hora_salida} | Llega: ${v.hora_llegada}</div>
                    </div>
                    <div class="text-right">
                        <div class="text-xl font-bold text-green-600">$ ${parseFloat(v.precio).toFixed(2)}</div>
                        <button class="btn-select-vuelo mt-2 bg-green-600 text-white py-2 px-4 rounded" data-vuelo-json='${JSON.stringify(v)}'>
                            Seleccionar
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Añadir listeners a los botones "Seleccionar"
            resultsDiv.querySelectorAll('.btn-select-vuelo').forEach(button => {
                button.addEventListener('click', (ev) => {
                    const vueloData = JSON.parse((ev.currentTarget as HTMLElement).dataset.vueloJson!);
                    wizardState.selectedVuelo = vueloData;
                    renderStepPassengers(container); // Avanzar al Paso 2
                });
            });

        } else if (result.success) {
            resultsDiv.innerHTML = `<p class="text-center text-gray-600">No se encontraron vuelos.</p>`;
        } else {
            resultsDiv.innerHTML = `<p class="text-center text-red-500">${result.message}</p>`;
        }
    });
}

// ----------------------------------------------------------------
// --- PASO 2: AÑADIR PASAJEROS ---
// ----------------------------------------------------------------
function renderStepPassengers(container: HTMLDivElement) {
    container.innerHTML = `
        <button id="btn-back-step1" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Búsqueda</button>
        <h2 class="text-2xl font-bold mb-4">Paso 2: Añadir Pasajeros</h2>
        
        <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <strong>Vuelo Seleccionado:</strong> ${wizardState.selectedVuelo.numero_vuelo} 
            (${wizardState.selectedVuelo.nombre_origen} &rarr; ${wizardState.selectedVuelo.nombre_destino})
        </div>

        <form id="form-add-pasajero" class="p-6 bg-gray-50 rounded-lg shadow-inner grid grid-cols-1 md:grid-cols-3 gap-4">
            <h3 class="text-lg font-semibold md:col-span-3">Nuevo Pasajero</h3>
            <div>
                <label for="p-nombre" class="block text-sm ...">Nombre:</label>
                <input type="text" id="p-nombre" required class="w-full mt-1 ...">
            </div>
            <div>
                <label for="p-apellido" class="block text-sm ...">Apellido:</label>
                <input type="text" id="p-apellido" required class="w-full mt-1 ...">
            </div>
            <div>
                <label for="p-documento" class="block text-sm ...">Documento Identidad:</label>
                <input type="text" id="p-documento" required class="w-full mt-1 ...">
            </div>
            <div class="md:col-span-3">
                <label for="p-nacimiento" class="block text-sm ...">Fecha Nacimiento:</label>
                <input type="date" id="p-nacimiento" required class="w-full mt-1 ...">
            </div>
            <div class="md:col-span-3">
                <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 ...">
                    Añadir Pasajero
                </button>
            </div>
        </form>

        <h3 class="text-xl font-semibold mt-6 mb-2">Pasajeros (${wizardState.pasajeros.length})</h3>
        <div id="pasajeros-list" class="mb-6">
            ${wizardState.pasajeros.length === 0 ? '<p class="text-gray-500">Añada al menos un pasajero.</p>' : ''}
            </div>

        <button id="btn-goto-step3" class="w-full bg-green-600 text-white py-3 px-4 text-lg rounded ...">
            Siguiente: Seleccionar Asientos
        </button>
    `;

    const listDiv = container.querySelector<HTMLDivElement>('#pasajeros-list')!;
    
    // Función para re-dibujar la lista de pasajeros
    const updatePasajerosList = () => {
        if (wizardState.pasajeros.length === 0) {
            listDiv.innerHTML = '<p class="text-gray-500">Añada al menos un pasajero.</p>';
        } else {
            listDiv.innerHTML = wizardState.pasajeros.map((p, index) => `
                <div class="bg-white shadow p-3 mb-2 rounded flex justify-between items-center">
                    <span><strong>${p.nombre} ${p.apellido}</strong> (${p.documento_identidad})</span>
                    <button class="btn-remove-pasajero text-red-500 hover:underline" data-index="${index}">Quitar</button>
                </div>
            `).join('');
        }
        
        // Activar/Desactivar botón "Siguiente"
        const nextButton = container.querySelector<HTMLButtonElement>('#btn-goto-step3')!;
        nextButton.disabled = wizardState.pasajeros.length === 0;
        nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';

        // Listeners para botones "Quitar"
        listDiv.querySelectorAll('.btn-remove-pasajero').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt((e.currentTarget as HTMLElement).dataset.index!);
                wizardState.pasajeros.splice(index, 1);
                updatePasajerosList();
            });
        });
    };

    updatePasajerosList(); // Renderizar la lista inicial

    // Listener para volver
    container.querySelector('#btn-back-step1')!.addEventListener('click', () => {
        renderStepSearch(container); // Vuelve al paso 1
    });
    
    // Listener para formulario "Añadir Pasajero"
    container.querySelector<HTMLFormElement>('#form-add-pasajero')!.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = e.currentTarget as HTMLFormElement;
        const pasajero = {
            nombre: (form.querySelector<HTMLInputElement>('#p-nombre')!).value,
            apellido: (form.querySelector<HTMLInputElement>('#p-apellido')!).value,
            documento_identidad: (form.querySelector<HTMLInputElement>('#p-documento')!).value,
            fecha_nacimiento: (form.querySelector<HTMLInputElement>('#p-nacimiento')!).value,
        };
        wizardState.pasajeros.push(pasajero);
        updatePasajerosList();
        form.reset();
    });

    // Listener para botón "Siguiente"
    container.querySelector('#btn-goto-step3')!.addEventListener('click', () => {
        if (wizardState.pasajeros.length > 0) {
            renderStepSeats(container); // Avanzar al Paso 3
        }
    });
}


// ----------------------------------------------------------------
// --- PASO 3: SELECCIONAR ASIENTOS ---
// ----------------------------------------------------------------
async function renderStepSeats(container: HTMLDivElement) {
    container.innerHTML = `
        <button id="btn-back-step2" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Pasajeros</button>
        <h2 class="text-2xl font-bold mb-4">Paso 3: Seleccionar Asientos</h2>
        
        <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <p><strong>Vuelo:</strong> ${wizardState.selectedVuelo.numero_vuelo}</p>
            <p>Debe seleccionar <strong>${wizardState.pasajeros.length}</strong> asiento(s).</p>
        </div>

        <div id="asientos-loading" class="text-center">Cargando asientos disponibles...</div>
        <div id="asientos-grid" class="grid grid-cols-6 gap-2 p-4 bg-gray-100 rounded-lg hidden">
            </div>

        <button id="btn-goto-step4" class="w-full bg-green-600 text-white py-3 px-4 text-lg rounded mt-6">
            Siguiente: Revisar Reserva
        </button>
    `;

    // Resetear asientos seleccionados si vuelven
    wizardState.selectedAsientos = []; 

    const loadingDiv = container.querySelector<HTMLDivElement>('#asientos-loading')!;
    const gridDiv = container.querySelector<HTMLDivElement>('#asientos-grid')!;
    const nextButton = container.querySelector<HTMLButtonElement>('#btn-goto-step4')!;
    
    // Función para actualizar estado del botón "Siguiente"
    const updateNextButtonState = () => {
        const needed = wizardState.pasajeros.length;
        const selected = wizardState.selectedAsientos.length;
        nextButton.disabled = selected !== needed;
        nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
        nextButton.textContent = `Siguiente: Revisar Reserva (${selected}/${needed})`;
    };

    updateNextButtonState();

    // Listener para volver
    container.querySelector('#btn-back-step2')!.addEventListener('click', () => {
        renderStepPassengers(container); // Vuelve al paso 2
    });
    
    // Listener para "Siguiente"
    container.querySelector('#btn-goto-step4')!.addEventListener('click', () => {
        if (wizardState.selectedAsientos.length === wizardState.pasajeros.length) {
            renderStepReview(container); // Avanzar al Paso 4
        }
    });

    // Cargar asientos
    const result = await getAsientosDisponibles(wizardState.selectedVuelo.id_vuelo);
    loadingDiv.classList.add('hidden');

    if (result.success && result.data.length > 0) {
        gridDiv.classList.remove('hidden');
        wizardState.disponibles = result.data; // Guardar en caché

        gridDiv.innerHTML = wizardState.disponibles.map(asiento => `
            <button class="btn-select-asiento p-3 bg-white border border-gray-300 rounded text-center hover:bg-blue-100" 
                    data-asiento-id="${asiento.id_asiento}">
                ${asiento.numero_asiento}
            </button>
        `).join('');

        // Listeners para botones de asiento
        gridDiv.querySelectorAll('.btn-select-asiento').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                const asientoId = parseInt(btn.dataset.asientoId!);
                const asiento = wizardState.disponibles.find(a => a.id_asiento === asientoId);
                const isSelected = wizardState.selectedAsientos.some(a => a.id_asiento === asientoId);
                
                if (isSelected) {
                    // Des-seleccionar
                    wizardState.selectedAsientos = wizardState.selectedAsientos.filter(a => a.id_asiento !== asientoId);
                    btn.classList.remove('bg-blue-600', 'text-white');
                    btn.classList.add('bg-white');
                } else {
                    // Seleccionar, si no hemos alcanzado el límite
                    if (wizardState.selectedAsientos.length < wizardState.pasajeros.length) {
                        wizardState.selectedAsientos.push(asiento);
                        btn.classList.add('bg-blue-600', 'text-white');
                        btn.classList.remove('bg-white');
                    } else {
                        alert(`Ya ha seleccionado el máximo de ${wizardState.pasajeros.length} asientos.`);
                    }
                }
                updateNextButtonState();
            });
        });

    } else if (result.success) {
        gridDiv.innerHTML = `<p class="col-span-6 text-center text-red-500">No hay asientos disponibles para este vuelo.</p>`;
        gridDiv.classList.remove('hidden');
    } else {
        gridDiv.innerHTML = `<p class="col-span-6 text-center text-red-500">${result.message}</p>`;
        gridDiv.classList.remove('hidden');
    }
}


// ----------------------------------------------------------------
// --- PASO 4: REVISAR Y CONFIRMAR ---
// ----------------------------------------------------------------
function renderStepReview(container: HTMLDivElement) {
    const vuelo = wizardState.selectedVuelo;
    const precioUnitario = parseFloat(vuelo.precio);
    const numPasajeros = wizardState.pasajeros.length;
    const precioTotal = (precioUnitario * numPasajeros).toFixed(2);

    container.innerHTML = `
        <button id="btn-back-step3" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Asientos</button>
        <h2 class="text-2xl font-bold mb-4">Paso 4: Revisar y Confirmar</h2>

        <div class="bg-white shadow-lg rounded-lg p-6">
            <div class="border-b pb-4 mb-4">
                <h3 class="text-xl font-semibold text-blue-700">Vuelo</h3>
                <p><strong>${vuelo.numero_vuelo}</strong> - ${vuelo.nombre_aerolinea}</p>
                <p>${vuelo.nombre_origen} &rarr; ${vuelo.nombre_destino}</p>
                <p><strong>Fecha:</strong> ${vuelo.fecha_salida}</p>
                <p><strong>Precio por pasajero:</strong> $ ${precioUnitario.toFixed(2)}</p>
            </div>

            <div class="border-b pb-4 mb-4">
                <h3 class="text-xl font-semibold text-blue-700">Pasajeros (${numPasajeros})</h3>
                <ul class="list-disc pl-5">
                    ${wizardState.pasajeros.map((p, index) => `
                        <li>
                            <strong>${p.nombre} ${p.apellido}</strong> 
                            (Asiento: ${wizardState.selectedAsientos[index]?.numero_asiento || 'N/A'})
                        </li>
                    `).join('')}
                </ul>
            </div>

            <div class="text-right">
                <div class="text-3xl font-bold text-green-600">
                    TOTAL: $ ${precioTotal}
                </div>
            </div>

            <button id="btn-confirmar-reserva" class="w-full bg-green-600 text-white py-3 px-4 text-lg rounded mt-6 font-bold ...">
                Confirmar Reserva
            </button>
            <p id="confirm-error" class="text-red-500 text-sm text-center mt-3"></p>
        </div>
    `;

    // Listener para volver
    container.querySelector('#btn-back-step3')!.addEventListener('click', () => {
        renderStepSeats(container); // Vuelve al paso 3
    });

    // Listener para Confirmar
    // Listener para Confirmar
    container.querySelector('#btn-confirmar-reserva')!.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const errorEl = container.querySelector<HTMLParagraphElement>('#confirm-error')!;
        
        btn.disabled = true;
        btn.textContent = 'Procesando...';
        errorEl.textContent = ''; // Limpiar errores previos

        // ... (definición del payload) ...
        const payload = {
            vuelos: [wizardState.selectedVuelo.id_vuelo],
            pasajeros: wizardState.pasajeros,
            asientos: wizardState.selectedAsientos.map(a => a.id_asiento)
        };

        const result = await crearReservaCompleta(payload);

        if (result.success) {
            renderStepSuccess(container, result.data.id_reserva);
        } else {
            errorEl.textContent = result.message ?? 'Ocurrió un error desconocido.';
            btn.disabled = false;
            btn.textContent = 'Confirmar Reserva';
        }
    });
}

// ----------------------------------------------------------------
// --- PASO 5: ÉXITO ---
// ----------------------------------------------------------------
function renderStepSuccess(container: HTMLDivElement, id_reserva: number) {
    container.innerHTML = `
        <div class="text-center p-10 bg-green-50 rounded-lg">
            <h2 class="text-3xl font-bold text-green-700 mb-4">¡Reserva Completada!</h2>
            <p class="text-lg text-gray-800">Su reserva se ha procesado exitosamente.</p>
            <p class="text-lg text-gray-800 mt-2">
                Su código de reserva es: 
                <strong class="text-2xl text-black">${id_reserva}</strong>
            </p>
            
            <p class="mt-6">El siguiente paso es proceder a la Compra de Billetes.</p>

            <button id="btn-nueva-reserva" class="bg-blue-600 text-white py-2 px-6 rounded mt-8">
                Hacer otra reserva
            </button>
        </div>
    `;

    container.querySelector('#btn-nueva-reserva')!.addEventListener('click', () => {
        renderReservaVuelos(container); // Reinicia el módulo
    });
}