const API_URL = 'http://localhost:5000/api';

/**
 * Obtiene los headers de autenticación.
 */
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Llama a: GET /api/reservas/mis-reservas
 * Obtiene las reservas del usuario que están pendientes de pago.
 */
export async function getMisReservasPendientes() {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer') || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }
        
        const response = await fetch(`${API_URL}/reservas/mis-reservas`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar las reservas');
        }
        return { success: true, data: data }; // data será un array de reservas

    } catch (error) {
        console.error('Error en billeteService.getMisReservasPendientes:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Llama a: GET /api/metodos-pago
 * Obtiene la lista de métodos de pago activos.
 */
export async function getMetodosPago() {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer') || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }
        
        const response = await fetch(`${API_URL}/metodos-pago`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar métodos de pago');
        }
        return { success: true, data: data }; // data será un array

    } catch (error) {
        console.error('Error en billeteService.getMetodosPago:', error);
        return { success: false, message: (error as Error).message };
    }
}

/**
 * Llama a: POST /api/billete/comprar
 * Envía la reserva, asientos y pago al orquestador de compra.
 */
export async function comprarBilletes(payload: {
    id_reserva: number;
    id_metodo_pago: number;
    asientos: number[]; // Array de IDs de asiento
}) {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization']?.includes('Bearer') || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }
        
        const response = await fetch(`${API_URL}/billete/comprar`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || data.details || 'Error al procesar la compra');
        }
        return { success: true, data: data }; // data será { message, id_reserva }

    } catch (error) {
        console.error('Error en billeteService.comprarBilletes:', error);
        return { success: false, message: (error as Error).message };
    }
}

export async function getMiHistorialDeCompras() {
    try {
        const headers = getAuthHeaders();
        if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado' };
        }

        const response = await fetch(`${API_URL}/billetes/mi-historial`, {
            method: 'GET',
            headers: headers
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Error al cargar el historial de compras');
        }
        return { success: true, data: data }; // data será un array de billetes

    } catch (error) {
        console.error('Error en billeteService.getMiHistorialDeCompras:', error);
        return { success: false, message: (error as Error).message };
    }
}