// src/pages/compraBilletes.ts

import { getAsientosDisponibles } from '../services/vueloService';
import { getMisReservasPendientes, getMetodosPago, comprarBilletes } from '../services/billeteService';

// --- Estado del Módulo de Compra ---
let compraState = {
    selectedReserva: null as any | null,
    selectedAsientos: [] as any[],
    disponibles: [] as any[], // Caché de asientos
    metodosPago: [] as any[], // Caché de métodos de pago
};

/**
 * Punto de entrada principal para el módulo de Compra de Billetes.
 */
export async function renderCompraBilletes(container: HTMLDivElement) {
    // Reseteamos el estado
    compraState = {
        selectedReserva: null,
        selectedAsientos: [],
        disponibles: [],
        metodosPago: [],
    };

    container.innerHTML = `<p class="text-center text-gray-600">Cargando...</p>`; // Mensaje genérico

    // Cargar métodos de pago una vez
    try {
        const result = await getMetodosPago();
        if (result.success) {
            compraState.metodosPago = result.data;
        } else {
            container.innerHTML = `<p class="text-center text-red-500">Error al cargar métodos de pago: ${result.message}</p>`;
            return;
        }
    } catch (e) {
         container.innerHTML = `<p class="text-center text-red-500">Error fatal al cargar métodos de pago.</p>`;
         return;
    }

    // Cargar reservas pendientes
    container.innerHTML = `<p class="text-center text-gray-600">Cargando reservas pendientes...</p>`;
    const resultReservas = await getMisReservasPendientes();
    if (resultReservas.success) {
        renderStepListReservas(container, resultReservas.data);
    } else {
        container.innerHTML = `<p class="text-center text-red-500">Error al cargar reservas: ${resultReservas.message}</p>`;
    }
}

// ----------------------------------------------------------------
// --- PASO 1: LISTAR RESERVAS PENDIENTES ---
// ----------------------------------------------------------------
function renderStepListReservas(container: HTMLDivElement, reservas: any[]) {
    container.innerHTML = `
        <h2 class="text-2xl font-bold mb-4">Paso 1: Seleccione una Reserva para Pagar</h2>
        <div id="reservas-list"></div>
    `;

    const listDiv = container.querySelector<HTMLDivElement>('#reservas-list')!;

    if (reservas.length === 0) {
        listDiv.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">No tiene reservas pendientes de pago.</p>`;
        return;
    }

    listDiv.innerHTML = reservas.map((r: any) => `
        <div class="bg-white shadow p-4 mb-3 rounded-lg flex flex-col md:flex-row justify-between md:items-center">
            <div class="mb-3 md:mb-0">
                <div class="font-bold">Reserva #${r.id_reserva}</div>
                <div class="text-sm text-gray-700">
                    ${r.nombre_aerolinea} (${r.numero_vuelo}) | ${r.origen} &rarr; ${r.destino}
                </div>
                <div class="text-sm text-gray-700">
                    Pasajeros: ${r.num_pasajeros} | Total: $ ${(parseFloat(r.precio) * r.num_pasajeros).toFixed(2)}
                </div>
            </div>
            <button class="btn-select-reserva w-full md:w-auto bg-green-600 text-white py-2 px-4 rounded" data-reserva-json='${JSON.stringify(r)}'>
                Pagar Ahora
            </button>
        </div>
    `).join('');

    // Listeners para botones "Pagar Ahora"
    listDiv.querySelectorAll('.btn-select-reserva').forEach(button => {
        button.addEventListener('click', (ev) => {
            const reservaData = JSON.parse((ev.currentTarget as HTMLElement).dataset.reservaJson!);
            compraState.selectedReserva = reservaData;
            renderStepSeats(container); // Avanzar al Paso 2 (Selección de Asientos)
        });
    });
}

