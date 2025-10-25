// src/pages/consultaVuelos.ts

import { getCiudades, getAerolineas } from '../services/catalogService';
import { buscarVuelos, getVueloByNumeroVuelo } from '../services/vueloService';

// Caché para no llamar a los catálogos cada vez que se cambia de pestaña
let ciudadesCache: any[] = [];
let aerolineasCache: any[] = [];

/**
 * Renderiza la interfaz principal de Consulta de Vuelos (con pestañas)
 * @param container El elemento 'div#content-area' donde se dibujará.
 */
export async function renderConsultaVuelos(container: HTMLDivElement) {
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
        container.innerHTML = `<p class="text-red-500 text-center">No se pudieron cargar los catálogos. Verifique la conexión o los permisos.</p>`;
        return;
    }

    // Renderizar la estructura de pestañas
    container.innerHTML = `
    <div class="w-full max-w-4xl mx-auto">
        <div class="mb-4 border-b border-gray-200">
            <nav class="flex -mb-px" aria-label="Tabs">
                <button id="tab-buscar" class="w-1/2 md:w-auto py-4 px-6 text-center font-medium text-sm border-b-2 border-blue-500 text-blue-600">
                    Buscar Vuelos
                </button>
                <button id="tab-info" class="w-1/2 md:w-auto py-4 px-6 text-center font-medium text-sm border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
                    Información de Vuelo
                </button>
            </nav>
        </div>

        <div id="tab-content-buscar">
        </div>
        <div id="tab-content-info" class="hidden">
        </div>
        
        <div id="consulta-resultados" class="mt-6"></div>
    </div>
    `;

    // --- Selectores de Pestañas ---
    const tabBuscar = container.querySelector<HTMLButtonElement>('#tab-buscar')!;
    const tabInfo = container.querySelector<HTMLButtonElement>('#tab-info')!;
    const contentBuscar = container.querySelector<HTMLDivElement>('#tab-content-buscar')!;
    const contentInfo = container.querySelector<HTMLDivElement>('#tab-content-info')!;
    const resultadosDiv = container.querySelector<HTMLDivElement>('#consulta-resultados')!;
    
    // --- Lógica de Pestañas ---
    const setActiveTab = (tabName: 'buscar' | 'info') => {
        if (tabName === 'buscar') {
            tabBuscar.classList.add('border-blue-500', 'text-blue-600');
            tabBuscar.classList.remove('border-transparent', 'text-gray-500');
            tabInfo.classList.add('border-transparent', 'text-gray-500');
            tabInfo.classList.remove('border-blue-500', 'text-blue-600');
            contentBuscar.classList.remove('hidden');
            contentInfo.classList.add('hidden');
        } else {
            tabInfo.classList.add('border-blue-500', 'text-blue-600');
            tabInfo.classList.remove('border-transparent', 'text-gray-500');
            tabBuscar.classList.add('border-transparent', 'text-gray-500');
            tabBuscar.classList.remove('border-blue-500', 'text-blue-600');
            contentInfo.classList.remove('hidden');
            contentBuscar.classList.add('hidden');
        }
        // Limpiar resultados al cambiar de pestaña
        resultadosDiv.innerHTML = '';
    };

    tabBuscar.addEventListener('click', () => {
        setActiveTab('buscar');
        renderBuscarForm(contentBuscar, resultadosDiv); // Pasar el div de resultados
    });
    
    tabInfo.addEventListener('click', () => {
        setActiveTab('info');
        renderInfoForm(contentInfo, resultadosDiv); // Pasar el div de resultados
    });

    // Cargar la pestaña de búsqueda por defecto
    renderBuscarForm(contentBuscar, resultadosDiv);
}

/**
 * Renderiza el formulario de la Pestaña "Buscar Vuelos" (GET /api/vuelos)
 */
