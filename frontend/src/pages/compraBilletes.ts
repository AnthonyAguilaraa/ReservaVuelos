// src/pages/compraBilletes.ts

import { getAsientosDisponibles } from '../services/vueloService';
import { getMisReservasPendientes, getMetodosPago, comprarBilletes, cancelarReserva } from '../services/billeteService'; // Importar cancelarReserva

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
        <div class="w-full max-w-4xl mx-auto"> <h2 class="text-2xl font-bold mb-4 text-gray-800">Paso 1: Seleccione una Reserva para Pagar</h2>
            <div id="reservas-list"></div>
        </div>
    `;

    const listDiv = container.querySelector<HTMLDivElement>('#reservas-list')!;

    if (reservas.length === 0) {
        listDiv.innerHTML = `<p class="text-center text-gray-600 p-4 bg-gray-50 rounded">No tiene reservas pendientes de pago.</p>`;
        return;
    }

    listDiv.innerHTML = reservas.map((r: any) => `
        <div class="bg-white shadow p-4 mb-3 rounded-lg flex flex-col md:flex-row justify-between md:items-center border border-gray-200">
            <div class="mb-3 md:mb-0">
                <div class="font-bold text-lg text-gray-800">Reserva #${r.id_reserva}</div>
                <div class="text-sm text-gray-600">
                    ${r.nombre_aerolinea} (${r.numero_vuelo}) | ${r.origen} &rarr; ${r.destino}
                </div>
                <div class="text-sm text-gray-600">
                    Pasajeros: ${r.num_pasajeros} | Total: <span class="font-semibold text-green-700">$ ${(parseFloat(r.precio) * r.num_pasajeros).toFixed(2)}</span>
                </div>
            </div>
            <button class="btn-select-reserva w-full md:w-auto bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200" data-reserva-json='${JSON.stringify(r)}'>
                Seleccionar Asientos y Pagar
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
// --- PASO 2: SELECCIONAR ASIENTOS (Modificado con botón Cancelar) ---
// ----------------------------------------------------------------
async function renderStepSeats(container: HTMLDivElement) {
    const reserva = compraState.selectedReserva;
    const numAsientosNecesarios = Number(reserva.num_pasajeros);
    const buttonClass = "py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200"; // Estilo base botón

    container.innerHTML = `
        <div class="w-full max-w-4xl mx-auto"> <button id="btn-back-step1" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Mis Reservas</button>
            <h2 class="text-2xl font-bold mb-4 text-gray-800">Paso 2: Seleccionar Asientos</h2>

            <div class="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                <p><strong>Reserva #${reserva.id_reserva}</strong> | Vuelo: ${reserva.numero_vuelo}</p>
                <p>Debe seleccionar <strong>${numAsientosNecesarios}</strong> asiento(s) para sus pasajeros.</p>
            </div>

            <div id="asientos-loading" class="text-center py-8">Cargando asientos disponibles...</div>
            <div id="asientos-container" class="bg-gray-100 rounded-lg hidden border border-gray-200">
                 <div id="asientos-grid" class="grid grid-cols-4 sm:grid-cols-6 gap-2 p-4">
                    {/* Asientos aquí */}
                 </div>
                 <div id="no-asientos-feedback" class="p-4 text-center hidden"></div>
            </div>

            <button id="btn-goto-step3" class="${buttonClass} w-full bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 text-lg mt-6">
                Siguiente: Método de Pago
            </button>
        </div>
    `;

    compraState.selectedAsientos = []; // Resetear asientos seleccionados

    const loadingDiv = container.querySelector<HTMLDivElement>('#asientos-loading')!;
    const asientosContainer = container.querySelector<HTMLDivElement>('#asientos-container')!; // Contenedor general
    const gridDiv = asientosContainer.querySelector<HTMLDivElement>('#asientos-grid')!;
    const noAsientosDiv = asientosContainer.querySelector<HTMLDivElement>('#no-asientos-feedback')!; // Div para mensaje y botón cancelar
    const nextButton = container.querySelector<HTMLButtonElement>('#btn-goto-step3')!;

    // Función para actualizar estado del botón "Siguiente"
    const updateNextButtonState = () => {
        const selected = compraState.selectedAsientos.length;
        nextButton.disabled = selected !== numAsientosNecesarios;
        nextButton.classList.toggle('opacity-50', nextButton.disabled); // Usar clase de opacidad de Tailwind
        nextButton.classList.toggle('cursor-not-allowed', nextButton.disabled);
        nextButton.textContent = `Siguiente: Método de Pago (${selected}/${numAsientosNecesarios})`;
    };
    updateNextButtonState(); // Inicializar estado del botón

    // Listener para volver al paso anterior
    container.querySelector('#btn-back-step1')!.addEventListener('click', () => {
        renderCompraBilletes(container); // Vuelve a cargar la lista de reservas
    });

    // Listener para el botón "Siguiente"
    nextButton.addEventListener('click', () => {
        if (compraState.selectedAsientos.length === numAsientosNecesarios) {
            renderStepPayment(container); // Avanzar al Paso 3
        }
    });

    // Cargar los asientos disponibles
    const result = await getAsientosDisponibles(Number(reserva.id_vuelo));
    loadingDiv.classList.add('hidden'); // Ocultar mensaje de carga
    asientosContainer.classList.remove('hidden'); // Mostrar contenedor

    if (result.success && result.data.length > 0) {
        // --- CASO: SÍ HAY ASIENTOS ---
        gridDiv.classList.remove('hidden'); // Mostrar grid
        noAsientosDiv.classList.add('hidden'); // Ocultar feedback de 'no asientos'
        compraState.disponibles = result.data; // Guardar asientos disponibles

        // Renderizar los botones de asiento
        gridDiv.innerHTML = compraState.disponibles.map((asiento: any) => `
            <button class="btn-select-asiento p-2 md:p-3 bg-white border border-gray-300 rounded text-center hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm md:text-base transition-colors duration-150"
                    data-asiento-id="${asiento.id_asiento}">
                ${asiento.numero_asiento}
            </button>
        `).join('');

        // Añadir listeners a los botones de asiento
        gridDiv.querySelectorAll('.btn-select-asiento').forEach(button => {
            button.addEventListener('click', (e) => {
                 const btn = e.currentTarget as HTMLButtonElement;
                const asientoId = parseInt(btn.dataset.asientoId!);
                const asiento = compraState.disponibles.find(a => a.id_asiento === asientoId);
                const isSelected = compraState.selectedAsientos.some((a:any) => a.id_asiento === asientoId);

                if (isSelected) {
                    // Des-seleccionar
                    compraState.selectedAsientos = compraState.selectedAsientos.filter((a:any) => a.id_asiento !== asientoId);
                    btn.classList.remove('bg-blue-600', 'text-white', 'border-blue-700'); // Quitar estilos de seleccionado
                    btn.classList.add('bg-white', 'border-gray-300'); // Volver a estilos por defecto
                } else {
                    // Seleccionar
                    if (compraState.selectedAsientos.length < numAsientosNecesarios) {
                        compraState.selectedAsientos.push(asiento);
                        btn.classList.add('bg-blue-600', 'text-white', 'border-blue-700'); // Añadir estilos de seleccionado
                        btn.classList.remove('bg-white', 'border-gray-300');
                    } else {
                        alert(`Ya ha seleccionado el máximo de ${numAsientosNecesarios} asientos.`);
                    }
                }
                updateNextButtonState();
            });
        });

    } else {
        // --- CASO: NO HAY ASIENTOS o ERROR ---
        gridDiv.classList.add('hidden'); // Ocultar grid
        noAsientosDiv.classList.remove('hidden'); // Mostrar div de feedback
        nextButton.disabled = true; // Deshabilitar botón "Siguiente"
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');

        if (result.success && result.data.length === 0) {
            // --- INICIO DE CAMBIOS: Añadir botón Cancelar ---
            // Mostrar mensaje y botón de cancelar
            noAsientosDiv.innerHTML = `
                <p class="text-center text-red-600 font-semibold mb-4">No quedan asientos disponibles para este vuelo.</p>
                <button id="btn-cancelar-reserva" class="${buttonClass} w-auto mx-auto bg-red-600 text-white hover:bg-red-700 focus:ring-red-500">
                    Cancelar esta Reserva
                </button>
                <p id="cancel-feedback" class="text-sm text-center mt-2 h-5"></p>
            `;

            // Añadir listener al botón de cancelar
            const cancelButton = noAsientosDiv.querySelector<HTMLButtonElement>('#btn-cancelar-reserva')!;
            const cancelFeedbackEl = noAsientosDiv.querySelector<HTMLParagraphElement>('#cancel-feedback')!;

            cancelButton.addEventListener('click', async () => {
                if (confirm(`¿Está seguro de que desea cancelar la Reserva #${reserva.id_reserva}? Esta acción no se puede deshacer.`)) {
                    cancelButton.disabled = true;
                    cancelButton.textContent = 'Cancelando...';
                    cancelFeedbackEl.textContent = '';
                    cancelFeedbackEl.className = 'text-sm text-center mt-2 h-5';


                    const cancelResult = await cancelarReserva(Number(reserva.id_reserva));

                    if (cancelResult.success) {
                        cancelFeedbackEl.textContent = 'Reserva cancelada con éxito. Volviendo a la lista...';
                        cancelFeedbackEl.className = 'text-sm text-center mt-2 h-5 text-green-600';
                        // Esperar un poco y recargar la lista de reservas
                        setTimeout(() => {
                            renderCompraBilletes(container);
                        }, 2000);
                    } else {
                        cancelFeedbackEl.textContent = `Error al cancelar: ${cancelResult.message}`;
                         cancelFeedbackEl.className = 'text-sm text-center mt-2 h-5 text-red-600';
                        cancelButton.disabled = false;
                        cancelButton.textContent = 'Cancelar esta Reserva';
                    }
                }
            });
            // --- FIN DE CAMBIOS ---
        } else {
            // Error al cargar asientos
            noAsientosDiv.innerHTML = `<p class="col-span-full text-center text-red-600 py-4">Error al cargar asientos: ${result.message}</p>`;
        }
    }
}