// ----------------------------------------------------------------
// --- PASO 2: SELECCIONAR ASIENTOS ---
// ----------------------------------------------------------------
async function renderStepSeats(container: HTMLDivElement) {
    const reserva = compraState.selectedReserva;
    const numAsientosNecesarios = Number(reserva.num_pasajeros);

    container.innerHTML = `
        <button id="btn-back-step1" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Mis Reservas</button>
        <h2 class="text-2xl font-bold mb-4">Paso 2: Seleccionar Asientos</h2>

        <div class="bg-blue-50 p-4 rounded-lg mb-4">
            <p><strong>Reserva #${reserva.id_reserva}</strong> | Vuelo: ${reserva.numero_vuelo}</p>
            <p>Debe seleccionar <strong>${numAsientosNecesarios}</strong> asiento(s) para sus pasajeros.</p>
        </div>

        <div id="asientos-loading" class="text-center">Cargando asientos disponibles...</div>
        <div id="asientos-grid" class="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4 bg-gray-100 rounded-lg hidden">
            </div>

        <button id="btn-goto-step3" class="w-full bg-green-600 text-white py-3 px-4 text-lg rounded mt-6">
            Siguiente: Método de Pago
        </button>
    `;

    compraState.selectedAsientos = []; // Resetear

    const loadingDiv = container.querySelector<HTMLDivElement>('#asientos-loading')!;
    const gridDiv = container.querySelector<HTMLDivElement>('#asientos-grid')!;
    const nextButton = container.querySelector<HTMLButtonElement>('#btn-goto-step3')!;

    const updateNextButtonState = () => {
        const selected = compraState.selectedAsientos.length;
        nextButton.disabled = selected !== numAsientosNecesarios;
        nextButton.style.opacity = nextButton.disabled ? '0.5' : '1';
        nextButton.textContent = `Siguiente: Método de Pago (${selected}/${numAsientosNecesarios})`;
    };
    updateNextButtonState();

    // Listener para volver
    container.querySelector('#btn-back-step1')!.addEventListener('click', () => {
        // Recargar la lista de reservas
        renderCompraBilletes(container);
    });

    // Listener para "Siguiente"
    nextButton.addEventListener('click', () => {
        if (compraState.selectedAsientos.length === numAsientosNecesarios) {
            renderStepPayment(container); // Avanzar al Paso 3
        }
    });

    // Cargar asientos
    const result = await getAsientosDisponibles(Number(reserva.id_vuelo));
    loadingDiv.classList.add('hidden');

    if (result.success && result.data.length > 0) {
        gridDiv.classList.remove('hidden');
        compraState.disponibles = result.data;

        gridDiv.innerHTML = compraState.disponibles.map((asiento: any) => `
            <button class="btn-select-asiento p-2 md:p-3 bg-white border border-gray-300 rounded text-center hover:bg-blue-100 text-sm md:text-base"
                    data-asiento-id="${asiento.id_asiento}">
                ${asiento.numero_asiento}
            </button>
        `).join('');

        // Listeners para botones de asiento
        gridDiv.querySelectorAll('.btn-select-asiento').forEach(button => {
            button.addEventListener('click', (e) => {
                const btn = e.currentTarget as HTMLButtonElement;
                const asientoId = parseInt(btn.dataset.asientoId!);
                const asiento = compraState.disponibles.find(a => a.id_asiento === asientoId);
                const isSelected = compraState.selectedAsientos.some((a:any) => a.id_asiento === asientoId);

                if (isSelected) {
                    // Des-seleccionar
                    compraState.selectedAsientos = compraState.selectedAsientos.filter((a:any) => a.id_asiento !== asientoId);
                    btn.classList.remove('bg-blue-600', 'text-white');
                    btn.classList.add('bg-white');
                } else {
                    // Seleccionar
                    if (compraState.selectedAsientos.length < numAsientosNecesarios) {
                        compraState.selectedAsientos.push(asiento);
                        btn.classList.add('bg-blue-600', 'text-white');
                        btn.classList.remove('bg-white');
                    } else {
                        alert(`Ya ha seleccionado el máximo de ${numAsientosNecesarios} asientos.`);
                    }
                }
                updateNextButtonState();
            });
        });

    } else {
        gridDiv.innerHTML = `<p class="col-span-full text-center text-red-500">${result.success ? 'No hay asientos disponibles' : result.message}</p>`;
        gridDiv.classList.remove('hidden');
        nextButton.disabled = true; // No se puede continuar
        nextButton.style.opacity = '0.5';
    }
}


// --- NUEVAS FUNCIONES HELPER ---

/**
 * Devuelve el HTML para los campos de Tarjeta de Crédito.
 */
