import { getMiHistorialDeCompras } from '../services/billeteService';

/**
 * Renderiza la pantalla del historial de compras.
 */
export async function renderHistorialCompras(container: HTMLDivElement) {
    container.innerHTML = `<p class="text-center text-gray-600">Cargando historial de compras...</p>`;

    const result = await getMiHistorialDeCompras();

    if (result.success) {
        const billetes = result.data;
        renderHistoryList(container, billetes);
    } else {
        container.innerHTML = `<p class="text-red-500 text-center">${result.message}</p>`;
         // Optionally redirect to login if unauthorized
        if (result.message && result.message.toLowerCase().includes('autorizado')) {
             // Asumiendo que tienes cerrarSesion importado o disponible globalmente
             // import { cerrarSesion } from '../services/authService';
             // setTimeout(() => cerrarSesion(), 2000);
        }
    }
}

/**
 * Renderiza la lista de billetes comprados.
 */
function renderHistoryList(container: HTMLDivElement, billetes: any[]) {
     container.innerHTML = `
        <div class="w-full max-w-4xl mx-auto"> <h2 class="text-2xl font-bold mb-6 text-gray-800">Mi Historial de Compras</h2>
            <div id="historial-list"></div>
        </div>
    `;

    const listDiv = container.querySelector<HTMLDivElement>('#historial-list')!;

    if (billetes.length === 0) {
        listDiv.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">No tiene compras registradas.</p>`;
        return;
    }

    listDiv.innerHTML = billetes.map((b: any) => `
        <div class="bg-white shadow rounded-lg p-4 mb-4 border border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-sm font-medium text-gray-500">Vuelo</p>
                    <p class="font-semibold text-blue-600">${b.nombre_aerolinea} ${b.numero_vuelo}</p>
                    <p class="text-gray-700">${b.ciudad_origen} &rarr; ${b.ciudad_destino}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-500">Salida</p>
                    <p class="text-gray-900">${new Date(b.fecha_salida).toLocaleDateString()} ${b.hora_salida}</p>
                    <p class="text-sm font-medium text-gray-500 mt-2">Asiento</p>
                    <p class="text-gray-900 font-mono">${b.numero_asiento}</p>
                </div>
                <div>
                    <p class="text-sm font-medium text-gray-500">Comprado el</p>
                    <p class="text-gray-900">${new Date(b.fecha_compra).toLocaleString()}</p>
                    <p class="text-sm font-medium text-gray-500 mt-2">Precio Pagado</p>
                    <p class="text-lg font-bold text-green-600">$ ${parseFloat(b.precio).toFixed(2)}</p>
                    <p class="text-xs text-gray-500 mt-1">Billete: ${b.numero_billete}</p>
                </div>
            </div>
        </div>
    `).join('');
}