// --- FUNCIONES HELPER PARA FORMULARIO DINÁMICO ---

/**
 * Devuelve el HTML para los campos de Tarjeta de Crédito.
 */
function getCardFieldsHTML(): string {
    const inputClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    return `
        <div>
            <label for="card_number" class="block text-sm font-medium text-gray-700">Número de Tarjeta:</label>
            <input type="text" id="card_number" placeholder="0000 0000 0000 0000" required inputmode="numeric" pattern="[0-9\\s]{13,19}" autocomplete="cc-number" class="${inputClass}">
        </div>
        <div>
            <label for="card_expiry" class="block text-sm font-medium text-gray-700">Vencimiento (MM/AA):</label>
            <input type="text" id="card_expiry" placeholder="MM/AA" required pattern="(0[1-9]|1[0-2])\\/([0-9]{2})" autocomplete="cc-exp" class="${inputClass}">
        </div>
        <div>
            <label for="card_cvc" class="block text-sm font-medium text-gray-700">CVC:</label>
            <input type="text" id="card_cvc" placeholder="123" required pattern="[0-9]{3,4}" inputmode="numeric" autocomplete="cc-csc" class="${inputClass}">
        </div>
    `;
}

/**
 * Devuelve el HTML para el campo de Transferencia.
 */