function renderBuscarForm(container: HTMLDivElement, resultadosDiv: HTMLDivElement) {
    // Generar las <option> para las ciudades
    // Se usa 'id_ciudad' que coincide con tu DB y el JSON esperado
    const opcionesCiudades = ciudadesCache.map(ciudad => 
        `<option value="${ciudad.id_ciudad}">${ciudad.nombre_ciudad} (${ciudad.pais})</option>`
    ).join('');

    // Generar las <option> para las aerolíneas
    const opcionesAerolineas = aerolineasCache.map(a => 
        `<option value="${a.id_aerolinea}">${a.nombre_aerolinea}</option>`
    ).join('');

    container.innerHTML = `
    <form id="consulta-form" class="p-6 bg-gray-50 rounded-lg shadow-inner">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div>
                <label for="origen" class="block text-sm font-medium text-gray-700">Origen:</label>
                <select id="origen" required 
                        class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Seleccione origen...</option>
                    ${opcionesCiudades}
                </select>
            </div>

            <div>
                <label for="destino" class="block text-sm font-medium text-gray-700">Destino:</label>
                <select id="destino" required 
                        class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Seleccione destino...</option>
                    ${opcionesCiudades}
                </select>
            </div>

            <div>
                <label for="fecha" class="block text-sm font-medium text-gray-700">Fecha:</label>
                <input type="date" id="fecha" required 
                       class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>

            <div>
                <label for="aerolinea" class="block text-sm font-medium text-gray-700">Aerolínea (Opcional):</label>
                <select id="aerolinea" 
                        class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">Todas</option>
                    ${opcionesAerolineas}
                </select>
            </div>

            <div class="md:col-span-2 lg:col-span-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por:
                </label>
                <div class="flex gap-4">
                    <label class="flex items-center">
                        <input type="radio" name="sortBy" value="precio_asc" 
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" checked>
                        <span class="ml-2">Tarifa (más barato)</span>
                    </label>
                    <label class="flex items-center">
                        <input type="radio" name="sortBy" value="hora_asc" 
                               class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                        <span class="ml-2">Horario (más temprano)</span>
                    </label>
                </div>
            </div>
        </div>
        
        <div class="mt-6">
            <button type="submit" 
                    class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                Buscar Vuelos
            </button>
        </div>
        <p id="buscar-error" class="text-red-500 text-sm text-center mt-3"></p>
    </form>
    `;

    // --- Lógica del formulario de Búsqueda ---
    const form = container.querySelector<HTMLFormElement>('#consulta-form')!;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorEl = container.querySelector<HTMLParagraphElement>('#buscar-error')!;
        const params: { [key: string]: string } = {};

        // Recolectar valores del formulario
        params.origen = (container.querySelector<HTMLSelectElement>('#origen')!).value;
        params.destino = (container.querySelector<HTMLSelectElement>('#destino')!).value;
        params.fecha = (container.querySelector<HTMLInputElement>('#fecha')!).value;
        params.sortBy = (container.querySelector<HTMLInputElement>('input[name="sortBy"]:checked')!).value;
        
        const aerolinea = (container.querySelector<HTMLSelectElement>('#aerolinea')!).value;
        if (aerolinea) {
            params.aerolinea_id = aerolinea;
        }

        // Validar que origen y destino no sean iguales (coincide con tu backend)
        if (params.origen === params.destino) {
            errorEl.textContent = 'La ciudad de origen y destino no pueden ser iguales.';
            return;
        }
        errorEl.textContent = ''; // Limpiar error

        // Llamar al servicio
        resultadosDiv.innerHTML = `<p class="text-center text-gray-600">Buscando vuelos...</p>`;
        const result = await buscarVuelos(params);

        if (result.success) {
            renderResultadosVuelos(resultadosDiv, result.data);
        } else {
            resultadosDiv.innerHTML = `<p class="text-red-500 text-sm text-center mt-3">${result.message}</p>`;
        }
    });
}

/**
 * Renderiza el formulario de la Pestaña "Información de Vuelo" (GET /api/vuelo/:id)
 */