function getCardFieldsHTML(): string {
    return `
        <div>
            <label for="card_number" class="block text-sm font-medium text-gray-700">Número de Tarjeta:</label>
            <input type="text" id="card_number" placeholder="0000 0000 0000 0000" required
                   class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
            <label for="card_expiry" class="block text-sm font-medium text-gray-700">Vencimiento (MM/AA):</label>
            <input type="text" id="card_expiry" placeholder="MM/AA" required
                   class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
        <div>
            <label for="card_cvc" class="block text-sm font-medium text-gray-700">CVC:</label>
            <input type="text" id="card_cvc" placeholder="123" required pattern="[0-9]{3,4}"
                   class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        </div>
    `;
}

/**
 * Devuelve el HTML para el campo de Transferencia.
 */
function getTransferFieldsHTML(): string {
    return `
        <div class="md:col-span-2">
            <label for="comprobante" class="block text-sm font-medium text-gray-700">Número de Comprobante:</label>
            <input type="text" id="comprobante" placeholder="Ingrese el N° de transacción" required
                   class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <p class="text-sm text-gray-500 mt-2">
                Por favor, realice la transferencia y luego ingrese el número de comprobante/referencia para confirmar.
            </p>
        </div>
    `;
}

/**
 * Devuelve el HTML para el mensaje de Efectivo.
 */
function getCashFieldsHTML(): string {
    return `
        <div class="md:col-span-2 p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <h4 class="font-bold">Pago en Efectivo</h4>
            <p class="text-sm text-gray-700">
                Su reserva será confirmada. Por favor, acérquese a la ventanilla del aeropuerto para realizar el pago
                al menos 2 horas antes de su vuelo.
            </p>
        </div>
    `;
}