function getTransferFieldsHTML(): string {
    const inputClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    return `
        <div class="md:col-span-2">
            <label for="comprobante" class="block text-sm font-medium text-gray-700">Número de Comprobante:</label>
            <input type="text" id="comprobante" placeholder="Ingrese el N° de transacción/referencia" required class="${inputClass}">
            <p class="text-xs text-gray-500 mt-2">
                Por favor, realice la transferencia bancaria correspondiente y luego ingrese el número de comprobante o referencia de la transacción para que podamos verificar su pago.
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
            <h4 class="font-bold text-yellow-800">Pago en Efectivo</h4>
            <p class="text-sm text-gray-700 mt-1">
                Su reserva será confirmada. Para emitir sus billetes, por favor acérquese a la ventanilla de la aerolínea en el aeropuerto
                para realizar el pago en efectivo al menos <strong>2 horas antes</strong> de la salida de su vuelo.
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
    const selectClass = "w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const buttonClass = "w-full bg-green-600 text-white py-3 px-4 text-lg rounded font-bold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200";

    // Opciones para el <select> de métodos de pago
    const opcionesPago = compraState.metodosPago.map((mp: any) =>
        // Almacenamos el nombre en data-nombre para facilitar la lógica
        `<option value="${mp.id_metodo}" data-nombre="${mp.nombre_metodo}">${mp.nombre_metodo}</option>`
    ).join('');

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto"> <button id="btn-back-step2" class="mb-4 text-blue-600 hover:underline">&larr; Volver a Asientos</button>
        <h2 class="text-2xl font-bold mb-4 text-gray-800">Paso 3: Realizar Pago</h2>

        <div class="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
            <div class="border-b border-gray-200 pb-4 mb-4">
                <h3 class="text-xl font-semibold text-blue-700">Resumen de Compra</h3>
                <p><strong>Reserva #${reserva.id_reserva}</strong> | Vuelo: ${reserva.numero_vuelo}</p>
                <p><strong>Pasajeros:</strong> ${reserva.num_pasajeros}</p>
                <p><strong>Asientos:</strong> ${compraState.selectedAsientos.map((a:any) => a.numero_asiento).join(', ')}</p>
                <div class="text-3xl font-bold text-green-700 mt-4 text-right">
                    TOTAL A PAGAR: $ ${precioTotal}
                </div>
            </div>

            <form id="form-payment">
                <div class="mb-4">
                    <label for="metodo_pago" class="block text-sm font-medium text-gray-700">Seleccione Método de Pago:</label>
                    <select id="metodo_pago" required class="${selectClass}">
                        ${opcionesPago}
                    </select>
                </div>

                <div id="dynamic-payment-fields" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                    </div>

                <div class="mt-6">
                    <button type="submit" id="btn-confirmar-pago" class="${buttonClass}">
                        Confirmar y Pagar
                    </button>
                    <p id="payment-error" class="text-sm text-center mt-3 h-5 text-red-600"></p> </div>
            </form>
        </div>
      </div> `;

    // --- LÓGICA DINÁMICA ---

    const selectMetodoPago = container.querySelector<HTMLSelectElement>('#metodo_pago')!;
    const dynamicFieldsContainer = container.querySelector<HTMLDivElement>('#dynamic-payment-fields')!;
    const paymentForm = container.querySelector<HTMLFormElement>('#form-payment')!;
    const confirmButton = paymentForm.querySelector<HTMLButtonElement>('#btn-confirmar-pago')!;
    const errorEl = paymentForm.querySelector<HTMLParagraphElement>('#payment-error')!;


    // Función para actualizar el formulario según el método seleccionado
    const updatePaymentForm = () => {
        const selectedOption = selectMetodoPago.options[selectMetodoPago.selectedIndex];
        // Usamos trim() y toLowerCase() para comparar sin importar espacios o mayúsculas
        const nombreMetodo = selectedOption.dataset.nombre?.trim().toLowerCase() || '';

        // Limpiar campos y errores anteriores
        dynamicFieldsContainer.innerHTML = '';
        errorEl.textContent = '';

        // Mostrar los campos correspondientes
        if (nombreMetodo.includes('tarjeta')) { // Acepta "Tarjeta de Crédito", "tarjeta", etc.
            dynamicFieldsContainer.innerHTML = getCardFieldsHTML();
            confirmButton.textContent = 'Confirmar y Pagar'; // Texto estándar para pago inmediato
        } else if (nombreMetodo.includes('transferencia')) {
            dynamicFieldsContainer.innerHTML = getTransferFieldsHTML();
            confirmButton.textContent = 'Confirmar con Transferencia'; // Texto diferente
        } else if (nombreMetodo.includes('efectivo')) {
            dynamicFieldsContainer.innerHTML = getCashFieldsHTML();
            confirmButton.textContent = 'Confirmar Reserva (Pago en Aeropuerto)'; // Texto diferente
        } else {
            // Caso por defecto (si hay métodos desconocidos), mostramos tarjeta
            dynamicFieldsContainer.innerHTML = getCardFieldsHTML();
             confirmButton.textContent = 'Confirmar y Pagar';
        }
    };

    // Listener para cuando el usuario cambia el método de pago
    selectMetodoPago.addEventListener('change', updatePaymentForm);

    // Cargar el formulario por defecto al inicio
    updatePaymentForm();


    // Listener para volver al paso anterior
    container.querySelector('#btn-back-step2')!.addEventListener('click', () => {
        renderStepSeats(container); // Vuelve al paso 2 (selección de asientos)
    });

    // Listener para el envío del formulario de pago
    paymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        confirmButton.disabled = true;
        confirmButton.textContent = 'Procesando Pago...';
        errorEl.textContent = '';

        // Validación simple del lado del cliente según el método
        const selectedOption = selectMetodoPago.options[selectMetodoPago.selectedIndex];
        const nombreMetodo = selectedOption.dataset.nombre?.trim().toLowerCase() || '';
        let valid = true;

        if (nombreMetodo.includes('tarjeta')) {
            const cardNum = container.querySelector<HTMLInputElement>('#card_number')?.value;
            const cardExp = container.querySelector<HTMLInputElement>('#card_expiry')?.value;
            const cardCvc = container.querySelector<HTMLInputElement>('#card_cvc')?.value;
            // Validación muy básica (longitud, presencia). Usar librerías para validación real.
            if (!cardNum || !cardExp || !cardCvc || cardNum.length < 15 || cardCvc.length < 3 || !/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(cardExp) ) {
                valid = false;
                errorEl.textContent = 'Por favor, complete los datos de la tarjeta correctamente.';
            }
        } else if (nombreMetodo.includes('transferencia')) {
            const comprobante = container.querySelector<HTMLInputElement>('#comprobante')?.value;
            if (!comprobante || comprobante.trim().length < 4) { // Requiere al menos 4 caracteres
                valid = false;
                errorEl.textContent = 'Debe ingresar un número de comprobante válido.';
            }
        }
        // No se requiere validación extra para 'Efectivo' en el frontend

        if (!valid) {
            confirmButton.disabled = false;
            // Restaurar texto original del botón
             updatePaymentForm(); // Llama a esto para resetear el texto del botón
            return; // Detener si la validación falla
        }

        // Preparar datos para enviar al backend
        const payload = {
            id_reserva: Number(compraState.selectedReserva.id_reserva),
            id_metodo_pago: parseInt(selectMetodoPago.value),
            asientos: compraState.selectedAsientos.map((a:any) => Number(a.id_asiento))
        };

        // Llamar al servicio de compra
        const result = await comprarBilletes(payload);

        if (result.success) {
            renderStepSuccess(container, result.data.id_reserva); // Ir a la pantalla de éxito
        } else {
            // Mostrar error del backend (ej: "El asiento X ya no está disponible")
            errorEl.textContent = result.message ?? 'Ocurrió un error desconocido.';
            confirmButton.disabled = false;
            updatePaymentForm(); // Restaurar texto del botón
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
            <h2 class="text-3xl font-bold text-green-700 mb-4">¡Compra Completada!</h2>
            <p class="text-lg text-gray-800">Su pago ha sido procesado y sus billetes han sido emitidos.</p>
            <p class="text-lg text-gray-800 mt-2">
                Referencia de Reserva:
                <strong class="text-2xl text-black font-mono">${id_reserva}</strong>
            </p>
            <p class="text-sm text-gray-600 mt-4">Puede ver sus billetes en la sección "Mi Historial".</p>

            <button id="btn-ver-historial" class="${buttonClass} mt-8">
                Ver Mi Historial de Compras
            </button>
        </div>
      </div> `;

    // Botón para ir al historial (simula clic en el botón del dashboard)
    container.querySelector('#btn-ver-historial')!.addEventListener('click', () => {
         const historialButton = document.getElementById('btn-historial');
         historialButton?.click(); // Esto activará el listener en dashboard.ts
    });
}