function renderInfoForm(container: HTMLDivElement, resultadosDiv: HTMLDivElement) {
    container.innerHTML = `
    <form id="info-form" class="p-6 bg-gray-50 rounded-lg shadow-inner">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
                <label for="numero_vuelo" class="block text-sm font-medium text-gray-700">Número de Vuelo:</label>
                <input type="text" id="numero_vuelo" placeholder="Ingrese el número (ej: AV123)" required 
                       class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <div class="self-end">
                <button type="submit" 
                        class="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200">
                    Consultar Estado
                </button>
            </div>
        </div>
        <p id="info-error" class="text-red-500 text-sm text-center mt-3"></p>
    </form>
    `;

    // --- Lógica del formulario de Info ---
    const form = container.querySelector<HTMLFormElement>('#info-form')!;
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const numeroVuelo = (container.querySelector<HTMLInputElement>('#numero_vuelo')!).value;
        const errorEl = container.querySelector<HTMLParagraphElement>('#info-error')!;
        
        if (!numeroVuelo) {
            errorEl.textContent = 'Debe ingresar un número de vuelo.';
            return;
        }
        errorEl.textContent = '';

        resultadosDiv.innerHTML = `<p class="text-center text-gray-600">Consultando información...</p>`;

        // Usamos la función del servicio que busca por NÚMERO de vuelo
        const result = await getVueloByNumeroVuelo(numeroVuelo);

        if (result.success) {
            renderResultadoInfoVuelo(resultadosDiv, result.data);
        } else {
            resultadosDiv.innerHTML = `<p class="text-red-500 text-sm text-center mt-3">${result.message}</p>`;
        }
    });
}


/**
 * Renderiza la lista de tarjetas de resultados de búsqueda
 */
function renderResultadosVuelos(container: HTMLDivElement, vuelos: any[]) {
    if (vuelos.length === 0) {
        container.innerHTML = `<p class="text-center text-gray-600">No se encontraron vuelos con esos criterios.</p>`;
        return;
    }

    container.innerHTML = vuelos.map(vuelo => `
    <div class="bg-white shadow-md rounded-lg p-4 mb-4 flex flex-col md:flex-row justify-between md:items-center">
        <div class="mb-4 md:mb-0">
            <div class="font-bold text-lg text-blue-600">${vuelo.nombre_aerolinea}</div>
            <div class="text-sm text-gray-700">
                ${vuelo.nombre_origen} (${vuelo.numero_vuelo}) &rarr; ${vuelo.nombre_destino}
            </div>
            <div class="text-gray-900 font-semibold mt-2">
                Sale: ${vuelo.fecha_salida} a las ${vuelo.hora_salida}
            </div>
            <div class="text-gray-900 font-semibold">
                Llega: ${vuelo.fecha_llegada} a las ${vuelo.hora_llegada}
            </div>
        </div>
        <div class="text-left md:text-right">
            <div class="text-xl font-bold text-green-600">$ ${parseFloat(vuelo.precio).toFixed(2)}</div>
        </div>
    </div>
    `).join('');
}

/**
 * Renderiza la tarjeta de información de un solo vuelo (Estado)
 */
function renderResultadoInfoVuelo(container: HTMLDivElement, vuelo: any) {
    const horaSalida = new Date(`${vuelo.fecha_salida}T${vuelo.hora_salida}`);
    const ahora = new Date();
    let estado = '';
    let estadoColor = '';

    // Asumimos estado 'Activo' (1) o 'Inactivo' (2)
    if (vuelo.id_estado !== 1) {
         estado = 'Cancelado';
         estadoColor = 'text-red-600';
    } else if (ahora > horaSalida) {
        estado = 'Despegó';
        estadoColor = 'text-gray-500';
    } else if (horaSalida.getTime() - ahora.getTime() < 30 * 60 * 1000) { // Menos de 30 mins
        estado = 'Próximo a salir';
        estadoColor = 'text-yellow-600';
    } else {
        estado = 'En Hora';
        estadoColor = 'text-green-600';
    }
    
    container.innerHTML = `
    <div class="bg-white shadow-md rounded-lg p-6">
        <h3 class="text-xl font-bold mb-4">Estado del Vuelo: ${vuelo.numero_vuelo}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <div class="text-sm text-gray-500">Aerolínea</div>
                <div class="text-lg font-medium">${vuelo.nombre_aerolinea}</div>
            </div>
            <div>
                <div class="text-sm text-gray-500">Estado</div>
                <div class="text-lg font-semibold ${estadoColor}">${estado}</div>
            </div>
            <div>
                <div class="text-sm text-gray-500">Ruta</div>
                <div class="text-lg font-medium">
                    ${vuelo.nombre_origen} &rarr; ${vuelo.nombre_destino}
                </div>
            </div>
            <div>
                <div class="text-sm text-gray-500">Salida Programada</div>
                <div class="text-lg font-medium">
                    ${vuelo.fecha_salida} a las ${vuelo.hora_salida}
                </div>
            </div>
        </div>
    </div>
    `;
}