// ----------------------------------------------------------------
// --- PASO 3: MÉTODO DE PAGO ---
// ----------------------------------------------------------------
function renderStepPayment(container: HTMLDivElement) {
    const reserva = compraState.selectedReserva;
    const precioTotal = (parseFloat(reserva.precio) * reserva.num_pasajeros).toFixed(2);

    // Opciones para el <select> de métodos de pago
    const opcionesPago = compraState.metodosPago.map((mp: any) =>
        `<option value="${mp.id_metodo}" data-nombre="${mp.nombre_metodo}">${mp.nombre_metodo}</option>`
    ).join('');

    container.innerHTML = `
        <button id="btn-back-step2" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Asientos</button>
        <h2 class="text-2xl font-bold mb-4">Paso 3: Realizar Pago</h2>

        <div class="bg-white shadow-lg rounded-lg p-6">
            <div class="border-b pb-4 mb-4">
                <h3 class="text-xl font-semibold text-blue-700">Resumen de Compra</h3>
                <p><strong>Reserva #${reserva.id_reserva}</strong> | Vuelo: ${reserva.numero_vuelo}</p>
                <p><strong>Pasajeros:</strong> ${reserva.num_pasajeros}</p>
                <p><strong>Asientos:</strong> ${compraState.selectedAsientos.map((a:any) => a.numero_asiento).join(', ')}</p>
                <div class="text-3xl font-bold text-green-600 mt-4 text-right">
                    TOTAL: $ ${precioTotal}
                </div>
            </div>

            <form id="form-payment">
                <div>
                    <label for="metodo_pago" class="block text-sm font-medium text-gray-700">Método de Pago:</label>
                    <select id="metodo_pago" required class="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                        ${opcionesPago}
                    </select>
                </div>

                <div id="dynamic-payment-fields" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    </div>

                <div class="mt-6">
                    <button type="submit" id="btn-confirmar-pago" class="w-full bg-green-600 text-white py-3 px-4 text-lg rounded font-bold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200">
                        Confirmar y Pagar
                    </button>
                    <p id="payment-error" class="text-red-500 text-sm text-center mt-3"></p>
                </div>
            </form>
        </div>
    `;

    // --- LÓGICA DINÁMICA ---

    const selectMetodoPago = container.querySelector<HTMLSelectElement>('#metodo_pago')!;
    const dynamicFieldsContainer = container.querySelector<HTMLDivElement>('#dynamic-payment-fields')!;

    // Función para actualizar el formulario
    const updatePaymentForm = () => {
        const selectedOption = selectMetodoPago.options[selectMetodoPago.selectedIndex];
        const nombreMetodo = selectedOption.dataset.nombre?.toLowerCase() || '';

        if (nombreMetodo.includes('tarjeta')) {
            dynamicFieldsContainer.innerHTML = getCardFieldsHTML();
        } else if (nombreMetodo.includes('transferencia')) {
            dynamicFieldsContainer.innerHTML = getTransferFieldsHTML();
        } else if (nombreMetodo.includes('efectivo')) {
            dynamicFieldsContainer.innerHTML = getCashFieldsHTML();
        } else {
            dynamicFieldsContainer.innerHTML = getCardFieldsHTML(); // Default to card
        }
    };

    // Listener para cuando el usuario cambia el método de pago
    selectMetodoPago.addEventListener('change', updatePaymentForm);

    // Cargar el formulario por defecto
    updatePaymentForm();


    // Listener para volver
    container.querySelector('#btn-back-step2')!.addEventListener('click', () => {
        renderStepSeats(container); // Vuelve al paso 2
    });

    // Listener para el formulario de pago
    container.querySelector('#form-payment')!.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = container.querySelector<HTMLButtonElement>('#btn-confirmar-pago')!;
        const errorEl = container.querySelector<HTMLParagraphElement>('#payment-error')!;
        btn.disabled = true;
        btn.textContent = 'Procesando Pago...';
        errorEl.textContent = '';

        // Validación simple del lado del cliente
        const selectedOption = selectMetodoPago.options[selectMetodoPago.selectedIndex];
        const nombreMetodo = selectedOption.dataset.nombre?.toLowerCase() || '';
        let valid = true;

        if (nombreMetodo.includes('tarjeta')) {
            const cardNum = container.querySelector<HTMLInputElement>('#card_number')?.value;
            const cardExp = container.querySelector<HTMLInputElement>('#card_expiry')?.value;
            const cardCvc = container.querySelector<HTMLInputElement>('#card_cvc')?.value;
            // Simple check - you'd use a library like Stripe.js for real validation
            if (!cardNum || !cardExp || !cardCvc || cardNum.length < 15 || cardCvc.length < 3) {
                valid = false;
                errorEl.textContent = 'Por favor, complete los datos de la tarjeta correctamente.';
            }
        } else if (nombreMetodo.includes('transferencia')) {
            const comprobante = container.querySelector<HTMLInputElement>('#comprobante')?.value;
            if (!comprobante) {
                valid = false;
                errorEl.textContent = 'Debe ingresar el número de comprobante.';
            }
        }
        // No validation needed for cash

        if (!valid) {
            btn.disabled = false;
            btn.textContent = 'Confirmar y Pagar';
            return; // Stop if validation fails
        }

        const payload = {
            id_reserva: Number(compraState.selectedReserva.id_reserva),
            id_metodo_pago: parseInt(selectMetodoPago.value),
            asientos: compraState.selectedAsientos.map((a:any) => Number(a.id_asiento))
        };

        const result = await comprarBilletes(payload);

        if (result.success) {
            renderStepSuccess(container, result.data.id_reserva);
        } else {
            // Error (e.g., seat no longer available)
            errorEl.textContent = result.message ?? 'Ocurrió un error desconocido.';
            btn.disabled = false;
            btn.textContent = 'Confirmar y Pagar';
        }
    });
}

// ----------------------------------------------------------------
// --- PASO 4: ÉXITO ---
// ----------------------------------------------------------------
function renderStepSuccess(container: HTMLDivElement, id_reserva: number) {
    container.innerHTML = `
        <div class="text-center p-10 bg-green-50 rounded-lg">
            <h2 class="text-3xl font-bold text-green-700 mb-4">¡Compra Completada!</h2>
            <p class="text-lg text-gray-800">Su pago ha sido procesado y sus billetes han sido emitidos.</p>
            <p class="text-lg text-gray-800 mt-2">
                Referencia de Reserva:
                <strong class="text-2xl text-black">${id_reserva}</strong>
            </p>

            <button id="btn-ver-reservas" class="bg-blue-600 text-white py-2 px-6 rounded mt-8 hover:bg-blue-700 transition duration-200">
                Volver a Mis Reservas
            </button>
        </div>
    `;

    container.querySelector('#btn-ver-reservas')!.addEventListener('click', () => {
        renderCompraBilletes(container); // Reinicia el módulo
    });
}