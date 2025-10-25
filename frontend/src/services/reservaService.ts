const API_URL = 'http://localhost:5000/api';

/**
 * Obtiene los headers de autenticación.
 * --- CORRECCIÓN AQUÍ ---
 * Cambiamos el tipo de retorno de 'HeadersInit' a 'Record<string, string>'
 * para que TypeScript sepa que es un objeto indexable.
 */
function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    
    // Asumimos que el token SIEMPRE existe, si no, el backend lo rechazará.
    // Si el token puede ser 'null', la lógica de abajo debe cambiar.
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Llama al endpoint "Orquestador" para crear una reserva completa en una sola transacción.
 * Coincide con tu 'exports.crearReservaCompleta' en el backend.
 * @param payload Objeto que contiene los vuelos, pasajeros y asientos.
 */
export async function crearReservaCompleta(payload: {
    vuelos: number[];       // Array de IDs de vuelo [101]
    pasajeros: any[];     // Array de objetos de pasajero [{nombre: "Ana", ...}, ...]
    asientos: number[];     // Array de IDs de asiento [20, 21]
    // NOTA: Asumimos que el backend obtiene el 'usuario_id' del token JWT.
    // (Si tu orquestador necesita 'usuario_id' en el body, debes agregarlo al payload)
}) {
    try {
        const headers = getAuthHeaders();
        
        // Esta línea ahora es válida porque 'headers' es tipo Record<string, string>
        if (!headers['Authorization']?.includes('Bearer') || headers['Authorization'] === 'Bearer null') {
            return { success: false, message: 'No autorizado o token no encontrado' };
        }
        
        // Llamamos a la nueva ruta del orquestador
        const response = await fetch(`${API_URL}/reserva/completa`, {
            method: 'POST',
            headers: headers, // 'Record<string, string>' es compatible con 'HeadersInit'
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            // El backend orquestador puede devolver errores específicos
            throw new Error(data.error || data.details || 'Error al confirmar la reserva');
        }

        return { success: true, data: data }; // data incluirá { message, id_reserva }

    } catch (error) {
        console.error('Error en reservaService.crearReservaCompleta:', error);
        return { success: false, message: (error as Error).message };
    }
}